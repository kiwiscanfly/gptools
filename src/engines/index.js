const { callEngine: callOpenAI } = require('./openai');
const { callEngine: callOllama } = require('./ollama');

module.exports.callAIEngine = async (content, engineConfig) => {
  if (engineConfig.engine === 'ollama') {
    return callOllama(content, engineConfig);
  }
  if (engineConfig.engine === 'openai') {
    return callOpenAI(content, engineConfig);
  }
  return content;
};
