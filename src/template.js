/* eslint-disable no-use-before-define */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { expandHomeDir, getSettingsByTemplate } = require('./config');
const { callAIEngine } = require('./engines');

const getTemplate = (templateName) => {
  const templatePath = path.join(expandHomeDir(process.env.GPTOOLS_PROMPTS_DIR), `${templateName}.md`);
  try {
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    return templateContent;
  } catch (error) {
    console.error(`Error reading template: ${templateName}`, error);
    return null;
  }
};

const processPromptTags = async (destinationTemplate, inputString, engineConfig) => {
  const regex = /<!-- \.\/([a-zA-Z0-9_-]+) -->/g;
  const matches = [...destinationTemplate.matchAll(regex)];

  const replacements = await Promise.all(matches.map(async (match) => {
    const [fullMatch, templateName] = match;
    const template = getTemplate(templateName);
    if (!template) {
      return null;
    }
    const appliedTemplate = await applyTemplate(
      templateName,
      inputString,
      engineConfig,
    );
    return { fullMatch, appliedTemplate };
  }));

  let templateOutput = destinationTemplate;
  replacements.forEach(({ fullMatch, appliedTemplate }) => {
    templateOutput = templateOutput.replace(fullMatch, appliedTemplate);
  });

  return templateOutput.replace('<!-- INPUT -->', inputString);
};

function extractYAML(input) {
  const regex = /```([^`]+)```/;
  const match = input.match(regex);
  return match ? match[1].trim() : null;
}

function extractTextOutsideBackticks(input) {
  const regex = /```.*?```/gs;
  const output = input.replace(regex, '').trim();
  return output;
}

module.exports.getTemplate = getTemplate;

const applyTemplate = async (templateName, inputString, options) => {
  const template = getTemplate(templateName);
  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }
  const yamlStr = extractYAML(template);
  const templateSettings = yaml.load(yamlStr);
  const promptText = extractTextOutsideBackticks(template);

  const processed = await processPromptTags(promptText, inputString, options);
  return callAIEngine(processed, getSettingsByTemplate(templateSettings, options));
};
module.exports.applyTemplate = applyTemplate;
