#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import { applyTemplate } from './apply-template.js';
import type { InputOptions } from './apply-template.js';
import { expandHomeDir, loadConfig } from './config.js';
import { getInputFromStdin, getInputFromPathOrUrl } from './input.js';

loadConfig();

const execute = async (command: string, options: InputOptions): Promise<string> => {
  const inputData = options.input
    ? await getInputFromPathOrUrl(options.input)
    : await getInputFromStdin();
  return applyTemplate(command, inputData, options);
};

program
  .name('gptools')
  .description('CLI to interact with OpenAI');

fs.readdirSync(expandHomeDir(process.env.GPTOOLS_PROMPTS_DIR!)).forEach((file) => {
  const commandName = path.basename(file, '.md');
  program
    .command(commandName)
    .description(`Runs the provided text against ${file}`)
    .option('--input <pathOrUrl>', 'Path to the document file or URL to accept instead of receiving from stdin')
    .option('--engine <value>', 'AI engine to use if not specified by the file (ollama or openai)')
    .option('--model <value>', 'AI engine to use if not specified by the file (i.e. gpt-3.5-turbo)')
    .action(
      (options: InputOptions) => execute(commandName, options)
        .then((result) => {
          console.log(result);
          process.exit(0);
        })
        .catch((err) => {
          console.error(err);
          process.exit(1);
        }),
    );
});

program.parse(process.argv);