# Email Notifier Action

A GitHub Action for sending email notifications with HTML template support and variable substitution via SMTP.

## Features

- **SMTP Email Delivery**: Send emails through any SMTP provider (Gmail, Outlook, AWS SES, etc.)
- **HTML Template Support**: Use inline HTML templates or load from files
- **Variable Substitution**: Dynamic content with `{{variableName}}` syntax
- **CSS Support**: Style your emails with inline or embedded CSS
- **Secure**: All credentials sourced from GitHub Secrets
- **Flexible**: Support for multiple recipients via comma-separated addresses
- **Dry Run Mode**: Test your templates without sending actual emails

## Prerequisites

Before using this action, you must configure the following secrets in your repository:

### Email Configuration

| Secret             | Description                                                 | Required |
| ------------------ | ----------------------------------------------------------- | -------- |
| `MAILER_SEND_FROM` | Email address to send from                                  | Yes      |
| `MAILER_SEND_TO`   | Email address(es) to send to (comma-separated for multiple) | Yes      |

### SMTP Configuration

| Secret        | Description                  | Required | Example                                   |
| ------------- | ---------------------------- | -------- | ----------------------------------------- |
| `SMTP_HOST`   | SMTP server hostname         | Yes      | `smtp.gmail.com`                          |
| `SMTP_PORT`   | SMTP server port             | Yes      | `587` (TLS) or `465` (SSL)                |
| `SMTP_USER`   | SMTP authentication username | Yes      | `your-email@gmail.com`                    |
| `SMTP_PASS`   | SMTP authentication password | Yes      | App password or SMTP password             |
| `SMTP_SECURE` | Use SSL connection           | Yes      | `true` for port 465, `false` for port 587 |

### Setting Up Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add all required secrets above

### SMTP Provider Examples

#### Gmail

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
```

#### Outlook/Hotmail

```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_SECURE=false
```

#### AWS SES

```
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-username
SMTP_PASS=your-ses-password
SMTP_SECURE=false
```

## Usage

### Basic Example with Inline Template

```yaml
name: Notify on Build
on:
  push:
    branches: [main]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Send Email Notification
        uses: peekaboo5149/email-notifier-action@v1
        with:
          subject: 'Build Complete'
          template: |
            <html>
              <body style="font-family: Arial, sans-serif;">
                <h1 style="color: #333;">Build Successful!</h1>
                <p>Branch: {{branch}}</p>
                <p>Commit: {{commit}}</p>
              </body>
            </html>
          template-variables: |
            {
              "branch": "${{ github.ref_name }}",
              "commit": "${{ github.sha }}"
            }
        env:
          MAILER_SEND_FROM: ${{ secrets.MAILER_SEND_FROM }}
          MAILER_SEND_TO: ${{ secrets.MAILER_SEND_TO }}
          SMTP_HOST: ${{ secrets.SMTP_HOST }}
          SMTP_PORT: ${{ secrets.SMTP_PORT }}
          SMTP_USER: ${{ secrets.SMTP_USER }}
          SMTP_PASS: ${{ secrets.SMTP_PASS }}
          SMTP_SECURE: ${{ secrets.SMTP_SECURE }}
```

### Using Template Files

Store your templates in `.github/mail-templates/`:

```yaml
- name: Send Deployment Notification
  uses: peekaboo5149/email-notifier-action@v1
  with:
    subject: 'Deployment Complete'
    template-path: 'mail-templates/deploy-success.html'
    template-variables: |
      {
        "appName": "MyApp",
        "version": "1.2.3",
        "environment": "production"
      }
  env:
    MAILER_SEND_FROM: ${{ secrets.MAILER_SEND_FROM }}
    MAILER_SEND_TO: ${{ secrets.MAILER_SEND_TO }}
    SMTP_HOST: ${{ secrets.SMTP_HOST }}
    SMTP_PORT: ${{ secrets.SMTP_PORT }}
    SMTP_USER: ${{ secrets.SMTP_USER }}
    SMTP_PASS: ${{ secrets.SMTP_PASS }}
    SMTP_SECURE: ${{ secrets.SMTP_SECURE }}
    SMTP_HOST: ${{ secrets.SMTP_HOST }}
    SMTP_PORT: ${{ secrets.SMTP_PORT }}
    SMTP_USER: ${{ secrets.SMTP_USER }}
    SMTP_PASS: ${{ secrets.SMTP_PASS }}
    SMTP_SECURE: ${{ secrets.SMTP_SECURE }}
```

### Dry Run Mode

Test your templates without sending emails:

```yaml
- name: Test Email Template
  uses: peekaboo5149/email-notifier-action@v1
  with:
    subject: 'Test Email'
    template: '<html><body><h1>Test: {{message}}</h1></body></html>'
    template-variables: '{"message": "Hello World"}'
    dry-run: true
  env:
    MAILER_SEND_FROM: ${{ secrets.MAILER_SEND_FROM }}
    MAILER_SEND_TO: ${{ secrets.MAILER_SEND_TO }}
    SMTP_HOST: ${{ secrets.SMTP_HOST }}
    SMTP_PORT: ${{ secrets.SMTP_PORT }}
    SMTP_USER: ${{ secrets.SMTP_USER }}
    SMTP_PASS: ${{ secrets.SMTP_PASS }}
    SMTP_SECURE: ${{ secrets.SMTP_SECURE }}
```

## Inputs

| Input                | Description                                                                                    | Required | Default                            |
| -------------------- | ---------------------------------------------------------------------------------------------- | -------- | ---------------------------------- |
| `subject`            | Email subject line                                                                             | Yes      | `Notification from GitHub Actions` |
| `template`           | HTML template content as a string. Use `\|` for multi-line YAML. Variables: `{{variableName}}` | No\*     | -                                  |
| `template-path`      | Path to HTML template file relative to `.github` directory. Must end with `.html`              | No\*     | -                                  |
| `template-folder`    | Default folder for templates inside `.github`                                                  | No       | `mail-templates`                   |
| `template-variables` | JSON object with template variables                                                            | No       | `{}`                               |
| `dry-run`            | Run in dry-run mode (no actual emails sent)                                                    | No       | `false`                            |

\*Either `template` or `template-path` must be provided.

## Outputs

| Output              | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `status`            | Status of the notification (`success` or `dry-run`)     |
| `timestamp`         | ISO timestamp when the notification was sent            |
| `rendered-template` | The final rendered HTML template (only in dry-run mode) |
| `from`              | Sender email address (from secrets)                     |
| `to`                | Recipient email address(es) (from secrets)              |

## Template Variables

Use double curly braces for variables in your templates:

```html
<html>
  <body>
    <h1>Hello {{name}}!</h1>
    <p>Your build {{buildNumber}} is {{status}}.</p>
  </body>
</html>
```

Provide values via the `template-variables` input:

```yaml
template-variables: |
  {
    "name": "Team",
    "buildNumber": 42,
    "status": "successful"
  }
```

### Available Variable Types

- `string`: `"Hello World"`
- `number`: `42` or `3.14`
- `boolean`: `true` or `false`

### Missing Variables

If a variable is referenced in the template but not provided in `template-variables`, the placeholder will be kept as-is and a warning will be logged.

## Template File Structure

Template files must be stored within the `.github` directory:

```
.github/
├── mail-templates/          # Default folder
│   ├── build-success.html
│   ├── build-failure.html
│   └── deploy-complete.html
├── templates/
│   └── mail/
│       └── custom-template.html
└── workflows/
    └── notify.yml
```

Reference templates using relative paths from `.github`:

```yaml
template-path: 'mail-templates/build-success.html'
# or
template-path: 'templates/mail/custom-template.html'
```

## Security

- Email addresses are **never** exposed in workflow files
- All email configuration is sourced from GitHub Secrets
- Template files must be within the `.github` directory (path traversal protection)
- Only `.html` files are allowed as templates

## Examples

### Build Status Notification

```yaml
- name: Notify Build Status
  uses: peekaboo5149/email-notifier-action@v1
  if: always()
  with:
    subject: 'Build ${{ job.status }} - ${{ github.repository }}'
    template: |
      <html>
        <head>
          <style>
            .success { color: green; }
            .failure { color: red; }
          </style>
        </head>
        <body>
          <h1 class="{{statusClass}}">Build {{status}}</h1>
          <p>Repository: {{repo}}</p>
          <p>Workflow: {{workflow}}</p>
          <p>Actor: {{actor}}</p>
        </body>
      </html>
    template-variables: |
      {
        "status": "${{ job.status }}",
        "statusClass": "${{ job.status == 'success' && 'success' || 'failure' }}",
        "repo": "${{ github.repository }}",
        "workflow": "${{ github.workflow }}",
        "actor": "${{ github.actor }}"
      }
  env:
    MAILER_SEND_FROM: ${{ secrets.MAILER_SEND_FROM }}
    MAILER_SEND_TO: ${{ secrets.MAILER_SEND_TO }}
```

### Deployment Notification with Multiple Recipients

```yaml
- name: Notify Team
  uses: peekaboo5149/email-notifier-action@v1
  with:
    subject: '🚀 Deployment to Production Complete'
    template-path: 'mail-templates/deploy-notification.html'
    template-variables: |
      {
        "version": "${{ github.ref_name }}",
        "commit": "${{ github.sha }}",
        "deployedBy": "${{ github.actor }}",
        "timestamp": "${{ github.event.head_commit.timestamp }}"
      }
  env:
    MAILER_SEND_FROM: ${{ secrets.MAILER_SEND_FROM }}
    MAILER_SEND_TO: ${{ secrets.MAILER_SEND_TO }} # Can be: "team@example.com, manager@example.com, devops@example.com"
    SMTP_HOST: ${{ secrets.SMTP_HOST }}
    SMTP_PORT: ${{ secrets.SMTP_PORT }}
    SMTP_USER: ${{ secrets.SMTP_USER }}
    SMTP_PASS: ${{ secrets.SMTP_PASS }}
    SMTP_SECURE: ${{ secrets.SMTP_SECURE }}
```

## License

MIT
