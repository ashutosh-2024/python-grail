# python-grail

> Read the code. Guess the output. Get it wrong.

**103 short Python programs that do not behave the way the code reads.** Each
entry gives you a snippet, hides the answer behind a click, then explains which
rule of the language you tripped over.

Inspired by [cpp-grail](https://bashar-ahmed.github.io/cpp-grail/).

Live at <https://ashutosh-2024.github.io/python-grail/>.

## The one rule

**No output on this site is written by hand.**

`build.py` executes every snippet in a subprocess and captures what actually
came back — stdout, stderr, tracebacks, warnings and all. Every `>>>` transcript
is verified with `doctest`. Every "the fix" snippet is executed and must not
raise. If any of that stops being true, the build fails rather than shipping a
page that lies.

That is why the footer names an exact interpreter version instead of a range.

## Running locally

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Static, no dependencies, no build step needed to *serve* it — `assets/js/data.js`
is generated and committed.

## Adding or editing an entry

All content lives in one file: [`content/entries.py`](content/entries.py).
Append a `dict(...)` to `ENTRIES`, then:

```bash
python3 build.py
```

which regenerates `assets/js/data.js`. Commit both files.

| field | required | notes |
| --- | --- | --- |
| `id` | yes | kebab-case, becomes the URL (`entry.html?id=...`) |
| `title` | yes | short name for the behaviour |
| `subtitle` | yes | one-line catchphrase, rendered in monospace |
| `difficulty` | yes | `beginner` \| `intermediate` \| `advanced` |
| `tags` | yes | topic strings; drive the Browse topic filter |
| `question` | no | prompt above the snippet; defaults to "What does this print?" |
| `code` | yes | the snippet — **executed by the build** |
| `expect_raises` | no | `True` if the snippet is meant to end in a traceback |
| `guesses` | no | common wrong answers |
| `explanation` | yes | list of paragraphs; inline HTML allowed |
| `extra` | no | a `>>>` transcript — **verified with doctest** |
| `fix_note` / `fix` | no | how you would write it for real — **executed** |
| `takeaway` | no | one-sentence rule |
| `caveat` | no | set when the behaviour is a CPython detail, not a guarantee |
| `refs` | no | list of `(label, url)` |

`num` is assigned automatically from list order. Do not set it.

Snippets must be **deterministic**: no timing, no randomness, no `id()` values,
no memory addresses. The build scrubs interpreter paths, temp directories and
hex addresses as a backstop, but do not rely on it.

Where a behaviour is a CPython implementation detail rather than a language
guarantee — the small-int cache, constant deduplication, refcount timing — say
so in `caveat`. The site renders it as a distinct callout.

## Deploying

Push to `main`, then **Settings → Pages → Deploy from a branch → `main` / `(root)`**.
`.nojekyll` stops GitHub running the files through Jekyll. Every later push
redeploys.

## Layout

```
index.html          home — stats and six featured entries
browse.html         search + difficulty chips + topic dropdown
entry.html          single entry, rendered client-side from ?id=
build.py            runs every snippet, generates data.js, fails loudly
content/entries.py  all content, the only file you edit
assets/js/app.js    shared helpers + a hand-rolled Python highlighter
assets/js/data.js   GENERATED — do not edit
assets/css/         one stylesheet
```
