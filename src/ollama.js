const { applyTemplate } = require('./prompts');

module.exports.processTemplate = async (command, text) => {
  const ollamaModule = await import('ollama');
  const { Ollama } = ollamaModule;
  const ollama = new Ollama();

  try {
    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL,
      messages: [
        { role: 'system', content: applyTemplate(command, text) },
      ],
    });
    console.log(response.message.content);
  } catch (error) {
    console.error('Error querying Ollama:', error);
  }
};
