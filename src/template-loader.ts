import * as fs from 'node:fs';
import * as path from 'node:path';

export class TemplateLoaderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateLoaderError';
  }
}

export class TemplateLoader {
  private readonly githubDir: string;

  constructor(githubDir = '.github') {
    this.githubDir = githubDir;
  }

  /**
   * Loads template from file path (relative to .github directory)
   * Validates that the file is within .github directory
   */
  loadFromFile(templatePath: string): string {
    // Resolve the full path
    const fullPath = path.resolve(this.githubDir, templatePath);
    const resolvedGithubDir = path.resolve(this.githubDir);

    // Security check: ensure file is within .github directory
    if (!fullPath.startsWith(resolvedGithubDir)) {
      throw new TemplateLoaderError(
        `Template path "${templatePath}" must be inside .github directory`
      );
    }

    // Validate file extension
    if (!fullPath.endsWith('.html')) {
      throw new TemplateLoaderError('Template file must have .html extension');
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      throw new TemplateLoaderError(`Template file not found: ${fullPath}`);
    }

    // Check if it's a file
    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      throw new TemplateLoaderError(`Template path is not a file: ${fullPath}`);
    }

    // Read and return content
    return fs.readFileSync(fullPath, 'utf-8');
  }

  /**
   * Loads template from default folder with given name
   */
  loadFromDefaultFolder(templateName: string, defaultFolder = 'mail-templates'): string {
    const templatePath = path.join(defaultFolder, `${templateName}.html`);
    return this.loadFromFile(templatePath);
  }

  /**
   * Lists available templates in a folder
   */
  listTemplates(folder = 'mail-templates'): string[] {
    const fullPath = path.resolve(this.githubDir, folder);
    const resolvedGithubDir = path.resolve(this.githubDir);

    // Security check
    if (!fullPath.startsWith(resolvedGithubDir)) {
      throw new TemplateLoaderError(`Folder "${folder}" must be inside .github directory`);
    }

    if (!fs.existsSync(fullPath)) {
      return [];
    }

    const stats = fs.statSync(fullPath);
    if (!stats.isDirectory()) {
      return [];
    }

    return fs
      .readdirSync(fullPath)
      .filter((file) => file.endsWith('.html'))
      .map((file) => file.replace('.html', ''));
  }
}
