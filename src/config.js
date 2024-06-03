const fs = require('fs');
const dotenv = require('dotenv');
const os = require('os');
const path = require('path');

const expandHomeDir = (filePath) => {
  if (!filePath.startsWith('~')) {
    return filePath;
  }
  const homeDir = os.homedir();
  return path.join(homeDir, filePath.slice(1));
};
module.exports.expandHomeDir = expandHomeDir;

module.exports.loadConfig = () => {
  const envPath = expandHomeDir('~/.gptools');

  if (!fs.statSync(envPath).isFile()) {
    console.error('~/.gptools is not a file');
    process.exit(1);
  }

  dotenv.config({ path: envPath });

  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'OPENAI_MODEL',
    'OPENAI_MAX_TOKENS',
    'GPTOOLS_PROMPTS_DIR',
  ];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      console.error(`${envVar} is not set`);
      process.exit(1);
    }
  });

  if (!fs.statSync(expandHomeDir(process.env.GPTOOLS_PROMPTS_DIR)).isDirectory()) {
    console.error(`${expandHomeDir(process.env.GPTOOLS_PROMPTS_DIR)} is not a directory`);
    process.exit(1);
  }
};

const getModelBasedOnGengine = (engine) => {
  if (process.env[`${engine.toUpperCase()}_MODEL`]) {
    return process.env[`${engine.toUpperCase()}_MODEL`];
  }
  return process.env.MODEL;
};

module.exports.getSettingsByTemplate = (templateSettings, options) => {
  const engine = options.engine || templateSettings.engine || process.env.ENGINE;
  return {
    engine,
    model: options.model || templateSettings.model || getModelBasedOnGengine(engine),
  };
};
