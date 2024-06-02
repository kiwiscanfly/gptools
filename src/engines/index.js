const { callAIEngine: callOpenAI } = require('./openai');
const { callAIEngine: callOllama } = require('./ollama');

module.exports.callAIEngine = async (content, engineConfig) => {
  if (engineConfig.engine === 'ollama') {
    return callOllama(content);
  }
  return callOpenAI(content);
};
