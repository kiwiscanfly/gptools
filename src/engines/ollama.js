module.exports.callEngine = async (content, engineConfig) => {
  const ollamaModule = await import('ollama');
  const { Ollama } = ollamaModule;
  const ollama = new Ollama();

  const response = await ollama.chat({
    model: engineConfig.model,
    messages: [
      { role: 'system', content },
    ],
  });

  return response.message.content;
};
