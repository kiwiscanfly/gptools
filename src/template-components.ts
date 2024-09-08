import yaml from 'yaml';

function extractYAML(input: string) {
  const regex = /```([^`]+)```/;
  const match = input.match(regex);
  return match ? match[1].trim() : null;
}

function extractTextOutsideBackticks(input: string) {
  const regex = /```.*?```/gs;
  const output = input.replace(regex, '').trim();
  return output;
}

export function breakTemplateIntoMajorComponents(template: string) {
  const yamlStr = extractYAML(template);
  const templateSettings = yamlStr && yaml.parse(yamlStr);
  const promptText = extractTextOutsideBackticks(template);

  return { 
    templateSettings: templateSettings || {}, 
    promptText 
  };
}