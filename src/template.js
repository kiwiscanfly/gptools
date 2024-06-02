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
  const regex = /<!-- \.\/([a-zA-Z0-9_\-]+) -->/g;

  // Finding matches
  const matches = [...inputString.matchAll(regex)];

  // Clone the string
  let templateOutput = destinationTemplate;

  // Output the results
  await Promise.all(matches.map(async (match) => {
    const [fullMatch, templateName] = match;
    const template = getTemplate(templateName);
    if (!template) {
      return;
    }
    const appliedTemplate = await applyTemplate(template, inputString, engineConfig);
    const templateResult = callAIEngine(appliedTemplate, engineConfig);
    templateOutput = templateOutput.replace(fullMatch, templateResult);
  }));

  return templateOutput;
};

module.exports.getTemplate = getTemplate;

const applyTemplate = async (templateName, inputString, engineConfig) => {
  const template = getTemplate(templateName);
  if (!template) {
    return null;
  }
  return template.replace('<!-- INPUT -->', await preprocessTemplate(template, inputString, engineConfig));
};
module.exports.applyTemplate = applyTemplate;
