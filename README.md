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

Currently **336 problems, 826 solutions** across all 16 topics: Binary Trees (99),
Heaps (20), Dynamic Programming (33), Backtracking (25), and the NeetCode 250
topics — Arrays and Hashing (21), Two Pointers and Intervals (18), Sliding
Window (9), Stacks (14), Binary Search (14), Linked Lists (13), Tries (3), Union
Find (5), Bit Manipulation (10), Greedy (13), Math and Geometry (13), Graphs (26).
None are placeholders any more.

Dynamic Programming is organised by **pattern** rather than as one flat list:
`dsa.html?topic=dp` lists the seven patterns, and
`dsa.html?topic=dp&pattern=<id>` shows that pattern's explanation followed by
its problems. A topic opts into this with `layout="patterns"`; each section
then supplies `summary` (one line, shown on its box) and `idea` (paragraphs).

### Where the content comes from

Two sources, kept apart on purpose:

- **Pedagogy** — `content/dsa.py` plus the `content/trees_*.py` and
  `content/bst_*.py` modules (trees), `content/heap.py` (heaps) and
  `content/dp.py` (dynamic programming): the
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
| `ref` | optional `(label, url)` for a non-LeetCode source, e.g. GeeksforGeeks |

`statement`, `examples`, `constraints` and `tags` come from the cache
automatically. Supply them inline only for premium or non-LeetCode problems —
the build refuses a problem with no statement from either source.

Exactly one approach per problem should set `best=True`.

A topic may define `prelude` for helpers its solutions share (`ListNode`,
`heapq` imports); it is prepended after the global `PRELUDE`.

## The Python Deep Dive section

[`content/deepdive/`](content/deepdive/) holds eleven long-form topics on how
CPython works — the GIL, memory management, bytecode, the object model,
magic (dunder) methods, descriptors, metaclasses, MRO, decorators, context managers and async
internals. Each topic is theory with runnable examples, then medium/hard
interview questions with answers.

The one rule holds here too: every `code(...)` block is executed by
`build.py` and its captured output is shipped beside it. A block that raises
without `raises=True` (or vice versa) fails the build. Write prose that stays
true to what the build prints — bytecode and GC details change between
versions, so re-read the outputs after upgrading Python.

One module per topic; order is set in `content/deepdive/__init__.py`. The
block helpers and schema are in [`_blocks.py`](content/deepdive/_blocks.py):

| block | notes |
| --- | --- |
| `"text"` | a paragraph; inline `<code>`, `<strong>`, `<em>`, `<br>` allowed |
| `code(src, label=, raises=)` | **executed**; output rendered below it |
| `table(head, rows)` | comparison grid |
| `note(text)` | rule-of-thumb callout |
| `caveat(text)` | CPython implementation detail, not a guarantee |

## The Databases section

[`content/databases/`](content/databases/) holds fourteen topics on how
databases work: B+ tree indexes, transactions and MVCC, locking, query
execution, storage internals, Redis, replication, sharding, WAL and
durability, backups and recovery, normalization, SQL, columnar storage and
caching. Topics use the same blocks as the Deep Dive (import them from
`deepdive._blocks`) and add a one-line `summary` for the topic card.
`deepdive.js` renders both sections; `databases.html` points it at
`window.GRAIL_DB` through `data-*` attributes on `#deepdive`.

Examples run against SQLite from the standard library, so query plans,
isolation behaviour and WAL sizes are what that engine actually did. Where
SQLite cannot show a behaviour (Redis structures, replication, sharding) a
small deterministic model stands in. To measure work without timings, some
snippets count SQLite VM instructions with the progress handler.

## Layout

```
index.html            home — stats, six featured entries, DSA teaser
browse.html           search + difficulty chips + topic dropdown
entry.html            single entry, rendered client-side from ?id=
dsa.html              DSA topic index, or one topic via ?topic=
problem.html          single DSA problem via ?id=
deepdive.html         Deep Dive topic boxes, or one topic via ?topic=
databases.html        Databases topics, same renderer as the Deep Dive
build.py              runs every snippet AND every DSA solution; fails loudly
fetch_leetcode.py     caches problem statements into content/leetcode.json
content/entries.py    the 103 gotcha entries
content/dsa.py        DSA topics: binary trees + the planned stubs
content/trees_*.py    more Binary Trees sections (paths, views, LCA, DP, AVL...)
content/bst_*.py      the BST sections of Binary Trees
content/deepdive/     Python Deep Dive topics, one module each
content/databases/    Databases topics, one module each
content/heap.py       DSA topic: heaps and priority queues
content/dp.py         DSA topic: dynamic programming, seven patterns
content/leetcode.json GENERATED by fetch_leetcode.py
assets/js/app.js    shared helpers + a hand-rolled Python highlighter
assets/js/data.js       GENERATED — do not edit
assets/js/dsa-data.js   GENERATED — do not edit
assets/css/         one stylesheet
```
