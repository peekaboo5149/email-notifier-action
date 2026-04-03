import * as core from '@actions/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { run } from './main';

// Mock @actions/core
vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  getBooleanInput: vi.fn(),
  setOutput: vi.fn(),
  setFailed: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  warning: vi.fn(),
}));

describe('main', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = {
      ...originalEnv,
      MAILER_SEND_FROM: 'sender@example.com',
      MAILER_SEND_TO: 'recipient@example.com',
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_USER: 'user@example.com',
      SMTP_PASS: 'password',
      SMTP_SECURE: 'false',
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  it('should handle dry-run mode', async () => {
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === 'subject') return 'Test Subject';
      if (name === 'template') return '<html><body>Test</body></html>';
      if (name === 'template-path') return '';
      if (name === 'template-folder') return 'mail-templates';
      if (name === 'template-variables') return '{}';
      return '';
    });
    vi.mocked(core.getBooleanInput).mockReturnValue(true);

    await run();

    expect(core.setOutput).toHaveBeenCalledWith('status', 'dry-run');
    expect(core.setOutput).toHaveBeenCalledWith('rendered-template', expect.any(String));
  });

  it('should throw error when MAILER_SEND_FROM is missing', async () => {
    delete process.env.MAILER_SEND_FROM;

    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === 'subject') return 'Test Subject';
      if (name === 'template') return '<html><body>Test</body></html>';
      return '';
    });
    vi.mocked(core.getBooleanInput).mockReturnValue(false);

    await expect(run()).rejects.toThrow('MAILER_SEND_FROM secret is required');
  });

  it('should throw error when MAILER_SEND_TO is missing', async () => {
    delete process.env.MAILER_SEND_TO;

    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === 'subject') return 'Test Subject';
      if (name === 'template') return '<html><body>Test</body></html>';
      return '';
    });
    vi.mocked(core.getBooleanInput).mockReturnValue(false);

    await expect(run()).rejects.toThrow('MAILER_SEND_TO secret is required');
  });

  it('should throw error when SMTP_HOST is missing', async () => {
    delete process.env.SMTP_HOST;

    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === 'subject') return 'Test Subject';
      if (name === 'template') return '<html><body>Test</body></html>';
      return '';
    });
    vi.mocked(core.getBooleanInput).mockReturnValue(false);

    await expect(run()).rejects.toThrow('SMTP_HOST secret is required');
  });
});
