import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TemplateLoader, TemplateLoaderError } from './template-loader';

describe('template-loader', () => {
  const testDir = path.join(process.cwd(), '.github', 'test-templates');
  const defaultDir = path.join(process.cwd(), '.github', 'mail-templates');

  beforeEach(() => {
    // Create test directories
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Cleanup test directories
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    if (fs.existsSync(defaultDir)) {
      fs.rmSync(defaultDir, { recursive: true });
    }
  });

  describe('loadFromFile', () => {
    it('should load template from file', () => {
      const templatePath = path.join(testDir, 'test.html');
      const content = '<html><body>Test Template</body></html>';
      fs.writeFileSync(templatePath, content);

      const loader = new TemplateLoader();
      const result = loader.loadFromFile('test-templates/test.html');

      expect(result).toBe(content);
    });

    it('should throw error for non-existent file', () => {
      const loader = new TemplateLoader();

      expect(() => loader.loadFromFile('test-templates/non-existent.html')).toThrow(
        TemplateLoaderError
      );
    });

    it('should throw error for non-html file', () => {
      const templatePath = path.join(testDir, 'test.txt');
      fs.writeFileSync(templatePath, 'Not HTML');

      const loader = new TemplateLoader();

      expect(() => loader.loadFromFile('test-templates/test.txt')).toThrow(TemplateLoaderError);
    });

    it('should throw error for path outside .github', () => {
      const loader = new TemplateLoader();

      expect(() => loader.loadFromFile('../outside.html')).toThrow(TemplateLoaderError);
    });

    it('should throw error for absolute path outside .github', () => {
      const loader = new TemplateLoader();

      expect(() => loader.loadFromFile('/etc/passwd')).toThrow(TemplateLoaderError);
    });
  });

  describe('loadFromDefaultFolder', () => {
    it('should load template from default folder', () => {
      const templatePath = path.join(defaultDir, 'welcome.html');
      const content = '<html><body>Welcome!</body></html>';
      fs.writeFileSync(templatePath, content);

      const loader = new TemplateLoader();
      const result = loader.loadFromDefaultFolder('welcome');

      expect(result).toBe(content);
    });

    it('should throw error for non-existent template in default folder', () => {
      const loader = new TemplateLoader();

      expect(() => loader.loadFromDefaultFolder('non-existent')).toThrow(TemplateLoaderError);
    });
  });

  describe('listTemplates', () => {
    it('should list templates in folder', () => {
      fs.writeFileSync(path.join(testDir, 'template1.html'), 'Template 1');
      fs.writeFileSync(path.join(testDir, 'template2.html'), 'Template 2');
      fs.writeFileSync(path.join(testDir, 'not-template.txt'), 'Not a template');

      const loader = new TemplateLoader();
      const result = loader.listTemplates('test-templates');

      expect(result).toContain('template1');
      expect(result).toContain('template2');
      expect(result).not.toContain('not-template');
    });

    it('should return empty array for non-existent folder', () => {
      const loader = new TemplateLoader();
      const result = loader.listTemplates('non-existent-folder');

      expect(result).toEqual([]);
    });

    it('should return empty array for empty folder', () => {
      const loader = new TemplateLoader();
      const result = loader.listTemplates('test-templates');

      expect(result).toEqual([]);
    });
  });
});
