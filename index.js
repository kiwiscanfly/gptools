#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const pdf2md = require('@opendocsg/pdf2md');
const { program } = require('commander');
const { applyTemplate } = require('./src/template');
const { expandHomeDir, loadConfig } = require('./src/config');

loadConfig();

const getInputFromStdin = () => new Promise((resolve, reject) => {
  let inputData = '';
  process.stdin.resume();

  process.stdin.on('data', (data) => {
    inputData += data;
  });

  process.stdin.on('end', () => {
    resolve(inputData);
  });

  process.stdin.on('error', (err) => {
    reject(err);
  });
});

const getInputFromPdf = async (pdfOption) => {
  const filePath = path.resolve(pdfOption);
  if (!fs.statSync(filePath).isFile()) {
    console.error(`${filePath} is not a file`);
    process.exit(1);
  }
  const pdfBuffer = fs.readFileSync(filePath);
  return pdf2md(pdfBuffer);
};

const execute = async (command, options) => {
  const inputData = options.pdf
    ? await getInputFromPdf(options.pdf)
    : await getInputFromStdin();
  return applyTemplate(
    command,
    inputData,
    options,
  );
};

program
  .name('gptools')
  .description('CLI to interact with OpenAI');

fs.readdirSync(expandHomeDir(process.env.GPTOOLS_PROMPTS_DIR)).forEach((file) => {
  const commandName = path.basename(file, '.md');
  program
    .command(commandName)
    .description(`Runs the provided text against ${file}`)
    .option('--pdf <file>', `Pass a PDF file to run ${file} against`)
    .option('--engine', 'AI engine to use (ollama or openai)')
    .action(
      (options) => execute(commandName, options)
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
