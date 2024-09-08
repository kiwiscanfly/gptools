export async function callEngine(content: string, engineConfig: { model: string }): Promise<string> {
  const { Ollama } = await import('ollama');

  const ollama = new Ollama();

  const response = await ollama.chat({
    model: engineConfig.model,
    messages: [
      { role: 'system', content },
    ],
  });

  return response.message.content;
};