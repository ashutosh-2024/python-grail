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

## The DSA section

[`content/dsa.py`](content/dsa.py) holds a separate study path: interview
problems grouped by topic, ordered so each one teaches the next, with every
worthwhile approach's time and auxiliary space cost and the reason it holds.

The same rule applies. Each approach's code is executed with a shared prelude
(`TreeNode`, `build`, `level_order`) and the problem's `tests` appended; a
failing assertion fails the build. Currently **18 problems, 40 solutions** under
Binary Trees, with Heaps reserved as a stub.

Structure is topic → section → problem → approaches:

| field | notes |
| --- | --- |
| `topic` | `id`, `title`, `subtitle`, `blurb`, `convention`, `sections`, `status` |
| `section` | `id`, `title`, `idea` (paragraphs teaching the pattern) |
| `problem` | `id`, `lc`, `slug`, `name`, `difficulty`, `framing`, `pitfall`, `tests` |
| `approach` | `name`, `time`, `space`, `why` (paragraphs), `code`, `best`, `tag` |

`slug` is the LeetCode URL slug — the link is built from it, so it must be the
real slug and not the problem number. Exactly one approach per problem should
carry `best=True`; it renders as "pick this".

Set `status="stub"` with `sections=[]` for a topic that is reserved but not
written, rather than shipping half a lesson.

The LeetCode mark in `assets/js/problem.js` is a hand-drawn approximation, not
the official asset. Swap it if you want it exact.

## Layout

```
index.html          home — stats, six featured entries, DSA teaser
browse.html         search + difficulty chips + topic dropdown
entry.html          single entry, rendered client-side from ?id=
dsa.html            DSA topic index, or one topic via ?topic=
problem.html        single DSA problem via ?id=
build.py            runs every snippet AND every DSA solution; fails loudly
content/entries.py  the 103 gotcha entries
content/dsa.py      the DSA study path
assets/js/app.js    shared helpers + a hand-rolled Python highlighter
assets/js/data.js       GENERATED — do not edit
assets/js/dsa-data.js   GENERATED — do not edit
assets/css/         one stylesheet
```
