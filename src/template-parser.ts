export type TemplateVariables = Readonly<Record<string, string | number | boolean>>;

const VARIABLE_REGEX = /\{\{(\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*)\}\}/g;

/**
 * Renders a template by replacing variables with their values
 * Variables format: {{variableName}}
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
  return template.replace(VARIABLE_REGEX, (match, variableName: string) => {
    const key = variableName.trim();
    const value = variables[key];

    if (!(key in variables)) {
      console.warn(`Template variable "${key}" not found, keeping placeholder`);
      return match;
    }

    return String(value);
  });
}

/**
 * Extracts all variable names from a template
 */
export function extractVariables(template: string): string[] {
  const variables: string[] = [];
  let match: RegExpExecArray | null;

  // Reset regex lastIndex
  VARIABLE_REGEX.lastIndex = 0;

  while ((match = VARIABLE_REGEX.exec(template)) !== null) {
    variables.push(match[1].trim());
  }

  return [...new Set(variables)]; // Remove duplicates
}

/**
 * Validates that all variables in template have values
 */
export function validateVariables(template: string, variables: TemplateVariables): string[] {
  const requiredVars = extractVariables(template);
  const missing: string[] = [];

  for (const variable of requiredVars) {
    if (!(variable in variables)) {
      missing.push(variable);
    }
  }

  return missing;
}
