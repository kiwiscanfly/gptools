# Changelog

## Upcoming (v2.0.0)

### Features

- Deploy to server

## Upcoming (v1.1.0)

## Features

- Variable support in the template, with a command/tool that you can pipe JSON into and allow it to be used as variables in the template
- Ability to call a web service and then pipe the result into the variable command or into the template

### Maintenance

- Support additional engines
- Support additional settings
- Support additional URLs

## v1.0.0

### Features

- Support nested prompt templates
- Support jekyll style settings for the prompt templates
- Support preprocessing items in the templates header so that it can be processed once and then included multiple times in the document
- Allow piping of preprocessed prompts into other tags as INPUT into those tags
- Create a cli arguments / prompt template settings / `.gptools` heirachy
- Support the ability to have a "prompt file" that is not used as a prompt but rather a static template that can be used for formatting output or just as a file to be included, these would have an engine tye of `none`
- Allow piping in preprocessing and tags so that they can be chained

### Maintenance

- Update documentation
