import { describe, expect, it } from 'vitest';
import {
  extractVariables,
  renderTemplate,
  validateVariables,
  type TemplateVariables,
} from './template-parser';

describe('template-parser', () => {
  describe('renderTemplate', () => {
    it('should replace simple variables', () => {
      const template = 'Hello {{name}}!';
      const variables: TemplateVariables = { name: 'World' };

      const result = renderTemplate(template, variables);

      expect(result).toBe('Hello World!');
    });

    it('should replace multiple variables', () => {
      const template = 'Hello {{firstName}} {{lastName}}!';
      const variables: TemplateVariables = { firstName: 'John', lastName: 'Doe' };

      const result = renderTemplate(template, variables);

      expect(result).toBe('Hello John Doe!');
    });

    it('should handle variables with spaces', () => {
      const template = 'Hello {{ name }}!';
      const variables: TemplateVariables = { name: 'World' };

      const result = renderTemplate(template, variables);

      expect(result).toBe('Hello World!');
    });

    it('should keep placeholder for missing variables', () => {
      const template = 'Hello {{name}} {{missing}}!';
      const variables: TemplateVariables = { name: 'World' };

      const result = renderTemplate(template, variables);

      expect(result).toBe('Hello World {{missing}}!');
    });

    it('should handle number variables', () => {
      const template = 'Build number: {{buildNumber}}';
      const variables: TemplateVariables = { buildNumber: 42 };

      const result = renderTemplate(template, variables);

      expect(result).toBe('Build number: 42');
    });

    it('should handle boolean variables', () => {
      const template = 'Success: {{isSuccess}}';
      const variables: TemplateVariables = { isSuccess: true };

      const result = renderTemplate(template, variables);

      expect(result).toBe('Success: true');
    });

    it('should handle HTML templates', () => {
      const template = '<h1>{{title}}</h1><p>{{content}}</p>';
      const variables: TemplateVariables = { title: 'Hello', content: 'World' };

      const result = renderTemplate(template, variables);

      expect(result).toBe('<h1>Hello</h1><p>World</p>');
    });
  });

  describe('extractVariables', () => {
    it('should extract single variable', () => {
      const template = 'Hello {{name}}!';

      const result = extractVariables(template);

      expect(result).toEqual(['name']);
    });

    it('should extract multiple variables', () => {
      const template = '{{greeting}} {{name}}, welcome to {{place}}!';

      const result = extractVariables(template);

      expect(result).toEqual(['greeting', 'name', 'place']);
    });

    it('should remove duplicate variables', () => {
      const template = '{{name}} {{name}} {{name}}';

      const result = extractVariables(template);

      expect(result).toEqual(['name']);
    });

    it('should return empty array for no variables', () => {
      const template = 'Hello World!';

      const result = extractVariables(template);

      expect(result).toEqual([]);
    });

    it('should handle variables with spaces', () => {
      const template = '{{ name }} {{  age  }}';

      const result = extractVariables(template);

      expect(result).toEqual(['name', 'age']);
    });
  });

  describe('validateVariables', () => {
    it('should return empty array when all variables are provided', () => {
      const template = 'Hello {{name}}!';
      const variables: TemplateVariables = { name: 'World' };

      const result = validateVariables(template, variables);

      expect(result).toEqual([]);
    });

    it('should return missing variables', () => {
      const template = 'Hello {{firstName}} {{lastName}}!';
      const variables: TemplateVariables = { firstName: 'John' };

      const result = validateVariables(template, variables);

      expect(result).toEqual(['lastName']);
    });

    it('should return all variables when none provided', () => {
      const template = 'Hello {{name}} {{age}}!';
      const variables: TemplateVariables = {};

      const result = validateVariables(template, variables);

      expect(result).toEqual(['name', 'age']);
    });
  });
});
