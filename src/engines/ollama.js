module.exports.callEngine = async (content) => {
  const ollamaModule = await import('ollama');
  const { Ollama } = ollamaModule;
  const ollama = new Ollama();

  const response = await ollama.chat({
    model: process.env.OLLAMA_MODEL,
    messages: [
      { role: 'system', content },
    ],
  });

  return response.message.content;
};
