const { OpenAI } = require('openai');
const { applyTemplate } = require('./prompts');

const getConfig = () => new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
module.exports.getConfig = getConfig;

module.exports.processTemplate = async (command, text) => {
  const openai = getConfig();
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: applyTemplate(command, text) },
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10),
    });

    // eslint-disable-next-line no-console
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error querying OpenAI:', error);
  }
};
