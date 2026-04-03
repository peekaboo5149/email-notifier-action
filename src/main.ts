import * as core from '@actions/core';
import { EmailSender, EmailSenderError, getSMTPConfigFromEnv } from './email-sender';
import { TemplateLoader, TemplateLoaderError } from './template-loader';
import {
  TemplateVariables,
  extractVariables,
  renderTemplate,
  validateVariables,
} from './template-parser';

export interface ActionInputs {
  readonly from: string;
  readonly to: string;
  readonly subject: string;
  readonly template?: string;
  readonly templatePath?: string;
  readonly templateFolder: string;
  readonly templateVariables: TemplateVariables;
  readonly dryRun: boolean;
}

export interface ActionOutputs {
  readonly status: string;
  readonly timestamp: string;
  readonly renderedTemplate?: string;
  readonly from: string;
  readonly to: string;
  readonly messageId?: string;
}

function parseVariables(variablesJson: string): TemplateVariables {
  try {
    const parsed = JSON.parse(variablesJson) as unknown;
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Variables must be a JSON object');
    }
    return parsed as TemplateVariables;
  } catch (error) {
    throw new Error(
      `Failed to parse template-variables: ${error instanceof Error ? error.message : 'Invalid JSON'}`
    );
  }
}

function getTemplateContent(inputs: ActionInputs): string {
  // Priority 1: Direct template content
  if (inputs.template) {
    core.info('Using inline template content');
    return inputs.template;
  }

  // Priority 2: Template from file path
  if (inputs.templatePath) {
    core.info(`Loading template from file: ${inputs.templatePath}`);
    const loader = new TemplateLoader();
    return loader.loadFromFile(inputs.templatePath);
  }

  throw new Error('Either "template" or "template-path" input must be provided');
}

function getInputs(): ActionInputs {
  // Read email addresses from secrets (passed as env vars)
  const from = process.env.MAILER_SEND_FROM;
  const to = process.env.MAILER_SEND_TO;

  if (!from) {
    throw new Error('MAILER_SEND_FROM secret is required');
  }
  if (!to) {
    throw new Error('MAILER_SEND_TO secret is required');
  }

  const subject = core.getInput('subject', { required: true });
  const template = core.getInput('template');
  const templatePath = core.getInput('template-path');
  const templateFolder = core.getInput('template-folder') || 'mail-templates';
  const templateVariables = parseVariables(core.getInput('template-variables') || '{}');
  const dryRun = core.getBooleanInput('dry-run');

  return {
    from,
    to,
    subject,
    template: template || undefined,
    templatePath: templatePath || undefined,
    templateFolder,
    templateVariables,
    dryRun,
  };
}

function setOutputs(outputs: ActionOutputs): void {
  core.setOutput('status', outputs.status);
  core.setOutput('timestamp', outputs.timestamp);
  core.setOutput('from', outputs.from);
  core.setOutput('to', outputs.to);
  if (outputs.renderedTemplate) {
    core.setOutput('rendered-template', outputs.renderedTemplate);
  }
  if (outputs.messageId) {
    core.setOutput('message-id', outputs.messageId);
  }
}

interface SendEmailResult {
  status: string;
  messageId?: string;
}

async function sendEmail(inputs: ActionInputs, renderedTemplate: string): Promise<SendEmailResult> {
  if (inputs.dryRun) {
    core.info('Dry run mode - email not sent');
    core.info(`Would send to: ${inputs.to}`);
    core.info(`Subject: ${inputs.subject}`);
    return { status: 'dry-run' };
  }

  // Initialize email sender with SMTP config
  core.info('Initializing SMTP connection...');
  const smtpConfig = getSMTPConfigFromEnv();
  const emailSender = new EmailSender(smtpConfig);
  await emailSender.initialize();

  core.info('Sending email via SMTP...');
  const result = await emailSender.send({
    from: inputs.from,
    to: inputs.to,
    subject: inputs.subject,
    html: renderedTemplate,
  });

  emailSender.close();

  if (!result.success) {
    throw new Error(`Failed to send email: ${result.error ?? 'Unknown error'}`);
  }

  core.info(`Email sent successfully. Message ID: ${result.messageId ?? 'N/A'}`);
  return { status: 'success', messageId: result.messageId };
}

function handleError(error: unknown): void {
  if (error instanceof TemplateLoaderError) {
    core.error(`Template loading failed: ${error.message}`);
  } else if (error instanceof EmailSenderError) {
    core.error(`Email sending failed: ${error.message}`);
  } else {
    core.error(`Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function run(): Promise<void> {
  try {
    core.info('Starting Email Notifier Action...');

    const inputs = getInputs();

    core.info(`Sending notification from: ${inputs.from}`);
    core.info(`Sending notification to: ${inputs.to}`);
    core.info(`Subject: ${inputs.subject}`);
    core.info(`Dry run mode: ${inputs.dryRun ? 'enabled' : 'disabled'}`);

    // Get template content
    const templateContent = getTemplateContent(inputs);
    core.debug(`Template content loaded (${String(templateContent.length)} characters)`);

    // Extract and log template variables found
    const templateVars = extractVariables(templateContent);
    if (templateVars.length > 0) {
      core.info(`Template variables found: ${templateVars.join(', ')}`);
    }

    // Render template with variables
    const renderedTemplate = renderTemplate(templateContent, inputs.templateVariables);
    core.info('Template rendered successfully');

    // Check for missing variables
    const missingVars = validateVariables(templateContent, inputs.templateVariables);
    if (missingVars.length > 0) {
      core.warning(`Missing template variables: ${missingVars.join(', ')}`);
    }

    const timestamp = new Date().toISOString();
    const { status, messageId } = await sendEmail(inputs, renderedTemplate);

    setOutputs({
      status,
      timestamp,
      from: inputs.from,
      to: inputs.to,
      renderedTemplate: inputs.dryRun ? renderedTemplate : undefined,
      messageId,
    });

    core.info(`Notification completed at ${timestamp}`);
  } catch (error) {
    handleError(error);
    throw error;
  }
}
