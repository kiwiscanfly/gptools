const fs = require('fs');
const path = require('path');
const { expandHomeDir } = require('./config');

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
module.exports.getTemplate = getTemplate;

const applyTemplate = (templateName, inputData) => {
  const template = getTemplate(templateName);
  if (!template) {
    return null;
  }
  return template.replace('<!-- INPUT -->', inputData);
};
module.exports.applyTemplate = applyTemplate;
