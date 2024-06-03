# gptools

`gptools` is a simple command line utility for executing your ChatGPT or Ollama prompts. By accepting input through the standard input, it provides the ability to chain your prompts, by using advanced templating techniques it also allow you to nest prompts within one-another. The command also provides the ability to accept PDFs and YouTube links through the `--input` option. By storing the prompts in a user definable directory it provides the ability to create, gather and experiment on your own collection of prompts which you can store in your own git repository and use in other projects.

For instuctions on how to use plese visit [this blog post](https://labs.bex.codes/development/gptools-ai-command-line-tool.html).

## Installation

1. Clone the repo using git: `git clone https://github.com/kiwiscanfly/gptools.git`
2. Install globally using NPM `npm install -g`
3. Create a plain-text config file named `.gptools` in your home directory, it should contain the following settings (adjust to your requirements):
```
ENGINE: 'openai'
OPENAI_API_KEY="<your api key>"
OPENAI_MAX_TOKENS=2000
OPENAI_MODEL="gpt-4-turbo-preview"
GPTOOLS_PROMPTS_DIR="~/prompts"
OLLAMA_MODEL="llama3"
```
4. Create a directory called prompts
5. Create markdown files in this directory for each command. The filename will be the name of the command. Use the placeholder `<!-- INPUT -->` to denote where to put the command input. The following is a simplistic example:

Filename: `summarise.md`

```
Summarise the following text:

<!-- INPUT -->
```

## Example Usage

- `gptools wisdom --input complex-paper.pdf`: This will execute the `wisdom.md` prompt with the contents of the PDF file.
- `cat essay.md | gptools summarise`: This will execute the `summarise.md` prompt with the contents of `essay.md`.
- `git diff | gptools diff`
- `git diff <branch1>..<branch2> | gptools diff`
- `cat codefile.js | gptools code-review`: This will execute the `code-review.md` prompt with the contents of `codefile.js`.
- `find . -path ./node_modules -prune -false -o -name "*.js" -exec sh -c 'echo "File: $1"; cat "$1"; echo ""' sh {} \; | gptools code-review`: This will combine all the javascript files in the current directory and send them over to your large language model for a code review using the prompt defined in `code-review.md`.

## Advanced Templating

The following is an example of some of the advanced techniques that can be used in prompt templates and demonstrates the following:

1. **Template nesting via tags** You can use a prompt template within another, the template in the tags is rendered before the template that it is within is sent to the AI model the nested template is defined within the tag i.e. `<!-- bullet-points -->` will render a template/prompt named `bullet-points.md` within the template.
2. **Triple backticks (```)**: optionally, these can be used to create a header section of a template where settings can be defined
3. **An `engine` of `none`** can be set, this means that the filled in template will not be sent to an AI model, which is useful when you want to execute other templates or want to include it in another.
4. **Preprocessing:** these templates are run before the body template that it is in is compiled. This means that it is only run once and then can be used in the tags in the body of the template.
5. **Pipes:** The pipe symbol `|` can be used to chain templates and send the result of one template to another via the `<!-- INPUT -->` tag. These can both be used within preprocessing and within the tags themselves.
6. **The settings heirachy:** When no settings are defined in the prompt template, we fall back to the settings defined in the `.gptools` file. i.e. for the `bullet-points.md` file we will use the engine defined in `ENGINE`. If it is set to `openai` we will use the model defined in `OPENAI_MODEL`.

### summarise.md

````
```
engine: ollama
model: llama3
```
Can you provide a one paragraph summary of the given text? The summary should cover the key points and main ideas presented in the original text, while also condensing the information into a concise and easy-to-understand format. Return nothing but the summary.

<!-- INPUT -->

````

### bullet-points.md

````
Please read the following text and provide an extensive list of all that is stated in the form of bullet points. Return nothing but the bullet points.

<!-- INPUT -->

````

### linkedin.md 

**`twitter.md` & `facebook.md` are similar**

````
Serve as my social media manager, create an engaging LinkedIn post about the following that incorporates prevelent hashtags and assists in optimizing engagement. This post should be targeted at business professionals. Return nothing but the tweet.

<!-- INPUT -->

````

### social.md

````
```
engine: none
preprocess:
  summary: summarise|bullet-points
```
# Social media posts

## Twitter

<!-- summary|twitter -->

## Facebook

<!-- summary|facebook -->

## LinkedIn

<!-- summary|linkedin -->

````

---

## ISC License

Copyright 2024 Rebecca Milne

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.