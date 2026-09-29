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

Interview problems by topic. Each problem page carries the LeetCode statement,
examples and constraints, then every worthwhile approach with its time and
auxiliary space cost and the reason that bound holds.

Currently **38 problems, 76 solutions** across Binary Trees (18) and Heaps (20);
the other topics are placeholders.

### Where the content comes from

Two sources, kept apart on purpose:

- **Pedagogy** — `content/dsa.py` (trees) and `content/heap.py` (heaps): the
  approaches, complexity reasoning, code and tests.
- **Problem statements** — `content/leetcode.json`, fetched from LeetCode's
  GraphQL API by `fetch_leetcode.py` and committed, so the site build never
  needs the network.

```bash
python3 fetch_leetcode.py          # fetch anything new
python3 fetch_leetcode.py --force  # refetch everything
python3 build.py                   # run all solutions, regenerate data
```

The build cross-checks the fetched metadata against what the entry claims and
fails on any mismatch: wrong LeetCode number, wrong difficulty, a slug missing
from the cache, or a URL that does not match its slug.

> LeetCode statements, examples and constraints are reproduced from their API.
> That is their content; if you would rather not republish it, replace the
> `statement` field per problem and the fetch becomes metadata-only.

### Adding a problem

Append to the relevant topic's `sections[...]["problems"]`:

| field | notes |
| --- | --- |
| `id` | kebab-case, becomes `problem.html?id=` |
| `lc` / `slug` | LeetCode number and URL slug. Omit both for a non-LeetCode entry |
| `name`, `difficulty` | difficulty must match LeetCode's or the build fails |
| `approaches` | `name`, `time`, `space`, `why`, `code`, `best`, `tag` |
| `tests` | assertions run against **every** approach |
| `pitfall` | optional; the mistake people actually make |

`statement`, `examples`, `constraints` and `tags` come from the cache
automatically. Supply them inline only for premium or non-LeetCode problems —
the build refuses a problem with no statement from either source.

Exactly one approach per problem should set `best=True`.

A topic may define `prelude` for helpers its solutions share (`ListNode`,
`heapq` imports); it is prepended after the global `PRELUDE`.

## Layout

```
index.html            home — stats, six featured entries, DSA teaser
browse.html           search + difficulty chips + topic dropdown
entry.html            single entry, rendered client-side from ?id=
dsa.html              DSA topic index, or one topic via ?topic=
problem.html          single DSA problem via ?id=
build.py              runs every snippet AND every DSA solution; fails loudly
fetch_leetcode.py     caches problem statements into content/leetcode.json
content/entries.py    the 103 gotcha entries
content/dsa.py        DSA topics: binary trees + the planned stubs
content/heap.py       DSA topic: heaps and priority queues
content/leetcode.json GENERATED by fetch_leetcode.py
assets/js/app.js    shared helpers + a hand-rolled Python highlighter
assets/js/data.js       GENERATED — do not edit
assets/js/dsa-data.js   GENERATED — do not edit
assets/css/         one stylesheet
```
