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
    throw new Error(`Error reading template: ${templateName}`, error);
  }
};

const processItem = async (args) => {
  const {
    item,
    inputString,
    options,
    preprocessed,
  } = args;

  const foundPreprocessed = preprocessed
    ? preprocessed.find((preprocessedItem) => preprocessedItem.key === item)
    : undefined;
  if (foundPreprocessed) {
    return foundPreprocessed.value;
  }

  const template = getTemplate(item);
  if (!template) {
    throw new Error(`Template not found: ${item}`);
  }

  return applyTemplate(
    item,
    inputString,
    options,
  );
};

const processPipes = async (args) => {
  const {
    pipes,
    inputString,
    options,
    preprocessed,
  } = args;
  const items = pipes.split('|').map((item) => item.trim());
  const item = items.shift();
  const result = await processItem({
    item,
    inputString,
    options,
    preprocessed,
  });

  if (!items.length) {
    return result;
  }

  return processPipes({
    pipes: items.join('|'),
    inputString: result,
    options,
    preprocessed,
  });
};

const processPromptTags = async (args) => {
  const {
    promptText,
    inputString,
    options,
    preprocessed,
  } = args;

  const regex = /<!-- ([a-zA-Z0-9_-|]+) -->/g;
  const matches = [...promptText.matchAll(regex)];

  const replacements = await Promise.all(matches.map(async (match) => {
    const [fullMatch, templateName] = match;

    if (templateName.toUpperCase() === 'INPUT') {
      return {
        fullMatch,
        result: inputString,
      };
    }

    return {
      fullMatch,
      result: await processPipes({
        pipes: templateName,
        inputString,
        options,
        preprocessed,
      }),
    };
  }));

  let templateOutput = promptText;
  replacements.forEach(({ fullMatch, result }) => {
    templateOutput = templateOutput.replace(fullMatch, result);
  });

  return templateOutput;
};

const preprocess = (items, inputString, options) => Promise.all(
  Object.keys(items).map(async (key) => ({
    key,
    value: await processPipes({ pipes: items[key], inputString, options }),
  })),
);

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
  const templateSettings = yamlStr && yaml.load(yamlStr);
  const promptText = extractTextOutsideBackticks(template);

  // Process items in the preprocess section
  const preprocessed = templateSettings && templateSettings.preprocess
    ? await preprocess(templateSettings.preprocess, inputString, options)
    : undefined;

  const processed = await processPromptTags({
    promptText,
    inputString,
    options,
    preprocessed,
  });
  return callAIEngine(
    processed,
    getSettingsByTemplate(templateSettings || {}, options),
  );
};
module.exports.applyTemplate = applyTemplate;
