import { OpenAI } from 'openai';

const getConfig = () => new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callEngine(content: string, engineConfig: { model: string }): Promise<string> {
  const openai = getConfig();

  if (!process.env.OPENAI_MAX_TOKENS) {
    console.error('OPENAI_MAX_TOKENS is not set');
    process.exit(1);
  }

  const response = await openai.chat.completions.create({
    model: engineConfig.model,
    messages: [
      { role: 'system', content },
    ],
    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10),
  });

  if (!response.choices || !response.choices[0] || !response.choices[0].message || !response.choices[0].message.content) {
    console.error('Invalid response from OpenAI');
    process.exit(1);
  }

  return response.choices[0].message.content;
};