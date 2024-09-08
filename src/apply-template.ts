import { getModelBasedOnGengine } from './config.js';
import { callAIEngine } from './engines/index.js';
import { getTemplate } from './get-template.js';
import { breakTemplateIntoMajorComponents } from './template-components.js';

interface ProcessItemArgs {
  item: string;
  inputString: string;
  options: any;
  preprocessed?: { key: string; value: string }[];
}

interface ProcessPipesArgs {
  pipes: string;
  inputString: string;
  options: any;
  preprocessed?: { key: string; value: string }[];
}

export async function processItem ({
  item,
  inputString,
  options,
  preprocessed,
}: ProcessItemArgs): Promise<string> {

  const foundPreprocessed = preprocessed
    ? preprocessed.find((preprocessedItem) => preprocessedItem.key === item)
    : undefined;
  if (foundPreprocessed) {
    return foundPreprocessed.value;
  }

  const template = getTemplate(item);
  if (!template) {
    throw new Error(`Template not found: ${item}`);
  }

  return applyTemplate(
    item,
    inputString,
    options,
  );
};

async function processPipes (args: ProcessPipesArgs): Promise<string> {
  const {
    pipes,
    inputString,
    options,
    preprocessed,
  } = args;
  const items = pipes.split('|').map((item) => item.trim());
  const item = items.shift();
  if (!item) {
    return inputString;
  }
  const result = await processItem({
    item,
    inputString,
    options,
    preprocessed,
  });

  if (!items.length) {
    return result;
  }

  return processPipes({
    pipes: items.join('|'),
    inputString: result,
    options,
    preprocessed,
  });
};

interface ProcessPromptTagsArgs {
  promptText: string;
  inputString: string;
  options: any;
  preprocessed?: { key: string; value: string }[];
}

const processPromptTags = async ({
  promptText,
  inputString,
  options,
  preprocessed,
}: ProcessPromptTagsArgs): Promise<string> => {
  const regex = /<!-- ([a-zA-Z0-9_-|]+) -->/g;
  const matches = [...promptText.matchAll(regex)];

  const replacements = await Promise.all(matches.map(async (match) => {
    const [fullMatch, templateName] = match;

    if (templateName.toUpperCase() === 'INPUT') {
      return {
        fullMatch,
        result: inputString,
      };
    }

    return {
      fullMatch,
      result: await processPipes({
        pipes: templateName,
        inputString,
        options,
        preprocessed,
      }),
    };
  }));

  let templateOutput = promptText;
  replacements.forEach(({ fullMatch, result }) => {
    templateOutput = templateOutput.replace(fullMatch, result);
  });

  return templateOutput;
};

interface PreprocessArgs {
  items: { [key: string]: string };
  inputString: string;
  options: any;
}

async function preprocess ({ items, inputString, options }: PreprocessArgs): Promise<{ key: string; value: string }[]> {
  return Promise.all(
    Object.keys(items).map(async (key: string) => ({
      key,
      value: await processPipes({ pipes: items[key], inputString, options }),
    })),
  );
}

export interface InputOptions {
  input?: string;
  engine?: string;
  model?: string;
}

export async function applyTemplate (templateName: string, inputString: string, options: InputOptions): Promise<string> {
  const template = getTemplate(templateName);
  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }
  
  const { templateSettings, promptText } = breakTemplateIntoMajorComponents(template);

  // Process items in the preprocess section
  const preprocessed = templateSettings && templateSettings.preprocess
    ? await preprocess({ items: templateSettings.preprocess, inputString, options })
    : undefined;

  const processed = await processPromptTags({
    promptText,
    inputString,
    options,
    preprocessed,
  });

  const engine = options.engine || templateSettings.engine || process.env.ENGINE;
  if (!engine) {
    throw new Error('Engine not specified');
  }

  return callAIEngine(
      processed,
      {
        engine,
        model: options.model || templateSettings.model || getModelBasedOnGengine(engine),
      }
    );
};
