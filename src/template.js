/* eslint-disable no-use-before-define */

const fs = require('fs');
const path = require('path');
const { expandHomeDir } = require('./config');
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

const preprocessTemplate = async (destinationTemplate, inputString, engineConfig) => {
  // Regular expression to match the pattern
  const regex = /<!-- \.\/([a-zA-Z0-9_-]+) -->/g;

  // Finding matches
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
    const aiResult = await callAIEngine(appliedTemplate, engineConfig);
    return { fullMatch, aiResult };
  }));

  let templateOutput = destinationTemplate;
  replacements.forEach(({ fullMatch, aiResult }) => {
    templateOutput = templateOutput.replace(fullMatch, aiResult);
  });

  return templateOutput;
};

module.exports.getTemplate = getTemplate;

const applyTemplate = async (templateName, inputString, engineConfig) => {
  const template = getTemplate(templateName);
  if (!template) {
    return null;
  }
  const processed = await preprocessTemplate(template, inputString, engineConfig);
  return processed.replace('<!-- INPUT -->', inputString);
};
module.exports.applyTemplate = applyTemplate;
