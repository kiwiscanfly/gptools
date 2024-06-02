module.exports.callEngine = async (content) => {
  const ollamaModule = await import('ollama');
  const { Ollama } = ollamaModule;
  const ollama = new Ollama();

  return ollama.chat({
    model: process.env.OLLAMA_MODEL,
    messages: [
      { role: 'system', content },
    ],
  });
};
