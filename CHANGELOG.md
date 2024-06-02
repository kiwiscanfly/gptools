# Changelog

## Upcoming (v1.1.0)

### Features

- Support additional engines
- Support additional settings

## Pending (v1.0.0)

### Features

- Support nested prompt templates
- Support jekyll style settings for the prompt templates
- Support preprocessing items in the templates header so that it can be processed once and then included multiple times in the document
- Allow piping of preprocessed prompts into other tags as INPUT into those tags
- Create a cli arguments / prompt template settings / `.gptools` heirachy
- Support the ability to have a "prompt file" that is not used as a prompt but rather a static template that can be used for formatting output or just as a file to be included, these would have an engine tye of `none`
- Allow piping in preprocessing so that they can be chained
- Allow tools to be used i.e PDF, YouTube transcripts, give them a prefix but they should be used in the same way as prompt files

### Maintenance

- Use async correctly
- Update documentation
