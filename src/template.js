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

const processItem = async (item, inputString, engineConfig) => {
  let result = 'ERROR';

  // TODO: Implement pipes

  // TODO: Implement tools

  if (item.startsWith('@')) {
    const template = getTemplate(item);
    if (!template) {
      return null;
    }
    result = await applyTemplate(
      item,
      inputString,
      engineConfig,
    );
  }
  return result;
};

const processPromptTags = async (args) => {
  const {
    destinationTemplate,
    inputString,
    engineConfig,
    preprocessed,
  } = args;

  const regex = /<!-- ([a-zA-Z0-9_-]+) -->/g;
  const matches = [...destinationTemplate.matchAll(regex)];

  const replacements = await Promise.all(matches.map(async (match) => {
    const [fullMatch, templateName] = match;
    if (preprocessed[templateName]) {
      return { fullMatch, result: preprocessed[templateName] };
    }

    return {
      fullMatch,
      result: await processItem(templateName, inputString, engineConfig) 
    };
  }));

  let templateOutput = destinationTemplate;
  replacements.forEach(({ fullMatch, appliedTemplate }) => {
    templateOutput = templateOutput.replace(fullMatch, appliedTemplate);
  });

  return templateOutput.replace('<!-- INPUT -->', inputString);
};

const preprocess = (items) => Promise.all(items.map((item) => processItem(item.value)));

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

  // Process items in the preprocess section
  const preprocessed = templateSettings.preprocess
    ? await preprocess(templateSettings.preprocess)
    : {};

  const processed = await processPromptTags({
    promptText,
    inputString,
    options,
    preprocessed,
  });
  return callAIEngine(processed, getSettingsByTemplate(templateSettings, options));
};
module.exports.applyTemplate = applyTemplate;
