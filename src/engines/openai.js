const { OpenAI } = require('openai');

const getConfig = () => new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
module.exports.getConfig = getConfig;

module.exports.callEngine = async (content) => {
  const openai = getConfig();

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [
      { role: 'system', content },
    ],
    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10),
  });

  return response.choices[0].message.content;
};
