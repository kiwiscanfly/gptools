import fs from 'fs';
import path from 'path';
import { expandHomeDir } from './config.js';

export function getTemplate(templateName: string): string {
  const templatePath = path.join(expandHomeDir(process.env.GPTOOLS_PROMPTS_DIR!), `${templateName}.md`);
  try {
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    return templateContent;
  } catch (error) {
    throw new Error(`Error reading template: ${templateName}`);
  }
};