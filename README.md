# gptools

`gptools` is a simple command line utility for executing your ChatGPT or Ollama prompts. By accepting input through the standard input, it provides the ability to chain your prompts. The command also provides the ability to accept PDFs through the `--pdf` option. By storing the prompts in a user definable directory it provides the ability to create, gather and experiment on your own collection of prompts which you can store in your own repository and use in other projects.

For instuctions on how to use plese visit [this blog post](https://labs.bex.codes/development/gptools-ai-command-line-tool.html).

## Installation

1. Clone the repo using git: `git clone https://github.com/kiwiscanfly/gptools.git`
2. Install globally using NPM `npm install -g`
3. Create a plain-text config file named `.gptools` in your home directory, it should contain the following settings (adjust to your requirements):
```
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

- `gptools wisdom --pdf complex-paper.pdf`: This will execute the `wisdom.md` prompt with the contents of the PDF file.
- `cat essay.md | gptools summarise`: This will execute the `summarise.md` prompt with the contents of `essay.md`.
- `git diff | gptools diff`
- `git diff <branch1>..<branch2> | gptools diff`
- `cat codefile.js | gptools code-review`: This will execute the `code-review.md` prompt with the contents of `codefile.js`.
- `find . -path ./node_modules -prune -false -o -name "*.js" -exec sh -c 'echo "File: $1"; cat "$1"; echo ""' sh {} \; | gptools code-review`: This will combine all the javascript files in the current directory and send them over to ChatGPT for a code review using the prompt defined in `code-review.md`.

---

ISC License

Copyright <YEAR> <OWNER>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.