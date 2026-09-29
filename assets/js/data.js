/* GENERATED FILE - do not edit by hand.
   Source: content/entries.py   Build: python3 build.py
   Every snippet below was executed on CPython 3.14.7 and the
   output field is exactly what came back. */

window.GRAIL_PYTHON = "3.14.7";
window.GRAIL_ENTRIES = [
  {
    "id": "mutable-default-argument",
    "num": 1,
    "title": "Mutable Default Arguments",
    "subtitle": "the list that remembers",
    "difficulty": "beginner",
    "tags": [
      "functions",
      "mutability",
      "defaults"
    ],
    "question": "What does this print?",
    "code": "def add_item(item, basket=[]):\n    basket.append(item)\n    return basket\n\nprint(add_item(\"apple\"))\nprint(add_item(\"banana\"))\nprint(add_item(\"cherry\", []))\nprint(add_item(\"date\"))",
    "output": "['apple']\n['apple', 'banana']\n['cherry']\n['apple', 'banana', 'date']",
    "isError": false,
    "guesses": [
      "['apple'], then ['banana'], then ['cherry'], then ['date']",
      "A fresh empty list on every call"
    ],
    "explanation": [
      "Default arguments are evaluated <strong>once</strong>, when the <code>def</code> statement runs &mdash; not on every call. That single list object is stored on the function and reused forever.",
      "So <code>add_item(\"apple\")</code> mutates the shared default in place, and the next bare call sees the leftovers. Passing an explicit <code>[]</code> bypasses the default entirely, which is why <code>\"cherry\"</code> lands in a clean list &mdash; but that call does nothing to reset the default, so <code>\"date\"</code> joins apple and banana.",
      "You can watch the default rot in real time:"
    ],
    "extraCode": ">>> def add_item(item, basket=[]):\n...     basket.append(item)\n...     return basket\n...\n>>> add_item.__defaults__\n([],)\n>>> add_item(\"x\")\n['x']\n>>> add_item.__defaults__\n(['x'],)",
    "fixNote": "Use <code>None</code> as the sentinel and build the real default inside the body:",
    "fixCode": "def add_item(item, basket=None):\n    if basket is None:\n        basket = []\n    basket.append(item)\n    return basket\n\nprint(add_item(\"apple\"))\nprint(add_item(\"banana\"))",
    "takeaway": "Immutable defaults (numbers, strings, tuples, None) are safe. Anything you can mutate is a trap.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; default argument values",
        "url": "https://docs.python.org/3/reference/compound_stmts.html#function-definitions"
      }
    ]
  },
  {
    "id": "small-int-identity",
    "num": 2,
    "title": "`is` Is Not `==`",
    "subtitle": "two ints that are equal but not the same",
    "difficulty": "beginner",
    "tags": [
      "identity",
      "integers",
      "cpython"
    ],
    "question": "What does this print?",
    "code": "def add_one(n):\n    return n + 1\n\na, b = add_one(255), 256\nc, d = add_one(256), 257\n\nprint(a == b, a is b)\nprint(c == d, c is d)",
    "output": "True True\nTrue False",
    "isError": false,
    "guesses": [
      "True True on both lines",
      "True False on both lines"
    ],
    "explanation": [
      "<code>==</code> asks whether two objects have the same value. <code>is</code> asks whether they are the same object. For most types those are different questions, and integers are where the difference first bites.",
      "CPython pre-allocates every int from <code>-5</code> to <code>256</code> at startup and hands out the same object every time one is needed. <code>255 + 1</code> therefore lands on the cached <code>256</code>, the same object the literal refers to. <code>256 + 1</code> is outside the cache, so it builds a fresh object and <code>is</code> says no.",
      "The <code>add_one</code> call is doing real work here: written as a plain <code>c = 256 + 1</code> the compiler would fold the arithmetic and the whole effect would disappear. That is the next entry."
    ],
    "extraCode": "",
    "fixNote": "Compare integers with <code>==</code>. Reserve <code>is</code> for singletons &mdash; <code>None</code>, <code>True</code>, <code>False</code>, and sentinels you created yourself:",
    "fixCode": "MISSING = object()\n\ndef get(d, key, default=MISSING):\n    value = d.get(key, MISSING)\n    if value is MISSING:\n        return default\n    return value\n\nprint(get({\"a\": 1}, \"a\"), get({\"a\": 1}, \"b\", 0))",
    "takeaway": "If you ever write `is` next to a number or a string, you meant `==`.",
    "caveat": "The size of the small-int cache is a CPython implementation detail. Other interpreters, and future CPython versions, are free to cache a different range or none at all.",
    "refs": [
      {
        "label": "Python docs &mdash; comparisons",
        "url": "https://docs.python.org/3/reference/expressions.html#is-not"
      },
      {
        "label": "CPython source &mdash; small int cache",
        "url": "https://github.com/python/cpython/blob/main/Objects/longobject.c"
      }
    ]
  },
  {
    "id": "literal-identity-script-vs-repl",
    "num": 3,
    "title": "The Same Literal, Two Answers",
    "subtitle": "your REPL and your script disagree",
    "difficulty": "beginner",
    "tags": [
      "identity",
      "integers",
      "compiler",
      "cpython"
    ],
    "question": "This is the previous entry with the arithmetic removed. Same two literals. What changes?",
    "code": "x = 257\ny = 257\nprint(x is y)\n\ndef f():\n    p = 257\n    return p\n\nprint(f() is x)",
    "output": "True\nTrue",
    "isError": false,
    "guesses": [
      "False, then False",
      "True, then False"
    ],
    "explanation": [
      "Paste the first three lines into an interactive prompt and you get <code>False</code>. Run them as a script and you get <code>True</code>. Nothing about the language changed &mdash; what changed is how much code the compiler got to see at once.",
      "CPython compiles a whole module as one unit and keeps a table of its constants, deduplicating equal ones. Both <code>257</code> literals become a single entry in that table, so <code>x</code> and <code>y</code> are bound to the same object. The REPL compiles each statement on its own, so the two <code>257</code>s land in different tables and really are different objects.",
      "On CPython 3.14 that table is shared across the whole compilation unit, so even the <code>257</code> inside <code>f</code> &mdash; a separate code object, with its own <code>co_consts</code> &mdash; resolves to the same integer. Two unrelated functions returning the same large literal will hand you the same object.",
      "The REPL is where you will meet this, because it is where people test <code>is</code>:"
    ],
    "extraCode": ">>> x = 257\n>>> y = 257\n>>> x is y\nFalse\n>>> x, y = 257, 257\n>>> x is y\nTrue",
    "fixNote": "There is nothing to fix &mdash; there is something to stop relying on. Compare values, not identities:",
    "fixCode": "x = 257\ny = 257\nprint(x == y)",
    "takeaway": "Identity of equal immutables is an accident of compilation. Never build behaviour on it, and never conclude anything from testing it in a REPL.",
    "caveat": "Constant deduplication is a CPython optimisation with no guarantee behind it, and its reach has widened over time — 3.14 shares constants across code objects where older versions did not. The same script can answer differently on another version or another implementation.",
    "refs": [
      {
        "label": "Python docs &mdash; the standard type hierarchy",
        "url": "https://docs.python.org/3/reference/datamodel.html#objects-values-and-types"
      }
    ]
  },
  {
    "id": "float-arithmetic-is-not-decimal",
    "num": 4,
    "title": "0.1 + 0.2",
    "subtitle": "the sum that misses by a hair",
    "difficulty": "beginner",
    "tags": [
      "floats",
      "numbers",
      "equality"
    ],
    "question": "What does this print?",
    "code": "print(0.1 + 0.2)\nprint(0.1 + 0.2 == 0.3)\nprint(f\"{0.1:.20f}\")\n\ntotal = 0.0\nfor _ in range(10):\n    total += 0.1\nprint(total, total == 1.0)",
    "output": "0.30000000000000004\nFalse\n0.10000000000000000555\n0.9999999999999999 False",
    "isError": false,
    "guesses": [
      "0.3 and True",
      "0.30000000000000004 but still True"
    ],
    "explanation": [
      "A Python <code>float</code> is an IEEE-754 double: a binary fraction. <code>0.1</code> is no more representable in binary than <code>1/3</code> is in decimal, so what you actually store is the nearest double, which is slightly more than a tenth.",
      "The literal <code>0.3</code> and the computed <code>0.1 + 0.2</code> round to <em>different</em> doubles, so the equality fails. Adding a tenth ten times accumulates the error rather than cancelling it.",
      "This is not a Python bug and not a CPython detail &mdash; every language with hardware floats behaves this way."
    ],
    "extraCode": "",
    "fixNote": "Compare with a tolerance, or use a decimal type when the decimal-ness is the point (money, invoices, anything a human will audit):",
    "fixCode": "import math\nfrom decimal import Decimal\n\nprint(math.isclose(0.1 + 0.2, 0.3))\nprint(Decimal(\"0.1\") + Decimal(\"0.2\") == Decimal(\"0.3\"))",
    "takeaway": "Never write `==` between two floats that came from arithmetic. Use `math.isclose`, or move to `Decimal`.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; floating point arithmetic: issues and limitations",
        "url": "https://docs.python.org/3/tutorial/floatingpoint.html"
      },
      {
        "label": "Python docs &mdash; math.isclose",
        "url": "https://docs.python.org/3/library/math.html#math.isclose"
      }
    ]
  },
  {
    "id": "bankers-rounding",
    "num": 5,
    "title": "round(0.5) Is 0",
    "subtitle": "the rounding you were not taught at school",
    "difficulty": "beginner",
    "tags": [
      "numbers",
      "floats",
      "rounding"
    ],
    "question": "What does this print?",
    "code": "print(round(0.5), round(1.5), round(2.5), round(3.5))\nprint(round(-0.5), round(-1.5))\nprint(round(2.675, 2))",
    "output": "0 2 2 4\n0 -2\n2.67",
    "isError": false,
    "guesses": [
      "1 2 3 4",
      "1 2 3 4 and 2.68"
    ],
    "explanation": [
      "Python rounds halves to the nearest <em>even</em> number, not away from zero. This is banker's rounding, and it is the IEEE-754 default because it does not accumulate an upward bias over a long column of figures the way always-round-up does.",
      "The last line is a different problem wearing the same coat. <code>2.675</code> is not exactly 2.675 &mdash; the nearest double is very slightly below it &mdash; so there is no tie to break and it rounds down. The rounding rule is innocent here; the binary representation is not."
    ],
    "extraCode": ">>> from decimal import Decimal\n>>> Decimal(2.675)\nDecimal('2.67499999999999982236431605997495353221893310546875')",
    "fixNote": "If you need half-up rounding, say so explicitly with <code>Decimal</code>, which also removes the representation problem:",
    "fixCode": "from decimal import Decimal, ROUND_HALF_UP\n\ndef round_half_up(value, places=0):\n    exp = Decimal(1).scaleb(-places)\n    return Decimal(str(value)).quantize(exp, rounding=ROUND_HALF_UP)\n\nprint(round_half_up(0.5), round_half_up(2.5))\nprint(round_half_up(2.675, 2))",
    "takeaway": "`round` is not the rounding your spreadsheet does. For money, use `Decimal` with an explicit rounding mode.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; round",
        "url": "https://docs.python.org/3/library/functions.html#round"
      },
      {
        "label": "Python docs &mdash; decimal rounding modes",
        "url": "https://docs.python.org/3/library/decimal.html#rounding-modes"
      }
    ]
  },
  {
    "id": "floor-division-goes-down",
    "num": 6,
    "title": "Floor Division Goes Down, Not Toward Zero",
    "subtitle": "-7 // 2 is -4",
    "difficulty": "beginner",
    "tags": [
      "numbers",
      "integers",
      "operators"
    ],
    "question": "What does this print?",
    "code": "print(7 // 2, -7 // 2)\nprint(int(7 / 2), int(-7 / 2))\n\nimport math\nprint(math.floor(-3.5), math.trunc(-3.5))",
    "output": "3 -4\n3 -3\n-4 -3",
    "isError": false,
    "guesses": [
      "3 and -3 on the first line",
      "3 and -4 on both lines"
    ],
    "explanation": [
      "<code>//</code> is <em>floor</em> division: it rounds toward negative infinity, so <code>-7 // 2</code> is <code>-4</code>. It is not truncation.",
      "<code>int()</code> on a float truncates toward zero, which is why the second line disagrees. Most languages that grew out of C make <code>/</code> on integers truncate; Python deliberately did not, so that <code>a // b</code> and <code>a % b</code> stay consistent with each other for negative operands.",
      "If you have been using <code>//</code> to mean \"integer divide\" on a value that can go negative &mdash; array midpoints, time offsets, coordinates &mdash; this is a real off-by-one waiting to happen."
    ],
    "extraCode": "",
    "fixNote": "Pick the one you actually meant. <code>math.trunc</code> or <code>int()</code> for toward-zero, <code>//</code> for floor:",
    "fixCode": "import math\n\nprint(math.trunc(-7 / 2))\nprint(-7 // 2)\nprint(math.ceil(-7 / 2))",
    "takeaway": "For non-negative operands the two agree, which is exactly why the bug survives testing.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; binary arithmetic operations",
        "url": "https://docs.python.org/3/reference/expressions.html#binary-arithmetic-operations"
      }
    ]
  },
  {
    "id": "modulo-sign-follows-divisor",
    "num": 7,
    "title": "The Modulo Sign Follows The Divisor",
    "subtitle": "-7 % 3 is 2",
    "difficulty": "beginner",
    "tags": [
      "numbers",
      "integers",
      "operators"
    ],
    "question": "What does this print?",
    "code": "print(-7 % 3)\nprint(7 % -3)\nprint(divmod(-7, 3))\n\nimport math\nprint(math.fmod(-7, 3))",
    "output": "2\n-2\n(-3, 2)\n-1.0",
    "isError": false,
    "guesses": [
      "-1 on the first line",
      "-1 and 1"
    ],
    "explanation": [
      "Python's <code>%</code> always returns a result with the sign of the <em>divisor</em>, never the dividend. C, Java, Rust and Go do the opposite. If you learned modulo anywhere else, your intuition is inverted here.",
      "The rule exists so that <code>(a // b) * b + (a % b) == a</code> holds for every pair of integers, which is what <code>divmod</code> returns as a pair.",
      "<code>math.fmod</code> gives you the C behaviour if you need it &mdash; note it returns a float.",
      "This is a feature when you are cycling an index, and a bug when you are extracting a signed remainder:"
    ],
    "extraCode": ">>> [(-3 + i) % 4 for i in range(4)]\n[1, 2, 3, 0]\n>>> hours = -5\n>>> hours % 12\n7",
    "fixNote": "For a clock or a ring buffer, <code>%</code> is already what you want. For a true signed remainder, be explicit:",
    "fixCode": "import math\n\nprint(math.fmod(-7, 3))\nprint(-7 - int(-7 / 3) * 3)",
    "takeaway": "Python's `%` is a modulo, not a remainder. The distinction only shows up when one operand is negative.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; binary arithmetic operations",
        "url": "https://docs.python.org/3/reference/expressions.html#binary-arithmetic-operations"
      }
    ]
  },
  {
    "id": "list-multiplication-aliases",
    "num": 8,
    "title": "[[0] * 3] * 3",
    "subtitle": "a grid with one row in it",
    "difficulty": "beginner",
    "tags": [
      "lists",
      "mutability",
      "aliasing"
    ],
    "question": "What does this print?",
    "code": "grid = [[0] * 3] * 3\ngrid[0][0] = 1\n\nfor row in grid:\n    print(row)\n\nprint([id(row) == id(grid[0]) for row in grid])",
    "output": "[1, 0, 0]\n[1, 0, 0]\n[1, 0, 0]\n[True, True, True]",
    "isError": false,
    "guesses": [
      "[1,0,0] then [0,0,0] then [0,0,0]",
      "A TypeError"
    ],
    "explanation": [
      "<code>list * n</code> copies <em>references</em>, not objects. The inner <code>[0] * 3</code> is fine, because integers are immutable and rebinding <code>grid[0][0]</code> replaces the reference rather than mutating the zero. The outer multiplication is not fine: it produces three references to the one row list.",
      "So <code>grid[0][0] = 1</code> mutates the single row that all three slots point at, and it appears to show up three times because it <em>is</em> three times.",
      "The same trap sits in <code>[set()] * n</code>, <code>[{}] * n</code> and <code>[MyClass()] * n</code>."
    ],
    "extraCode": "",
    "fixNote": "Build each row separately with a comprehension, which evaluates <code>[0] * 3</code> once per iteration:",
    "fixCode": "grid = [[0] * 3 for _ in range(3)]\ngrid[0][0] = 1\nfor row in grid:\n    print(row)",
    "takeaway": "`*` on a list is safe only when the elements are immutable.",
    "caveat": "",
    "refs": [
      {
        "label": "Python FAQ &mdash; how do I create a multidimensional list?",
        "url": "https://docs.python.org/3/faq/programming.html#how-do-i-create-a-multidimensional-list"
      }
    ]
  },
  {
    "id": "assignment-is-not-a-copy",
    "num": 9,
    "title": "b = a Does Not Copy",
    "subtitle": "two names, one list",
    "difficulty": "beginner",
    "tags": [
      "lists",
      "mutability",
      "aliasing",
      "copying"
    ],
    "question": "What does this print?",
    "code": "a = [1, 2, [3, 4]]\nb = a\nb.append(5)\nprint(a)\n\nc = a[:]\nc.append(6)\nprint(a, c)\n\nc[2].append(99)\nprint(a)",
    "output": "[1, 2, [3, 4], 5]\n[1, 2, [3, 4], 5] [1, 2, [3, 4], 5, 6]\n[1, 2, [3, 4, 99], 5]",
    "isError": false,
    "guesses": [
      "[1, 2, [3, 4]] on the first line",
      "The last line prints [1, 2, [3, 4]]"
    ],
    "explanation": [
      "Assignment in Python binds a name to an object. It never copies. <code>b = a</code> gives the same list a second name, so <code>b.append</code> is visible through <code>a</code>.",
      "<code>a[:]</code> does copy &mdash; but only one level deep. The new outer list holds the same three references as the old one, so the nested <code>[3, 4]</code> is still shared. Mutating it through <code>c</code> shows up in <code>a</code>.",
      "<code>list(a)</code> and <code>copy.copy(a)</code> behave exactly like <code>a[:]</code>. Only <code>copy.deepcopy</code> walks the whole structure."
    ],
    "extraCode": "",
    "fixNote": "Match the copy depth to the structure. Shallow is enough for a flat list; nested data needs <code>deepcopy</code>:",
    "fixCode": "import copy\n\na = [1, 2, [3, 4]]\nd = copy.deepcopy(a)\nd[2].append(99)\nprint(a, d)",
    "takeaway": "`a[:]`, `list(a)` and `copy.copy(a)` are the same shallow copy. Reach for `deepcopy` only when you know the structure is nested.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; copy",
        "url": "https://docs.python.org/3/library/copy.html"
      }
    ]
  },
  {
    "id": "chained-assignment-shares",
    "num": 10,
    "title": "x = y = []",
    "subtitle": "one list wearing two names",
    "difficulty": "beginner",
    "tags": [
      "lists",
      "mutability",
      "aliasing",
      "assignment"
    ],
    "question": "What does this print?",
    "code": "x = y = []\nx.append(1)\nprint(x, y)\n\nclass Counter:\n    hits = misses = []\n\na, b = Counter(), Counter()\na.hits.append(\"one\")\nprint(b.misses)",
    "output": "[1] [1]\n['one']",
    "isError": false,
    "guesses": [
      "[1] []",
      "[] on the last line"
    ],
    "explanation": [
      "<code>x = y = []</code> evaluates the right-hand side <em>once</em> and binds the single resulting object to both names, left to right. It is not shorthand for two empty lists.",
      "The class version compounds it: <code>hits</code> and <code>misses</code> are one list, it lives on the class rather than on any instance, and every instance shares it. Appending through <code>a.hits</code> is visible as <code>b.misses</code>.",
      "Read chained assignment as \"bind this one object to all of these names\" and the behaviour stops being surprising."
    ],
    "extraCode": "",
    "fixNote": "Write the two bindings separately, and build per-instance state in <code>__init__</code>:",
    "fixCode": "x, y = [], []\nx.append(1)\nprint(x, y)\n\nclass Counter:\n    def __init__(self):\n        self.hits = []\n        self.misses = []\n\na, b = Counter(), Counter()\na.hits.append(\"one\")\nprint(b.misses)",
    "takeaway": "Chained assignment is only safe for immutable values.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; assignment statements",
        "url": "https://docs.python.org/3/reference/simple_stmts.html#assignment-statements"
      }
    ]
  },
  {
    "id": "sort-returns-none",
    "num": 11,
    "title": "`.sort()` Returns None",
    "subtitle": "the one-liner that deletes your data",
    "difficulty": "beginner",
    "tags": [
      "lists",
      "mutability",
      "api-design"
    ],
    "question": "What does this print?",
    "code": "names = [\"carol\", \"alice\", \"bob\"]\nnames = names.sort()\nprint(names)\n\nnums = [3, 1, 2]\nprint(nums.append(4), nums.reverse(), nums.extend([5]))\nprint(nums)",
    "output": "None\nNone None None\n[4, 2, 1, 3, 5]",
    "isError": false,
    "guesses": [
      "['alice', 'bob', 'carol']",
      "An AttributeError somewhere"
    ],
    "explanation": [
      "Every list method that mutates in place returns <code>None</code>: <code>sort</code>, <code>reverse</code>, <code>append</code>, <code>extend</code>, <code>insert</code>, <code>clear</code>. That is a deliberate convention &mdash; returning <code>None</code> signals \"I changed the object you gave me\" and stops you chaining a mutation onto a read.",
      "The cost is this exact bug. <code>names = names.sort()</code> sorts the list, throws it away, and rebinds <code>names</code> to <code>None</code>. Nothing raises; the failure arrives later, somewhere else, as <code>TypeError: 'NoneType' object is not iterable</code>.",
      "Note the evaluation order on the second print: the arguments are evaluated left to right, so all three mutations happen before anything is printed."
    ],
    "extraCode": "",
    "fixNote": "Use the mutating method as a statement, or use the non-mutating builtin when you want a value:",
    "fixCode": "names = [\"carol\", \"alice\", \"bob\"]\nnames.sort()\nprint(names)\n\noriginal = [\"carol\", \"alice\", \"bob\"]\nprint(sorted(original), original)\nprint(list(reversed(original)))",
    "takeaway": "`sorted`/`reversed` return, `sort`/`reverse` mutate. If you are assigning the result, you want the builtin.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; sorting techniques",
        "url": "https://docs.python.org/3/howto/sorting.html"
      }
    ]
  },
  {
    "id": "string-methods-return-new",
    "num": 12,
    "title": "`.replace()` Does Not Mutate",
    "subtitle": "the cleanup that cleans nothing",
    "difficulty": "beginner",
    "tags": [
      "strings",
      "immutability"
    ],
    "question": "What does this print?",
    "code": "line = \"  user@example.com \\n\"\nline.strip()\nline.replace(\"@\", \" at \")\nline.upper()\nprint(repr(line))\n\ncleaned = line.strip().replace(\"@\", \" at \").upper()\nprint(repr(cleaned))",
    "output": "'  user@example.com \\n'\n'USER AT EXAMPLE.COM'",
    "isError": false,
    "guesses": [
      "'USER AT EXAMPLE.COM'",
      "An AttributeError on the second call"
    ],
    "explanation": [
      "Strings are immutable. No string method can change the object you called it on &mdash; every one of them builds and returns a new string, and if you throw that away nothing happened.",
      "The first three lines are legal, do real work, and discard all of it. Python will not warn you: an expression statement whose value you ignore is perfectly valid.",
      "Because each call returns a new string, they chain, which is the idiom you want."
    ],
    "extraCode": "",
    "fixNote": "Assign the result, or chain:",
    "fixCode": "line = \"  user@example.com \\n\"\nline = line.strip().replace(\"@\", \" at \").upper()\nprint(repr(line))",
    "takeaway": "If a string method's return value is not assigned or passed on, the line is dead code.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; string methods",
        "url": "https://docs.python.org/3/library/stdtypes.html#string-methods"
      }
    ]
  },
  {
    "id": "strip-is-not-removeprefix",
    "num": 13,
    "title": "strip('abc') Is Not removeprefix",
    "subtitle": "it eats characters, not the word",
    "difficulty": "beginner",
    "tags": [
      "strings",
      "api-design"
    ],
    "question": "What does this print?",
    "code": "print(\"abcdef\".strip(\"abc\"))\nprint(\"cbaXcba\".strip(\"abc\"))\nprint(\"test_data.csv\".strip(\".csv\"))\nprint(\"banana\".lstrip(\"ba\"))",
    "output": "def\nX\ntest_data\nnana",
    "isError": false,
    "guesses": [
      "'def', 'cbaXcba', 'test_data', 'nana'"
    ],
    "explanation": [
      "The argument to <code>strip</code> is a <em>set of characters</em>, not a prefix. Python removes characters from both ends, in any order, for as long as they are members of that set.",
      "<code>\"abcdef\".strip(\"abc\")</code> looks like it stripped the word \"abc\" &mdash; it did not, it stripped the letters a, b and c, and the result happens to be identical. That coincidence is what makes the bug survive code review.",
      "<code>\"test_data.csv\".strip(\".csv\")</code> is the version that reaches production. The character set is <code>{'.', 'c', 's', 'v'}</code>, so it eats the extension and then keeps eating, stopping only at the first character that is not one of those four. On this input it happens to stop right where you wanted; on <code>\"sassafras.csv\"</code> it does not."
    ],
    "extraCode": ">>> \"sassafras.csv\".strip(\".csv\")\n'assafra'\n>>> \"sassafras.csv\".removesuffix(\".csv\")\n'sassafras' ",
    "fixNote": "Use <code>removeprefix</code> and <code>removesuffix</code> (3.9+), which do the literal thing you meant:",
    "fixCode": "print(\"test_data.csv\".removesuffix(\".csv\"))\nprint(\"banana\".removeprefix(\"ba\"))\nprint(\"nothing\".removesuffix(\".csv\"))",
    "takeaway": "`strip` takes a character set. If you passed it a word, you almost certainly wanted `removeprefix`/`removesuffix`.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; str.removeprefix",
        "url": "https://docs.python.org/3/library/stdtypes.html#str.removeprefix"
      },
      {
        "label": "PEP 616 &mdash; string methods to remove prefixes and suffixes",
        "url": "https://peps.python.org/pep-0616/"
      }
    ]
  },
  {
    "id": "split-versus-split-space",
    "num": 14,
    "title": "split() vs split(' ')",
    "subtitle": "the empty field that appears from nowhere",
    "difficulty": "beginner",
    "tags": [
      "strings",
      "parsing"
    ],
    "question": "What does this print?",
    "code": "line = \"alice   bob  carol\"\nprint(line.split())\nprint(line.split(\" \"))\n\nprint(\"  padded  \".split())\nprint(\"  padded  \".split(\" \"))\nprint(\"a,b,,c\".split(\",\"))",
    "output": "['alice', 'bob', 'carol']\n['alice', '', '', 'bob', '', 'carol']\n['padded']\n['', '', 'padded', '', '']\n['a', 'b', '', 'c']",
    "isError": false,
    "guesses": [
      "The same list both times",
      "['alice', 'bob', 'carol'] for both"
    ],
    "explanation": [
      "<code>split()</code> with no argument is a different algorithm, not a default. It splits on runs of <em>any</em> whitespace and discards leading and trailing whitespace, so consecutive spaces never produce empty fields.",
      "<code>split(sep)</code> splits on each single occurrence of <code>sep</code>. Two spaces in a row means there is an empty string between them, and it is faithfully returned.",
      "Neither is wrong. For human-written whitespace-separated text you want the no-argument form; for delimited data where an empty field is meaningful &mdash; CSV, TSV &mdash; you want the explicit separator, because collapsing the run would silently shift your columns."
    ],
    "extraCode": "",
    "fixNote": "Choose deliberately, and say which you meant:",
    "fixCode": "line = \"alice   bob  carol\"\nprint(line.split())\nprint([f for f in line.split(\" \") if f])\n\nrow = \"a,b,,c\"\nprint(row.split(\",\"))",
    "takeaway": "`split()` is for prose. `split(sep)` is for data. Swapping them corrupts one or the other silently.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; str.split",
        "url": "https://docs.python.org/3/library/stdtypes.html#str.split"
      }
    ]
  },
  {
    "id": "bool-is-an-int",
    "num": 15,
    "title": "`True + True` Is 2",
    "subtitle": "booleans are integers wearing a costume",
    "difficulty": "beginner",
    "tags": [
      "bool",
      "integers",
      "type-hierarchy"
    ],
    "question": "What does this print?",
    "code": "print(True + True)\nprint(sum([True, True, False, True]))\nprint(isinstance(True, int), issubclass(bool, int))\nprint(True == 1, False == 0)\nprint([\"no\", \"yes\"][True])\nprint(\"%d apples\" % True)",
    "output": "2\n3\nTrue True\nTrue True\nyes\n1 apples",
    "isError": false,
    "guesses": [
      "A TypeError on the first line",
      "True on the first line"
    ],
    "explanation": [
      "<code>bool</code> is a subclass of <code>int</code>, with exactly two instances whose values are 1 and 0. Every integer operation works on them.",
      "This is mostly a convenience &mdash; <code>sum(flags)</code> counting the true ones is genuinely useful, and predates <code>bool</code> existing at all, since Python 2.2 had only 1 and 0.",
      "It becomes a bug when a function that should return a count returns a boolean, or when a boolean is accidentally passed where an index or an amount was expected. Neither will raise."
    ],
    "extraCode": "",
    "fixNote": "Counting with <code>sum</code> is idiomatic and fine. Where you need the distinction, ask about the type, not the value:",
    "fixCode": "flags = [True, True, False, True]\nprint(sum(flags))\n\ndef is_strictly_int(x):\n    return isinstance(x, int) and not isinstance(x, bool)\n\nprint(is_strictly_int(1), is_strictly_int(True))",
    "takeaway": "`isinstance(x, int)` is True for booleans. If that matters, you must exclude `bool` explicitly.",
    "caveat": "",
    "refs": [
      {
        "label": "PEP 285 &mdash; adding a bool type",
        "url": "https://peps.python.org/pep-0285/"
      }
    ]
  },
  {
    "id": "true-as-a-dict-key",
    "num": 16,
    "title": "{1: 'a', True: 'b'} Has One Key",
    "subtitle": "the key that overwrote a different key",
    "difficulty": "beginner",
    "tags": [
      "dicts",
      "sets",
      "hashing",
      "bool"
    ],
    "question": "What does this print?",
    "code": "print({1: \"a\", True: \"b\"})\nprint({0: \"zero\", False: \"false\", 0.0: \"float\"})\nprint(len({0, False, 0.0}))\nprint({True: \"yes\"}[1])\nprint(hash(1) == hash(True) == hash(1.0))",
    "output": "{1: 'b'}\n{0: 'float'}\n1\nyes\nTrue",
    "isError": false,
    "guesses": [
      "Two keys in the first dict",
      "A TypeError on the mixed set"
    ],
    "explanation": [
      "Dict keys and set members are deduplicated by hash-then-equality, not by type. <code>1</code>, <code>True</code> and <code>1.0</code> all hash the same and all compare equal, so they are the same key.",
      "Note which value survives and which key survives: the <em>first</em> key inserted stays in place, and each later assignment overwrites the value. That is why the output shows the key <code>1</code> but the value <code>\"b\"</code>, and <code>0</code> with <code>\"float\"</code>.",
      "This is the documented contract for numeric types &mdash; equal numbers must hash equally, or dicts would behave differently depending on whether you wrote <code>1</code> or <code>1.0</code>."
    ],
    "extraCode": "",
    "fixNote": "If the type is part of the identity, put it in the key:",
    "fixCode": "d = {}\nfor value in (1, True, 1.0):\n    d[(type(value).__name__, value)] = value\nprint(d)",
    "takeaway": "Mixing bools, ints and floats as keys silently merges them. It also merges them in sets.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; hash",
        "url": "https://docs.python.org/3/library/functions.html#hash"
      },
      {
        "label": "Python docs &mdash; numeric types",
        "url": "https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex"
      }
    ]
  },
  {
    "id": "slices-forgive-indexes-do-not",
    "num": 17,
    "title": "Slices Forgive, Indexes Do Not",
    "subtitle": "out of range, no complaint",
    "difficulty": "beginner",
    "tags": [
      "lists",
      "slicing",
      "errors"
    ],
    "question": "What does this print?",
    "code": "items = [1, 2, 3]\n\nprint(items[10:20])\nprint(items[1:100])\nprint(items[-100:2])\n\ntry:\n    print(items[10])\nexcept IndexError as exc:\n    print(\"IndexError:\", exc)",
    "output": "[]\n[2, 3]\n[1, 2]\nIndexError: list index out of range",
    "isError": false,
    "guesses": [
      "An IndexError on the first line",
      "None for the out-of-range slices"
    ],
    "explanation": [
      "Slicing clamps its bounds to the sequence. Anything past the end becomes the end, anything before the start becomes the start, and an empty result is a perfectly ordinary answer. Indexing does not clamp &mdash; it raises.",
      "The asymmetry is deliberate: a slice describes a region, and the empty region is meaningful, whereas an index names one element and there is no element to name.",
      "The cost is that a paging or chunking bug in slice arithmetic produces empty lists rather than errors, and empty lists flow a long way downstream before anyone notices."
    ],
    "extraCode": "",
    "fixNote": "When an empty slice would be a bug rather than an answer, check the bounds yourself:",
    "fixCode": "def page(items, start, size):\n    if start < 0 or start >= len(items):\n        raise IndexError(f\"start {start} outside 0..{len(items) - 1}\")\n    return items[start:start + size]\n\nprint(page([1, 2, 3], 1, 2))",
    "takeaway": "An unexpectedly empty list is often an out-of-range slice that never told you.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; sequence types",
        "url": "https://docs.python.org/3/library/stdtypes.html#common-sequence-operations"
      }
    ]
  },
  {
    "id": "negative-step-slices",
    "num": 18,
    "title": "a[3:0:-1]",
    "subtitle": "the reversal that drops an element",
    "difficulty": "beginner",
    "tags": [
      "lists",
      "slicing"
    ],
    "question": "What does this print?",
    "code": "a = [0, 1, 2, 3, 4]\n\nprint(a[::-1])\nprint(a[3:0:-1])\nprint(a[3::-1])\nprint(a[:3:-1])\nprint(a[3:0:-1] == list(reversed(a[1:4])))",
    "output": "[4, 3, 2, 1, 0]\n[3, 2, 1]\n[3, 2, 1, 0]\n[4]\nTrue",
    "isError": false,
    "guesses": [
      "[3, 2, 1, 0] on the second line",
      "[0, 1, 2, 3] on the second line"
    ],
    "explanation": [
      "A slice's <code>stop</code> is exclusive regardless of direction. With a negative step you are walking down toward <code>stop</code> and still never reach it, so <code>a[3:0:-1]</code> gives you indexes 3, 2, 1 and stops short of 0.",
      "There is no way to write \"down to and including index 0\" with an explicit stop, because the index before 0 is <code>-1</code>, which means the last element. You have to omit <code>stop</code> entirely: <code>a[3::-1]</code>.",
      "<code>a[::-1]</code> works because both bounds are omitted, so Python fills in the whole range in the step's direction."
    ],
    "extraCode": "",
    "fixNote": "Reverse a forward slice instead of doing the arithmetic backwards &mdash; it reads the way you think:",
    "fixCode": "a = [0, 1, 2, 3, 4]\nprint(a[1:4][::-1])\nprint(list(reversed(a[1:4])))",
    "takeaway": "Negative-step slices with an explicit stop are almost always off by one. Slice forward, then reverse.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; slicings",
        "url": "https://docs.python.org/3/reference/expressions.html#slicings"
      }
    ]
  },
  {
    "id": "tuple-needs-the-comma",
    "num": 19,
    "title": "(1) Is Not A Tuple",
    "subtitle": "the comma makes it, not the parentheses",
    "difficulty": "beginner",
    "tags": [
      "tuples",
      "syntax"
    ],
    "question": "What does this print?",
    "code": "print(type((1)))\nprint(type((1,)))\nprint(type(()))\n\nprint(len((\"abc\")))\nprint(len((\"abc\",)))\n\npoint = 3, 4\nprint(type(point), point)",
    "output": "<class 'int'>\n<class 'tuple'>\n<class 'tuple'>\n3\n1\n<class 'tuple'> (3, 4)",
    "isError": false,
    "guesses": [
      "tuple on every line",
      "A SyntaxError on the empty parentheses"
    ],
    "explanation": [
      "The comma builds the tuple. Parentheses only group, exactly as they do in arithmetic, so <code>(1)</code> is the integer 1 with a redundant pair of brackets around it.",
      "The empty tuple <code>()</code> is the one exception, because there is nowhere to put a comma. And <code>point = 3, 4</code> shows the other direction: no parentheses at all, still a tuple.",
      "The failure mode is a one-element container that silently becomes the element. <code>len((\"abc\"))</code> is 3, not 1, and a function expecting a tuple of arguments gets a string it will happily iterate."
    ],
    "extraCode": "",
    "fixNote": "Write the trailing comma, and let a linter catch the ones you forget:",
    "fixCode": "SINGLE = (\"abc\",)\nprint(len(SINGLE), SINGLE)\n\ndef handles(*types):\n    return types\n\nprint(handles(ValueError))",
    "takeaway": "A one-element tuple always needs a trailing comma. Every other length is forgiving, which is why this only ever breaks at length one.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; parenthesized forms",
        "url": "https://docs.python.org/3/reference/expressions.html#parenthesized-forms"
      }
    ]
  },
  {
    "id": "tuples-are-shallowly-immutable",
    "num": 20,
    "title": "Tuples Are Only Shallowly Immutable",
    "subtitle": "frozen on the outside",
    "difficulty": "beginner",
    "tags": [
      "tuples",
      "mutability",
      "hashing"
    ],
    "question": "What does this print?",
    "code": "t = ([1, 2], \"fixed\")\nt[0].append(3)\nprint(t)\n\ntry:\n    hash(t)\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\nprint(hash((\"a\", \"b\")) == hash((\"a\", \"b\")))",
    "output": "([1, 2, 3], 'fixed')\nTypeError: unhashable type: 'list'\nTrue",
    "isError": false,
    "guesses": [
      "A TypeError on the append",
      "hash(t) works fine"
    ],
    "explanation": [
      "A tuple's immutability is about its own slots: you cannot rebind <code>t[0]</code> to a different object. It says nothing about the objects those slots point at. If one of them is a list, that list is as mutable as ever.",
      "The consequence people actually hit is hashing. A tuple's hash is built from its elements' hashes, so a tuple containing a list is unhashable and cannot be a dict key or a set member &mdash; which is the correct answer, since its contents can change underneath the hash.",
      "\"Immutable\" in Python is never transitive."
    ],
    "extraCode": "",
    "fixNote": "If you need a hashable composite, make every element hashable:",
    "fixCode": "t = ((1, 2), \"fixed\")\nprint(hash(t) is not None)\n\nseen = {t}\nprint(t in seen)",
    "takeaway": "Immutable containers guarantee their own structure, never their contents.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; the standard type hierarchy",
        "url": "https://docs.python.org/3/reference/datamodel.html#the-standard-type-hierarchy"
      }
    ]
  },
  {
    "id": "tuple-iadd-paradox",
    "num": 21,
    "title": "The t[0] += [2] Paradox",
    "subtitle": "it raises and it works",
    "difficulty": "beginner",
    "tags": [
      "tuples",
      "mutability",
      "operators"
    ],
    "question": "This raises. What does the tuple look like afterwards?",
    "code": "t = ([1, 2],)\n\ntry:\n    t[0] += [3]\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\nprint(\"t is now\", t)",
    "output": "TypeError: 'tuple' object does not support item assignment\nt is now ([1, 2, 3],)",
    "isError": false,
    "guesses": [
      "([1, 2],) &mdash; the exception rolled it back",
      "It cannot raise at all"
    ],
    "explanation": [
      "<code>t[0] += [3]</code> is not one operation, it is two. Python evaluates <code>t[0] = t[0].__iadd__([3])</code>: first the in-place add, then the store back into the tuple.",
      "<code>list.__iadd__</code> succeeds &mdash; it extends the list in place and returns it. Then the store raises, because tuples do not support item assignment. Both halves are correct in isolation; together they leave you with a completed mutation and a traceback saying it failed.",
      "The store is not optional even though the object is unchanged: augmented assignment <em>always</em> stores back, because it cannot know whether the target's <code>__iadd__</code> returned the same object or a new one."
    ],
    "extraCode": "",
    "fixNote": "Mutate through a name, so there is no store back into the tuple:",
    "fixCode": "t = ([1, 2],)\nt[0].extend([3])\nprint(t)",
    "takeaway": "An exception does not mean nothing happened. `+=` on a tuple slot is the clearest proof.",
    "caveat": "",
    "refs": [
      {
        "label": "Python FAQ &mdash; why does a_tuple[i] += ['item'] raise an exception when the addition works?",
        "url": "https://docs.python.org/3/faq/programming.html#why-does-a-tuple-i-item-raise-an-exception-when-the-addition-works"
      }
    ]
  },
  {
    "id": "mutate-while-iterating",
    "num": 22,
    "title": "Deleting While Iterating",
    "subtitle": "every other element survives",
    "difficulty": "beginner",
    "tags": [
      "lists",
      "iteration",
      "mutability"
    ],
    "question": "What does this print?",
    "code": "items = [1, 2, 3, 4, 5, 6]\nfor x in items:\n    if x % 2 == 0:\n        items.remove(x)\nprint(items)\n\nd = {\"a\": 1, \"b\": 2}\ntry:\n    for k in d:\n        d[k + \"!\"] = 0\nexcept RuntimeError as exc:\n    print(\"RuntimeError:\", exc)",
    "output": "[1, 3, 5]\nRuntimeError: dictionary changed size during iteration",
    "isError": false,
    "guesses": [
      "[1, 3, 5]",
      "An error on the list loop too"
    ],
    "explanation": [
      "A list iterator holds an integer index, not a copy. Removing an element shifts everything after it down by one, but the iterator still advances, so the element that slid into the vacated slot is skipped entirely.",
      "Removing 2 at index 1 pulls 3 into index 1, the iterator moves to index 2, and 3 is never examined. Half your matches escape. Nothing raises, and the result looks plausible enough to ship.",
      "Dicts are stricter: they carry a version counter and raise <code>RuntimeError</code> the moment the size changes mid-iteration. Sets do the same. Lists are the only common container that fails quietly."
    ],
    "extraCode": "",
    "fixNote": "Build a new list rather than editing the one you are walking, or iterate over a snapshot:",
    "fixCode": "items = [1, 2, 3, 4, 5, 6]\nitems = [x for x in items if x % 2]\nprint(items)\n\noriginal = [1, 2, 3, 4, 5, 6]\nfor x in list(original):\n    if x % 2 == 0:\n        original.remove(x)\nprint(original)",
    "takeaway": "Never mutate the container you are iterating. For lists, Python will not stop you.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; the for statement",
        "url": "https://docs.python.org/3/reference/compound_stmts.html#the-for-statement"
      }
    ]
  },
  {
    "id": "list-iadd-is-extend",
    "num": 23,
    "title": "+= On A List Is extend",
    "subtitle": "your string became four elements",
    "difficulty": "beginner",
    "tags": [
      "lists",
      "operators",
      "mutability"
    ],
    "question": "What does this print?",
    "code": "a = [1, 2]\na += \"abc\"\nprint(a)\n\nb = [1, 2]\ntry:\n    b = b + \"abc\"\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\nc = [1, 2]\nd = c\nc += [3]\nprint(c, d, c is d)\n\ne = [1, 2]\nf = e\ne = e + [3]\nprint(e, f, e is f)",
    "output": "[1, 2, 'a', 'b', 'c']\nTypeError: can only concatenate list (not \"str\") to list\n[1, 2, 3] [1, 2, 3] True\n[1, 2, 3] [1, 2] False",
    "isError": false,
    "guesses": [
      "The same result from += and +",
      "A TypeError on the first line too"
    ],
    "explanation": [
      "<code>list.__iadd__</code> is <code>extend</code>, and <code>extend</code> takes any iterable. A string is an iterable of characters, so <code>a += \"abc\"</code> appends three separate characters. <code>list.__add__</code>, used by <code>+</code>, is stricter and accepts only another list.",
      "The second difference is aliasing. <code>+=</code> mutates in place and rebinds the same object, so every other name for that list sees the change. <code>c + [3]</code> builds a new list and leaves the original alone.",
      "So <code>+=</code> and <code>x = x + y</code> are not interchangeable for lists on either axis: they accept different right-hand sides, and they differ in whether anyone else notices."
    ],
    "extraCode": "",
    "fixNote": "Say which one you mean. <code>append</code> for one element, <code>extend</code> for an iterable, <code>+</code> for a fresh list:",
    "fixCode": "a = [1, 2]\na.append(\"abc\")\nprint(a)\n\nb = [1, 2]\nb.extend([\"c\", \"d\"])\nprint(b)",
    "takeaway": "`+=` on a list accepts any iterable and mutates in place. Both halves of that are ways to lose data.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; augmented assignment statements",
        "url": "https://docs.python.org/3/reference/simple_stmts.html#augmented-assignment-statements"
      }
    ]
  },
  {
    "id": "range-is-not-a-list",
    "num": 24,
    "title": "range Is Not A List",
    "subtitle": "lazy, sliceable, and reusable",
    "difficulty": "beginner",
    "tags": [
      "range",
      "iteration",
      "laziness"
    ],
    "question": "What does this print?",
    "code": "r = range(10)\nprint(r)\nprint(r[2:5])\nprint(r == range(10))\n\nhuge = range(10 ** 100)\nprint(huge[-1] == 10 ** 100 - 1)\nprint(10 ** 99 in huge)\ntry:\n    len(huge)\nexcept OverflowError as exc:\n    print(\"OverflowError:\", exc)\n\nimport sys\nprint(sys.getsizeof(huge) < sys.getsizeof([0] * 10))",
    "output": "range(0, 10)\nrange(2, 5)\nTrue\nTrue\nTrue\nOverflowError: Python int too large to convert to C ssize_t\nTrue",
    "isError": false,
    "guesses": [
      "[0, 1, 2, ...] for the first print",
      "A MemoryError on the huge range"
    ],
    "explanation": [
      "A <code>range</code> stores three integers &mdash; start, stop, step &mdash; and computes elements on demand. It never materialises, which is why a range of 10<sup>100</sup> elements costs the same as a range of ten.",
      "Unlike a generator it is a full sequence: it indexes, it slices (returning another <code>range</code>), and you can iterate it as many times as you like. Two ranges compare equal when they would produce the same values, so <code>range(0)</code> equals <code>range(2, 2)</code>. Membership testing is O(1) arithmetic rather than a scan, which is how the 10<sup>99</sup> test returns instantly.",
      "The one thing it cannot do is report its length. <code>len()</code> is defined to return a C <code>ssize_t</code>, so any container claiming more than about 9.2 quintillion elements overflows &mdash; the range itself is perfectly fine, and <code>huge[-1]</code> still answers. If you need the count of a giant range, compute it from <code>start</code>, <code>stop</code> and <code>step</code> yourself."
    ],
    "extraCode": ">>> range(0) == range(2, 2)\nTrue\n>>> range(0, 10, 2)[1:3]\nrange(2, 6, 2)\n>>> list(range(0, 10, 2)[1:3])\n[2, 4]",
    "fixNote": "Nothing to fix &mdash; but call <code>list()</code> when you genuinely need the values, and do not when you do not:",
    "fixCode": "print(list(range(5)))\n\nfor i in range(3):\n    print(i, end=\" \")\nprint()",
    "takeaway": "`range` is a sequence, not an iterator. It does not exhaust, and it does not cost memory.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; ranges",
        "url": "https://docs.python.org/3/library/stdtypes.html#ranges"
      }
    ]
  },
  {
    "id": "in-checks-keys-and-substrings",
    "num": 25,
    "title": "in On A Dict Checks Keys",
    "subtitle": "and on a string it checks substrings",
    "difficulty": "beginner",
    "tags": [
      "dicts",
      "strings",
      "operators"
    ],
    "question": "What does this print?",
    "code": "prices = {\"apple\": 1, \"banana\": 2}\nprint(\"apple\" in prices)\nprint(1 in prices)\nprint(1 in prices.values())\n\nprint(\"ell\" in \"hello\")\nprint(\"h\" in \"hello\".split())\n\ngrid = [[1, 2], [3, 4]]\nprint(2 in grid)\nprint(any(2 in row for row in grid))",
    "output": "True\nFalse\nTrue\nTrue\nFalse\nFalse\nTrue",
    "isError": false,
    "guesses": [
      "True for 1 in prices",
      "True for 2 in grid"
    ],
    "explanation": [
      "<code>in</code> delegates to the container, and each container decides what it means. A dict tests keys. A string tests <em>substrings</em>, not characters, so a multi-character needle works. A list of lists tests its elements, which are lists, so a bare <code>2</code> is never found.",
      "The dict case is the one that causes silent bugs: <code>value in some_dict</code> reads like a value lookup, always compiles, and quietly asks a different question. You need <code>.values()</code>, which is an O(n) scan rather than the O(1) key test.",
      "The nested-list case is the same mistake one level down &mdash; you have to say which level you mean."
    ],
    "extraCode": "",
    "fixNote": "Be explicit about which view you are searching:",
    "fixCode": "prices = {\"apple\": 1, \"banana\": 2}\nprint(1 in prices.values())\nprint((\"apple\", 1) in prices.items())\n\ngrid = [[1, 2], [3, 4]]\nprint(any(2 in row for row in grid))",
    "takeaway": "`x in d` asks about keys. Scanning values is a different operation with a different cost.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; membership test operations",
        "url": "https://docs.python.org/3/reference/expressions.html#membership-test-operations"
      }
    ]
  },
  {
    "id": "or-returns-a-value",
    "num": 26,
    "title": "or Returns A Value, Not A Bool",
    "subtitle": "the default that overrides a legitimate zero",
    "difficulty": "beginner",
    "tags": [
      "operators",
      "truthiness",
      "defaults"
    ],
    "question": "What does this print?",
    "code": "print(0 or \"\" or None)\nprint(\"a\" or \"b\")\nprint([] and \"never evaluated\")\n\ndef make_port(port=None):\n    return port or 8080\n\nprint(make_port(9000))\nprint(make_port(0))\nprint(make_port())",
    "output": "None\na\n[]\n9000\n8080\n8080",
    "isError": false,
    "guesses": [
      "True/False from the first three lines",
      "0 from make_port(0)"
    ],
    "explanation": [
      "<code>or</code> returns the first operand that is truthy, or the last one if none are. <code>and</code> returns the first falsy operand, or the last one. Neither ever converts to <code>bool</code>, which is what makes <code>x or default</code> such a compact idiom.",
      "It is also what makes it wrong. <code>port or 8080</code> means \"8080 unless port is truthy\", and <code>0</code> is not truthy. The same bug eats empty strings, empty lists and <code>False</code> &mdash; every one of which may be a value the caller deliberately passed.",
      "The idiom is safe only when every falsy value really should be replaced."
    ],
    "extraCode": "",
    "fixNote": "Test for the sentinel you actually mean:",
    "fixCode": "def make_port(port=None):\n    return 8080 if port is None else port\n\nprint(make_port(9000), make_port(0), make_port())",
    "takeaway": "`x or default` replaces every falsy value, not just the missing one.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; boolean operations",
        "url": "https://docs.python.org/3/reference/expressions.html#boolean-operations"
      }
    ]
  },
  {
    "id": "falsy-is-not-none",
    "num": 27,
    "title": "Falsy Is Not None",
    "subtitle": "if not count fires on zero",
    "difficulty": "beginner",
    "tags": [
      "truthiness",
      "none",
      "conditionals"
    ],
    "question": "What does this print?",
    "code": "for value in (None, 0, \"\", [], 0.0, False, \"0\", [0]):\n    print(repr(value), \"falsy\" if not value else \"truthy\",\n          \"| is None:\", value is None)",
    "output": "None falsy | is None: True\n0 falsy | is None: False\n'' falsy | is None: False\n[] falsy | is None: False\n0.0 falsy | is None: False\nFalse falsy | is None: False\n'0' truthy | is None: False\n[0] truthy | is None: False",
    "isError": false,
    "guesses": [
      "Only None is falsy",
      "'0' and [0] are falsy too"
    ],
    "explanation": [
      "Truthiness is a property of the object, decided by <code>__bool__</code> or, failing that, <code>__len__</code>. Every empty container, every zero and <code>None</code> are all falsy, and Python gives you no way to tell them apart with a bare <code>if</code>.",
      "So <code>if not count:</code> catches a genuine count of zero, <code>if not name:</code> catches a deliberate empty string, and <code>if not items:</code> cannot distinguish \"no list\" from \"empty list\". Each of those is a different situation that usually wants different handling.",
      "Note the last two: <code>\"0\"</code> is a non-empty string and <code>[0]</code> is a non-empty list, so both are truthy. Truthiness never looks inside."
    ],
    "extraCode": "",
    "fixNote": "Ask the question you mean. <code>is None</code> for absence, an explicit comparison for emptiness:",
    "fixCode": "def describe(items=None):\n    if items is None:\n        return \"not provided\"\n    if len(items) == 0:\n        return \"provided but empty\"\n    return f\"{len(items)} items\"\n\nprint(describe(), describe([]), describe([1, 2]))",
    "takeaway": "`if x:` conflates missing, empty and zero. When those differ, say which one you mean.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; truth value testing",
        "url": "https://docs.python.org/3/library/stdtypes.html#truth-value-testing"
      }
    ]
  },
  {
    "id": "zip-stops-at-the-shortest",
    "num": 28,
    "title": "zip Stops At The Shortest",
    "subtitle": "silent data loss, one row at a time",
    "difficulty": "beginner",
    "tags": [
      "zip",
      "iteration",
      "data-loss"
    ],
    "question": "What does this print?",
    "code": "names = [\"alice\", \"bob\", \"carol\"]\nscores = [90, 85]\n\nprint(list(zip(names, scores)))\n\ntry:\n    print(list(zip(names, scores, strict=True)))\nexcept ValueError as exc:\n    print(\"ValueError:\", exc)\n\nfrom itertools import zip_longest\nprint(list(zip_longest(names, scores, fillvalue=0)))",
    "output": "[('alice', 90), ('bob', 85)]\nValueError: zip() argument 2 is shorter than argument 1\n[('alice', 90), ('bob', 85), ('carol', 0)]",
    "isError": false,
    "guesses": [
      "An error by default",
      "carol paired with None"
    ],
    "explanation": [
      "<code>zip</code> stops as soon as any input is exhausted and discards the rest without a word. When the inputs are supposed to be parallel &mdash; names and scores, keys and values, timestamps and readings &mdash; a length mismatch is a bug, and <code>zip</code> turns it into quietly truncated output.",
      "Since Python 3.10 you can pass <code>strict=True</code> to make the mismatch raise. It is off by default for backwards compatibility, not because silence is the better answer.",
      "<code>itertools.zip_longest</code> covers the other case, where the inputs are genuinely ragged and you want padding."
    ],
    "extraCode": "",
    "fixNote": "If the inputs must be the same length, say so:",
    "fixCode": "names = [\"alice\", \"bob\", \"carol\"]\nscores = [90, 85, 70]\nprint(list(zip(names, scores, strict=True)))",
    "takeaway": "Default `zip` is only correct when a ragged input is acceptable. Otherwise pass `strict=True`.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; zip",
        "url": "https://docs.python.org/3/library/functions.html#zip"
      },
      {
        "label": "PEP 618 &mdash; add optional length-checking to zip",
        "url": "https://peps.python.org/pep-0618/"
      }
    ]
  },
  {
    "id": "chained-comparison-is-an-and",
    "num": 29,
    "title": "Chained Comparison Is Not What It Looks Like",
    "subtitle": "False == False in [False]",
    "difficulty": "beginner",
    "tags": [
      "operators",
      "comparisons",
      "syntax"
    ],
    "question": "What does this print?",
    "code": "print(1 < 2 < 3)\nprint((1 < 2) < 3)\n\nprint(False == False in [False])\nprint((False == False) in [False], False == (False in [False]))\n\ncalls = []\ndef side_effect():\n    calls.append(\"called\")\n    return 2\n\nprint(1 < side_effect() < 3, calls)",
    "output": "True\nTrue\nTrue\nFalse False\nTrue ['called']",
    "isError": false,
    "guesses": [
      "False for the third line",
      "side_effect runs twice"
    ],
    "explanation": [
      "<code>a OP b OP c</code> expands to <code>a OP b and b OP c</code>, with <code>b</code> evaluated exactly once. That is why the middle call happens a single time, and why <code>1 < 2 < 3</code> is <code>True</code> while the explicitly parenthesised <code>(1 < 2) < 3</code> means <code>True < 3</code>, which is <code>1 < 3</code>.",
      "The catch is that <code>in</code>, <code>not in</code>, <code>is</code> and <code>is not</code> are comparison operators too, and they chain with the rest. <code>False == False in [False]</code> is <code>(False == False) and (False in [False])</code> &mdash; two true things and-ed together &mdash; and neither of the parenthesised readings gives the same answer.",
      "So an expression mixing <code>==</code> and <code>in</code> almost certainly does not mean what its author thought."
    ],
    "extraCode": "",
    "fixNote": "Parenthesise the moment you mix comparison operators:",
    "fixCode": "flag = False\nprint((flag == False) and (flag in [False]))\nprint(flag is False)",
    "takeaway": "`in` and `is` chain like `<` does. Mixing them with `==` on one line is always a mistake.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; comparisons",
        "url": "https://docs.python.org/3/reference/expressions.html#comparisons"
      }
    ]
  },
  {
    "id": "dict-copy-is-shallow",
    "num": 30,
    "title": "dict(d) Is A Shallow Copy",
    "subtitle": "the nested value you forgot to clone",
    "difficulty": "beginner",
    "tags": [
      "dicts",
      "copying",
      "mutability"
    ],
    "question": "What does this print?",
    "code": "defaults = {\"retries\": 3, \"tags\": [\"core\"]}\n\nconfig = dict(defaults)\nconfig[\"retries\"] = 5\nconfig[\"tags\"].append(\"extra\")\n\nprint(defaults)\nprint(config)\nprint({**defaults} == defaults.copy() == dict(defaults))",
    "output": "{'retries': 3, 'tags': ['core', 'extra']}\n{'retries': 5, 'tags': ['core', 'extra']}\nTrue",
    "isError": false,
    "guesses": [
      "defaults keeps ['core']",
      "defaults['retries'] becomes 5 too"
    ],
    "explanation": [
      "<code>dict(d)</code>, <code>d.copy()</code> and <code>{**d}</code> are all the same shallow copy: a new mapping holding the same value objects. Rebinding a key in the copy is invisible to the original, which is why <code>retries</code> behaves. Mutating a value through the copy is not, which is why <code>tags</code> does not.",
      "This bites hardest with a module-level defaults dict, because the corruption is permanent for the life of the process and shows up in a later, unrelated request.",
      "The same applies to <code>copy.copy</code>, and to <code>list(d.items())</code>."
    ],
    "extraCode": "",
    "fixNote": "Deep-copy when the structure is nested, or build the mutable parts fresh each time:",
    "fixCode": "import copy\n\ndefaults = {\"retries\": 3, \"tags\": [\"core\"]}\nconfig = copy.deepcopy(defaults)\nconfig[\"tags\"].append(\"extra\")\nprint(defaults, config)",
    "takeaway": "Copying a dict protects the keys, never the values.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; copy",
        "url": "https://docs.python.org/3/library/copy.html"
      }
    ]
  },
  {
    "id": "class-attributes-are-shared",
    "num": 31,
    "title": "Class Attributes Are Shared",
    "subtitle": "every instance writing to the same list",
    "difficulty": "beginner",
    "tags": [
      "classes",
      "mutability",
      "state"
    ],
    "question": "What does this print?",
    "code": "class Basket:\n    items = []\n    count = 0\n\n    def add(self, thing):\n        self.items.append(thing)\n        self.count += 1\n\na, b = Basket(), Basket()\na.add(\"apple\")\nb.add(\"banana\")\n\nprint(a.items, b.items)\nprint(a.count, b.count)\nprint(Basket.items, Basket.count)",
    "output": "['apple', 'banana'] ['apple', 'banana']\n1 1\n['apple', 'banana'] 0",
    "isError": false,
    "guesses": [
      "Each basket holds its own item",
      "count behaves like items"
    ],
    "explanation": [
      "<code>items</code> and <code>count</code> live on the class, and attribute lookup falls back to the class when the instance has nothing. Both instances therefore start out reading the same two objects.",
      "<code>self.items.append(...)</code> is a <em>read</em> followed by a mutation: it finds the class's list and appends to it, so both baskets see both fruits. <code>self.count += 1</code> is a read followed by an <em>assignment</em>, and assignment always targets the instance &mdash; so each object quietly grows its own <code>count</code> shadowing the class's, and the class attribute stays 0.",
      "The two attributes were written identically and behave completely differently, which is what makes this so hard to spot."
    ],
    "extraCode": ">>> class Basket:\n...     items = []\n...\n>>> a = Basket()\n>>> \"items\" in a.__dict__\nFalse\n>>> a.items = [\"own\"]\n>>> \"items\" in a.__dict__\nTrue",
    "fixNote": "Per-instance state belongs in <code>__init__</code>. Keep class attributes for genuine constants:",
    "fixCode": "class Basket:\n    CAPACITY = 10\n\n    def __init__(self):\n        self.items = []\n        self.count = 0\n\n    def add(self, thing):\n        self.items.append(thing)\n        self.count += 1\n\na, b = Basket(), Basket()\na.add(\"apple\")\nb.add(\"banana\")\nprint(a.items, b.items, a.count, b.count)",
    "takeaway": "A mutable class attribute is global state. Mutating through `self` hits the class; assigning through `self` does not.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; class and instance variables",
        "url": "https://docs.python.org/3/tutorial/classes.html#class-and-instance-variables"
      }
    ]
  },
  {
    "id": "late-binding-closures",
    "num": 32,
    "title": "Late-Binding Closures",
    "subtitle": "every lambda agreed on the last value",
    "difficulty": "intermediate",
    "tags": [
      "closures",
      "lambdas",
      "comprehensions",
      "laziness"
    ],
    "question": "What do these two prints produce?",
    "code": "multipliers = [lambda x: i * x for i in range(4)]\nprint([m(2) for m in multipliers])\n\ngen = (lambda x: i * x for i in range(4))\nprint([m(2) for m in gen])",
    "output": "[6, 6, 6, 6]\n[0, 2, 4, 6]",
    "isError": false,
    "guesses": [
      "[0, 2, 4, 6] for both",
      "[6, 6, 6, 6] for both"
    ],
    "explanation": [
      "A closure captures the <em>variable</em>, not the value it held when the closure was created. All four lambdas in the list comprehension close over the same cell for <code>i</code>. By the time you call any of them the comprehension has finished and that cell holds <code>3</code>, so every lambda computes <code>3 * 2</code>.",
      "The generator expression prints something different for a reason that has nothing to do with scoping: it is <strong>lazy</strong>. Each lambda is produced and immediately called by the outer comprehension, while <code>i</code> still holds its current value. Interleaving creation and call hides the bug; it does not fix it.",
      "Drain the generator into a list first and the bug comes straight back:"
    ],
    "extraCode": ">>> gen = (lambda x: i * x for i in range(4))\n>>> funcs = list(gen)\n>>> [m(2) for m in funcs]\n[6, 6, 6, 6]",
    "fixNote": "Bind the value at definition time with a default argument, which is evaluated eagerly:",
    "fixCode": "multipliers = [lambda x, i=i: i * x for i in range(4)]\nprint([m(2) for m in multipliers])\n\nfrom functools import partial\nimport operator\nmultipliers = [partial(operator.mul, i) for i in range(4)]\nprint([m(2) for m in multipliers])",
    "takeaway": "The same defect bites def-in-a-loop, nested functions and decorators. If a closure reads a loop variable, ask when it will be called.",
    "caveat": "",
    "refs": [
      {
        "label": "Python FAQ &mdash; why do lambdas defined in a loop with different values all return the same result?",
        "url": "https://docs.python.org/3/faq/programming.html#why-do-lambdas-defined-in-a-loop-with-different-values-all-return-the-same-result"
      }
    ]
  },
  {
    "id": "loop-variable-outlives-the-loop",
    "num": 33,
    "title": "The Loop Variable Outlives The Loop",
    "subtitle": "i is still there when you are done with it",
    "difficulty": "intermediate",
    "tags": [
      "scope",
      "iteration",
      "comprehensions"
    ],
    "question": "What does this print?",
    "code": "for i in range(3):\n    pass\nprint(\"after for:\", i)\n\nj = \"untouched\"\nsquares = [j for j in range(3)]\nprint(\"after comprehension:\", j)\n\nfor k in []:\n    pass\ntry:\n    print(k)\nexcept NameError as exc:\n    print(\"NameError:\", exc)",
    "output": "after for: 2\nafter comprehension: untouched\nNameError: name 'k' is not defined",
    "isError": false,
    "guesses": [
      "A NameError on the first print",
      "The comprehension overwrites j"
    ],
    "explanation": [
      "A <code>for</code> statement does not create a scope. It binds its target in the enclosing function or module namespace and leaves it there, holding the final value, which is why code after the loop can still read <code>i</code>.",
      "A comprehension <em>does</em> create a scope &mdash; an implicit function &mdash; so its loop variable is local to it and <code>j</code> outside is untouched. This changed in Python 3; in Python 2 comprehensions leaked too.",
      "The empty-iterable case shows the other half: the name is bound by the first iteration, so a loop that never runs leaves the name undefined. Code that reads the loop variable afterwards works right up until the input is empty."
    ],
    "extraCode": "",
    "fixNote": "Initialise before the loop if you intend to read after it, and prefer a form that returns a value:",
    "fixCode": "last = None\nfor last in []:\n    pass\nprint(\"last:\", last)\n\nfound = next((x for x in [] if x > 1), None)\nprint(\"found:\", found)",
    "takeaway": "`for` leaks its target and comprehensions do not. Reading a loop variable after the loop breaks on empty input.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; the for statement",
        "url": "https://docs.python.org/3/reference/compound_stmts.html#the-for-statement"
      }
    ]
  },
  {
    "id": "for-else",
    "num": 34,
    "title": "for ... else",
    "subtitle": "else means no break",
    "difficulty": "intermediate",
    "tags": [
      "control-flow",
      "iteration",
      "syntax"
    ],
    "question": "What does this print?",
    "code": "def find(haystack, needle):\n    for item in haystack:\n        if item == needle:\n            print(\"found\", needle)\n            break\n    else:\n        print(\"no\", needle)\n\nfind([1, 2, 3], 2)\nfind([1, 2, 3], 9)\nfind([], 9)\n\nn = 0\nwhile n < 3:\n    n += 1\nelse:\n    print(\"while-else ran, n =\", n)",
    "output": "found 2\nno 9\nno 9\nwhile-else ran, n = 3",
    "isError": false,
    "guesses": [
      "else runs when the loop body never executed",
      "else runs every time"
    ],
    "explanation": [
      "The <code>else</code> clause on a loop runs when the loop finished normally &mdash; that is, when it was <em>not</em> exited by <code>break</code>. It has nothing to do with whether the body ever ran, which is why the empty-list call still takes the <code>else</code> branch.",
      "The name is the problem. Everyone reads it as the <code>else</code> of an <code>if</code>. It would make instant sense if the keyword were <code>nobreak</code>, which is roughly what Guido has said he wishes it had been.",
      "It is genuinely useful for search loops: it removes the <code>found = False</code> flag that the pattern otherwise needs. It is also rare enough that many readers will misparse it, so a comment earns its place."
    ],
    "extraCode": "",
    "fixNote": "If you would rather not rely on it, the explicit forms read the same:",
    "fixCode": "def find(haystack, needle):\n    if any(item == needle for item in haystack):\n        print(\"found\", needle)\n    else:\n        print(\"no\", needle)\n\nfind([1, 2, 3], 2)\nfind([1, 2, 3], 9)",
    "takeaway": "Loop `else` means \"the loop ran to completion without breaking\", not \"the loop did nothing\".",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; break, continue and else clauses on loops",
        "url": "https://docs.python.org/3/tutorial/controlflow.html#break-and-continue-statements"
      }
    ]
  },
  {
    "id": "return-in-finally",
    "num": 35,
    "title": "return In finally Swallows The Exception",
    "subtitle": "the error that never made it out",
    "difficulty": "intermediate",
    "tags": [
      "exceptions",
      "control-flow",
      "finally"
    ],
    "question": "What does this print?",
    "code": "def swallow():\n    try:\n        raise ValueError(\"boom\")\n    finally:\n        return \"all fine\"\n\nprint(swallow())\n\ndef which():\n    try:\n        return \"from try\"\n    finally:\n        return \"from finally\"\n\nprint(which())",
    "output": "all fine\nfrom finally\nreturn_in_finally.py:5: SyntaxWarning: 'return' in a 'finally' block\n  return \"all fine\"\nreturn_in_finally.py:13: SyntaxWarning: 'return' in a 'finally' block\n  return \"from finally\"",
    "isError": false,
    "guesses": [
      "A ValueError propagating out of swallow()",
      "'from try'"
    ],
    "explanation": [
      "<code>finally</code> runs on every exit path, and if it exits by itself &mdash; with <code>return</code>, <code>break</code> or <code>continue</code> &mdash; it discards whatever the block was already doing. A pending exception is dropped on the floor, and a pending return value is replaced.",
      "This is specified behaviour, not a bug, and it is almost never what the author wanted. The failure is total: no traceback, no log line, no non-zero exit code. A function that was supposed to fail loudly returns a cheerful string instead.",
      "CPython 3.14 finally warns about it. The <code>SyntaxWarning</code> in the output above is new &mdash; on 3.13 and earlier this code is silently accepted."
    ],
    "extraCode": "",
    "fixNote": "Keep <code>finally</code> for cleanup only, and let control flow happen in <code>try</code> or <code>else</code>:",
    "fixCode": "def honest():\n    try:\n        raise ValueError(\"boom\")\n    except ValueError as exc:\n        return f\"handled: {exc}\"\n    finally:\n        print(\"cleanup still runs\")\n\nprint(honest())",
    "takeaway": "Nothing that transfers control belongs in a `finally` block.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; the try statement",
        "url": "https://docs.python.org/3/reference/compound_stmts.html#the-try-statement"
      },
      {
        "label": "PEP 765 &mdash; disallow return/break/continue that exit a finally block",
        "url": "https://peps.python.org/pep-0765/"
      }
    ]
  },
  {
    "id": "generator-exhausts-once",
    "num": 36,
    "title": "A Generator Is Empty The Second Time",
    "subtitle": "the data was there a moment ago",
    "difficulty": "intermediate",
    "tags": [
      "generators",
      "iteration",
      "laziness"
    ],
    "question": "What does this print?",
    "code": "rows = (n for n in range(4))\n\nprint(\"count:\", sum(1 for _ in rows))\nprint(\"values:\", list(rows))\nprint(\"max:\", max(rows, default=\"nothing left\"))\n\nsquares = [n * n for n in range(4)]\nprint(sum(squares), list(squares), max(squares))",
    "output": "count: 4\nvalues: []\nmax: nothing left\n14 [0, 1, 4, 9] 9",
    "isError": false,
    "guesses": [
      "4, then [0, 1, 2, 3]",
      "An error on the second read"
    ],
    "explanation": [
      "A generator is an iterator: it has a position, and consuming it moves that position forward permanently. Once it reaches the end it stays there and every further read yields nothing. It does not reset, and it cannot be rewound.",
      "So the first aggregate wins and every one after it silently sees an empty sequence. <code>sum</code> returns 0, <code>list</code> returns <code>[]</code>, <code>max</code> raises <code>ValueError</code> unless you gave it a default. None of that says \"you already consumed this\".",
      "The list comprehension on the last line is a sequence, not an iterator, so all three aggregates see all four values."
    ],
    "extraCode": "",
    "fixNote": "Materialise once if you need more than one pass, or build a fresh generator per pass:",
    "fixCode": "rows = list(n for n in range(4))\nprint(sum(rows), len(rows), max(rows))\n\ndef make_rows():\n    return (n for n in range(4))\n\nprint(sum(make_rows()), max(make_rows()))",
    "takeaway": "Any function that walks an iterable consumes it. Two aggregates over one generator means the second gets nothing.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; generator-iterator methods",
        "url": "https://docs.python.org/3/reference/expressions.html#generator-iterator-methods"
      }
    ]
  },
  {
    "id": "generators-defer-side-effects",
    "num": 37,
    "title": "Generators Defer Their Side Effects",
    "subtitle": "the function ran, the body did not",
    "difficulty": "intermediate",
    "tags": [
      "generators",
      "laziness",
      "exceptions"
    ],
    "question": "What does this print?",
    "code": "def load(path):\n    print(\"opening\", path)\n    if not path:\n        raise ValueError(\"empty path\")\n    yield 1\n    yield 2\n\nprint(\"calling load\")\nrows = load(\"\")\nprint(\"call returned, nothing printed yet\")\n\ntry:\n    print(next(rows))\nexcept ValueError as exc:\n    print(\"ValueError arrived late:\", exc)",
    "output": "calling load\ncall returned, nothing printed yet\nopening \nValueError arrived late: empty path",
    "isError": false,
    "guesses": [
      "The ValueError is raised by the call to load",
      "'opening ' prints immediately"
    ],
    "explanation": [
      "Calling a generator function does not run its body. It builds a generator object and returns immediately. Nothing inside &mdash; not the <code>print</code>, not the validation, not the <code>open</code> &mdash; happens until something asks for the first value.",
      "That moves your errors. Argument validation written at the top of a generator fires at the first <code>next()</code>, which may be in a completely different function, inside a <code>try</code> that was not written to expect it, or never, if nobody iterates.",
      "The same delay applies to resources. A generator that opens a file at the top has not opened it yet."
    ],
    "extraCode": "",
    "fixNote": "Split the eager part from the lazy part: a plain function that validates, returning an inner generator:",
    "fixCode": "def load(path):\n    if not path:\n        raise ValueError(\"empty path\")\n\n    def rows():\n        print(\"opening\", path)\n        yield 1\n        yield 2\n\n    return rows()\n\ntry:\n    load(\"\")\nexcept ValueError as exc:\n    print(\"raised at call time:\", exc)",
    "takeaway": "A generator function's body runs at `next()`, not at the call. Validation belongs in a non-generator wrapper.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; yield expressions",
        "url": "https://docs.python.org/3/reference/expressions.html#yield-expressions"
      }
    ]
  },
  {
    "id": "dict-views-are-live",
    "num": 38,
    "title": "Dict Views Are Live",
    "subtitle": "the keys you captured keep changing",
    "difficulty": "intermediate",
    "tags": [
      "dicts",
      "views",
      "iteration"
    ],
    "question": "What does this print?",
    "code": "d = {\"a\": 1}\nkeys = d.keys()\nvalues = d.values()\n\nd[\"b\"] = 2\nprint(keys, values)\nprint(len(keys), \"b\" in keys)\n\nprint(d.keys() & {\"a\", \"z\"})\n\ntry:\n    for k in keys:\n        d[k + \"!\"] = 0\nexcept RuntimeError as exc:\n    print(\"RuntimeError:\", exc)",
    "output": "dict_keys(['a', 'b']) dict_values([1, 2])\n2 True\n{'a'}\nRuntimeError: dictionary changed size during iteration",
    "isError": false,
    "guesses": [
      "dict_keys(['a']) &mdash; a snapshot from before the insert",
      "keys is a list"
    ],
    "explanation": [
      "<code>keys()</code>, <code>values()</code> and <code>items()</code> return <em>views</em>: thin objects that read the dict on demand. They are not copies, so a view captured before an insert reflects the insert afterwards.",
      "Views are cheap and they support set operations directly &mdash; <code>d.keys() &amp; other</code> is an intersection &mdash; which is why they exist. In Python 2 these methods returned real lists and people wrote <code>iterkeys()</code> to avoid the copy.",
      "The live-ness means a view is not a safe thing to iterate while mutating, exactly like the dict itself."
    ],
    "extraCode": "",
    "fixNote": "Call <code>list()</code> when you want a snapshot that will not move under you:",
    "fixCode": "d = {\"a\": 1}\nkeys = list(d.keys())\nd[\"b\"] = 2\nprint(keys)\n\nfor k in list(d):\n    d[k + \"!\"] = 0\nprint(sorted(d))",
    "takeaway": "A dict view is a window, not a photograph. `list()` takes the photograph.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; dictionary view objects",
        "url": "https://docs.python.org/3/library/stdtypes.html#dictionary-view-objects"
      }
    ]
  },
  {
    "id": "setdefault-always-evaluates",
    "num": 39,
    "title": "setdefault Always Evaluates Its Default",
    "subtitle": "the cache that calls the thing it is caching",
    "difficulty": "intermediate",
    "tags": [
      "dicts",
      "evaluation-order",
      "performance"
    ],
    "question": "What does this print?",
    "code": "calls = []\n\ndef expensive(name):\n    calls.append(name)\n    return f\"computed-{name}\"\n\ncache = {\"a\": \"cached-a\"}\n\nprint(cache.setdefault(\"a\", expensive(\"a\")))\nprint(cache.get(\"a\", expensive(\"a\")))\nprint(\"expensive was called:\", calls)",
    "output": "cached-a\ncached-a\nexpensive was called: ['a', 'a']",
    "isError": false,
    "guesses": [
      "expensive is never called",
      "calls == ['a'] &mdash; once"
    ],
    "explanation": [
      "<code>setdefault</code> and <code>get</code> are ordinary methods, so their arguments are evaluated before the call happens. Python has no lazy argument evaluation and no way for a method to opt into it.",
      "So the default is computed every single time, hit or miss, and then thrown away on a hit. If it is a function call you have destroyed the point of the cache; if it has side effects &mdash; a network request, a counter increment, an insert &mdash; they happen on every lookup.",
      "The mistake is invisible when the default is a literal, which is how it survives: <code>d.setdefault(k, [])</code> only wastes an empty list."
    ],
    "extraCode": "",
    "fixNote": "Test membership first, or use <code>defaultdict</code> / <code>functools.cache</code> when the default is real work:",
    "fixCode": "calls = []\n\ndef expensive(name):\n    calls.append(name)\n    return f\"computed-{name}\"\n\ncache = {\"a\": \"cached-a\"}\nif \"a\" not in cache:\n    cache[\"a\"] = expensive(\"a\")\nprint(cache[\"a\"], \"calls:\", calls)",
    "takeaway": "`d.get(k, f())` and `d.setdefault(k, f())` always call `f`. Only the literal-default form is free.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; dict.setdefault",
        "url": "https://docs.python.org/3/library/stdtypes.html#dict.setdefault"
      }
    ]
  },
  {
    "id": "defaultdict-inserts-on-read",
    "num": 40,
    "title": "defaultdict Inserts On Read",
    "subtitle": "looking is writing",
    "difficulty": "intermediate",
    "tags": [
      "dicts",
      "defaultdict",
      "collections"
    ],
    "question": "What does this print?",
    "code": "from collections import defaultdict\n\ncounts = defaultdict(int)\ncounts[\"a\"] += 1\n\nprint(\"b\" in counts)\nprint(counts[\"b\"])\nprint(\"b\" in counts)\nprint(dict(counts), len(counts))\n\nprint(counts.get(\"c\"), \"c\" in counts)",
    "output": "False\n0\nTrue\n{'a': 1, 'b': 0} 2\nNone False",
    "isError": false,
    "guesses": [
      "'b' in counts stays False",
      "len is 1 at the end"
    ],
    "explanation": [
      "<code>defaultdict.__missing__</code> does two things: it calls the factory <em>and</em> stores the result under the key. So a plain read of a key that is not there is a mutation, and the dict grows.",
      "That is the entire point when you are accumulating &mdash; <code>counts[k] += 1</code> works because the read half inserts a zero first &mdash; but it makes a <code>defaultdict</code> dangerous to inspect. Printing it during debugging changes it. So does an <code>if d[k]:</code> check.",
      "<code>get</code> is the exception: it never goes through <code>__missing__</code>, so it returns <code>None</code> and inserts nothing."
    ],
    "extraCode": "",
    "fixNote": "Use <code>get</code> or <code>in</code> to inspect, and convert to a plain dict when you are done accumulating:",
    "fixCode": "from collections import defaultdict\n\ncounts = defaultdict(int)\ncounts[\"a\"] += 1\nprint(counts.get(\"b\", 0), \"b\" in counts)\n\ncounts = dict(counts)\nprint(counts)",
    "takeaway": "Reading an absent key from a `defaultdict` creates it. Use `.get()` when you only want to look.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; defaultdict",
        "url": "https://docs.python.org/3/library/collections.html#collections.defaultdict"
      }
    ]
  },
  {
    "id": "fromkeys-shares-the-value",
    "num": 41,
    "title": "dict.fromkeys(keys, [])",
    "subtitle": "one list handed to every key",
    "difficulty": "intermediate",
    "tags": [
      "dicts",
      "mutability",
      "aliasing"
    ],
    "question": "What does this print?",
    "code": "groups = dict.fromkeys([\"a\", \"b\", \"c\"], [])\ngroups[\"a\"].append(1)\nprint(groups)\n\nprint(groups[\"a\"] is groups[\"b\"])\n\nok = {k: [] for k in [\"a\", \"b\", \"c\"]}\nok[\"a\"].append(1)\nprint(ok)",
    "output": "{'a': [1], 'b': [1], 'c': [1]}\nTrue\n{'a': [1], 'b': [], 'c': []}",
    "isError": false,
    "guesses": [
      "{'a': [1], 'b': [], 'c': []}",
      "fromkeys copies the default"
    ],
    "explanation": [
      "<code>fromkeys</code> takes a single value object and binds every key to it. It does not call it, and it does not copy it &mdash; it cannot, because it has no idea how.",
      "This is <code>[[0] * 3] * 3</code> in mapping form. With an immutable default like <code>0</code> or <code>None</code> it is perfectly safe, which is the form everyone has seen, so the mutable case sails through review.",
      "The dict comprehension on the last line evaluates <code>[]</code> once per key, which is what you wanted."
    ],
    "extraCode": "",
    "fixNote": "Use a dict comprehension, or a <code>defaultdict</code> when the keys are not known up front:",
    "fixCode": "from collections import defaultdict\n\ngroups = {k: [] for k in [\"a\", \"b\", \"c\"]}\ngroups[\"a\"].append(1)\nprint(groups)\n\ngroups = defaultdict(list)\ngroups[\"a\"].append(1)\nprint(dict(groups))",
    "takeaway": "`fromkeys` shares one value. Safe for `None` and `0`, never for a container.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; dict.fromkeys",
        "url": "https://docs.python.org/3/library/stdtypes.html#dict.fromkeys"
      }
    ]
  },
  {
    "id": "counter-arithmetic-drops-negatives",
    "num": 42,
    "title": "Counter Arithmetic Drops Zeros And Negatives",
    "subtitle": "the difference that hides the differences",
    "difficulty": "intermediate",
    "tags": [
      "collections",
      "counter",
      "arithmetic"
    ],
    "question": "What does this print?",
    "code": "from collections import Counter\n\nhave = Counter(a=1, b=2)\nwant = Counter(a=3, b=2, c=1)\n\nprint(want - have)\nprint(have - want)\nprint(have.subtract(want) or have)",
    "output": "Counter({'a': 2, 'c': 1})\nCounter()\nCounter({'b': 0, 'c': -1, 'a': -2})",
    "isError": false,
    "guesses": [
      "Counter({'a': 2, 'b': 0, 'c': 1}) for the first line",
      "have - want shows negative counts"
    ],
    "explanation": [
      "The <code>+</code>, <code>-</code>, <code>&amp;</code> and <code>|</code> operators on a <code>Counter</code> are <em>multiset</em> operations, and a multiset cannot hold an element a negative number of times. Every result is filtered to keep only positive counts.",
      "So <code>want - have</code> silently drops <code>b</code> (difference zero) and would drop anything you are over-supplied on. Using it to answer \"what is the delta?\" gives you half the answer, and the half it gives you looks complete.",
      "<code>Counter.subtract</code> is the one that keeps the sign. It mutates in place and returns <code>None</code>, which is why the last line prints <code>have</code> rather than the call's result."
    ],
    "extraCode": "",
    "fixNote": "Use <code>subtract</code> when you want a true delta, and read it off a copy so you do not clobber the original:",
    "fixCode": "from collections import Counter\n\nhave = Counter(a=1, b=2)\nwant = Counter(a=3, b=2, c=1)\n\ndelta = Counter(want)\ndelta.subtract(have)\nprint(dict(delta))\nprint({k: v for k, v in delta.items() if v})",
    "takeaway": "`Counter` operators are multiset algebra, not arithmetic. `subtract` is arithmetic.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; Counter",
        "url": "https://docs.python.org/3/library/collections.html#collections.Counter"
      }
    ]
  },
  {
    "id": "all-of-empty-is-true",
    "num": 43,
    "title": "all([]) Is True",
    "subtitle": "the validator that passes on no data",
    "difficulty": "intermediate",
    "tags": [
      "builtins",
      "logic",
      "validation"
    ],
    "question": "What does this print?",
    "code": "print(all([]), any([]))\n\ndef all_valid(records):\n    return all(r[\"ok\"] for r in records)\n\nprint(all_valid([{\"ok\": True}, {\"ok\": True}]))\nprint(all_valid([{\"ok\": True}, {\"ok\": False}]))\nprint(all_valid([]))",
    "output": "True False\nTrue\nFalse\nTrue",
    "isError": false,
    "guesses": [
      "all([]) is False",
      "all_valid([]) raises"
    ],
    "explanation": [
      "<code>all</code> asks whether any element is falsy and reports back. With no elements there is nothing falsy, so the answer is <code>True</code>. <code>any</code> is the mirror image: nothing truthy, so <code>False</code>. This is vacuous truth, and it is the only definition that keeps <code>all(a + b) == (all(a) and all(b))</code> true.",
      "It is also how an empty input passes every check you wrote. A parser that silently returns no records, a filter that matched nothing, a file that failed to load &mdash; each of them turns your validation gate into a no-op, and the pipeline downstream sees a green light.",
      "The bug is invisible in tests, because tests supply data."
    ],
    "extraCode": "",
    "fixNote": "Decide explicitly whether empty is acceptable, and say so:",
    "fixCode": "def all_valid(records):\n    records = list(records)\n    if not records:\n        raise ValueError(\"no records to validate\")\n    return all(r[\"ok\"] for r in records)\n\ntry:\n    all_valid([])\nexcept ValueError as exc:\n    print(\"ValueError:\", exc)",
    "takeaway": "`all()` over an empty iterable is True. If empty input is suspicious, check for it separately.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; all",
        "url": "https://docs.python.org/3/library/functions.html#all"
      }
    ]
  },
  {
    "id": "any-short-circuits",
    "num": 44,
    "title": "any Short-Circuits Over A Generator",
    "subtitle": "the side effects that stopped halfway",
    "difficulty": "intermediate",
    "tags": [
      "builtins",
      "generators",
      "laziness",
      "side-effects"
    ],
    "question": "What does this print?",
    "code": "checked = []\n\ndef check(n):\n    checked.append(n)\n    return n > 2\n\nprint(any(check(n) for n in range(6)), checked)\n\nchecked.clear()\nprint(any([check(n) for n in range(6)]), checked)",
    "output": "True [0, 1, 2, 3]\nTrue [0, 1, 2, 3, 4, 5]",
    "isError": false,
    "guesses": [
      "Both lines check all six",
      "The first line checks none"
    ],
    "explanation": [
      "<code>any</code> stops at the first truthy element and never pulls another value. Paired with a generator expression, that means the side effects inside only happen up to the first match &mdash; here <code>check</code> runs four times, not six.",
      "Swap the generator for a list comprehension and the brackets change everything: the list is fully built <em>before</em> <code>any</code> is called, so all six run and the short-circuit saves nothing.",
      "Short-circuiting is the reason to use <code>any</code>, so this is usually a feature. It is a bug when the predicate was doing the real work &mdash; logging failures, collecting errors, writing a row &mdash; and you assumed it would see everything."
    ],
    "extraCode": "",
    "fixNote": "If you need every element visited, do the visiting first and test afterwards:",
    "fixCode": "checked = []\n\ndef check(n):\n    checked.append(n)\n    return n > 2\n\nresults = [check(n) for n in range(6)]\nprint(any(results), checked)",
    "takeaway": "`any`/`all` over a generator visit only as far as they must. Over a list, the list already visited everything.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; any",
        "url": "https://docs.python.org/3/library/functions.html#any"
      }
    ]
  },
  {
    "id": "min-max-return-the-first-tie",
    "num": 45,
    "title": "min/max Return The First Tie",
    "subtitle": "the winner depends on insertion order",
    "difficulty": "intermediate",
    "tags": [
      "builtins",
      "sorting",
      "determinism"
    ],
    "question": "What does this print?",
    "code": "votes = {\"alice\": 3, \"bob\": 3, \"carol\": 1}\nprint(max(votes, key=votes.get))\n\nvotes2 = {\"bob\": 3, \"alice\": 3, \"carol\": 1}\nprint(max(votes2, key=votes2.get))\n\npairs = [(\"a\", 1), (\"b\", 1)]\nprint(min(pairs, key=lambda t: t[1]), max(pairs, key=lambda t: t[1]))",
    "output": "alice\nbob\n('a', 1) ('a', 1)",
    "isError": false,
    "guesses": [
      "The same winner both times",
      "An error on the tie"
    ],
    "explanation": [
      "<code>max</code> keeps the first element with the maximal key and only replaces it on a strictly greater one. <code>min</code> does the same with strictly less. So on a tie you get whichever candidate the iterable produced first.",
      "For a dict that is insertion order, which is stable but is almost never the order you reasoned about. Rebuild the dict from a differently ordered source &mdash; a different JSON payload, a different query plan, a set that got iterated &mdash; and the answer changes with no code change.",
      "This is one of the classic sources of \"it works locally, it picks a different value in production\"."
    ],
    "extraCode": "",
    "fixNote": "Break the tie explicitly by making the key total:",
    "fixCode": "votes = {\"bob\": 3, \"alice\": 3, \"carol\": 1}\nprint(max(votes, key=lambda name: (votes[name], name)))\n\nwinners = [n for n, v in votes.items() if v == max(votes.values())]\nprint(sorted(winners))",
    "takeaway": "If ties are possible and the choice matters, put the tiebreaker in the key.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; max",
        "url": "https://docs.python.org/3/library/functions.html#max"
      }
    ]
  },
  {
    "id": "sorted-on-mixed-types",
    "num": 46,
    "title": "sorted On Mixed Types",
    "subtitle": "Python 2 answered, Python 3 refuses",
    "difficulty": "intermediate",
    "tags": [
      "sorting",
      "comparisons",
      "errors"
    ],
    "question": "What does this print?",
    "code": "try:\n    print(sorted([3, \"1\", 2]))\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\nprint(sorted([3, True, 2.5]))\n\ntry:\n    print(sorted([None, 1]))\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\nprint(sorted([3, \"1\", 2], key=str))",
    "output": "TypeError: '<' not supported between instances of 'str' and 'int'\n[True, 2.5, 3]\nTypeError: '<' not supported between instances of 'int' and 'NoneType'\n['1', 2, 3]",
    "isError": false,
    "guesses": [
      "All four lines raise",
      "[True, 2.5, 3] raises too"
    ],
    "explanation": [
      "Python 3 removed the universal ordering that Python 2 had. <code>&lt;</code> between unrelated types is now a <code>TypeError</code> rather than an arbitrary but consistent answer based on type name and address.",
      "Numbers are the exception, because <code>int</code>, <code>float</code> and <code>bool</code> form one numeric tower and genuinely compare. <code>None</code> does not compare with anything, which is why a column with a single missing value blows up a sort that worked on every other row.",
      "Supplying <code>key=str</code> makes it sort, but it sorts the string forms &mdash; <code>\"10\"</code> before <code>\"9\"</code> &mdash; so it fixes the traceback rather than the problem."
    ],
    "extraCode": "",
    "fixNote": "Normalise the type first, and give missing values an explicit place:",
    "fixCode": "rows = [3, None, 2, None, 1]\nprint(sorted(rows, key=lambda v: (v is None, v)))\n\nmixed = [3, \"1\", 2]\nprint(sorted(int(v) for v in mixed))",
    "takeaway": "A sort that meets its first `None` fails at runtime, in production, on real data.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; value comparisons",
        "url": "https://docs.python.org/3/reference/expressions.html#value-comparisons"
      }
    ]
  },
  {
    "id": "nan-breaks-sorting",
    "num": 47,
    "title": "NaN Breaks Sorting And Equality",
    "subtitle": "a value that is not equal to itself",
    "difficulty": "intermediate",
    "tags": [
      "floats",
      "nan",
      "sorting",
      "comparisons"
    ],
    "question": "What does this print?",
    "code": "nan = float(\"nan\")\n\nprint(nan == nan, nan < 1, nan > 1)\n\nprint(sorted([3, 1, nan, 2]))\nprint(sorted([3, 1, 2, nan]))\nprint(max([1, nan, 3]), max([nan, 1, 3]))",
    "output": "False False False\n[1, nan, 2, 3]\n[1, 2, 3, nan]\n3 nan",
    "isError": false,
    "guesses": [
      "A ValueError from sorted",
      "The same sorted result both times"
    ],
    "explanation": [
      "IEEE-754 says every comparison involving NaN is false, including equality with itself. Python implements that faithfully, so NaN is not merely unordered against other floats &mdash; it actively lies to any algorithm that assumes comparison is a total order.",
      "Timsort assumes exactly that. It does not raise; it just produces a list whose order depends on where the NaN happened to start, and the result is neither sorted nor stable in any useful sense.",
      "<code>max</code> is worse, because it is a single scan: a NaN early in the list poisons every subsequent comparison and the first element wins, while a NaN later on is simply ignored."
    ],
    "extraCode": "",
    "fixNote": "Filter NaN out, or sort it to a known end with a key:",
    "fixCode": "import math\nnan = float(\"nan\")\nvalues = [3, 1, nan, 2]\n\nprint(sorted(v for v in values if not math.isnan(v)))\nprint(sorted(values, key=lambda v: (math.isnan(v), v)))",
    "takeaway": "NaN is not a number that sorts badly. It is a value for which comparison is meaningless, and sorting silently gives up.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; math.isnan",
        "url": "https://docs.python.org/3/library/math.html#math.isnan"
      },
      {
        "label": "Python docs &mdash; value comparisons",
        "url": "https://docs.python.org/3/reference/expressions.html#value-comparisons"
      }
    ]
  },
  {
    "id": "nan-in-a-list",
    "num": 48,
    "title": "But nan in [nan] Is True",
    "subtitle": "containment checks identity first",
    "difficulty": "intermediate",
    "tags": [
      "nan",
      "operators",
      "identity",
      "containment"
    ],
    "question": "What does this print?",
    "code": "nan = float(\"nan\")\n\nprint(nan == nan)\nprint(nan in [nan])\nprint(float(\"nan\") in [float(\"nan\")])\n\nprint([nan].count(nan), [nan].index(nan))\nprint(nan in {nan})\n\nd = {nan: \"stored\"}\nprint(d[nan])",
    "output": "False\nTrue\nFalse\n1 0\nTrue\nstored",
    "isError": false,
    "guesses": [
      "False on every line",
      "True only for the set"
    ],
    "explanation": [
      "<code>x in seq</code> is not defined as \"some element equals x\". It is defined as \"some element satisfies <code>e is x or e == x</code>\". The identity check comes first, as a shortcut that is normally just an optimisation.",
      "For NaN it is not an optimisation, it is the whole answer. The <em>same</em> NaN object is found because identity succeeds where equality never would. Two <em>different</em> NaN objects are not found, because then it falls through to <code>==</code> and gets <code>False</code>.",
      "So containment depends on object identity in a way that equality does not, and the same applies to <code>list.index</code>, <code>list.count</code>, <code>remove</code>, and dict and set lookup."
    ],
    "extraCode": "",
    "fixNote": "Never rely on finding a NaN. Test for it directly:",
    "fixCode": "import math\nnan = float(\"nan\")\nvalues = [1.0, nan, 3.0]\nprint(any(math.isnan(v) for v in values))\nprint([i for i, v in enumerate(values) if math.isnan(v)])",
    "takeaway": "`in` short-circuits on identity, so a container can find an object that is not equal to itself.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; membership test operations",
        "url": "https://docs.python.org/3/reference/expressions.html#membership-test-operations"
      }
    ]
  },
  {
    "id": "eq-without-hash",
    "num": 49,
    "title": "__eq__ Without __hash__",
    "subtitle": "defining one removes the other",
    "difficulty": "intermediate",
    "tags": [
      "classes",
      "hashing",
      "equality",
      "dunder"
    ],
    "question": "What does this print?",
    "code": "class Point:\n    def __init__(self, x):\n        self.x = x\n\n    def __eq__(self, other):\n        return isinstance(other, Point) and self.x == other.x\n\np = Point(1)\nprint(p == Point(1))\nprint(Point.__hash__)\n\ntry:\n    {p}\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\nclass Plain:\n    pass\n\nprint(len({Plain(), Plain()}))",
    "output": "True\nNone\nTypeError: cannot use 'Point' as a set element (unhashable type: 'Point')\n2",
    "isError": false,
    "guesses": [
      "The set works fine",
      "A TypeError on the == comparison"
    ],
    "explanation": [
      "Python requires that equal objects hash equally. If you define <code>__eq__</code> and inherit the default identity-based <code>__hash__</code>, two equal objects would land in different buckets and your dict would hold duplicates.",
      "Rather than let that happen, defining <code>__eq__</code> in a class sets <code>__hash__</code> to <code>None</code>, which makes instances unhashable. The class stops working in sets and as dict keys, and the error appears wherever it is first used that way &mdash; typically far from the class definition.",
      "A class with no <code>__eq__</code> keeps the default: equality is identity and the hash is derived from it, so two distinct <code>Plain()</code> objects are two distinct set members."
    ],
    "extraCode": "",
    "fixNote": "Define <code>__hash__</code> alongside <code>__eq__</code> over the same fields, or let <code>dataclass(frozen=True)</code> do it:",
    "fixCode": "from dataclasses import dataclass\n\nclass Point:\n    def __init__(self, x):\n        self.x = x\n    def __eq__(self, other):\n        return isinstance(other, Point) and self.x == other.x\n    def __hash__(self):\n        return hash(self.x)\n\nprint(len({Point(1), Point(1)}))\n\n@dataclass(frozen=True)\nclass FrozenPoint:\n    x: int\n\nprint(len({FrozenPoint(1), FrozenPoint(1)}))",
    "takeaway": "`__eq__` and `__hash__` are a pair. Define one and you have silently unset the other.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; object.__hash__",
        "url": "https://docs.python.org/3/reference/datamodel.html#object.__hash__"
      }
    ]
  },
  {
    "id": "unbound-local-error",
    "num": 50,
    "title": "UnboundLocalError From x += 1",
    "subtitle": "one assignment makes the name local everywhere",
    "difficulty": "intermediate",
    "tags": [
      "scope",
      "errors",
      "compiler"
    ],
    "question": "What does this print?",
    "code": "total = 0\n\ndef broken():\n    try:\n        total += 1\n    except UnboundLocalError as exc:\n        print(\"UnboundLocalError:\", exc)\n\nbroken()\n\ndef also_broken():\n    try:\n        print(total)\n        value = total\n    except UnboundLocalError as exc:\n        print(\"UnboundLocalError:\", exc)\n    total = 1\n\nalso_broken()\n\ndef fine():\n    print(\"read-only access:\", total)\n\nfine()",
    "output": "UnboundLocalError: cannot access local variable 'total' where it is not associated with a value\nUnboundLocalError: cannot access local variable 'total' where it is not associated with a value\nread-only access: 0",
    "isError": false,
    "guesses": [
      "The second function prints 0 and then assigns",
      "Only the += version fails"
    ],
    "explanation": [
      "Whether a name is local is decided at compile time, for the whole function, by looking for any assignment to it anywhere in the body. One <code>total = 1</code> on the last line of a function makes <code>total</code> local on the first line too.",
      "So <code>total += 1</code> is a read of a local that has not been assigned yet, and the read on the line <em>before</em> the assignment fails identically. There is no partial scoping and no \"global until first assigned\" rule.",
      "A function that only reads the name has no assignment, so it stays global and works &mdash; which is why adding one innocent assignment can break lines far above it."
    ],
    "extraCode": "",
    "fixNote": "Declare the intent, or better, stop mutating module state and pass the value:",
    "fixCode": "total = 0\n\ndef with_global():\n    global total\n    total += 1\n\nwith_global()\nprint(total)\n\ndef pure(current):\n    return current + 1\n\nprint(pure(total))",
    "takeaway": "Assigning a name anywhere in a function makes it local throughout. The error appears at the read, not the write.",
    "caveat": "",
    "refs": [
      {
        "label": "Python FAQ &mdash; what are the rules for local and global variables?",
        "url": "https://docs.python.org/3/faq/programming.html#what-are-the-rules-for-local-and-global-variables-in-python"
      }
    ]
  },
  {
    "id": "global-versus-nonlocal",
    "num": 51,
    "title": "global vs nonlocal",
    "subtitle": "two keywords, two different namespaces",
    "difficulty": "intermediate",
    "tags": [
      "scope",
      "closures",
      "keywords"
    ],
    "question": "What does this print?",
    "code": "counter = \"module\"\n\ndef outer():\n    counter = \"outer\"\n\n    def shadows():\n        counter = \"inner\"\n\n    def writes_enclosing():\n        nonlocal counter\n        counter = \"changed by nonlocal\"\n\n    def writes_module():\n        global counter\n        counter = \"changed by global\"\n\n    shadows()\n    print(\"after shadows:\", counter)\n    writes_enclosing()\n    print(\"after nonlocal:\", counter)\n    writes_module()\n    print(\"outer still:\", counter)\n\nouter()\nprint(\"module now:\", counter)",
    "output": "after shadows: outer\nafter nonlocal: changed by nonlocal\nouter still: changed by nonlocal\nmodule now: changed by global",
    "isError": false,
    "guesses": [
      "nonlocal and global do the same thing here",
      "shadows() changes outer's counter"
    ],
    "explanation": [
      "<code>global</code> binds in the module namespace. <code>nonlocal</code> binds in the nearest enclosing <em>function</em> scope that already has the name &mdash; it never reaches the module, and it is a <code>SyntaxError</code> if no enclosing function defines the name.",
      "With no declaration at all, an assignment creates a fresh local that shadows both, which is what <code>shadows()</code> does: it changes nothing anyone else can see.",
      "The three functions differ by one line and write to three different variables. That is the whole difficulty &mdash; nothing in the assignment itself tells you which namespace you are hitting."
    ],
    "extraCode": ">>> def f():\n...     nonlocal missing\n...\nTraceback (most recent call last):\nSyntaxError: no binding for nonlocal 'missing' found",
    "fixNote": "Prefer returning values to mutating enclosing state. Where you do need a shared counter, a mutable container needs no declaration at all:",
    "fixCode": "def make_counter():\n    state = {\"n\": 0}\n\n    def bump():\n        state[\"n\"] += 1\n        return state[\"n\"]\n\n    return bump\n\nbump = make_counter()\nprint(bump(), bump())",
    "takeaway": "`nonlocal` reaches one scope out; `global` jumps all the way to the module. Neither creates the name.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; the nonlocal statement",
        "url": "https://docs.python.org/3/reference/simple_stmts.html#the-nonlocal-statement"
      }
    ]
  },
  {
    "id": "except-as-deletes-the-name",
    "num": 52,
    "title": "except E as e Deletes e",
    "subtitle": "the exception you saved for later is gone",
    "difficulty": "intermediate",
    "tags": [
      "exceptions",
      "scope"
    ],
    "question": "What does this print?",
    "code": "saved = \"before\"\ntry:\n    raise ValueError(\"boom\")\nexcept ValueError as saved:\n    print(\"inside:\", saved)\n\ntry:\n    print(\"after:\", saved)\nexcept NameError as exc:\n    print(\"NameError:\", exc)\n\ndef capture():\n    problem = None\n    try:\n        raise ValueError(\"boom\")\n    except ValueError as exc:\n        problem = exc\n    return problem\n\nprint(\"kept:\", repr(capture()))",
    "output": "inside: boom\nNameError: name 'saved' is not defined\nkept: ValueError('boom')",
    "isError": false,
    "guesses": [
      "'after: boom'",
      "'after: before' &mdash; the old value comes back"
    ],
    "explanation": [
      "At the end of an <code>except ... as name</code> block Python runs the equivalent of <code>del name</code>. Not restore, not leave alone &mdash; delete. If the name existed beforehand it is gone too, which is why <code>saved</code> does not revert to <code>\"before\"</code>.",
      "The reason is memory. A caught exception holds a traceback, the traceback holds every frame, and every frame holds its locals &mdash; including the exception. Left bound, that cycle keeps whole call stacks alive. Python 3 broke the cycle by unbinding the name.",
      "So anything you want after the block has to be copied out to a different name first, as <code>capture</code> does."
    ],
    "extraCode": "",
    "fixNote": "Assign to a separate variable inside the handler, or re-raise and let the caller deal with it:",
    "fixCode": "def capture():\n    try:\n        raise ValueError(\"boom\")\n    except ValueError as exc:\n        problem = exc\n    return problem\n\nprint(repr(capture()))",
    "takeaway": "The `as` name is scoped to the handler and deleted on exit, even if it shadowed something.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; the try statement",
        "url": "https://docs.python.org/3/reference/compound_stmts.html#the-try-statement"
      },
      {
        "label": "PEP 3110 &mdash; catching exceptions in Python 3000",
        "url": "https://peps.python.org/pep-3110/"
      }
    ]
  },
  {
    "id": "bare-except-catches-everything",
    "num": 53,
    "title": "Bare except: Catches Ctrl-C",
    "subtitle": "the handler that will not let you quit",
    "difficulty": "intermediate",
    "tags": [
      "exceptions",
      "control-flow",
      "operations"
    ],
    "question": "What does this print?",
    "code": "def retry_forever():\n    for attempt in range(3):\n        try:\n            raise KeyboardInterrupt(\"user pressed ctrl-c\")\n        except:\n            print(\"attempt\", attempt, \"- swallowed, retrying\")\n\nretry_forever()\n\ntry:\n    raise SystemExit(1)\nexcept Exception:\n    print(\"not reached\")\nexcept BaseException as exc:\n    print(\"SystemExit is a BaseException:\", repr(exc))\n\nprint(KeyboardInterrupt.__mro__)",
    "output": "attempt 0 - swallowed, retrying\nattempt 1 - swallowed, retrying\nattempt 2 - swallowed, retrying\nSystemExit is a BaseException: SystemExit(1)\n(<class 'KeyboardInterrupt'>, <class 'BaseException'>, <class 'object'>)",
    "isError": false,
    "guesses": [
      "The KeyboardInterrupt escapes the loop",
      "SystemExit is caught by except Exception"
    ],
    "explanation": [
      "<code>KeyboardInterrupt</code>, <code>SystemExit</code> and <code>GeneratorExit</code> deliberately inherit from <code>BaseException</code> rather than <code>Exception</code>, precisely so that ordinary error handling does not catch them. They are control flow, not errors.",
      "A bare <code>except:</code> is <code>except BaseException:</code>, so it catches all three. Put one inside a retry loop and Ctrl-C becomes a message the loop shrugs off &mdash; the process becomes unkillable by normal means, which is exactly when you most want to kill it.",
      "It also swallows <code>SystemExit</code>, so <code>sys.exit()</code> stops exiting, and your exit code becomes 0 no matter what happened."
    ],
    "extraCode": "",
    "fixNote": "Catch <code>Exception</code> when you mean \"any error\", and name the specific type when you know it:",
    "fixCode": "import sys\n\ndef retry(attempts=3):\n    for attempt in range(attempts):\n        try:\n            raise ValueError(\"transient\")\n        except Exception as exc:\n            print(\"attempt\", attempt, \"failed:\", exc)\n    return None\n\nretry()\nprint(\"Ctrl-C and sys.exit still work\", file=sys.stderr)",
    "takeaway": "`except:` and `except BaseException:` are the same thing, and neither belongs in application code.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; exception hierarchy",
        "url": "https://docs.python.org/3/library/exceptions.html#exception-hierarchy"
      }
    ]
  },
  {
    "id": "decorator-without-wraps",
    "num": 54,
    "title": "Decorators Without functools.wraps",
    "subtitle": "your function lost its name",
    "difficulty": "intermediate",
    "tags": [
      "decorators",
      "introspection",
      "metadata"
    ],
    "question": "What does this print?",
    "code": "import functools, inspect\n\ndef plain(fn):\n    def wrapper(*args, **kwargs):\n        return fn(*args, **kwargs)\n    return wrapper\n\ndef wrapped(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        return fn(*args, **kwargs)\n    return wrapper\n\n@plain\ndef alpha(a, b=2):\n    \"\"\"Add two numbers.\"\"\"\n    return a + b\n\n@wrapped\ndef beta(a, b=2):\n    \"\"\"Add two numbers.\"\"\"\n    return a + b\n\nfor f in (alpha, beta):\n    print(f.__name__, repr(f.__doc__), str(inspect.signature(f)))",
    "output": "wrapper None (*args, **kwargs)\nbeta 'Add two numbers.' (a, b=2)",
    "isError": false,
    "guesses": [
      "Both report alpha/beta correctly",
      "plain raises"
    ],
    "explanation": [
      "A decorator returns a different function object. Unless you copy the metadata across, that object carries the wrapper's identity: its <code>__name__</code>, its empty docstring, and its <code>(*args, **kwargs)</code> signature.",
      "Everything that introspects suffers. Tracebacks name <code>wrapper</code>, logging shows <code>wrapper</code>, <code>help()</code> is blank, <code>inspect.signature</code> is useless, and test frameworks that collect by name see every decorated test as the same function.",
      "<code>functools.wraps</code> copies <code>__name__</code>, <code>__doc__</code>, <code>__module__</code>, <code>__qualname__</code>, <code>__dict__</code> and sets <code>__wrapped__</code>, which is what lets <code>inspect.signature</code> see through to the original."
    ],
    "extraCode": "",
    "fixNote": "Always apply <code>@functools.wraps(fn)</code> to the wrapper. There is no case where you want the wrapper's own metadata:",
    "fixCode": "import functools\n\ndef log_calls(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        print(\"calling\", fn.__name__)\n        return fn(*args, **kwargs)\n    return wrapper\n\n@log_calls\ndef add(a, b):\n    \"\"\"Add two numbers.\"\"\"\n    return a + b\n\nprint(add(1, 2), add.__name__, add.__doc__)",
    "takeaway": "An undecorated decorator makes every function it touches anonymous.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; functools.wraps",
        "url": "https://docs.python.org/3/library/functools.html#functools.wraps"
      }
    ]
  },
  {
    "id": "decorator-stacking-order",
    "num": 55,
    "title": "Decorator Stacking Order",
    "subtitle": "bottom-up to build, top-down to call",
    "difficulty": "intermediate",
    "tags": [
      "decorators",
      "order",
      "functions"
    ],
    "question": "What does this print?",
    "code": "def tag(name):\n    def deco(fn):\n        print(\"applying\", name)\n        def wrapper(*a, **k):\n            print(\"entering\", name)\n            result = fn(*a, **k)\n            print(\"leaving\", name)\n            return result\n        return wrapper\n    return deco\n\n@tag(\"outer\")\n@tag(\"inner\")\ndef work():\n    print(\"working\")\n\nprint(\"--- defined, now calling ---\")\nwork()",
    "output": "applying inner\napplying outer\n--- defined, now calling ---\nentering outer\nentering inner\nworking\nleaving inner\nleaving outer",
    "isError": false,
    "guesses": [
      "applying outer, then applying inner",
      "entering inner, then entering outer"
    ],
    "explanation": [
      "Stacked decorators are applied bottom-up. <code>@outer</code> above <code>@inner</code> desugars to <code>work = outer(inner(work))</code>, so <code>inner</code> runs first and <code>outer</code> wraps its result.",
      "At call time the order inverts, because the outermost wrapper is the one you are actually calling. It enters first, delegates inward, and leaves last.",
      "This matters whenever the decorators are not commutative. <code>@app.route</code> must be outermost to register the fully-decorated function; <code>@staticmethod</code> must be outermost because the thing below it has to still be a plain function; a cache placed above a retry caches the retrying, while below it caches each attempt."
    ],
    "extraCode": "",
    "fixNote": "Nothing to fix &mdash; just read the stack as nested calls. Written out, the order is obvious:",
    "fixCode": "def tag(name):\n    def deco(fn):\n        def wrapper(*a, **k):\n            print(\"entering\", name)\n            return fn(*a, **k)\n        return wrapper\n    return deco\n\ndef work():\n    print(\"working\")\n\nwork = tag(\"outer\")(tag(\"inner\")(work))\nwork()",
    "takeaway": "Applied bottom-up, executed top-down. When order matters, write the nesting out and check.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; function definitions",
        "url": "https://docs.python.org/3/reference/compound_stmts.html#function-definitions"
      }
    ]
  },
  {
    "id": "decorators-run-at-import",
    "num": 56,
    "title": "Decorators Run At Import Time",
    "subtitle": "the registry that filled itself before main()",
    "difficulty": "intermediate",
    "tags": [
      "decorators",
      "imports",
      "side-effects"
    ],
    "question": "What does this print?",
    "code": "REGISTRY = {}\n\ndef register(fn):\n    print(\"registering\", fn.__name__)\n    REGISTRY[fn.__name__] = fn\n    return fn\n\nprint(\"module body starts\")\n\n@register\ndef alpha():\n    return \"a\"\n\n@register\ndef beta():\n    return \"b\"\n\nprint(\"module body ends, registry =\", sorted(REGISTRY))\n\ndef main():\n    print(\"main() runs now\")\n\nif __name__ == \"__main__\":\n    main()",
    "output": "module body starts\nregistering alpha\nregistering beta\nmodule body ends, registry = ['alpha', 'beta']\nmain() runs now",
    "isError": false,
    "guesses": [
      "registering happens when alpha is first called",
      "The registry is empty until main()"
    ],
    "explanation": [
      "A decorator is applied when the <code>def</code> statement executes, which for a module-level function is while the module is being imported. Whatever the decorator does &mdash; register, connect, validate, patch, read config &mdash; happens then, before any of your own startup code.",
      "This is the mechanism behind route tables, plugin registries, signal handlers and <code>pytest</code> collection, and it is genuinely useful. It also means importing a module is never free, and that import order determines registration order.",
      "The trap is a decorator that needs something not yet set up: a database connection, an environment variable read in <code>main()</code>, a logging config. It will fail at import, with a traceback that points at a <code>def</code> line."
    ],
    "extraCode": "",
    "fixNote": "Keep import-time decorators to pure bookkeeping, and defer the real work to first call:",
    "fixCode": "REGISTRY = {}\n\ndef register(fn):\n    REGISTRY[fn.__name__] = fn\n    return fn\n\n@register\ndef alpha():\n    return \"a\"\n\ndef main():\n    print(\"resolved at call time:\", REGISTRY[\"alpha\"]())\n\nmain()",
    "takeaway": "Decorating is not lazy. If a decorator needs configuration, the module cannot be imported before that configuration exists.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; the import system",
        "url": "https://docs.python.org/3/reference/import.html"
      }
    ]
  },
  {
    "id": "property-setter-name",
    "num": 57,
    "title": "A property Setter Must Reuse The Name",
    "subtitle": "two properties where you meant one",
    "difficulty": "intermediate",
    "tags": [
      "properties",
      "descriptors",
      "classes"
    ],
    "question": "What does this print?",
    "code": "class Broken:\n    @property\n    def value(self):\n        return self._value\n\n    @property\n    def set_value(self, new):\n        self._value = new\n\nclass Works:\n    @property\n    def value(self):\n        return self._value\n\n    @value.setter\n    def value(self, new):\n        self._value = new\n\nb = Broken()\nb._value = 1\ntry:\n    b.value = 99\nexcept AttributeError as exc:\n    print(\"AttributeError:\", exc)\n\nw = Works()\nw.value = 99\nprint(w.value)",
    "output": "AttributeError: property 'value' of 'Broken' object has no setter\n99",
    "isError": false,
    "guesses": [
      "Broken works, it just has an odd API",
      "Both raise"
    ],
    "explanation": [
      "<code>@value.setter</code> is not special syntax &mdash; it is a method on the existing property object that returns a <em>new</em> property carrying both the getter and the setter, which then rebinds the same class attribute. The name has to match because that is how the new object replaces the old one.",
      "Decorate a second method with a different name and you get two independent read-only properties. Assigning to <code>b.value</code> then hits a property with no setter, and properties are data descriptors, so the instance dict cannot shadow it. <code>AttributeError</code>.",
      "The error message says the attribute has no setter, which is accurate but does not point at the typo three lines away."
    ],
    "extraCode": "",
    "fixNote": "Getter, setter and deleter all share the property's name:",
    "fixCode": "class Temperature:\n    @property\n    def celsius(self):\n        return self._c\n\n    @celsius.setter\n    def celsius(self, value):\n        if value < -273.15:\n            raise ValueError(\"below absolute zero\")\n        self._c = value\n\nt = Temperature()\nt.celsius = 20\nprint(t.celsius)",
    "takeaway": "The setter's name is load-bearing. Renaming it silently turns the property read-only.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; property",
        "url": "https://docs.python.org/3/library/functions.html#property"
      }
    ]
  },
  {
    "id": "bound-method-identity",
    "num": 58,
    "title": "a.f is a.f Is False",
    "subtitle": "a new method object on every lookup",
    "difficulty": "intermediate",
    "tags": [
      "methods",
      "identity",
      "descriptors",
      "callbacks"
    ],
    "question": "What does this print?",
    "code": "class Widget:\n    def handler(self):\n        return \"handled\"\n\nw = Widget()\nprint(w.handler is w.handler)\nprint(w.handler == w.handler)\nprint(Widget.handler is Widget.handler)\n\nprint(w.handler.__func__ is Widget.handler)\nprint(w.handler.__self__ is w)\n\nlisteners = set()\nlisteners.add(w.handler)\nlisteners.discard(w.handler)\nprint(\"removed:\", len(listeners) == 0)",
    "output": "False\nTrue\nTrue\nTrue\nTrue\nremoved: True",
    "isError": false,
    "guesses": [
      "True on the first line",
      "The discard fails to find the method"
    ],
    "explanation": [
      "Functions are descriptors. Looking up <code>w.handler</code> calls <code>function.__get__</code>, which builds a fresh bound-method object pairing the function with the instance. Do it twice and you get two objects, so <code>is</code> says no.",
      "They compare equal, and hash equally, because bound methods define <code>__eq__</code> and <code>__hash__</code> over <code>__func__</code> and <code>__self__</code>. That is why the set removal works, and why this is usually harmless.",
      "Where it bites is code that stores callbacks and later unregisters them by identity, or uses a <code>WeakSet</code> &mdash; the bound method you handed over has no other reference and may already be gone. Accessing the function through the <em>class</em> gives a stable object, because there is no instance to bind."
    ],
    "extraCode": "",
    "fixNote": "Keep a reference to the exact object you registered:",
    "fixCode": "class Widget:\n    def __init__(self):\n        self._handler = self.handler\n\n    def handler(self):\n        return \"handled\"\n\nw = Widget()\nlisteners = [w._handler]\nlisteners.remove(w._handler)\nprint(\"clean:\", listeners)",
    "takeaway": "Every `obj.method` access mints a new object. Equal, hashable, but never identical.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; instance methods",
        "url": "https://docs.python.org/3/reference/datamodel.html#instance-methods"
      }
    ]
  },
  {
    "id": "staticmethod-is-now-callable",
    "num": 59,
    "title": "staticmethod Objects Used To Be Uncallable",
    "subtitle": "a gotcha that was fixed under you",
    "difficulty": "intermediate",
    "tags": [
      "classes",
      "staticmethod",
      "descriptors",
      "versions"
    ],
    "question": "This works today. On Python 3.9 one of these lines raised. Which?",
    "code": "class Tools:\n    @staticmethod\n    def helper():\n        return \"helped\"\n\nprint(Tools.helper())\nprint(Tools().helper())\n\nraw = Tools.__dict__[\"helper\"]\nprint(type(raw))\nprint(raw())\n\nprint(callable(staticmethod(lambda: 1)))",
    "output": "helped\nhelped\n<class 'staticmethod'>\nhelped\nTrue",
    "isError": false,
    "guesses": [
      "All of them work on every version",
      "Tools().helper() was the broken one"
    ],
    "explanation": [
      "<code>staticmethod</code> is a descriptor object. <code>Tools.helper</code> goes through <code>__get__</code> and hands back the underlying function, which is why the normal call paths always worked.",
      "Reach into <code>__dict__</code> and you get the descriptor itself, unbound. Before Python 3.10 that object had no <code>__call__</code>, so <code>raw()</code> raised <code>TypeError: 'staticmethod' object is not callable</code>. It bit anyone writing a metaclass, a registry, or a decorator that walked a class namespace.",
      "3.10 made <code>staticmethod</code> callable and copied the wrapped function's metadata onto it. The old code is still out there working around a problem that no longer exists."
    ],
    "extraCode": "",
    "fixNote": "If you have to support older versions, unwrap explicitly with <code>__func__</code>, which has worked since 3.0:",
    "fixCode": "class Tools:\n    @staticmethod\n    def helper():\n        return \"helped\"\n\nraw = Tools.__dict__[\"helper\"]\nprint(raw.__func__())\nprint(getattr(Tools, \"helper\")())",
    "takeaway": "Class `__dict__` gives you descriptors, not the values attribute access returns. `getattr` is what triggers the protocol.",
    "caveat": "The callability of staticmethod objects is version-dependent: raises on 3.9 and earlier, works from 3.10. This entry was run on the version shown in the footer.",
    "refs": [
      {
        "label": "Python docs &mdash; staticmethod",
        "url": "https://docs.python.org/3/library/functions.html#staticmethod"
      },
      {
        "label": "What's new in Python 3.10",
        "url": "https://docs.python.org/3/whatsnew/3.10.html"
      }
    ]
  },
  {
    "id": "deepcopy-handles-cycles",
    "num": 60,
    "title": "deepcopy On A Cycle",
    "subtitle": "the memo that stops the recursion",
    "difficulty": "intermediate",
    "tags": [
      "copying",
      "recursion",
      "references"
    ],
    "question": "What does this print?",
    "code": "import copy\n\nnode = {\"name\": \"a\"}\nnode[\"self\"] = node\n\nclone = copy.deepcopy(node)\nprint(clone[\"name\"], clone[\"self\"] is clone, clone is node)\n\nshared = [1, 2]\npair = {\"x\": shared, \"y\": shared}\ndup = copy.deepcopy(pair)\nprint(dup[\"x\"] is dup[\"y\"], dup[\"x\"] is shared)\n\ndef naive(obj):\n    if isinstance(obj, dict):\n        return {k: naive(v) for k, v in obj.items()}\n    return obj\n\ntry:\n    naive(node)\nexcept RecursionError as exc:\n    print(\"RecursionError:\", type(exc).__name__)",
    "output": "a True False\nTrue False\nRecursionError: RecursionError",
    "isError": false,
    "guesses": [
      "deepcopy recurses forever too",
      "dup['x'] and dup['y'] become separate lists"
    ],
    "explanation": [
      "<code>deepcopy</code> carries a <code>memo</code> dict keyed by <code>id()</code> of everything it has already copied. When it meets an object a second time it returns the existing copy instead of recursing, which terminates cycles and, just as importantly, <em>preserves sharing</em>.",
      "That second property is the one people miss. Two keys pointing at the same list in the original point at the same &mdash; single &mdash; new list in the copy. A hand-rolled recursive copy would give you two, silently changing the structure's aliasing.",
      "The naive version shows what you get without a memo."
    ],
    "extraCode": "",
    "fixNote": "Use <code>copy.deepcopy</code> rather than writing your own, and implement <code>__deepcopy__</code> when a class needs special handling:",
    "fixCode": "import copy\n\nclass Connection:\n    def __init__(self, dsn):\n        self.dsn = dsn\n    def __deepcopy__(self, memo):\n        return Connection(self.dsn)\n\nconn = Connection(\"db://x\")\nprint(copy.deepcopy(conn).dsn)",
    "takeaway": "`deepcopy` preserves the shape of the object graph, including cycles and shared references. Rolling your own does not.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; copy",
        "url": "https://docs.python.org/3/library/copy.html"
      }
    ]
  },
  {
    "id": "zip-star-transpose",
    "num": 61,
    "title": "zip(*matrix) Gives Tuples",
    "subtitle": "the transpose that changed your row type",
    "difficulty": "intermediate",
    "tags": [
      "zip",
      "unpacking",
      "types"
    ],
    "question": "What does this print?",
    "code": "matrix = [[1, 2, 3], [4, 5, 6]]\n\ntransposed = list(zip(*matrix))\nprint(transposed)\nprint(type(transposed[0]))\n\ntry:\n    transposed[0].append(99)\nexcept AttributeError as exc:\n    print(\"AttributeError:\", exc)\n\nprint(list(zip(*[])))\nprint([list(row) for row in zip(*matrix)])",
    "output": "[(1, 4), (2, 5), (3, 6)]\n<class 'tuple'>\nAttributeError: 'tuple' object has no attribute 'append'\n[]\n[[1, 4], [2, 5], [3, 6]]",
    "isError": false,
    "guesses": [
      "[[1, 4], [2, 5], [3, 6]] with lists inside",
      "zip(*[]) raises"
    ],
    "explanation": [
      "<code>zip(*matrix)</code> unpacks the rows as separate arguments and pairs them up positionally, which is a transpose. It is one of the tidiest idioms in the language and it silently changes your element type: <code>zip</code> always yields tuples, whatever went in.",
      "So a matrix of lists transposes into a list of tuples, and the next line that tries to mutate a row fails with an <code>AttributeError</code> far from the transpose.",
      "The empty case is its own surprise: <code>zip()</code> with no arguments yields nothing, so transposing an empty matrix gives <code>[]</code> rather than raising &mdash; and transposing twice does not round-trip for ragged input, because <code>zip</code> truncates to the shortest row."
    ],
    "extraCode": "",
    "fixNote": "Convert back to the container you want, and use <code>strict=True</code> if the rows must be equal length:",
    "fixCode": "matrix = [[1, 2, 3], [4, 5, 6]]\ntransposed = [list(row) for row in zip(*matrix, strict=True)]\ntransposed[0].append(99)\nprint(transposed)",
    "takeaway": "`zip` is a tuple factory. Any pipeline that transposes and keeps mutating needs an explicit conversion.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; zip",
        "url": "https://docs.python.org/3/library/functions.html#zip"
      }
    ]
  },
  {
    "id": "dict-merge-later-wins",
    "num": 62,
    "title": "{**a, **b} - Later Wins",
    "subtitle": "the override you did not notice",
    "difficulty": "intermediate",
    "tags": [
      "dicts",
      "unpacking",
      "merging"
    ],
    "question": "What does this print?",
    "code": "defaults = {\"host\": \"localhost\", \"port\": 80}\noverrides = {\"port\": 8080, \"debug\": True}\n\nprint({**defaults, **overrides})\nprint({**overrides, **defaults})\nprint(defaults | overrides)\n\nprint(dict(defaults, **overrides))\nprint(defaults.update(overrides), defaults)\n\nprint({**{1: \"a\"}, **{2: \"b\"}})\ntry:\n    print(dict({1: \"a\"}, **{2: \"b\"}))\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)",
    "output": "{'host': 'localhost', 'port': 8080, 'debug': True}\n{'port': 80, 'debug': True, 'host': 'localhost'}\n{'host': 'localhost', 'port': 8080, 'debug': True}\n{'host': 'localhost', 'port': 8080, 'debug': True}\nNone {'host': 'localhost', 'port': 8080, 'debug': True}\n{1: 'a', 2: 'b'}\nTypeError: keywords must be strings",
    "isError": false,
    "guesses": [
      "The first two lines give the same dict",
      "update returns the merged dict"
    ],
    "explanation": [
      "Dict unpacking applies left to right, so the rightmost occurrence of a key wins. Reversing the order reverses the precedence, and it is easy to write the operands in the order you thought of them rather than the order you meant.",
      "<code>|</code> (3.9+) is the same rule with clearer intent. <code>update</code> is the in-place version and returns <code>None</code>, which is the usual mutating-method trap.",
      "<code>dict(a, **b)</code> looks equivalent but is not: it passes <code>b</code> as keyword arguments, so every key has to be a valid identifier string. A non-string key raises, where <code>{**a, **b}</code> accepts anything hashable."
    ],
    "extraCode": "",
    "fixNote": "Use <code>|</code> and put the winner on the right:",
    "fixCode": "defaults = {\"host\": \"localhost\", \"port\": 80}\noverrides = {\"port\": 8080}\n\nconfig = defaults | overrides\nprint(config, defaults)",
    "takeaway": "Rightmost wins in `{**a, **b}` and `a | b`. `dict(a, **b)` additionally requires string keys.",
    "caveat": "",
    "refs": [
      {
        "label": "PEP 584 &mdash; add union operators to dict",
        "url": "https://peps.python.org/pep-0584/"
      }
    ]
  },
  {
    "id": "itertools-tee-buffers",
    "num": 63,
    "title": "itertools.tee Buffers Everything",
    "subtitle": "the lazy split that is not lazy",
    "difficulty": "intermediate",
    "tags": [
      "itertools",
      "generators",
      "memory"
    ],
    "question": "What does this print?",
    "code": "from itertools import tee\n\nproduced = []\n\ndef source():\n    for n in range(5):\n        produced.append(n)\n        yield n\n\na, b = tee(source())\n\nprint(\"a fully:\", list(a))\nprint(\"produced so far:\", produced)\nprint(\"b fully:\", list(b))\nprint(\"produced now:\", produced)\n\nc, d = tee(source())\nprint(\"interleaved:\", next(c), next(d), next(c))",
    "output": "a fully: [0, 1, 2, 3, 4]\nproduced so far: [0, 1, 2, 3, 4]\nb fully: [0, 1, 2, 3, 4]\nproduced now: [0, 1, 2, 3, 4]\ninterleaved: 0 0 1",
    "isError": false,
    "guesses": [
      "source runs twice, producing 0-4 twice",
      "b gets nothing"
    ],
    "explanation": [
      "<code>tee</code> does not restart the underlying iterator &mdash; it cannot, iterators have no rewind. It keeps an internal FIFO buffer per branch. Anything one branch has consumed that another has not is held in memory until the slower branch catches up.",
      "So draining <code>a</code> completely pulls all five values from the source and stores all five for <code>b</code>. The source still runs exactly once, which is the useful part, but the memory saving you expected from laziness is gone: peak usage is the whole gap between the branches.",
      "Consume the branches in lockstep, as the last line does, and the buffer never exceeds one element. The docs put it plainly: if one iterator will be consumed before another starts, <code>list()</code> is faster."
    ],
    "extraCode": "",
    "fixNote": "If you are going to drain one branch first, just materialise the data and share it:",
    "fixCode": "def source():\n    yield from range(5)\n\nrows = list(source())\nprint(sum(rows), max(rows))",
    "takeaway": "`tee` trades memory for a single pass over the source. Non-overlapping consumption gets you the cost with none of the benefit.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; itertools.tee",
        "url": "https://docs.python.org/3/library/itertools.html#itertools.tee"
      }
    ]
  },
  {
    "id": "assert-disappears-under-O",
    "num": 64,
    "title": "assert Disappears Under -O",
    "subtitle": "the check that is not there in production",
    "difficulty": "intermediate",
    "tags": [
      "assert",
      "deployment",
      "security"
    ],
    "question": "What does this print?",
    "code": "import subprocess, sys, textwrap\n\nprogram = textwrap.dedent(\"\"\"\n    def withdraw(balance, amount):\n        assert amount <= balance, \"overdraft\"\n        return balance - amount\n\n    print(\"result:\", withdraw(100, 500))\n    print(\"__debug__ is\", __debug__)\n\"\"\")\n\nfor flags in ([], [\"-O\"]):\n    label = \" \".join(flags) or \"(no flags)\"\n    done = subprocess.run([sys.executable, *flags, \"-c\", program],\n                          capture_output=True, text=True)\n    for line in (done.stdout + done.stderr).strip().splitlines():\n        print(f\"{label:>11}: {line}\")",
    "output": " (no flags): Traceback (most recent call last):\n (no flags):   File \"<string>\", line 6, in <module>\n (no flags):     print(\"result:\", withdraw(100, 500))\n (no flags):                      ~~~~~~~~^^^^^^^^^^\n (no flags):   File \"<string>\", line 3, in withdraw\n (no flags):     assert amount <= balance, \"overdraft\"\n (no flags):            ^^^^^^^^^^^^^^^^^\n (no flags): AssertionError: overdraft\n         -O: result: -400\n         -O: __debug__ is False",
    "isError": false,
    "guesses": [
      "Both runs raise AssertionError",
      "-O only affects speed"
    ],
    "explanation": [
      "<code>-O</code> sets <code>__debug__</code> to <code>False</code> and the compiler removes every <code>assert</code> statement entirely. Not \"skips at runtime\" &mdash; the bytecode is not generated. The same happens with <code>PYTHONOPTIMIZE</code> set, and when a deployment ships only <code>.opt-1.pyc</code> files.",
      "So an <code>assert</code> is a developer's note about an invariant, checked in development and absent in production. That is fine for \"this cannot happen\". It is a disaster for input validation, permission checks, or anything guarding money, because the guard silently evaporates in exactly the environment that matters.",
      "Anything with a side effect inside an <code>assert</code> vanishes too."
    ],
    "extraCode": "",
    "fixNote": "Raise real exceptions for anything a user or a caller can trigger. Keep <code>assert</code> for internal invariants:",
    "fixCode": "def withdraw(balance, amount):\n    if amount > balance:\n        raise ValueError(\"insufficient funds\")\n    return balance - amount\n\ntry:\n    withdraw(100, 500)\nexcept ValueError as exc:\n    print(\"ValueError:\", exc)",
    "takeaway": "If the check must run in production, it cannot be an `assert`.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; the assert statement",
        "url": "https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement"
      }
    ]
  },
  {
    "id": "default-encoding-is-platform-dependent",
    "num": 65,
    "title": "open() Without encoding= Is Platform-Dependent",
    "subtitle": "works on my machine, mojibake on yours",
    "difficulty": "intermediate",
    "tags": [
      "files",
      "encoding",
      "unicode",
      "portability"
    ],
    "question": "What does this print?",
    "code": "import locale, pathlib\n\nprint(\"locale encoding here:\", locale.getencoding())\n\np = pathlib.Path(\"note.txt\")\np.write_text(\"café costs 5€\", encoding=\"utf-8\")\n\nprint(\"as utf-8 :\", p.read_text(encoding=\"utf-8\"))\nprint(\"as cp1252:\", p.read_text(encoding=\"cp1252\"))\n\ntry:\n    p.read_text(encoding=\"ascii\")\nexcept UnicodeDecodeError as exc:\n    print(\"UnicodeDecodeError:\", exc.reason)",
    "output": "locale encoding here: UTF-8\nas utf-8 : café costs 5€\nas cp1252: cafÃ© costs 5â‚¬\nUnicodeDecodeError: ordinal not in range(128)",
    "isError": false,
    "guesses": [
      "Every read gives the same text",
      "cp1252 raises rather than mangling"
    ],
    "explanation": [
      "With no <code>encoding=</code>, <code>open()</code> and <code>Path.read_text()</code> use <code>locale.getencoding()</code>. On modern Linux and macOS that is UTF-8. On Windows it is still the legacy ANSI code page &mdash; cp1252 in Western Europe, cp932 in Japan &mdash; so the same code reads the same file differently on different machines.",
      "The dangerous case is the middle line. cp1252 maps every byte to some character, so decoding UTF-8 as cp1252 does not fail: it produces mojibake that flows straight into your database. Only a strict encoding like ASCII refuses outright.",
      "Python 3.15 will make UTF-8 mode the default, and <code>-X warn_default_encoding</code> already reports every unqualified <code>open()</code> today."
    ],
    "extraCode": "",
    "fixNote": "Pass <code>encoding=</code> on every text-mode open. There is no good reason to omit it:",
    "fixCode": "import pathlib\n\np = pathlib.Path(\"note.txt\")\np.write_text(\"café costs 5€\", encoding=\"utf-8\")\nprint(p.read_text(encoding=\"utf-8\"))",
    "takeaway": "An unqualified `open()` is a portability bug that only appears on someone else's computer.",
    "caveat": "",
    "refs": [
      {
        "label": "PEP 686 &mdash; make UTF-8 mode default",
        "url": "https://peps.python.org/pep-0686/"
      },
      {
        "label": "PEP 597 &mdash; add optional EncodingWarning",
        "url": "https://peps.python.org/pep-0597/"
      }
    ]
  },
  {
    "id": "len-of-non-ascii-text",
    "num": 66,
    "title": "len() On Non-ASCII Text",
    "subtitle": "one character, two code points",
    "difficulty": "intermediate",
    "tags": [
      "unicode",
      "strings",
      "normalisation"
    ],
    "question": "What does this print?",
    "code": "import unicodedata\n\nnfc = unicodedata.normalize(\"NFC\", \"café\")\nnfd = unicodedata.normalize(\"NFD\", \"café\")\n\nprint(len(nfc), len(nfd), nfc == nfd)\nprint(nfc == nfd, unicodedata.normalize(\"NFC\", nfd) == nfc)\n\nfamily = \"👨‍👩‍👧\"\nprint(len(family), [hex(ord(c)) for c in family])\n\nflag = \"🇮🇳\"\nprint(len(flag), flag[0])",
    "output": "4 5 False\nFalse True\n5 ['0x1f468', '0x200d', '0x1f469', '0x200d', '0x1f467']\n2 🇮",
    "isError": false,
    "guesses": [
      "len is 4 for both spellings",
      "The emoji family has length 1"
    ],
    "explanation": [
      "<code>len()</code> counts code points, not characters as a reader perceives them. <code>é</code> can be one code point (U+00E9) or two (<code>e</code> plus a combining acute), and both render identically. Text arriving from a macOS filesystem tends to be NFD; text from a web form tends to be NFC. They are unequal strings.",
      "Emoji make it vivid: the family is three people joined by zero-width joiners, so five code points and one glyph. A regional-indicator flag is two code points, and indexing it gives you half a flag.",
      "So <code>len()</code> is not a display width, not a grapheme count, and not a safe thing to compare between two sources."
    ],
    "extraCode": "",
    "fixNote": "Normalise at the boundary, compare normalised forms, and use a grapheme library if you need user-perceived characters:",
    "fixCode": "import unicodedata\n\ndef key(s):\n    return unicodedata.normalize(\"NFC\", s)\n\na = unicodedata.normalize(\"NFD\", \"café\")\nb = unicodedata.normalize(\"NFC\", \"café\")\nprint(a == b, key(a) == key(b))",
    "takeaway": "Normalise text as it enters your system. Two strings that look identical are not necessarily equal.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; unicodedata.normalize",
        "url": "https://docs.python.org/3/library/unicodedata.html#unicodedata.normalize"
      },
      {
        "label": "Unicode Standard Annex 15 &mdash; normalization forms",
        "url": "https://unicode.org/reports/tr15/"
      }
    ]
  },
  {
    "id": "naive-versus-aware-datetimes",
    "num": 67,
    "title": "datetime.now() vs now(UTC)",
    "subtitle": "two timestamps that refuse to be compared",
    "difficulty": "intermediate",
    "tags": [
      "datetime",
      "timezones",
      "comparisons"
    ],
    "question": "What does this print?",
    "code": "import datetime as dt\n\nnaive = dt.datetime(2026, 1, 1, 12, 0)\naware = dt.datetime(2026, 1, 1, 12, 0, tzinfo=dt.UTC)\n\nprint(naive, \"|\", aware)\nprint(naive == aware)\n\ntry:\n    print(naive < aware)\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\nprint(naive.timestamp() == aware.timestamp())\nprint(aware.astimezone(dt.timezone(dt.timedelta(hours=5, minutes=30))))",
    "output": "2026-01-01 12:00:00 | 2026-01-01 12:00:00+00:00\nFalse\nTypeError: can't compare offset-naive and offset-aware datetimes\nFalse\n2026-01-01 17:30:00+05:30",
    "isError": false,
    "guesses": [
      "naive == aware is True",
      "Comparison works, subtraction does not"
    ],
    "explanation": [
      "A naive <code>datetime</code> carries no <code>tzinfo</code> and therefore does not identify a moment in time &mdash; it is a wall-clock reading with no location. An aware one does. Python refuses to order them, because there is no correct answer.",
      "Equality is the inconsistent part: it returns <code>False</code> rather than raising, so a naive value compared against an aware one is quietly never equal. A dict keyed on timestamps, or an <code>if now == deadline</code>, fails silently rather than loudly.",
      "<code>.timestamp()</code> on a naive value interprets it as <em>local</em> time, so the answer depends on the machine's timezone. That is the line that produces \"the job ran an hour early on the production box\".",
      "<code>utcnow()</code> is the historical trap: it returns UTC wall-clock with no <code>tzinfo</code> attached, so it looks aware and is not. It is deprecated since 3.12."
    ],
    "extraCode": "",
    "fixNote": "Use aware datetimes everywhere, and get UTC with an explicit timezone:",
    "fixCode": "import datetime as dt\n\nnow = dt.datetime.now(dt.UTC)\ndeadline = now + dt.timedelta(hours=1)\nprint(now < deadline, (deadline - now))",
    "takeaway": "Pick aware or naive and never mix. `datetime.now(dt.UTC)` is the one to reach for; `utcnow()` is not.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; aware and naive objects",
        "url": "https://docs.python.org/3/library/datetime.html#aware-and-naive-objects"
      }
    ]
  },
  {
    "id": "fstring-quotes-and-equals",
    "num": 68,
    "title": "f-string `=` And Nested Quotes",
    "subtitle": "two features you probably have not met",
    "difficulty": "intermediate",
    "tags": [
      "f-strings",
      "strings",
      "debugging",
      "versions"
    ],
    "question": "What does this print?",
    "code": "user = {\"name\": \"ada\", \"id\": 7}\ntotal = 2 + 3\n\nprint(f\"{total=}\")\nprint(f\"{total = }\")\nprint(f\"{user['name']=}\")\n\nprint(f\"{user[\"name\"]}\")\n\nwidth = 8\nprint(f\"{total:>{width}}|\")\nprint(f\"{'{literal}'} {{braces}}\")",
    "output": "total=5\ntotal = 5\nuser['name']='ada'\nada\n       5|\n{literal} {braces}",
    "isError": false,
    "guesses": [
      "The `=` form prints just the value",
      "The double-quoted key is a SyntaxError"
    ],
    "explanation": [
      "<code>f\"{expr=}\"</code> prints the source text of the expression, an equals sign, and the <code>repr</code> of the result. It is a debugging shortcut that removes the copy-paste error where the label no longer matches the value. Whitespace around the <code>=</code> is preserved exactly as you wrote it.",
      "Reusing the outer quote character inside the braces &mdash; <code>f\"{user[\"name\"]}\"</code> &mdash; was a <code>SyntaxError</code> until 3.12. PEP 701 rewrote f-strings to be parsed by the real grammar rather than a bespoke scanner, which also allowed nesting, backslashes and multi-line expressions inside the braces.",
      "Format specs can themselves be f-strings, which is how <code>{total:>{width}}</code> works. And a literal brace still needs doubling."
    ],
    "extraCode": "",
    "fixNote": "The <code>=</code> form is the one worth adopting; it replaces a whole genre of print statement:",
    "fixCode": "def solve(a, b):\n    ratio = a / b\n    print(f\"{a=} {b=} {ratio=:.3f}\")\n    return ratio\n\nsolve(22, 7)",
    "takeaway": "`f\"{x=}\"` prints the expression and its value. Nested same-quotes need Python 3.12 or later.",
    "caveat": "The nested-quote line is a SyntaxError on 3.11 and earlier, which means the whole file fails to parse there, not just that line.",
    "refs": [
      {
        "label": "PEP 701 &mdash; syntactic formalization of f-strings",
        "url": "https://peps.python.org/pep-0701/"
      },
      {
        "label": "Python docs &mdash; formatted string literals",
        "url": "https://docs.python.org/3/reference/lexical_analysis.html#f-strings"
      }
    ]
  },
  {
    "id": "sum-refuses-strings",
    "num": 69,
    "title": "sum() Refuses Strings But Not Lists",
    "subtitle": "one quadratic concatenation is allowed",
    "difficulty": "intermediate",
    "tags": [
      "builtins",
      "performance",
      "strings",
      "lists"
    ],
    "question": "What does this print?",
    "code": "parts = [\"a\", \"b\", \"c\"]\n\ntry:\n    print(sum(parts, \"\"))\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\nprint(\"\".join(parts))\n\nchunks = [[1], [2], [3]]\nprint(sum(chunks, []))\n\nimport itertools\nprint(list(itertools.chain.from_iterable(chunks)))",
    "output": "TypeError: sum() can't sum strings [use ''.join(seq) instead]\nabc\n[1, 2, 3]\n[1, 2, 3]",
    "isError": false,
    "guesses": [
      "sum works for both",
      "sum refuses both"
    ],
    "explanation": [
      "<code>sum</code> special-cases <code>str</code> and refuses it, with an error message that names the replacement. The reason is cost: each <code>+</code> builds a whole new string, so summing n pieces copies O(n&sup2;) characters. <code>str.join</code> measures the total once and fills a single buffer.",
      "Lists have exactly the same problem and are not refused. <code>sum(chunks, [])</code> is quadratic, works fine on the three-element example in your test, and quietly becomes the bottleneck on real data. The guard was only ever added for the case people hit most.",
      "<code>itertools.chain.from_iterable</code> is the linear answer for lists, and it does not build the intermediate results at all."
    ],
    "extraCode": "",
    "fixNote": "<code>join</code> for strings, <code>chain</code> for iterables:",
    "fixCode": "import itertools\n\nparts = [\"a\", \"b\", \"c\"]\nprint(\"\".join(parts))\n\nchunks = [[1], [2], [3]]\nprint(list(itertools.chain.from_iterable(chunks)))",
    "takeaway": "Repeated concatenation is quadratic whatever the type. Python only stops you for strings.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; sum",
        "url": "https://docs.python.org/3/library/functions.html#sum"
      },
      {
        "label": "Python docs &mdash; itertools.chain.from_iterable",
        "url": "https://docs.python.org/3/library/itertools.html#itertools.chain.from_iterable"
      }
    ]
  },
  {
    "id": "the-walrus-leaks",
    "num": 70,
    "title": "The Walrus Leaks Out Of A Comprehension",
    "subtitle": "deliberately, unlike everything else in there",
    "difficulty": "intermediate",
    "tags": [
      "walrus",
      "comprehensions",
      "scope"
    ],
    "question": "What does this print?",
    "code": "data = [1, 2, 3]\n\nsquares = [y := x * x for x in data]\nprint(squares, \"and y is\", y)\n\ntry:\n    print(x)\nexcept NameError as exc:\n    print(\"NameError:\", exc)\n\nvalues = [0, 0, 7, 0]\nif any((first := v) for v in values if v):\n    print(\"first truthy:\", first)\n\nprint([total := 0] and [total := total + v for v in data], total)",
    "output": "[1, 4, 9] and y is 9\nNameError: name 'x' is not defined\nfirst truthy: 7\n[1, 3, 6] 6",
    "isError": false,
    "guesses": [
      "y is not defined outside",
      "x leaks as well"
    ],
    "explanation": [
      "A comprehension runs in its own implicit function scope, and its iteration variable stays there. The walrus operator is the deliberate exception: PEP 572 specifies that <code>:=</code> inside a comprehension binds in the <em>containing</em> scope, so the value survives.",
      "That is the point of it &mdash; it lets you capture something computed inside a comprehension, most usefully with <code>any</code>/<code>all</code>, where you want to know which element matched.",
      "It is also a trap, because it is the one name in a comprehension that behaves unlike all the others, and because it holds only the <em>last</em> value assigned. Combined with the short-circuiting of <code>any</code>, \"last\" and \"the one that matched\" happen to coincide here, but only because <code>any</code> stopped."
    ],
    "extraCode": "",
    "fixNote": "Use it where the capture is the point, and keep the expression small enough to read:",
    "fixCode": "import re\n\nline = \"id=42\"\nif match := re.search(r\"id=(\\d+)\", line):\n    print(\"matched:\", match.group(1))\n\nvalues = [0, 0, 7, 0]\nfirst = next((v for v in values if v), None)\nprint(\"first truthy:\", first)",
    "takeaway": "`:=` in a comprehension writes to the enclosing scope on purpose. It is the only name that escapes.",
    "caveat": "",
    "refs": [
      {
        "label": "PEP 572 &mdash; assignment expressions",
        "url": "https://peps.python.org/pep-0572/"
      }
    ]
  },
  {
    "id": "match-bare-name-captures",
    "num": 71,
    "title": "match Treats A Bare Name As A Capture",
    "subtitle": "your constant matched everything",
    "difficulty": "intermediate",
    "tags": [
      "match",
      "pattern-matching",
      "constants"
    ],
    "question": "What does this print?",
    "code": "STATUS_OK = \"ok\"\n\ndef classify(value):\n    match value:\n        case STATUS_OK:\n            return f\"matched; STATUS_OK is now {STATUS_OK!r}\"\n    return \"fell through\"\n\nprint(classify(\"ok\"))\nprint(classify(\"catastrophic failure\"))\nprint(\"STATUS_OK after:\", STATUS_OK)\n\nclass Status:\n    OK = \"ok\"\n\ndef correct(value):\n    match value:\n        case Status.OK:\n            return \"really matched OK\"\n        case _:\n            return \"fallback\"\n\nprint(correct(\"ok\"), \"|\", correct(\"nope\"))",
    "output": "matched; STATUS_OK is now 'ok'\nmatched; STATUS_OK is now 'catastrophic failure'\nSTATUS_OK after: ok\nreally matched OK | fallback",
    "isError": false,
    "guesses": [
      "The second call returns 'fell through'",
      "A SyntaxError on the bare name"
    ],
    "explanation": [
      "In a <code>match</code> statement a bare identifier is a <em>capture pattern</em>. It matches anything and binds the subject to that name &mdash; it never compares. So <code>case STATUS_OK:</code> is an irrefutable pattern that also destroys your constant.",
      "PEP 634 chose this because capture is overwhelmingly the common case, and made the disambiguation syntactic: a <em>dotted</em> name is a value pattern and is compared with <code>==</code>. There is no way to compare against an undotted name.",
      "Python does catch the worst version. If any pattern follows an irrefutable capture, compilation fails with <code>SyntaxError: name capture makes remaining patterns unreachable</code>. That safety net only covers the case where something comes after &mdash; make the bare name your <em>last</em> pattern, as here, and it compiles, runs, and is wrong.",
      "Watch what the capture writes to. Inside a function it creates a <em>local</em>, so the module-level <code>STATUS_OK</code> still reads <code>'ok'</code> afterwards and the damage is confined to the function. Write the same <code>match</code> at module level and it overwrites the constant for the rest of the program.",
      "The first call looks like it worked, which is what makes this dangerous. You find out when a value that should have fallen through is reported as a match."
    ],
    "extraCode": ">>> RED = \"red\"\n>>> match \"blue\":\n...     case RED:\n...         print(\"matched\", RED)\n...\nmatched blue",
    "fixNote": "Put constants on a class, an enum, or a module and refer to them with a dot:",
    "fixCode": "from enum import Enum\n\nclass Status(Enum):\n    OK = \"ok\"\n    FAIL = \"fail\"\n\ndef classify(value):\n    match value:\n        case Status.OK:\n            return \"ok\"\n        case Status.FAIL:\n            return \"fail\"\n        case _:\n            return \"unknown\"\n\nprint(classify(Status.OK), classify(\"something else\"))",
    "takeaway": "Only dotted names are compared in a `match`. A bare name always matches and always rebinds.",
    "caveat": "",
    "refs": [
      {
        "label": "PEP 634 &mdash; structural pattern matching: specification",
        "url": "https://peps.python.org/pep-0634/"
      },
      {
        "label": "Python docs &mdash; the match statement",
        "url": "https://docs.python.org/3/reference/compound_stmts.html#the-match-statement"
      }
    ]
  },
  {
    "id": "decimal-from-a-float",
    "num": 72,
    "title": "Decimal(0.1)",
    "subtitle": "the exact value of an inexact number",
    "difficulty": "intermediate",
    "tags": [
      "decimal",
      "floats",
      "numbers"
    ],
    "question": "What does this print?",
    "code": "from decimal import Decimal, getcontext\n\nprint(Decimal(0.1))\nprint(Decimal(\"0.1\"))\nprint(Decimal(0.1) == Decimal(\"0.1\"))\n\nprint(Decimal(\"0.1\") * 3 == Decimal(\"0.3\"))\nprint(Decimal(1) / Decimal(3))\n\ngetcontext().prec = 5\nprint(Decimal(1) / Decimal(3))",
    "output": "0.1000000000000000055511151231257827021181583404541015625\n0.1\nFalse\nTrue\n0.3333333333333333333333333333\n0.33333",
    "isError": false,
    "guesses": [
      "Decimal(0.1) prints 0.1",
      "Both constructors give the same value"
    ],
    "explanation": [
      "<code>Decimal</code> from a string parses the digits you wrote. <code>Decimal</code> from a float converts the <em>exact</em> binary value that float holds &mdash; and since <code>0.1</code> is not representable in binary, that exact value is a 55-digit number slightly above a tenth.",
      "Neither is a bug. The float constructor is doing the only honest thing: showing you what was really in there. But passing a float into <code>Decimal</code> imports the error you were using <code>Decimal</code> to avoid, which defeats the entire exercise.",
      "Note also that <code>Decimal</code> is arbitrary <em>precision</em>, not infinite: division is governed by the context precision, which defaults to 28 significant digits and is global to the thread."
    ],
    "extraCode": "",
    "fixNote": "Construct from strings or integers, never from floats, and set precision explicitly where it matters:",
    "fixCode": "from decimal import Decimal, localcontext\n\nprice = Decimal(\"19.99\")\nqty = 3\nprint(price * qty)\n\nwith localcontext() as ctx:\n    ctx.prec = 4\n    print(Decimal(1) / Decimal(7))\nprint(Decimal(1) / Decimal(7))",
    "takeaway": "`Decimal(some_float)` inherits the float's error. Keep the value in text form all the way to the constructor.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; decimal",
        "url": "https://docs.python.org/3/library/decimal.html"
      }
    ]
  },
  {
    "id": "class-body-comprehension-scope",
    "num": 73,
    "title": "Comprehensions Cannot See The Class Body",
    "subtitle": "one line works, the next raises NameError",
    "difficulty": "advanced",
    "tags": [
      "scope",
      "classes",
      "comprehensions",
      "namespaces"
    ],
    "question": "Does this class definition succeed? If not, which line fails?",
    "code": "class Config:\n    scale = 10\n    sizes = [i for i in range(scale)]\n    scaled = [scale * i for i in range(3)]\n\nprint(Config.scaled)",
    "output": "Traceback (most recent call last):\n  File \"class_body_comprehension_scope.py\", line 1, in <module>\n    class Config:\n    ...<2 lines>...\n        scaled = [scale * i for i in range(3)]\n  File \"class_body_comprehension_scope.py\", line 4, in Config\n    scaled = [scale * i for i in range(3)]\n              ^^^^^\nNameError: name 'scale' is not defined",
    "isError": true,
    "guesses": [
      "[0, 10, 20] &mdash; scale is right there",
      "Both comprehension lines fail"
    ],
    "explanation": [
      "A comprehension gets its own function scope, and that scope's enclosing namespace is the module, not the class body. Class bodies are deliberately skipped during name resolution &mdash; otherwise methods would silently see sibling attributes as bare names.",
      "So why does line 3 work? Because the <strong>outermost iterable</strong> is the one piece of a comprehension evaluated eagerly, in the enclosing scope, and passed into the implicit function as an argument. <code>range(scale)</code> is that iterable, so <code>scale</code> resolves. The element expression <code>scale * i</code> on line 4 runs <em>inside</em> the implicit function, which cannot see the class body at all.",
      "A function nested in another function does not have this problem, because function scopes do nest:"
    ],
    "extraCode": ">>> def scale_visible():\n...     scale = 10\n...     return [scale * i for i in range(3)]\n...\n>>> scale_visible()\n[0, 10, 20]",
    "fixNote": "Pass the value in through the iterable, or lift the constant out of the class body:",
    "fixCode": "SCALE = 10\n\nclass Config:\n    scale = SCALE\n    scaled = [SCALE * i for i in range(3)]\n\nprint(Config.scaled)\n\nclass Config2:\n    scale = 10\n    scaled = [s * i for s in (scale,) for i in range(3)]\n\nprint(Config2.scaled)",
    "takeaway": "The same rule applies to generator expressions, set and dict comprehensions, and lambdas in a class body. Functions nest; class bodies do not.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; execution model, resolution of names",
        "url": "https://docs.python.org/3/reference/executionmodel.html#resolution-of-names"
      },
      {
        "label": "Python docs &mdash; displays for lists, sets and dictionaries",
        "url": "https://docs.python.org/3/reference/expressions.html#displays-for-lists-sets-and-dictionaries"
      }
    ]
  },
  {
    "id": "dunder-lookup-skips-the-instance",
    "num": 74,
    "title": "Dunder Lookup Skips The Instance",
    "subtitle": "assigning __len__ on an object does nothing",
    "difficulty": "advanced",
    "tags": [
      "dunder",
      "datamodel",
      "attribute-lookup"
    ],
    "question": "What does this print?",
    "code": "class Box:\n    pass\n\nb = Box()\nb.__len__ = lambda: 42\n\nprint(b.__len__())\ntry:\n    print(len(b))\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\nclass Sized:\n    def __len__(self):\n        return 7\n\ns = Sized()\ns.__len__ = lambda: 99\nprint(len(s), s.__len__())",
    "output": "42\nTypeError: object of type 'Box' has no len()\n7 99",
    "isError": false,
    "guesses": [
      "len(b) is 42",
      "len(s) is 99"
    ],
    "explanation": [
      "Implicit special-method lookup goes to the <em>type</em>, never the instance. <code>len(x)</code> is effectively <code>type(x).__len__(x)</code>, so an attribute of the same name sitting in the instance dict is simply not consulted.",
      "This is not an oversight. It makes every operator dispatch one predictable lookup on a slot rather than a full attribute search, which is a large speed difference on the hot path, and it keeps <code>type(x)</code> the single authority on how <code>x</code> behaves. It also means <code>__init__</code>, <code>__enter__</code>, <code>__iter__</code>, <code>__eq__</code> and the rest cannot be monkey-patched per object.",
      "The second class shows how confusing this can get: <code>len(s)</code> and <code>s.__len__()</code> give different answers, because only the first goes through the type."
    ],
    "extraCode": "",
    "fixNote": "Patch the class, or give the class a hook that reads per-instance state:",
    "fixCode": "class Box:\n    def __init__(self, size):\n        self._size = size\n    def __len__(self):\n        return self._size\n\nprint(len(Box(42)))\n\nclass Other:\n    pass\nOther.__len__ = lambda self: 5\nprint(len(Other()))",
    "takeaway": "Special methods are looked up on the type. Per-instance overrides of dunders are silently ignored.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; special method lookup",
        "url": "https://docs.python.org/3/reference/datamodel.html#special-method-lookup"
      }
    ]
  },
  {
    "id": "bool-falls-back-to-len",
    "num": 75,
    "title": "__bool__ Falls Back To __len__",
    "subtitle": "your empty object became false",
    "difficulty": "advanced",
    "tags": [
      "dunder",
      "truthiness",
      "datamodel"
    ],
    "question": "What does this print?",
    "code": "class Basket:\n    def __init__(self, items):\n        self.items = items\n    def __len__(self):\n        return len(self.items)\n\nempty = Basket([])\nfull = Basket([1])\n\nprint(bool(empty), bool(full))\n\nif not empty:\n    print(\"an existing Basket tested as falsy\")\n\nclass Explicit(Basket):\n    def __bool__(self):\n        return True\n\nprint(bool(Explicit([])), len(Explicit([])))",
    "output": "False True\nan existing Basket tested as falsy\nTrue 0",
    "isError": false,
    "guesses": [
      "bool(empty) is True &mdash; the object exists",
      "Defining __len__ has no effect on truthiness"
    ],
    "explanation": [
      "Truth testing tries <code>__bool__</code> first. If the type does not define it, Python falls back to <code>__len__</code> and calls the object false when the length is zero. Only if neither exists is every instance true.",
      "So adding <code>__len__</code> to a class &mdash; a perfectly reasonable thing to do for anything container-shaped &mdash; silently changes what <code>if obj:</code> means everywhere in the codebase. A result object, a response wrapper, a query set: each becomes falsy when empty, and <code>if result:</code> stops distinguishing \"no result\" from \"an empty result\".",
      "It is the class-level version of the <code>falsy is not None</code> trap, and it is harder to see because the <code>__len__</code> may have been added years later by someone else."
    ],
    "extraCode": "",
    "fixNote": "Define <code>__bool__</code> explicitly whenever you define <code>__len__</code> on something that is not really a container, and test <code>is None</code> at the call site:",
    "fixCode": "class Response:\n    def __init__(self, rows):\n        self.rows = rows\n    def __len__(self):\n        return len(self.rows)\n    def __bool__(self):\n        return True\n\nr = Response([])\nprint(bool(r), len(r))\nprint(\"empty\" if len(r) == 0 else \"has rows\")",
    "takeaway": "Adding `__len__` makes your empty objects falsy. If that is wrong, say so with `__bool__`.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; object.__bool__",
        "url": "https://docs.python.org/3/reference/datamodel.html#object.__bool__"
      }
    ]
  },
  {
    "id": "data-versus-non-data-descriptors",
    "num": 76,
    "title": "Data vs Non-Data Descriptors",
    "subtitle": "which one the instance dict can beat",
    "difficulty": "advanced",
    "tags": [
      "descriptors",
      "attribute-lookup",
      "datamodel"
    ],
    "question": "What does this print?",
    "code": "class NonData:\n    def __get__(self, obj, owner=None):\n        return \"from descriptor\"\n\nclass Data(NonData):\n    def __set__(self, obj, value):\n        raise AttributeError(\"read-only\")\n\nclass C:\n    weak = NonData()\n    strong = Data()\n\nc = C()\nprint(c.weak, \"|\", c.strong)\n\nc.__dict__[\"weak\"] = \"from instance dict\"\nc.__dict__[\"strong\"] = \"from instance dict\"\n\nprint(c.weak, \"|\", c.strong)",
    "output": "from descriptor | from descriptor\nfrom instance dict | from descriptor",
    "isError": false,
    "guesses": [
      "Both come from the instance dict the second time",
      "Both keep coming from the descriptor"
    ],
    "explanation": [
      "<code>object.__getattribute__</code> has a fixed precedence: data descriptors on the type, then the instance <code>__dict__</code>, then non-data descriptors and plain class attributes. A descriptor counts as a <em>data</em> descriptor if its type defines <code>__set__</code> or <code>__delete__</code>.",
      "So a descriptor with only <code>__get__</code> loses to anything in the instance dict, and one that also defines <code>__set__</code> wins. Adding a single <code>__set__</code> method silently reverses the priority.",
      "This is the machinery behind everything: <code>property</code> defines <code>__set__</code>, so it always wins, which is why you cannot shadow a property by assigning to the instance. Plain functions define only <code>__get__</code>, so they are non-data &mdash; which is exactly why <code>obj.method = something</code> works and shadows the class's method for that object.",
      "It is also how <code>functools.cached_property</code> works: <code>__get__</code> only, so it computes once, writes the value into the instance dict, and every later lookup finds the dict entry first and never calls the descriptor again."
    ],
    "extraCode": "",
    "fixNote": "Pick the side you want deliberately. Add <code>__set__</code> to make a descriptor authoritative, leave it off to allow per-instance caching or overriding:",
    "fixCode": "import functools\n\nclass Report:\n    @functools.cached_property\n    def rows(self):\n        print(\"computing once\")\n        return [1, 2, 3]\n\nr = Report()\nprint(r.rows, r.rows)\nprint(r.__dict__[\"rows\"])",
    "takeaway": "`__set__` or `__delete__` on the descriptor's type is what makes it beat the instance dict. Nothing else.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; descriptor HowTo",
        "url": "https://docs.python.org/3/howto/descriptor.html"
      },
      {
        "label": "Python docs &mdash; invoking descriptors",
        "url": "https://docs.python.org/3/reference/datamodel.html#invoking-descriptors"
      }
    ]
  },
  {
    "id": "getattr-versus-getattribute",
    "num": 77,
    "title": "__getattr__ vs __getattribute__",
    "subtitle": "one is a fallback, the other is the whole road",
    "difficulty": "advanced",
    "tags": [
      "dunder",
      "attribute-lookup",
      "recursion"
    ],
    "question": "What does this print?",
    "code": "class Fallback:\n    def __init__(self):\n        self.real = \"present\"\n    def __getattr__(self, name):\n        return f\"invented {name!r}\"\n\nf = Fallback()\nprint(f.real, \"|\", f.missing)\n\nclass Intercept:\n    def __init__(self):\n        self.real = \"present\"\n    def __getattribute__(self, name):\n        return object.__getattribute__(self, name)\n\nprint(Intercept().real)\n\nclass Recursive:\n    def __getattribute__(self, name):\n        return self.__dict__.get(name)\n\ntry:\n    Recursive().anything\nexcept RecursionError:\n    print(\"RecursionError from self.__dict__ inside __getattribute__\")",
    "output": "present | invented 'missing'\npresent\nRecursionError from self.__dict__ inside __getattribute__",
    "isError": false,
    "guesses": [
      "__getattr__ intercepts f.real too",
      "The Recursive class returns None"
    ],
    "explanation": [
      "<code>__getattribute__</code> is called for <em>every</em> attribute access. <code>__getattr__</code> is called only after normal lookup has already failed. Defining the second is a safe way to add fallbacks; defining the first replaces the entire lookup mechanism, including the descriptor protocol and the instance dict.",
      "The recursion trap follows immediately: any <code>self.anything</code> inside <code>__getattribute__</code> re-enters <code>__getattribute__</code>. Even <code>self.__dict__</code> does, because <code>__dict__</code> is itself an attribute. The only way out is to call <code>object.__getattribute__(self, name)</code> or <code>super().__getattribute__(name)</code> explicitly.",
      "<code>__getattr__</code> has a milder version of the same problem: if it references an attribute that is also missing, it calls itself."
    ],
    "extraCode": "",
    "fixNote": "Use <code>__getattr__</code> unless you truly need to intercept everything, and route through <code>object</code> when you do:",
    "fixCode": "class Proxy:\n    def __init__(self, target):\n        object.__setattr__(self, \"_target\", target)\n    def __getattr__(self, name):\n        return getattr(object.__getattribute__(self, \"_target\"), name)\n\nclass Real:\n    value = 42\n\nprint(Proxy(Real()).value)",
    "takeaway": "`__getattr__` runs only on failure. `__getattribute__` runs always, and every `self.x` inside it recurses.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; customizing attribute access",
        "url": "https://docs.python.org/3/reference/datamodel.html#customizing-attribute-access"
      }
    ]
  },
  {
    "id": "super-needs-the-class-cell",
    "num": 78,
    "title": "super() Needs The __class__ Cell",
    "subtitle": "the same function works in a class body and not outside it",
    "difficulty": "advanced",
    "tags": [
      "super",
      "classes",
      "closures",
      "compiler"
    ],
    "question": "What does this print?",
    "code": "class Base:\n    def greet(self):\n        return \"base\"\n\nclass Child(Base):\n    def greet(self):\n        return \"child of \" + super().greet()\n\nprint(Child().greet())\nprint(Child.greet.__code__.co_freevars)\n\ndef greet(self):\n    return \"patched onto \" + super().greet()\n\nChild.patched = greet\ntry:\n    Child().patched()\nexcept RuntimeError as exc:\n    print(\"RuntimeError:\", exc)\n\nprint(greet.__code__.co_freevars)",
    "output": "child of base\n('__class__',)\nRuntimeError: super(): __class__ cell not found\n()",
    "isError": false,
    "guesses": [
      "The patched method works the same way",
      "A NameError rather than a RuntimeError"
    ],
    "explanation": [
      "Zero-argument <code>super()</code> is compiler magic. When the compiler sees it inside a function defined in a class body, it adds a hidden <code>__class__</code> closure cell to that function and arranges for <code>super()</code> to read it, together with the first positional argument, to reconstruct <code>super(__class__, self)</code>.",
      "Print <code>co_freevars</code> and you can see the cell on the method and its absence on the plain function. A function written outside a class body never gets one, so attaching it later gives you a method that raises <code>RuntimeError: super(): __class__ cell not found</code> the moment it runs.",
      "The same applies to functions built with <code>exec</code>, to some class-decorator and mixin-injection tricks, and to methods moved between classes."
    ],
    "extraCode": "",
    "fixNote": "Use the explicit two-argument form, which needs no cell:",
    "fixCode": "class Base:\n    def greet(self):\n        return \"base\"\n\nclass Child(Base):\n    pass\n\ndef greet(self):\n    return \"patched onto \" + super(Child, self).greet()\n\nChild.patched = greet\nprint(Child().patched())",
    "takeaway": "`super()` with no arguments only works in a function lexically inside a class body.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; super",
        "url": "https://docs.python.org/3/library/functions.html#super"
      },
      {
        "label": "Python docs &mdash; class definitions and __class__",
        "url": "https://docs.python.org/3/reference/compound_stmts.html#class-definitions"
      }
    ]
  },
  {
    "id": "mro-can-be-impossible",
    "num": 79,
    "title": "The MRO Can Be Impossible",
    "subtitle": "a class that refuses to be defined",
    "difficulty": "advanced",
    "tags": [
      "mro",
      "inheritance",
      "classes"
    ],
    "question": "What does this print?",
    "code": "class A: pass\nclass B(A): pass\n\nprint([c.__name__ for c in B.__mro__])\n\ntry:\n    class C(A, B):\n        pass\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\nclass D(B, A):\n    pass\n\nprint([c.__name__ for c in D.__mro__])",
    "output": "['B', 'A', 'object']\nTypeError: Cannot create a consistent method resolution order (MRO) for bases A, B\n['D', 'B', 'A', 'object']",
    "isError": false,
    "guesses": [
      "C is created with A before B",
      "Both orderings fail"
    ],
    "explanation": [
      "Python linearises bases with the C3 algorithm, which must preserve two things: the order you listed the bases in, and the rule that a subclass always precedes its own base. <code>class C(A, B)</code> demands <code>A</code> before <code>B</code>, while <code>B</code> being a subclass of <code>A</code> demands <code>B</code> before <code>A</code>. No ordering satisfies both, so the class cannot be created at all.",
      "The failure is at <em>class definition</em> time, which means at import. A refactor that makes one mixin inherit from another can break an unrelated module three levels away, and the traceback points at a <code>class</code> statement rather than at the change.",
      "Reversing the bases to <code>(B, A)</code> is consistent and works &mdash; put the most derived base first."
    ],
    "extraCode": "",
    "fixNote": "List bases most-derived first, and keep mixins independent of each other so any order stays legal:",
    "fixCode": "class Loggable:\n    def describe(self): return \"loggable\"\n\nclass Serialisable:\n    def describe(self): return \"serialisable\"\n\nclass Model(Loggable, Serialisable):\n    pass\n\nprint([c.__name__ for c in Model.__mro__])",
    "takeaway": "Base order is a constraint, not a preference. A base that subclasses another base must come first.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; method resolution order",
        "url": "https://docs.python.org/3/glossary.html#term-method-resolution-order"
      },
      {
        "label": "The Python 2.3 method resolution order",
        "url": "https://docs.python.org/3/howto/mro.html"
      }
    ]
  },
  {
    "id": "super-is-not-the-parent-class",
    "num": 80,
    "title": "super() Is Not The Parent Class",
    "subtitle": "the next class in the instance's MRO",
    "difficulty": "advanced",
    "tags": [
      "super",
      "mro",
      "inheritance",
      "diamond"
    ],
    "question": "What does this print?",
    "code": "class Base:\n    def run(self): return [\"Base\"]\n\nclass Left(Base):\n    def run(self): return [\"Left\"] + super().run()\n\nclass Right(Base):\n    def run(self): return [\"Right\"] + super().run()\n\nclass Diamond(Left, Right):\n    def run(self): return [\"Diamond\"] + super().run()\n\nprint(Diamond().run())\nprint(Left().run())\nprint([c.__name__ for c in Diamond.__mro__])",
    "output": "['Diamond', 'Left', 'Right', 'Base']\n['Left', 'Base']\n['Diamond', 'Left', 'Right', 'Base', 'object']",
    "isError": false,
    "guesses": [
      "['Diamond', 'Left', 'Base'] &mdash; Left's super is Base",
      "Base runs twice"
    ],
    "explanation": [
      "<code>super()</code> inside <code>Left.run</code> does not mean \"<code>Base</code>\". It means \"whatever follows <code>Left</code> in the MRO of <code>type(self)</code>\". For a plain <code>Left</code> instance that is <code>Base</code>; for a <code>Diamond</code> instance it is <code>Right</code> &mdash; a class <code>Left</code> knows nothing about and does not inherit from.",
      "That is the whole design. It is what lets cooperative multiple inheritance work and guarantees <code>Base</code> runs exactly once rather than once per path. It also means the author of <code>Left</code> cannot know what their <code>super()</code> call will reach.",
      "The practical consequence: every class in a cooperative hierarchy must accept and forward compatible arguments, call <code>super()</code> unconditionally, and never assume it is last. A single class that skips its <code>super()</code> call silently truncates the chain for everyone downstream."
    ],
    "extraCode": "",
    "fixNote": "Write cooperative methods: forward <code>*args, **kwargs</code> and always call up:",
    "fixCode": "class Base:\n    def __init__(self, **kwargs):\n        super().__init__()\n        self.tags = []\n\nclass Left(Base):\n    def __init__(self, **kwargs):\n        super().__init__(**kwargs)\n        self.tags.append(\"left\")\n\nclass Right(Base):\n    def __init__(self, **kwargs):\n        super().__init__(**kwargs)\n        self.tags.append(\"right\")\n\nclass Diamond(Left, Right):\n    pass\n\nprint(Diamond().tags)",
    "takeaway": "`super()` is a pointer into the MRO of the runtime type, not a reference to your declared base.",
    "caveat": "",
    "refs": [
      {
        "label": "Python's super() considered super!",
        "url": "https://rhettinger.wordpress.com/2011/05/26/super-considered-super/"
      },
      {
        "label": "Python docs &mdash; super",
        "url": "https://docs.python.org/3/library/functions.html#super"
      }
    ]
  },
  {
    "id": "slots-silently-does-nothing",
    "num": 81,
    "title": "__slots__ Silently Does Nothing",
    "subtitle": "one base without it and the saving is gone",
    "difficulty": "advanced",
    "tags": [
      "slots",
      "memory",
      "inheritance",
      "classes"
    ],
    "question": "What does this print?",
    "code": "class Slotted:\n    __slots__ = (\"x\",)\n\ns = Slotted()\ns.x = 1\ntry:\n    s.y = 2\nexcept AttributeError as exc:\n    print(\"AttributeError:\", exc)\n\nclass Plain:\n    pass\n\nclass Mixed(Slotted, Plain):\n    __slots__ = (\"z\",)\n\nm = Mixed()\nm.anything = \"accepted\"\nprint(\"Mixed has __dict__:\", hasattr(m, \"__dict__\"), m.__dict__)\n\nclass Child(Slotted):\n    pass\n\nprint(\"Child has __dict__:\", hasattr(Child(), \"__dict__\"))",
    "output": "AttributeError: 'Slotted' object has no attribute 'y' and no __dict__ for setting new attributes\nMixed has __dict__: True {'anything': 'accepted'}\nChild has __dict__: True",
    "isError": false,
    "guesses": [
      "Mixed rejects unknown attributes too",
      "Child rejects them"
    ],
    "explanation": [
      "<code>__slots__</code> stops the class creating a <code>__dict__</code> for its instances. It is not inherited as a restriction: the instance gets a <code>__dict__</code> if <em>any</em> class in the MRO fails to declare slots.",
      "So a slotted class mixed with one ordinary class, or subclassed without repeating <code>__slots__</code>, gets its dict back. Both the memory saving and the typo protection vanish, and nothing warns you &mdash; the class is created happily and the attribute assignment succeeds.",
      "Inheriting from anything with a dict has the same effect, which catches people subclassing library base classes."
    ],
    "extraCode": "",
    "fixNote": "Declare <code>__slots__</code> on every class in the chain, including empty tuples for the ones that add nothing:",
    "fixCode": "class Base:\n    __slots__ = (\"x\",)\n\nclass Child(Base):\n    __slots__ = ()\n\nc = Child()\nc.x = 1\ntry:\n    c.y = 2\nexcept AttributeError as exc:\n    print(\"AttributeError:\", exc)",
    "takeaway": "`__slots__` is only effective if every ancestor declares it. One gap restores the dict for the whole chain.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; __slots__",
        "url": "https://docs.python.org/3/reference/datamodel.html#slots"
      }
    ]
  },
  {
    "id": "slots-kills-weakref",
    "num": 82,
    "title": "__slots__ Kills Weak References",
    "subtitle": "unless you ask for __weakref__ by name",
    "difficulty": "advanced",
    "tags": [
      "slots",
      "weakref",
      "memory",
      "classes"
    ],
    "question": "What does this print?",
    "code": "import weakref\n\nclass Plain:\n    pass\n\nclass Slotted:\n    __slots__ = (\"x\",)\n\nclass SlottedWeakref:\n    __slots__ = (\"x\", \"__weakref__\")\n\nprint(weakref.ref(Plain()) is not None)\n\ntry:\n    weakref.ref(Slotted())\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\nprint(weakref.ref(SlottedWeakref()) is not None)\n\nobj = SlottedWeakref()\ncache = weakref.WeakSet([obj])\nprint(\"in cache:\", len(cache))",
    "output": "True\nTypeError: cannot create weak reference to 'Slotted' object\nTrue\nin cache: 1",
    "isError": false,
    "guesses": [
      "Slots have nothing to do with weak references",
      "Adding __weakref__ is a syntax error"
    ],
    "explanation": [
      "Weak reference support costs a pointer per instance, stored in a slot named <code>__weakref__</code>. Ordinary classes get it as part of the default instance layout. A class with <code>__slots__</code> gets exactly the slots it named, and nothing else &mdash; so weak referencing stops working.",
      "The failure surfaces far from the class. <code>weakref.WeakSet</code>, <code>WeakValueDictionary</code>, observer registries, many caches and several libraries' internals all need weak references, and they raise <code>TypeError: cannot create weak reference to 'X' object</code> from inside code you did not write.",
      "The fix is to name <code>__weakref__</code> in the slots tuple. Only one class in a hierarchy may do so, which is why you add it at the root."
    ],
    "extraCode": "",
    "fixNote": "Add <code>__weakref__</code> to the root slotted class if anything might weakly reference it:",
    "fixCode": "import weakref\n\nclass Node:\n    __slots__ = (\"value\", \"__weakref__\")\n    def __init__(self, value):\n        self.value = value\n\nn = Node(1)\nseen = weakref.WeakSet([n])\nprint(len(seen))",
    "takeaway": "Slots give you exactly what you asked for. `__weakref__` and `__dict__` are opt-in by name.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; __slots__",
        "url": "https://docs.python.org/3/reference/datamodel.html#slots"
      },
      {
        "label": "Python docs &mdash; weakref",
        "url": "https://docs.python.org/3/library/weakref.html"
      }
    ]
  },
  {
    "id": "dataclass-mutable-default",
    "num": 83,
    "title": "Mutable Default In A dataclass",
    "subtitle": "the one place Python stops you",
    "difficulty": "advanced",
    "tags": [
      "dataclasses",
      "defaults",
      "mutability"
    ],
    "question": "What does this print?",
    "code": "from dataclasses import dataclass, field, fields\n\ntry:\n    @dataclass\n    class Broken:\n        tags: list = []\nexcept ValueError as exc:\n    print(\"ValueError:\", exc)\n\n@dataclass\nclass Works:\n    tags: list = field(default_factory=list)\n\na, b = Works(), Works()\na.tags.append(\"x\")\nprint(a.tags, b.tags)\n\n@dataclass\nclass Sneaky:\n    tags: tuple = ()\n    lookup: dict = field(default_factory=dict)\n\nprint(fields(Sneaky)[0].default, fields(Sneaky)[1].default_factory)",
    "output": "ValueError: mutable default <class 'list'> for field tags is not allowed: use default_factory\n['x'] []\n() <class 'dict'>",
    "isError": false,
    "guesses": [
      "Broken is created and shares one list",
      "field(default_factory=list) shares too"
    ],
    "explanation": [
      "A dataclass turns its class attributes into <code>__init__</code> parameter defaults, which would reproduce the classic shared-mutable-default bug exactly. Rather than let that happen, <code>@dataclass</code> inspects each default and raises <code>ValueError</code> at class-creation time for anything unhashable.",
      "This is the only place in the language that catches this mistake for you, and it catches it at import, not at runtime. <code>default_factory</code> is the supported alternative: it is called once per instance, inside <code>__init__</code>.",
      "The check is by hashability, not by mutability, so it is a heuristic. A tuple default is allowed and is genuinely safe. A custom class that is mutable but defines <code>__hash__</code> slips straight through and will be shared."
    ],
    "extraCode": "",
    "fixNote": "Any container default goes through <code>default_factory</code>:",
    "fixCode": "from dataclasses import dataclass, field\n\n@dataclass\nclass Config:\n    tags: list = field(default_factory=list)\n    limits: dict = field(default_factory=lambda: {\"max\": 10})\n\na, b = Config(), Config()\na.tags.append(\"x\")\nprint(a.tags, b.tags, b.limits)",
    "takeaway": "`@dataclass` rejects unhashable defaults. Hashable-but-mutable defaults are still shared, silently.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; dataclasses, mutable default values",
        "url": "https://docs.python.org/3/library/dataclasses.html#mutable-default-values"
      }
    ]
  },
  {
    "id": "dataclass-eq-unsets-hash",
    "num": 84,
    "title": "@dataclass Sets __hash__ To None",
    "subtitle": "your model stopped working as a dict key",
    "difficulty": "advanced",
    "tags": [
      "dataclasses",
      "hashing",
      "equality"
    ],
    "question": "What does this print?",
    "code": "from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n\nprint(Point.__eq__ is not object.__eq__, Point.__hash__)\n\ntry:\n    {Point(1)}\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\n@dataclass(frozen=True)\nclass Frozen:\n    x: int\n\n@dataclass(eq=False)\nclass NoEq:\n    x: int\n\nprint(len({Frozen(1), Frozen(1)}), len({NoEq(1), NoEq(1)}))\n\n@dataclass(unsafe_hash=True)\nclass Unsafe:\n    x: int\n\nu = Unsafe(1)\nseen = {u}\nu.x = 99\nprint(\"lost in set:\", u in seen)",
    "output": "True None\nTypeError: cannot use 'Point' as a set element (unhashable type: 'Point')\n1 2\nlost in set: False",
    "isError": false,
    "guesses": [
      "A plain dataclass is hashable",
      "frozen and unsafe_hash behave the same"
    ],
    "explanation": [
      "<code>@dataclass</code> generates <code>__eq__</code> by default, and by the rule from the <code>__eq__</code>/<code>__hash__</code> entry, that means <code>__hash__</code> is set to <code>None</code>. Your model class is unhashable the moment you decorate it, and the error appears wherever someone first puts it in a set.",
      "<code>frozen=True</code> makes the instance immutable and generates a real <code>__hash__</code>. <code>eq=False</code> keeps identity-based equality and inherits <code>object.__hash__</code>. Both are safe; they just mean different things.",
      "<code>unsafe_hash=True</code> generates a hash on a mutable class, and the last three lines show why it is named that way: mutate a field after inserting and the object hashes to a different bucket, so the set contains something it can no longer find."
    ],
    "extraCode": "",
    "fixNote": "Use <code>frozen=True</code> for anything that goes in a set or a dict key:",
    "fixCode": "from dataclasses import dataclass, replace\n\n@dataclass(frozen=True)\nclass Point:\n    x: int\n    y: int\n\np = Point(1, 2)\nseen = {p}\nmoved = replace(p, x=5)\nprint(p in seen, moved)",
    "takeaway": "Default dataclasses are unhashable. `frozen=True` is the answer; `unsafe_hash=True` is a trap with a warning in its name.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; dataclasses and __hash__",
        "url": "https://docs.python.org/3/library/dataclasses.html#module-contents"
      }
    ]
  },
  {
    "id": "lru-cache-on-a-method-leaks",
    "num": 85,
    "title": "lru_cache On A Method Leaks",
    "subtitle": "the cache holds self forever",
    "difficulty": "advanced",
    "tags": [
      "functools",
      "caching",
      "memory",
      "gc"
    ],
    "question": "What does this print?",
    "code": "import functools, gc, weakref\n\nclass Cached:\n    @functools.lru_cache(maxsize=None)\n    def compute(self, n):\n        return n * n\n\nclass Plain:\n    def compute(self, n):\n        return n * n\n\ndef survives(cls, call):\n    obj = cls()\n    if call:\n        obj.compute(2)\n    ref = weakref.ref(obj)\n    del obj\n    gc.collect()\n    return ref() is not None\n\nprint(\"cached, never called:\", survives(Cached, False))\nprint(\"cached, called once :\", survives(Cached, True))\nprint(\"plain,  called once :\", survives(Plain, True))\n\nprint(Cached.compute.cache_info())",
    "output": "cached, never called: False\ncached, called once : True\nplain,  called once : False\nCacheInfo(hits=0, misses=1, maxsize=None, currsize=1)",
    "isError": false,
    "guesses": [
      "The cache is per-instance",
      "gc.collect() clears it"
    ],
    "explanation": [
      "The decorator is applied to the function in the class body, so there is one cache on the class, shared by every instance. Its keys include <code>self</code>, because <code>self</code> is just the first argument.",
      "A key is a strong reference. With <code>maxsize=None</code> nothing is ever evicted, so every instance the method is ever called on is pinned in memory for the lifetime of the process, with its entire object graph. The leak is invisible to <code>gc.collect()</code> &mdash; the object is genuinely reachable.",
      "Note the first line: an instance the method was never called on collects fine. The leak starts on first use, which is why it shows up in production and not in a unit test that constructs an object and checks a property.",
      "It also requires <code>self</code> to be hashable, so the decorator quietly imposes that on your class."
    ],
    "extraCode": "",
    "fixNote": "Cache per instance with <code>cached_property</code>, or keep the cache on a module-level function that takes only plain values:",
    "fixCode": "import functools\n\nclass Report:\n    def __init__(self, rows):\n        self._rows = rows\n\n    @functools.cached_property\n    def total(self):\n        print(\"computing once\")\n        return sum(self._rows)\n\nr = Report([1, 2, 3])\nprint(r.total, r.total)\n\n@functools.lru_cache(maxsize=128)\ndef square(n):\n    return n * n\n\nprint(square(4))",
    "takeaway": "`lru_cache` on a method is a class-level cache keyed on `self`. `maxsize=None` makes it a permanent leak.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; functools.lru_cache",
        "url": "https://docs.python.org/3/library/functools.html#functools.lru_cache"
      },
      {
        "label": "Python docs &mdash; functools.cached_property",
        "url": "https://docs.python.org/3/library/functools.html#functools.cached_property"
      }
    ]
  },
  {
    "id": "generator-return-value",
    "num": 86,
    "title": "A Generator's return Value",
    "subtitle": "hidden on the StopIteration",
    "difficulty": "advanced",
    "tags": [
      "generators",
      "yield-from",
      "exceptions"
    ],
    "question": "What does this print?",
    "code": "def counted():\n    yield \"a\"\n    yield \"b\"\n    return \"counted 2\"\n\ng = counted()\nprint(list(g))\n\ng2 = counted()\nnext(g2); next(g2)\ntry:\n    next(g2)\nexcept StopIteration as stop:\n    print(\"StopIteration.value:\", stop.value)\n\ndef delegating():\n    result = yield from counted()\n    print(\"yield from saw:\", result)\n    yield \"done\"\n\nprint(list(delegating()))",
    "output": "['a', 'b']\nStopIteration.value: counted 2\nyield from saw: counted 2\n['a', 'b', 'done']",
    "isError": false,
    "guesses": [
      "list(g) ends with 'counted 2'",
      "The return value is unreachable"
    ],
    "explanation": [
      "A <code>return</code> in a generator does not yield &mdash; it sets the <code>value</code> attribute on the <code>StopIteration</code> that ends the iteration. Every <code>for</code> loop and every <code>list()</code> catches that exception and discards it, so the value is invisible through normal iteration.",
      "The only ergonomic way to read it is <code>yield from</code>, whose expression value <em>is</em> the delegated generator's return value. That is the feature's real purpose: it turns generators into coroutines that can return results to their caller.",
      "Since PEP 479, a <code>StopIteration</code> raised inside a generator body is converted to <code>RuntimeError</code> rather than silently ending the generator, so this channel cannot be abused by accident."
    ],
    "extraCode": "",
    "fixNote": "Use <code>yield from</code> to collect it, or return the summary separately if the caller is a plain loop:",
    "fixCode": "def counted(items):\n    n = 0\n    for item in items:\n        n += 1\n        yield item\n    return n\n\ndef run(items):\n    total = yield from counted(items)\n    print(\"total was\", total)\n\nlist(run([\"a\", \"b\", \"c\"]))",
    "takeaway": "`return x` in a generator is only reachable via `yield from` or by catching `StopIteration` yourself.",
    "caveat": "",
    "refs": [
      {
        "label": "PEP 380 &mdash; syntax for delegating to a subgenerator",
        "url": "https://peps.python.org/pep-0380/"
      },
      {
        "label": "PEP 479 &mdash; change StopIteration handling inside generators",
        "url": "https://peps.python.org/pep-0479/"
      }
    ]
  },
  {
    "id": "yield-from-is-not-a-loop",
    "num": 87,
    "title": "yield from Is Not A Loop",
    "subtitle": "it forwards send, throw and close",
    "difficulty": "advanced",
    "tags": [
      "generators",
      "yield-from",
      "coroutines"
    ],
    "question": "What does this print?",
    "code": "def inner():\n    while True:\n        try:\n            got = yield \"ready\"\n            print(\"  inner received\", got)\n        except ValueError as exc:\n            print(\"  inner caught\", exc)\n\ndef with_yield_from():\n    yield from inner()\n\ndef with_a_loop():\n    for value in inner():\n        yield value\n\na = with_yield_from()\nprint(next(a))\na.send(\"hello\")\n\nb = with_a_loop()\nprint(next(b))\nprint(\"loop version send:\", b.send(\"hello\"))",
    "output": "ready\n  inner received hello\nready\n  inner received None\nloop version send: ready",
    "isError": false,
    "guesses": [
      "Both forward the sent value",
      "The loop version raises"
    ],
    "explanation": [
      "<code>yield from sub</code> establishes a transparent channel to the subgenerator. Values sent with <code>send()</code>, exceptions thrown with <code>throw()</code>, and <code>close()</code> all pass straight through to <code>sub</code>, and its return value becomes the expression's value.",
      "A <code>for</code> loop only pulls. It calls <code>next()</code> on the subgenerator, so anything the caller sends is delivered to the <em>outer</em> generator's own <code>yield</code> and never reaches the inner one &mdash; which is why the loop version's <code>send</code> is swallowed and only the outer generator resumes.",
      "For plain iteration the two are equivalent apart from speed. The moment the subgenerator is a coroutine that expects to receive anything, they are completely different."
    ],
    "extraCode": "",
    "fixNote": "Use <code>yield from</code> whenever you delegate to another generator. There is no case where the manual loop is better:",
    "fixCode": "def chain(*iterables):\n    for it in iterables:\n        yield from it\n\nprint(list(chain([1, 2], (3, 4), \"ab\")))",
    "takeaway": "`for x in sub: yield x` is a one-way pipe. `yield from sub` is a two-way connection.",
    "caveat": "",
    "refs": [
      {
        "label": "PEP 380 &mdash; syntax for delegating to a subgenerator",
        "url": "https://peps.python.org/pep-0380/"
      }
    ]
  },
  {
    "id": "with-open-inside-a-generator",
    "num": 88,
    "title": "with open(...) Inside A Generator",
    "subtitle": "the file closes when the generator does",
    "difficulty": "advanced",
    "tags": [
      "generators",
      "files",
      "resources",
      "context-managers"
    ],
    "question": "What does this print?",
    "code": "import pathlib\n\npathlib.Path(\"data.txt\").write_text(\"one\\ntwo\\nthree\\n\", encoding=\"utf-8\")\n\ndef rows(path):\n    with open(path, encoding=\"utf-8\") as fh:\n        for line in fh:\n            yield line.strip()\n\ng = rows(\"data.txt\")\nprint(next(g))\n\nhandle = g.gi_frame.f_locals[\"fh\"]\nprint(\"file still open:\", not handle.closed)\n\ng.close()\nprint(\"after close():\", handle.closed)\n\ng2 = rows(\"data.txt\")\nprint(list(g2))\nprint(\"after exhaustion:\", g2.gi_frame is None)",
    "output": "one\nfile still open: True\nafter close(): True\n['one', 'two', 'three']\nafter exhaustion: True",
    "isError": false,
    "guesses": [
      "The with block closes the file before next() returns",
      "The file leaks until the process exits"
    ],
    "explanation": [
      "A generator's <code>with</code> block spans suspensions. The body is paused at the <code>yield</code> with the frame, and the frame holds the open file, so the handle stays open between calls &mdash; which is exactly what makes the pattern work at all.",
      "It closes when the generator finishes: on exhaustion, on <code>close()</code>, or when the generator object is collected and CPython throws <code>GeneratorExit</code> into it. Abandon a half-consumed generator and the file stays open until that happens, which on CPython is usually immediate refcounting but is not guaranteed and is not immediate on PyPy.",
      "The consequence is that <code>rows()</code> gives you no way to guarantee cleanup from the outside unless the caller cooperates. Under Windows file locking, or against a connection pool, \"usually collected soon\" is not good enough."
    ],
    "extraCode": "",
    "fixNote": "Make the generator itself a context manager, or take an already-open file and let the caller own it:",
    "fixCode": "import contextlib, pathlib\n\npathlib.Path(\"data.txt\").write_text(\"one\\ntwo\\n\", encoding=\"utf-8\")\n\n@contextlib.contextmanager\ndef rows(path):\n    with open(path, encoding=\"utf-8\") as fh:\n        yield (line.strip() for line in fh)\n\nwith rows(\"data.txt\") as lines:\n    print(next(lines))\nprint(\"closed deterministically\")",
    "takeaway": "A `with` inside a generator is scoped to the generator's life, not to one `next()`. Abandon it and cleanup is deferred.",
    "caveat": "",
    "refs": [
      {
        "label": "PEP 533 &mdash; deterministic cleanup for iterators",
        "url": "https://peps.python.org/pep-0533/"
      },
      {
        "label": "Python docs &mdash; generator.close",
        "url": "https://docs.python.org/3/reference/expressions.html#generator.close"
      }
    ]
  },
  {
    "id": "exception-in-exit-masks-the-original",
    "num": 89,
    "title": "An Exception In __exit__ Masks The Original",
    "subtitle": "the cleanup error you see instead of the real one",
    "difficulty": "advanced",
    "tags": [
      "context-managers",
      "exceptions",
      "chaining"
    ],
    "question": "What does this print?",
    "code": "class Noisy:\n    def __enter__(self): return self\n    def __exit__(self, *exc_info):\n        raise RuntimeError(\"cleanup failed\")\n\ntry:\n    with Noisy():\n        raise ValueError(\"the actual bug\")\nexcept RuntimeError as exc:\n    print(\"surfaced:\", repr(exc))\n    print(\"context :\", repr(exc.__context__))\n\nclass Swallow:\n    def __enter__(self): return self\n    def __exit__(self, *exc_info):\n        return True\n\nwith Swallow():\n    raise ValueError(\"never seen again\")\nprint(\"execution continued\")",
    "output": "surfaced: RuntimeError('cleanup failed')\ncontext : ValueError('the actual bug')\nexecution continued",
    "isError": false,
    "guesses": [
      "The ValueError wins",
      "Both exceptions are raised"
    ],
    "explanation": [
      "If <code>__exit__</code> raises, its exception replaces whatever was propagating. The original is not lost &mdash; it is attached as <code>__context__</code> and printed under \"During handling of the above exception, another exception occurred\" &mdash; but the exception that reaches your <code>except</code> clause, your logging, and your monitoring is the cleanup error.",
      "So a flaky <code>close()</code> in a context manager turns every failure in the block into the same misleading error, and the real cause is one attribute deeper than anyone looks.",
      "The second class is the other half of the protocol: returning a truthy value from <code>__exit__</code> <em>suppresses</em> the exception entirely. Returning <code>None</code> is what you almost always want, and it is easy to write a <code>return</code> that accidentally is not."
    ],
    "extraCode": "",
    "fixNote": "Never let cleanup raise. Catch, log, and chain explicitly if you must re-raise:",
    "fixCode": "import contextlib\n\nclass Careful:\n    def __enter__(self): return self\n    def __exit__(self, exc_type, exc, tb):\n        try:\n            raise RuntimeError(\"cleanup failed\")\n        except RuntimeError as cleanup_error:\n            print(\"logged, not raised:\", cleanup_error)\n        return False\n\nwith contextlib.suppress(ValueError):\n    with Careful():\n        raise ValueError(\"the actual bug\")\nprint(\"original still propagated to suppress()\")",
    "takeaway": "`__exit__` raising replaces the real error; `__exit__` returning truthy deletes it. Both are easy to do by accident.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; with statement context managers",
        "url": "https://docs.python.org/3/reference/datamodel.html#with-statement-context-managers"
      }
    ]
  },
  {
    "id": "forgetting-await",
    "num": 90,
    "title": "Forgetting await",
    "subtitle": "a truthy object and a warning at exit",
    "difficulty": "advanced",
    "tags": [
      "asyncio",
      "coroutines",
      "warnings"
    ],
    "question": "What does this print?",
    "code": "import asyncio, gc, warnings\n\nasync def fetch():\n    return {\"rows\": 3}\n\nasync def main():\n    result = fetch()\n    print(\"type:\", type(result).__name__)\n    print(\"truthy:\", bool(result))\n    print(\"awaited:\", await fetch())\n    await result\n\nasyncio.run(main())\n\nwith warnings.catch_warnings(record=True) as caught:\n    warnings.simplefilter(\"always\")\n    fetch()\n    gc.collect()\n    print(\"warning:\", caught[0].message)",
    "output": "type: coroutine\ntruthy: True\nawaited: {'rows': 3}\nwarning: coroutine 'fetch' was never awaited",
    "isError": false,
    "guesses": [
      "fetch() returns the dict",
      "Forgetting await raises immediately"
    ],
    "explanation": [
      "Calling an <code>async def</code> function does not run it. It builds a coroutine object, exactly as calling a generator function builds a generator. Nothing executes until something awaits it or schedules it on a loop.",
      "The coroutine object is truthy and has no useful <code>__eq__</code>, so <code>if fetch():</code> is always true and <code>result[\"rows\"]</code> fails with an unhelpful <code>TypeError</code> somewhere else. The only signal you get is a <code>RuntimeWarning: coroutine 'fetch' was never awaited</code>, emitted when the object is collected &mdash; long after the mistake, and suppressed entirely under some test runners.",
      "The same applies to forgetting <code>await</code> on <code>asyncio.sleep</code>, on a lock's <code>acquire</code>, or on anything that returns an awaitable."
    ],
    "extraCode": "",
    "fixNote": "Turn the warning into an error while developing, and let a type checker catch the rest:",
    "fixCode": "import asyncio, warnings\n\nasync def fetch():\n    return {\"rows\": 3}\n\nasync def main():\n    warnings.simplefilter(\"error\", RuntimeWarning)\n    print(await fetch())\n\nasyncio.run(main(), debug=True)",
    "takeaway": "An un-awaited coroutine is a silent no-op that passes every truthiness check.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; coroutines",
        "url": "https://docs.python.org/3/library/asyncio-task.html#coroutines"
      },
      {
        "label": "Python docs &mdash; asyncio debug mode",
        "url": "https://docs.python.org/3/library/asyncio-dev.html#debug-mode"
      }
    ]
  },
  {
    "id": "coroutines-cannot-be-reused",
    "num": 91,
    "title": "A Coroutine Can Only Be Awaited Once",
    "subtitle": "unlike the function that made it",
    "difficulty": "advanced",
    "tags": [
      "asyncio",
      "coroutines",
      "reuse"
    ],
    "question": "What does this print?",
    "code": "import asyncio\n\nasync def work():\n    return \"done\"\n\nasync def main():\n    coro = work()\n    print(await coro)\n    try:\n        print(await coro)\n    except RuntimeError as exc:\n        print(\"RuntimeError:\", exc)\n\n    again = work()\n    print(\"a fresh one:\", await again)\n\n    shared = work()\n    try:\n        await asyncio.gather(shared, shared)\n    except RuntimeError as exc:\n        print(\"gather:\", exc)\n\nasyncio.run(main())",
    "output": "done\nRuntimeError: cannot reuse already awaited coroutine\na fresh one: done",
    "isError": false,
    "guesses": [
      "Awaiting twice returns the cached result",
      "gather handles the duplicate fine"
    ],
    "explanation": [
      "A coroutine object holds a frame and a position in it, just like a generator. Awaiting runs it to completion and leaves it exhausted; there is no result cached on the object and no way to rewind.",
      "This catches people who store a coroutine as a retry target, pass the same one to <code>gather</code> twice, or build a list of coroutines and then iterate it more than once. The error is clear when it fires, but it fires at await time, far from where the object was created.",
      "The distinction to hold onto: an <code>async def</code> <em>function</em> is reusable, a coroutine <em>object</em> is not. A <code>Task</code> is different again &mdash; it wraps a coroutine, runs it once, and can be awaited any number of times, returning the same result."
    ],
    "extraCode": "",
    "fixNote": "Call the function again for each use, or wrap it in a task if several places need the one result:",
    "fixCode": "import asyncio\n\nasync def work():\n    return \"done\"\n\nasync def main():\n    print(await asyncio.gather(work(), work()))\n\n    task = asyncio.create_task(work())\n    print(await task, await task)\n\nasyncio.run(main())",
    "takeaway": "Coroutines are single-use. Tasks are the reusable handle on a single execution.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; awaitables",
        "url": "https://docs.python.org/3/library/asyncio-task.html#awaitables"
      }
    ]
  },
  {
    "id": "gather-versus-taskgroup",
    "num": 92,
    "title": "gather vs TaskGroup",
    "subtitle": "what happens to the siblings when one fails",
    "difficulty": "advanced",
    "tags": [
      "asyncio",
      "cancellation",
      "taskgroup",
      "error-handling"
    ],
    "question": "What does this print?",
    "code": "import asyncio\n\nfinished = []\n\nasync def boom():\n    await asyncio.sleep(0.01)\n    raise ValueError(\"boom\")\n\nasync def slow(name):\n    try:\n        await asyncio.sleep(0.2)\n        finished.append(name)\n    except asyncio.CancelledError:\n        finished.append(f\"{name}-cancelled\")\n        raise\n\nasync def main():\n    finished.clear()\n    try:\n        await asyncio.gather(boom(), slow(\"gather\"))\n    except ValueError as exc:\n        print(\"gather raised:\", exc)\n    await asyncio.sleep(0.3)\n    print(\"after gather:\", finished)\n\n    finished.clear()\n    try:\n        async with asyncio.TaskGroup() as tg:\n            tg.create_task(boom())\n            tg.create_task(slow(\"taskgroup\"))\n    except* ValueError as eg:\n        print(\"taskgroup raised:\", [str(e) for e in eg.exceptions])\n    print(\"after taskgroup:\", finished)\n\nasyncio.run(main())",
    "output": "gather raised: boom\nafter gather: ['gather']\ntaskgroup raised: ['boom']\nafter taskgroup: ['taskgroup-cancelled']",
    "isError": false,
    "guesses": [
      "Both cancel the sibling",
      "Neither cancels the sibling"
    ],
    "explanation": [
      "<code>gather</code> reports the first exception to its caller but does <em>not</em> cancel the other awaitables. They keep running, unsupervised, and their results and failures are discarded. If the caller then returns, you have orphaned work still touching your database.",
      "<code>TaskGroup</code> (3.11+) is structured concurrency: on any failure it cancels every sibling, waits for them to finish unwinding, and only then leaves the <code>async with</code> block. Nothing escapes the scope. Because several tasks can fail at once it always raises an <code>ExceptionGroup</code>, which is why you need <code>except*</code>.",
      "The <code>finished</code> list shows the difference plainly: under <code>gather</code> the sibling runs to completion after the error; under <code>TaskGroup</code> it records its own cancellation."
    ],
    "extraCode": "",
    "fixNote": "Use <code>TaskGroup</code> for anything where the tasks belong together, and <code>return_exceptions=True</code> when you genuinely want all results:",
    "fixCode": "import asyncio\n\nasync def ok(n):\n    return n\n\nasync def main():\n    async with asyncio.TaskGroup() as tg:\n        tasks = [tg.create_task(ok(n)) for n in range(3)]\n    print([t.result() for t in tasks])\n\n    print(await asyncio.gather(ok(1), ok(2), return_exceptions=True))\n\nasyncio.run(main())",
    "takeaway": "`gather` leaves failed siblings running. `TaskGroup` cancels them and waits. Prefer `TaskGroup`.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; asyncio.TaskGroup",
        "url": "https://docs.python.org/3/library/asyncio-task.html#task-groups"
      },
      {
        "label": "PEP 654 &mdash; exception groups and except*",
        "url": "https://peps.python.org/pep-0654/"
      }
    ]
  },
  {
    "id": "blocking-call-in-the-event-loop",
    "num": 93,
    "title": "A Blocking Call In The Event Loop",
    "subtitle": "one time.sleep stalls everything",
    "difficulty": "advanced",
    "tags": [
      "asyncio",
      "concurrency",
      "blocking"
    ],
    "question": "What does this print?",
    "code": "import asyncio, time\n\nlog = []\n\nasync def polite(name):\n    for _ in range(3):\n        log.append(name)\n        await asyncio.sleep(0.01)\n\nasync def rude(name):\n    for _ in range(3):\n        log.append(name)\n        time.sleep(0.01)\n\nasync def main():\n    log.clear()\n    await asyncio.gather(polite(\"a\"), polite(\"b\"))\n    print(\"both polite :\", log)\n\n    log.clear()\n    await asyncio.gather(rude(\"rude\"), polite(\"polite\"))\n    print(\"one blocking:\", log)\n\nasyncio.run(main())",
    "output": "both polite : ['a', 'b', 'a', 'b', 'a', 'b']\none blocking: ['rude', 'rude', 'rude', 'polite', 'polite', 'polite']",
    "isError": false,
    "guesses": [
      "The blocking version interleaves too",
      "asyncio raises on the blocking call"
    ],
    "explanation": [
      "An event loop is one thread running one callback at a time. <code>await</code> is the only point at which control returns to it, so a coroutine that calls a synchronous blocking function holds the entire loop for the duration &mdash; every other task, every timer and every socket read is frozen.",
      "The interleaving in the first line is what concurrency looks like. The second shows the blocking task running to completion before the polite one gets a single turn.",
      "Nothing raises, so this is invisible until latency shows up under load. The usual culprits are <code>time.sleep</code>, <code>requests</code>, a synchronous database driver, a large <code>json.loads</code>, <code>hashlib</code> on a big buffer, and ordinary file I/O &mdash; <code>open()</code> has no async form."
    ],
    "extraCode": "",
    "fixNote": "Push blocking work to a thread with <code>asyncio.to_thread</code>, or use an async-native library:",
    "fixCode": "import asyncio, time\n\nlog = []\n\nasync def offloaded(name):\n    for _ in range(3):\n        log.append(name)\n        await asyncio.to_thread(time.sleep, 0.01)\n\nasync def polite(name):\n    for _ in range(3):\n        log.append(name)\n        await asyncio.sleep(0.01)\n\nasync def main():\n    await asyncio.gather(offloaded(\"thread\"), polite(\"loop\"))\n    print(log)\n\nasyncio.run(main())",
    "takeaway": "If a line inside a coroutine has no `await`, it is blocking the whole loop while it runs.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; asyncio.to_thread",
        "url": "https://docs.python.org/3/library/asyncio-task.html#asyncio.to_thread"
      },
      {
        "label": "Python docs &mdash; running blocking code",
        "url": "https://docs.python.org/3/library/asyncio-dev.html#running-blocking-code"
      }
    ]
  },
  {
    "id": "threading-local-is-wrong-in-async",
    "num": 94,
    "title": "threading.local Is Wrong In async",
    "subtitle": "every task shares one thread",
    "difficulty": "advanced",
    "tags": [
      "asyncio",
      "contextvars",
      "threading",
      "state"
    ],
    "question": "What does this print?",
    "code": "import asyncio, threading, contextvars\n\ntl = threading.local()\ncv = contextvars.ContextVar(\"request_id\")\n\nasync def handler(name):\n    tl.request_id = name\n    cv.set(name)\n    await asyncio.sleep(0.01)\n    print(f\"{name}: threading.local={tl.request_id} contextvar={cv.get()}\")\n\nasync def main():\n    await asyncio.gather(handler(\"req-1\"), handler(\"req-2\"))\n\nasyncio.run(main())",
    "output": "req-1: threading.local=req-2 contextvar=req-1\nreq-2: threading.local=req-2 contextvar=req-2",
    "isError": false,
    "guesses": [
      "Both report their own id from threading.local",
      "contextvars leak between tasks the same way"
    ],
    "explanation": [
      "<code>threading.local</code> isolates state per OS thread. An event loop runs every task on the <em>same</em> thread, so all of them share one <code>threading.local</code> namespace. Each task overwrites the previous one's value, and after the first <code>await</code> you read whichever task ran most recently.",
      "This is the classic way request-scoped state &mdash; a request id, a user, a tenant, a database session &mdash; gets attributed to the wrong request in an async service. It is also why porting a threaded web app to async breaks logging correlation in a way that only shows up under concurrency.",
      "<code>contextvars</code> is the async-aware equivalent. Each task starts with a copy of the current context, so a <code>set()</code> inside a task is invisible to its siblings, and it still works correctly across threads."
    ],
    "extraCode": "",
    "fixNote": "Use <code>ContextVar</code> for anything request-scoped, and reset it with the token if you need to restore:",
    "fixCode": "import asyncio, contextvars\n\nrequest_id = contextvars.ContextVar(\"request_id\", default=\"-\")\n\nasync def handler(name):\n    token = request_id.set(name)\n    try:\n        await asyncio.sleep(0.01)\n        print(\"handling\", request_id.get())\n    finally:\n        request_id.reset(token)\n\nasync def main():\n    await asyncio.gather(handler(\"req-1\"), handler(\"req-2\"))\n    print(\"outside:\", request_id.get())\n\nasyncio.run(main())",
    "takeaway": "Tasks are not threads. `threading.local` gives every task the same storage.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; contextvars",
        "url": "https://docs.python.org/3/library/contextvars.html"
      },
      {
        "label": "PEP 567 &mdash; context variables",
        "url": "https://peps.python.org/pep-0567/"
      }
    ]
  },
  {
    "id": "from-import-binds-a-copy",
    "num": 95,
    "title": "from module import name Binds A Copy",
    "subtitle": "rebinding the original does not reach you",
    "difficulty": "advanced",
    "tags": [
      "imports",
      "modules",
      "namespaces"
    ],
    "question": "What does this print?",
    "code": "import pathlib, subprocess, sys\n\npathlib.Path(\"settings.py\").write_text(\n    \"DEBUG = False\\n\"\n    \"def enable():\\n\"\n    \"    global DEBUG\\n\"\n    \"    DEBUG = True\\n\",\n    encoding=\"utf-8\")\n\nprogram = \"\"\"\nimport settings\nfrom settings import DEBUG, enable\n\nenable()\nprint(\"from-import name :\", DEBUG)\nprint(\"attribute lookup :\", settings.DEBUG)\n\"\"\"\npathlib.Path(\"app.py\").write_text(program, encoding=\"utf-8\")\nprint(subprocess.run([sys.executable, \"app.py\"], capture_output=True,\n                     text=True).stdout.strip())",
    "output": "from-import name : False\nattribute lookup : True",
    "isError": false,
    "guesses": [
      "Both print True",
      "Both print False"
    ],
    "explanation": [
      "<code>from m import x</code> imports the module, reads <code>m.x</code> once, and binds the <em>value</em> into your namespace. It does not create a link. When <code>m</code> later rebinds its own global, your name still points at the object it found at import time.",
      "Attribute access through the module goes to the module's namespace every time, so it sees the new value. The two lines disagree permanently.",
      "This is why flags, settings, patched objects and lazily-initialised singletons should be reached through the module. It is also why <code>unittest.mock.patch(\"m.thing\")</code> fails to take effect in a module that did <code>from m import thing</code> &mdash; you have to patch the name where it was imported <em>to</em>.",
      "Mutating a shared object works fine either way; only rebinding breaks."
    ],
    "extraCode": "",
    "fixNote": "Import the module and reach through it for anything that can change:",
    "fixCode": "import pathlib, subprocess, sys\n\npathlib.Path(\"settings.py\").write_text(\n    \"DEBUG = False\\n\"\n    \"def enable():\\n\"\n    \"    global DEBUG\\n\"\n    \"    DEBUG = True\\n\",\n    encoding=\"utf-8\")\n\npathlib.Path(\"app.py\").write_text(\n    \"import settings\\n\"\n    \"settings.enable()\\n\"\n    \"print('current:', settings.DEBUG)\\n\",\n    encoding=\"utf-8\")\n\nprint(subprocess.run([sys.executable, \"app.py\"], capture_output=True,\n                     text=True).stdout.strip())",
    "takeaway": "`from m import x` is a snapshot. Mutation propagates; rebinding does not.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; the import statement",
        "url": "https://docs.python.org/3/reference/simple_stmts.html#the-import-statement"
      }
    ]
  },
  {
    "id": "circular-imports-give-a-half-built-module",
    "num": 96,
    "title": "Circular Imports Give A Half-Built Module",
    "subtitle": "the name exists a line too late",
    "difficulty": "advanced",
    "tags": [
      "imports",
      "modules",
      "initialisation"
    ],
    "question": "What does this print?",
    "code": "import pathlib, subprocess, sys\n\npathlib.Path(\"alpha.py\").write_text(\n    \"print('alpha: starting')\\n\"\n    \"import beta\\n\"\n    \"ALPHA = 'alpha-value'\\n\"\n    \"print('alpha: done')\\n\", encoding=\"utf-8\")\n\npathlib.Path(\"beta.py\").write_text(\n    \"print('beta: starting')\\n\"\n    \"from alpha import ALPHA\\n\"\n    \"print('beta: got', ALPHA)\\n\", encoding=\"utf-8\")\n\npathlib.Path(\"main.py\").write_text(\"import alpha\\n\", encoding=\"utf-8\")\n\ndone = subprocess.run([sys.executable, \"main.py\"], capture_output=True, text=True)\nprint(done.stdout.strip())\nprint(done.stderr.strip().splitlines()[-1])",
    "output": "alpha: starting\nbeta: starting\nalpha: starting\nbeta: starting\nImportError: cannot import name 'ALPHA' from 'alpha' (consider renaming './alpha.py' if it has the same name as a library you intended to import)",
    "isError": false,
    "guesses": [
      "An infinite import loop",
      "beta simply gets alpha-value"
    ],
    "explanation": [
      "Importing a module runs its body top to bottom and registers it in <code>sys.modules</code> <em>before</em> the body finishes. That registration is what stops the recursion &mdash; when <code>beta</code> imports <code>alpha</code>, the partially built module is already there and is handed back immediately.",
      "Partially built is the problem. <code>alpha</code> was only three lines in when it handed control to <code>beta</code>, so <code>ALPHA</code> does not exist yet. The <code>from alpha import ALPHA</code> fails on a module that is perfectly healthy and will define that name two lines later.",
      "Note which form fails: <code>from alpha import ALPHA</code> needs the attribute <em>now</em>. A plain <code>import alpha</code> succeeds, because the lookup is deferred to first use &mdash; which is the standard workaround, along with moving the import inside the function that needs it.",
      "One oddity in the output: <code>alpha: starting</code> and <code>beta: starting</code> each appear <em>twice</em>. CPython 3.14 builds the \"consider renaming\" hint by re-importing the module in a fresh context to check whether it shadows a standard-library name &mdash; so your module body runs a second time, side effects and all, purely to produce a better error message. (stdout and stderr are shown here concatenated, so the duplicates appear above the traceback rather than after it.)",
      "The entry point matters too. Running <code>alpha.py</code> directly would <em>not</em> reproduce this: alpha would be <code>__main__</code>, so beta's import of <code>alpha</code> would build a second, complete copy and succeed. That is the next entry's problem wearing a disguise, and it is why the cycle here is triggered from a separate <code>main.py</code>."
    ],
    "extraCode": "",
    "fixNote": "Use a plain <code>import</code> and defer the attribute access, or move the import into the function:",
    "fixCode": "import pathlib, subprocess, sys\n\npathlib.Path(\"alpha.py\").write_text(\n    \"import beta\\n\"\n    \"ALPHA = 'alpha-value'\\n\"\n    \"print(beta.read())\\n\", encoding=\"utf-8\")\n\npathlib.Path(\"beta.py\").write_text(\n    \"import alpha\\n\"\n    \"def read():\\n\"\n    \"    return 'beta got ' + alpha.ALPHA\\n\", encoding=\"utf-8\")\n\nprint(subprocess.run([sys.executable, \"alpha.py\"],\n                     capture_output=True, text=True).stdout.strip())",
    "takeaway": "A cycle is survivable with `import m`; it is fatal with `from m import name`, because the name may not exist yet.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; the import system",
        "url": "https://docs.python.org/3/reference/import.html#the-module-cache"
      }
    ]
  },
  {
    "id": "python-m-imports-twice",
    "num": 97,
    "title": "python -m pkg.mod Imports It Twice",
    "subtitle": "two copies of every global",
    "difficulty": "advanced",
    "tags": [
      "imports",
      "modules",
      "main",
      "state"
    ],
    "question": "What does this print?",
    "code": "import pathlib, subprocess, sys\n\npathlib.Path(\"pkg\").mkdir(exist_ok=True)\npathlib.Path(\"pkg/__init__.py\").write_text(\"\", encoding=\"utf-8\")\npathlib.Path(\"pkg/mod.py\").write_text(\n    \"import sys\\n\"\n    \"print('body runs as', __name__)\\n\"\n    \"REGISTRY = []\\n\"\n    \"def register(x):\\n\"\n    \"    REGISTRY.append(x)\\n\"\n    \"\\n\"\n    \"if __name__ == '__main__':\\n\"\n    \"    import pkg.mod\\n\"\n    \"    pkg.mod.register('added via pkg.mod')\\n\"\n    \"    print('__main__ REGISTRY :', REGISTRY)\\n\"\n    \"    print('pkg.mod REGISTRY  :', pkg.mod.REGISTRY)\\n\"\n    \"    print('same module object:', sys.modules['__main__'] is sys.modules['pkg.mod'])\\n\",\n    encoding=\"utf-8\")\n\nprint(subprocess.run([sys.executable, \"-m\", \"pkg.mod\"],\n                     capture_output=True, text=True).stdout.strip())",
    "output": "body runs as __main__\nbody runs as pkg.mod\n__main__ REGISTRY : []\npkg.mod REGISTRY  : ['added via pkg.mod']\nsame module object: False",
    "isError": false,
    "guesses": [
      "The body runs once",
      "Both registries show the added item"
    ],
    "explanation": [
      "<code>python -m pkg.mod</code> executes the file under the name <code>__main__</code>. If anything then imports <code>pkg.mod</code> &mdash; directly, or through any other module in the package &mdash; the import machinery finds no <code>pkg.mod</code> in <code>sys.modules</code> and runs the file again, producing a second, independent module object.",
      "Every module-level object exists twice. Two registries, two caches, two singletons, two sets of class objects &mdash; so <code>isinstance</code> against the other copy's class fails, and state written to one is invisible to the other.",
      "The body printing twice under two different <code>__name__</code> values is the tell. Any import-time side effect &mdash; connecting, registering, spawning a thread &mdash; also happens twice."
    ],
    "extraCode": "",
    "fixNote": "Keep the entry point separate from the library module, so the thing that runs as <code>__main__</code> holds no state:",
    "fixCode": "import pathlib, subprocess, sys\n\npathlib.Path(\"pkg2\").mkdir(exist_ok=True)\npathlib.Path(\"pkg2/__init__.py\").write_text(\"\", encoding=\"utf-8\")\npathlib.Path(\"pkg2/core.py\").write_text(\n    \"REGISTRY = []\\n\"\n    \"def register(x):\\n\"\n    \"    REGISTRY.append(x)\\n\", encoding=\"utf-8\")\npathlib.Path(\"pkg2/__main__.py\").write_text(\n    \"from pkg2 import core\\n\"\n    \"core.register('once')\\n\"\n    \"print('registry:', core.REGISTRY)\\n\", encoding=\"utf-8\")\n\nprint(subprocess.run([sys.executable, \"-m\", \"pkg2\"],\n                     capture_output=True, text=True).stdout.strip())",
    "takeaway": "A module run as `__main__` and imported by name is two modules. Put the entry point in `__main__.py`.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; __main__",
        "url": "https://docs.python.org/3/library/__main__.html"
      }
    ]
  },
  {
    "id": "mutating-locals-does-nothing",
    "num": 98,
    "title": "Mutating locals() Does Nothing",
    "subtitle": "inside a function it is a snapshot",
    "difficulty": "advanced",
    "tags": [
      "scope",
      "locals",
      "exec",
      "compiler"
    ],
    "question": "What does this print?",
    "code": "def in_function():\n    x = 1\n    locals()[\"x\"] = 99\n    exec(\"x = 77\")\n    return x\n\nprint(\"function:\", in_function())\n\ny = 1\nlocals()[\"y\"] = 99\nprint(\"module  :\", y)\n\ndef with_explicit_namespace():\n    scope = {\"x\": 1}\n    exec(\"x = 77\", {}, scope)\n    return scope[\"x\"]\n\nprint(\"explicit:\", with_explicit_namespace())",
    "output": "function: 1\nmodule  : 99\nexplicit: 77",
    "isError": false,
    "guesses": [
      "99 inside the function",
      "exec at least works"
    ],
    "explanation": [
      "Function locals live in a fixed array on the frame, decided at compile time, and are read with <code>LOAD_FAST</code> by index. <code>locals()</code> builds a dict <em>describing</em> that array; writing to the dict writes to the description, not the array.",
      "<code>exec(\"x = 77\")</code> with no explicit namespace uses that same dict, so it has the same non-effect. This is the single most common reason people conclude that <code>exec</code> is broken.",
      "At module level <code>locals()</code> <em>is</em> <code>globals()</code> &mdash; the real namespace dict &mdash; so the write takes effect, which makes the behaviour look inconsistent until you know why.",
      "PEP 667 in Python 3.13 made this explicit: <code>locals()</code> in a function now documentedly returns an independent snapshot, rather than a CPython-specific \"sometimes works\" dict."
    ],
    "extraCode": "",
    "fixNote": "Pass an explicit namespace to <code>exec</code> and read the result back out of it:",
    "fixCode": "def compute(source, **inputs):\n    scope = dict(inputs)\n    exec(source, {\"__builtins__\": {}}, scope)\n    return scope\n\nprint(compute(\"total = a + b\", a=2, b=3)[\"total\"])",
    "takeaway": "Function locals cannot be written through `locals()` or a bare `exec`. Use a real dict you own.",
    "caveat": "",
    "refs": [
      {
        "label": "PEP 667 &mdash; consistent views of namespaces",
        "url": "https://peps.python.org/pep-0667/"
      },
      {
        "label": "Python docs &mdash; locals",
        "url": "https://docs.python.org/3/library/functions.html#locals"
      }
    ]
  },
  {
    "id": "del-is-not-a-destructor",
    "num": 99,
    "title": "__del__ Is Not A Destructor",
    "subtitle": "it runs eventually, and its errors vanish",
    "difficulty": "advanced",
    "tags": [
      "gc",
      "dunder",
      "resources",
      "exceptions"
    ],
    "question": "What does this print?",
    "code": "import gc\n\nclass Resource:\n    def __init__(self, name):\n        self.name = name\n    def __del__(self):\n        print(\"closing\", self.name)\n\nr = Resource(\"plain\")\ndel r\n\ncyclic = Resource(\"cyclic\")\ncyclic.self = cyclic\ndel cyclic\nprint(\"before collect\")\ngc.collect()\n\nclass Noisy:\n    def __del__(self):\n        raise RuntimeError(\"cleanup blew up\")\n\nn = Noisy()\ndel n\ngc.collect()\nprint(\"still running - the exception was swallowed\")",
    "output": "closing plain\nbefore collect\nclosing cyclic\nstill running - the exception was swallowed\nException ignored while calling deallocator <function Noisy.__del__ at 0x...>:\nTraceback (most recent call last):\n  File \"del_is_not_a_destructor.py\", line 20, in __del__\n    raise RuntimeError(\"cleanup blew up\")\nRuntimeError: cleanup blew up",
    "isError": false,
    "guesses": [
      "The cyclic one is never collected",
      "The RuntimeError propagates"
    ],
    "explanation": [
      "<code>__del__</code> runs when the last reference goes away, which on CPython is usually immediately but is a refcounting implementation detail. On PyPy or any tracing collector it happens later, or not before exit.",
      "Reference cycles used to be fatal: before PEP 442 (Python 3.4) an object with <code>__del__</code> in a cycle was never collected at all and went into <code>gc.garbage</code>. That is fixed &mdash; the cyclic object above is collected &mdash; but the <em>order</em> in which a cycle's finalisers run is still unspecified, so one object's <code>__del__</code> may find another already torn down.",
      "The part that has not improved: an exception inside <code>__del__</code> cannot propagate, because there is no call site to propagate to. It is printed to stderr as \"Exception ignored in\" and execution continues. Cleanup that fails, fails silently.",
      "At interpreter shutdown module globals may already be <code>None</code>, so a <code>__del__</code> that calls anything imported can fail in ways that only happen on exit."
    ],
    "extraCode": "",
    "fixNote": "Use a context manager for deterministic cleanup, and keep <code>__del__</code> as a last-resort backstop if at all:",
    "fixCode": "import contextlib\n\nclass Resource:\n    def __init__(self, name):\n        self.name = name\n    def close(self):\n        print(\"closing\", self.name)\n    def __enter__(self):\n        return self\n    def __exit__(self, *exc):\n        self.close()\n        return False\n\nwith Resource(\"deterministic\") as r:\n    print(\"using\", r.name)\n\nwith contextlib.closing(Resource(\"closing helper\")) as r2:\n    print(\"using\", r2.name)",
    "takeaway": "`__del__` gives you no guarantee about when it runs, in what order, or whether its failures are reported.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; object.__del__",
        "url": "https://docs.python.org/3/reference/datamodel.html#object.__del__"
      },
      {
        "label": "PEP 442 &mdash; safe object finalization",
        "url": "https://peps.python.org/pep-0442/"
      }
    ]
  },
  {
    "id": "enum-members-with-equal-values-alias",
    "num": 100,
    "title": "Enum Members With Equal Values Are Aliases",
    "subtitle": "two names, one member",
    "difficulty": "advanced",
    "tags": [
      "enum",
      "classes",
      "aliasing"
    ],
    "question": "What does this print?",
    "code": "from enum import Enum, unique, auto\n\nclass Colour(Enum):\n    RED = 1\n    CRIMSON = 1\n    BLUE = 2\n\nprint(list(Colour))\nprint(Colour.CRIMSON is Colour.RED, Colour.CRIMSON.name)\nprint(Colour(1), len(Colour), len(Colour.__members__))\n\ntry:\n    @unique\n    class Strict(Enum):\n        RED = 1\n        CRIMSON = 1\nexcept ValueError as exc:\n    print(\"ValueError:\", exc)\n\nclass Auto(Enum):\n    A = auto()\n    B = auto()\n\nprint(list(Auto))",
    "output": "[<Colour.RED: 1>, <Colour.BLUE: 2>]\nTrue RED\nColour.RED 2 3\nValueError: duplicate values found in <enum 'Strict'>: CRIMSON -> RED\n[<Auto.A: 1>, <Auto.B: 2>]",
    "isError": false,
    "guesses": [
      "Colour has three members",
      "CRIMSON keeps its own name"
    ],
    "explanation": [
      "An <code>Enum</code> member is uniquely identified by its <em>value</em>. A second name with an existing value does not create a member &mdash; it creates an alias, an extra entry in <code>__members__</code> pointing at the first member.",
      "So <code>Colour.CRIMSON</code> is literally <code>Colour.RED</code>: same object, and <code>.name</code> reports <code>RED</code>. Iteration yields two members, <code>len()</code> is 2, but <code>__members__</code> has three keys, and serialising by name silently rewrites <code>CRIMSON</code> to <code>RED</code>.",
      "Aliases are a deliberate feature for deprecated spellings. They are a bug when two members were meant to be distinct and someone copy-pasted a value &mdash; which is why <code>auto()</code> exists and why <code>@unique</code> exists."
    ],
    "extraCode": "",
    "fixNote": "Apply <code>@unique</code> to any enum where duplicate values would be a mistake, and use <code>auto()</code> when the numbers do not matter:",
    "fixCode": "from enum import Enum, unique, auto\n\n@unique\nclass Colour(Enum):\n    RED = auto()\n    CRIMSON = auto()\n    BLUE = auto()\n\nprint(list(Colour), Colour.RED is Colour.CRIMSON)",
    "takeaway": "Duplicate enum values silently collapse into one member. `@unique` turns that into an error.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; enum, allowed members and attributes",
        "url": "https://docs.python.org/3/howto/enum.html#duplicating-enum-members-and-values"
      }
    ]
  },
  {
    "id": "future-annotations-are-strings",
    "num": 101,
    "title": "from __future__ import annotations",
    "subtitle": "every annotation becomes text",
    "difficulty": "advanced",
    "tags": [
      "annotations",
      "typing",
      "introspection",
      "versions"
    ],
    "question": "What does this print?",
    "code": "import pathlib, subprocess, sys\n\nbody = \"\"\"\nimport typing\n\nclass Config:\n    retries: int\n    tags: list[str]\n\nprint(\"annotations:\", Config.__annotations__)\nprint(\"resolved   :\", typing.get_type_hints(Config))\n\ndef check(obj, name):\n    expected = Config.__annotations__[name]\n    return isinstance(getattr(obj, name), expected)\n\nc = Config()\nc.retries = 3\ntry:\n    print(\"isinstance check:\", check(c, \"retries\"))\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\"\"\"\n\nfor header in (\"\", \"from __future__ import annotations\\n\"):\n    label = \"with future \" if header else \"without     \"\n    pathlib.Path(\"m.py\").write_text(header + body, encoding=\"utf-8\")\n    out = subprocess.run([sys.executable, \"m.py\"], capture_output=True, text=True)\n    for line in (out.stdout + out.stderr).strip().splitlines():\n        print(label + \"|\", line)",
    "output": "without     | annotations: {'retries': <class 'int'>, 'tags': list[str]}\nwithout     | resolved   : {'retries': <class 'int'>, 'tags': list[str]}\nwithout     | isinstance check: True\nwith future | annotations: {'retries': 'int', 'tags': 'list[str]'}\nwith future | resolved   : {'retries': <class 'int'>, 'tags': list[str]}\nwith future | TypeError: isinstance() arg 2 must be a type, a tuple of types, or a union",
    "isError": false,
    "guesses": [
      "The two runs are identical",
      "get_type_hints fails with the future import"
    ],
    "explanation": [
      "<code>from __future__ import annotations</code> (PEP 563) stops annotations being evaluated and stores their source text instead. That is what lets you reference a class before it is defined, and removes the import-time cost of building type objects.",
      "It also breaks everything that reads <code>__annotations__</code> expecting real objects: runtime validators, serialisers, dependency injection, and any <code>isinstance</code> check against an annotation, which now gets a string. <code>typing.get_type_hints</code> is the supported way to resolve them, and it needs the right module globals to do it.",
      "Python 3.14 changed the default. Under PEP 649 annotations are now <em>lazily</em> evaluated: you get the forward-reference benefit without the stringification, and <code>__annotations__</code> holds real objects again. The <code>__future__</code> import still forces the old string behaviour, so code that relies on it keeps working &mdash; and keeps breaking introspection."
    ],
    "extraCode": "",
    "fixNote": "Read annotations through <code>typing.get_type_hints</code>, never off <code>__annotations__</code> directly:",
    "fixCode": "import typing\n\nclass Config:\n    retries: int\n    tags: list[str]\n\nhints = typing.get_type_hints(Config)\nprint(hints)\nprint(isinstance(3, hints[\"retries\"]))",
    "takeaway": "Annotations are not guaranteed to be objects. `get_type_hints` is the only portable way to read them.",
    "caveat": "The default behaviour is version-dependent: strings under the __future__ import, real objects eagerly before 3.14, and lazily evaluated real objects from 3.14 under PEP 649.",
    "refs": [
      {
        "label": "PEP 563 &mdash; postponed evaluation of annotations",
        "url": "https://peps.python.org/pep-0563/"
      },
      {
        "label": "PEP 649 &mdash; deferred evaluation of annotations using descriptors",
        "url": "https://peps.python.org/pep-0649/"
      }
    ]
  },
  {
    "id": "init-subclass-and-set-name",
    "num": 102,
    "title": "__init_subclass__ And __set_name__",
    "subtitle": "two hooks that need no metaclass",
    "difficulty": "advanced",
    "tags": [
      "classes",
      "hooks",
      "descriptors",
      "metaclasses"
    ],
    "question": "What does this print?",
    "code": "class Field:\n    def __set_name__(self, owner, name):\n        print(f\"  __set_name__: {owner.__name__}.{name}\")\n        self.name = name\n    def __get__(self, obj, owner=None):\n        return f\"<{self.name}>\"\n\nREGISTRY = {}\n\nclass Base:\n    def __init_subclass__(cls, /, label=None, **kwargs):\n        super().__init_subclass__(**kwargs)\n        print(f\"  __init_subclass__: {cls.__name__} label={label!r}\")\n        REGISTRY[label or cls.__name__] = cls\n\nprint(\"defining User:\")\nclass User(Base, label=\"user\"):\n    name = Field()\n    email = Field()\n\nprint(\"registry:\", REGISTRY)\nprint(\"descriptor knows its name:\", User().name)\nprint(\"Base itself was not registered:\", \"Base\" not in REGISTRY)",
    "output": "defining User:\n  __set_name__: User.name\n  __set_name__: User.email\n  __init_subclass__: User label='user'\nregistry: {'user': <class '__main__.User'>}\ndescriptor knows its name: <name>\nBase itself was not registered: True",
    "isError": false,
    "guesses": [
      "__init_subclass__ runs for Base too",
      "__set_name__ needs to be called manually"
    ],
    "explanation": [
      "Both hooks run during class creation, and neither needs a metaclass. <code>__set_name__</code> is called on every class attribute that defines it, with the owning class and the attribute's name &mdash; which is how a descriptor learns what it is called without you repeating the name as an argument.",
      "<code>__init_subclass__</code> is called on the <em>parent</em> whenever a subclass is created, and receives any extra keyword arguments from the <code>class</code> statement. That is the <code>label=\"user\"</code> above. It is implicitly a class method, and it does not fire for the class that defines it.",
      "Together they cover most of what people used to reach for metaclasses to do: registration, validation, attribute naming, plugin discovery. Since Python 3.6 a metaclass is rarely the right answer.",
      "The ordering matters: <code>__set_name__</code> calls happen before <code>__init_subclass__</code>, so the hook sees fully named descriptors."
    ],
    "extraCode": "",
    "fixNote": "Prefer these hooks to a metaclass &mdash; they compose, where metaclasses conflict on multiple inheritance:",
    "fixCode": "class Plugin:\n    registry = {}\n    def __init_subclass__(cls, /, name, **kwargs):\n        super().__init_subclass__(**kwargs)\n        cls.registry[name] = cls\n\nclass Json(Plugin, name=\"json\"): pass\nclass Yaml(Plugin, name=\"yaml\"): pass\n\nprint(sorted(Plugin.registry))",
    "takeaway": "`__set_name__` for \"what am I called\", `__init_subclass__` for \"someone subclassed me\". No metaclass required.",
    "caveat": "",
    "refs": [
      {
        "label": "PEP 487 &mdash; simpler customisation of class creation",
        "url": "https://peps.python.org/pep-0487/"
      },
      {
        "label": "Python docs &mdash; __set_name__",
        "url": "https://docs.python.org/3/reference/datamodel.html#object.__set_name__"
      }
    ]
  },
  {
    "id": "abc-is-enforced-at-instantiation",
    "num": 103,
    "title": "abc Does Not Stop You",
    "subtitle": "the abstract class that instantiates fine",
    "difficulty": "advanced",
    "tags": [
      "abc",
      "classes",
      "inheritance",
      "validation"
    ],
    "question": "What does this print?",
    "code": "from abc import ABC, ABCMeta, abstractmethod\n\nclass Base(ABC):\n    @abstractmethod\n    def run(self): ...\n\nclass Incomplete(Base):\n    pass\n\nprint(\"class created fine:\", Incomplete.__name__)\ntry:\n    Incomplete()\nexcept TypeError as exc:\n    print(\"TypeError:\", exc)\n\nclass NotAbstract:\n    @abstractmethod\n    def run(self): ...\n\nprint(\"no ABCMeta, so no check:\", NotAbstract().run())\n\nclass Late(Base):\n    def run(self): return \"ok\"\n\nLate.run = None\nprint(\"abstractmethods frozen at creation:\", Late.__abstractmethods__)\nprint(\"still instantiable:\", Late() is not None)",
    "output": "class created fine: Incomplete\nTypeError: Can't instantiate abstract class Incomplete without an implementation for abstract method 'run'\nno ABCMeta, so no check: None\nabstractmethods frozen at creation: frozenset()\nstill instantiable: True",
    "isError": false,
    "guesses": [
      "Creating Incomplete raises",
      "NotAbstract cannot be instantiated"
    ],
    "explanation": [
      "<code>@abstractmethod</code> only sets a flag on the function. The enforcement lives in <code>ABCMeta</code>, which at class-creation time collects the names still abstract into <code>__abstractmethods__</code>, and in <code>object.__new__</code>, which refuses to instantiate a class whose set is non-empty.",
      "So the check happens at <em>instantiation</em>, not at class definition. A subclass that forgets a method is created successfully, imports successfully, passes <code>issubclass</code>, and only fails when someone constructs it. On a plugin loaded at request time, that means production.",
      "Without <code>ABCMeta</code> in the metaclass chain there is no enforcement at all &mdash; <code>@abstractmethod</code> on an ordinary class is decoration with no effect, and this is a common copy-paste error.",
      "The set is also computed once, at class creation. Removing the implementation afterwards does not restore abstractness."
    ],
    "extraCode": "",
    "fixNote": "Inherit from <code>ABC</code> so the metaclass is present, and use <code>__init_subclass__</code> if you want failure at definition time:",
    "fixCode": "from abc import ABC, abstractmethod\n\nclass Base(ABC):\n    @abstractmethod\n    def run(self): ...\n\n    def __init_subclass__(cls, **kwargs):\n        super().__init_subclass__(**kwargs)\n        missing = {n for n in (\"run\",) if getattr(cls, n, None) is getattr(Base, n)}\n        if missing:\n            raise TypeError(f\"{cls.__name__} must implement {sorted(missing)}\")\n\ntry:\n    class Incomplete(Base):\n        pass\nexcept TypeError as exc:\n    print(\"TypeError at definition:\", exc)\n\nclass Complete(Base):\n    def run(self): return \"ok\"\n\nprint(Complete().run())",
    "takeaway": "ABCs fail at construction, not at import. `@abstractmethod` without `ABCMeta` does nothing at all.",
    "caveat": "",
    "refs": [
      {
        "label": "Python docs &mdash; abc",
        "url": "https://docs.python.org/3/library/abc.html"
      }
    ]
  }
];
