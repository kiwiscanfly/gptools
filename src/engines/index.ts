import { callEngine as callOpenAI } from './openai.js';
import { callEngine as callOllama } from './ollama.js';

export const callAIEngine = async (content: string, engineConfig: { engine: string, model: string }): Promise<string> => {
  if (engineConfig.engine === 'ollama') {
    return callOllama(content, engineConfig);
  }
  if (engineConfig.engine === 'openai') {
    return callOpenAI(content, engineConfig);
  }
  return content;
};