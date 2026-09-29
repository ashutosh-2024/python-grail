# python-grail

> Read the code. Guess the output. Get it wrong.

A collection of short Python programs that do not behave the way the code reads.
Each entry gives you a snippet, hides the answer behind a click, then explains
which rule of the language you tripped over.

Inspired by [cpp-grail](https://bashar-ahmed.github.io/cpp-grail/).

## Running locally

It is a static site with no build step. Any static server works:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly with `file://` also works.

## Deploying to GitHub Pages

1. Create a repo (e.g. `python-grail`) and push this directory to `main`.
2. Repo **Settings → Pages → Build and deployment**: source `Deploy from a branch`,
   branch `main`, folder `/ (root)`.
3. `window.GRAIL_REPO` at the top of `assets/js/app.js` already points at this repo;
   change it if you fork or rename.

The site will be live at <https://ashutosh-2024.github.io/python-grail/>.

`.nojekyll` is present so GitHub Pages serves the files as-is instead of running
them through Jekyll.

## Adding an entry

Everything lives in `assets/js/data.js`. Append an object to `window.GRAIL_ENTRIES`:

| field | required | notes |
| --- | --- | --- |
| `id` | yes | kebab-case, used in the URL (`entry.html?id=...`) |
| `num` | yes | display number, keep sequential |
| `title` | yes | short name for the behaviour |
| `subtitle` | yes | one-line catchphrase, shown in monospace |
| `difficulty` | yes | `beginner` \| `intermediate` \| `advanced` |
| `tags` | yes | array of topic strings; drives the Browse topic filter |
| `question` | yes | the prompt above the snippet |
| `code` | yes | the snippet, as a template literal |
| `output` | yes | **real** output, pasted from an actual run |
| `guesses` | no | array of common wrong answers |
| `explanation` | yes | array of paragraphs; inline HTML allowed |
| `extraCode` | no | a follow-up REPL transcript |
| `fixNote` / `fixCode` | no | how you would write it in real code |
| `takeaway` | no | one-sentence rule to remember |
| `refs` | no | array of `{ label, url }` into the language reference |

The one rule: **run the snippet first and paste what actually happened.** Do not
write the output from memory.

## Layout

```
index.html        home
browse.html       filterable list
entry.html        single entry, rendered from ?id=
assets/js/data.js all content
assets/js/app.js  shared helpers + the Python syntax highlighter
assets/css/       one stylesheet
```
