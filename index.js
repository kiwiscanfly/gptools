#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const pdf2md = require('@opendocsg/pdf2md')
const { program } = require('commander');
const { processTemplate } = require('./src/openai');
const { expandHomeDir, loadConfig } = require('./src/config');

loadConfig();

const processInputOrPDF = (command, options) => {
  if (options.pdf) {
    const filePath = path.resolve(options.pdf);
    if (!fs.statSync(filePath).isFile()) {
      console.error(`${filePath} is not a file`);
      process.exit(1);
    }
    const pdfBuffer = fs.readFileSync(filePath);
    pdf2md(pdfBuffer)
      .then((pdfContent) => {
        processTemplate(command, pdfContent);
      })
      .catch((error) => {
        console.error(error);
      });
    return;
  }

  // Get input from stdin
  let inputData = '';
  process.stdin.resume();
  process.stdin.on('data', (data) => {
    inputData += data;
  });
  process.stdin.on('end', () => {
    processTemplate(command, inputData);
  });
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
    .action((options) => processInputOrPDF(commandName, options));
});

program.parse(process.argv);
