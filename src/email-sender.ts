import type { SendMailOptions, Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';

export interface SMTPConfig {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly pass: string;
}

export interface EmailMessage {
  readonly from: string;
  readonly to: string;
  readonly subject: string;
  readonly html: string;
}

export interface SendResult {
  readonly success: boolean;
  readonly messageId?: string;
  readonly error?: string;
}

export class EmailSenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailSenderError';
  }
}

export class EmailSender {
  private transporter: Transporter | null = null;
  private readonly config: SMTPConfig;

  constructor(config: SMTPConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.user,
          pass: this.config.pass,
        },
        // Add TLS options for better compatibility
        tls: {
          rejectUnauthorized: true,
        },
      });

      // Verify connection
      await this.transporter.verify();
    } catch (error) {
      throw new EmailSenderError(
        `Failed to initialize email transporter: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async send(message: EmailMessage): Promise<SendResult> {
    if (!this.transporter) {
      throw new EmailSenderError('Email sender not initialized. Call initialize() first.');
    }

    try {
      // Split multiple recipients
      const toAddresses = message.to.split(',').map((addr) => addr.trim());

      const mailOptions: SendMailOptions = {
        from: message.from,
        to: toAddresses,
        subject: message.subject,
        html: message.html,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result: { messageId?: string } = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId ?? undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  close(): void {
    if (this.transporter) {
      this.transporter.close();
      this.transporter = null;
    }
  }
}

export function getSMTPConfigFromEnv(): SMTPConfig {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const secure = process.env.SMTP_SECURE;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) {
    throw new EmailSenderError('SMTP_HOST secret is required');
  }
  if (!port) {
    throw new EmailSenderError('SMTP_PORT secret is required');
  }
  if (!user) {
    throw new EmailSenderError('SMTP_USER secret is required');
  }
  if (!pass) {
    throw new EmailSenderError('SMTP_PASS secret is required');
  }

  const portNumber = Number.parseInt(port, 10);
  if (Number.isNaN(portNumber)) {
    throw new EmailSenderError('SMTP_PORT must be a valid number');
  }

  return {
    host,
    port: portNumber,
    secure: secure === 'true',
    user,
    pass,
  };
}
