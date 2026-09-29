# -*- coding: utf-8 -*-
"""Source of truth for every python-grail entry.

`code`, `extra` and `fix` are executed by build.py. The `output` shown on the
site is captured from that run, never written by hand. Keep snippets short,
deterministic and free of anything address- or time-dependent.

Fields
------
id             kebab-case, becomes the URL
title          short name for the behaviour
subtitle       one-line catchphrase, rendered in monospace
difficulty     beginner | intermediate | advanced
tags           topic strings; drive the Browse topic filter
question       prompt shown above the snippet
code           the snippet (executed)
expect_raises  True if the snippet is supposed to end in a traceback
guesses        common wrong answers
explanation    list of paragraphs, inline HTML allowed
extra          optional >>> transcript, verified with doctest
fix_note/fix   how you would write it for real (executed, must not raise)
takeaway       one-sentence rule
caveat         set when the behaviour is a CPython detail, not a guarantee
refs           list of (label, url)
"""

ENTRIES = [

# ===================== BEGINNER =====================

dict(
    id="mutable-default-argument",
    title="Mutable Default Arguments",
    subtitle="the list that remembers",
    difficulty="beginner",
    tags=["functions", "mutability", "defaults"],
    code='''def add_item(item, basket=[]):
    basket.append(item)
    return basket

print(add_item("apple"))
print(add_item("banana"))
print(add_item("cherry", []))
print(add_item("date"))''',
    guesses=[
        "['apple'], then ['banana'], then ['cherry'], then ['date']",
        "A fresh empty list on every call",
    ],
    explanation=[
        "Default arguments are evaluated <strong>once</strong>, when the <code>def</code> statement runs &mdash; not on every call. That single list object is stored on the function and reused forever.",
        "So <code>add_item(\"apple\")</code> mutates the shared default in place, and the next bare call sees the leftovers. Passing an explicit <code>[]</code> bypasses the default entirely, which is why <code>\"cherry\"</code> lands in a clean list &mdash; but that call does nothing to reset the default, so <code>\"date\"</code> joins apple and banana.",
        "You can watch the default rot in real time:",
    ],
    extra='''>>> def add_item(item, basket=[]):
...     basket.append(item)
...     return basket
...
>>> add_item.__defaults__
([],)
>>> add_item("x")
['x']
>>> add_item.__defaults__
(['x'],)''',
    fix_note="Use <code>None</code> as the sentinel and build the real default inside the body:",
    fix='''def add_item(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket

print(add_item("apple"))
print(add_item("banana"))''',
    takeaway="Immutable defaults (numbers, strings, tuples, None) are safe. Anything you can mutate is a trap.",
    refs=[("Python docs &mdash; default argument values",
           "https://docs.python.org/3/reference/compound_stmts.html#function-definitions")],
),

dict(
    id="small-int-identity",
    title="`is` Is Not `==`",
    subtitle="two ints that are equal but not the same",
    difficulty="beginner",
    tags=["identity", "integers", "cpython"],
    code='''def add_one(n):
    return n + 1

a, b = add_one(255), 256
c, d = add_one(256), 257

print(a == b, a is b)
print(c == d, c is d)''',
    guesses=["True True on both lines", "True False on both lines"],
    explanation=[
        "<code>==</code> asks whether two objects have the same value. <code>is</code> asks whether they are the same object. For most types those are different questions, and integers are where the difference first bites.",
        "CPython pre-allocates every int from <code>-5</code> to <code>256</code> at startup and hands out the same object every time one is needed. <code>255 + 1</code> therefore lands on the cached <code>256</code>, the same object the literal refers to. <code>256 + 1</code> is outside the cache, so it builds a fresh object and <code>is</code> says no.",
        "The <code>add_one</code> call is doing real work here: written as a plain <code>c = 256 + 1</code> the compiler would fold the arithmetic and the whole effect would disappear. That is the next entry.",
    ],
    fix_note="Compare integers with <code>==</code>. Reserve <code>is</code> for singletons &mdash; <code>None</code>, <code>True</code>, <code>False</code>, and sentinels you created yourself:",
    fix='''MISSING = object()

def get(d, key, default=MISSING):
    value = d.get(key, MISSING)
    if value is MISSING:
        return default
    return value

print(get({"a": 1}, "a"), get({"a": 1}, "b", 0))''',
    takeaway="If you ever write `is` next to a number or a string, you meant `==`.",
    caveat="The size of the small-int cache is a CPython implementation detail. Other interpreters, and future CPython versions, are free to cache a different range or none at all.",
    refs=[("Python docs &mdash; comparisons",
           "https://docs.python.org/3/reference/expressions.html#is-not"),
          ("CPython source &mdash; small int cache",
           "https://github.com/python/cpython/blob/main/Objects/longobject.c")],
),

dict(
    id="literal-identity-script-vs-repl",
    title="The Same Literal, Two Answers",
    subtitle="your REPL and your script disagree",
    difficulty="beginner",
    tags=["identity", "integers", "compiler", "cpython"],
    question="This is the previous entry with the arithmetic removed. Same two literals. What changes?",
    code='''x = 257
y = 257
print(x is y)

def f():
    p = 257
    return p

print(f() is x)''',
    guesses=["False, then False", "True, then False"],
    explanation=[
        "Paste the first three lines into an interactive prompt and you get <code>False</code>. Run them as a script and you get <code>True</code>. Nothing about the language changed &mdash; what changed is how much code the compiler got to see at once.",
        "CPython compiles a whole module as one unit and keeps a table of its constants, deduplicating equal ones. Both <code>257</code> literals become a single entry in that table, so <code>x</code> and <code>y</code> are bound to the same object. The REPL compiles each statement on its own, so the two <code>257</code>s land in different tables and really are different objects.",
        "On CPython 3.14 that table is shared across the whole compilation unit, so even the <code>257</code> inside <code>f</code> &mdash; a separate code object, with its own <code>co_consts</code> &mdash; resolves to the same integer. Two unrelated functions returning the same large literal will hand you the same object.",
        "The REPL is where you will meet this, because it is where people test <code>is</code>:",
    ],
    extra='''>>> x = 257
>>> y = 257
>>> x is y
False
>>> x, y = 257, 257
>>> x is y
True''',
    fix_note="There is nothing to fix &mdash; there is something to stop relying on. Compare values, not identities:",
    fix='''x = 257
y = 257
print(x == y)''',
    takeaway="Identity of equal immutables is an accident of compilation. Never build behaviour on it, and never conclude anything from testing it in a REPL.",
    caveat="Constant deduplication is a CPython optimisation with no guarantee behind it, and its reach has widened over time \u2014 3.14 shares constants across code objects where older versions did not. The same script can answer differently on another version or another implementation.",
    refs=[("Python docs &mdash; the standard type hierarchy",
           "https://docs.python.org/3/reference/datamodel.html#objects-values-and-types")],
),

dict(
    id="float-arithmetic-is-not-decimal",
    title="0.1 + 0.2",
    subtitle="the sum that misses by a hair",
    difficulty="beginner",
    tags=["floats", "numbers", "equality"],
    code='''print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(f"{0.1:.20f}")

total = 0.0
for _ in range(10):
    total += 0.1
print(total, total == 1.0)''',
    guesses=["0.3 and True", "0.30000000000000004 but still True"],
    explanation=[
        "A Python <code>float</code> is an IEEE-754 double: a binary fraction. <code>0.1</code> is no more representable in binary than <code>1/3</code> is in decimal, so what you actually store is the nearest double, which is slightly more than a tenth.",
        "The literal <code>0.3</code> and the computed <code>0.1 + 0.2</code> round to <em>different</em> doubles, so the equality fails. Adding a tenth ten times accumulates the error rather than cancelling it.",
        "This is not a Python bug and not a CPython detail &mdash; every language with hardware floats behaves this way.",
    ],
    fix_note="Compare with a tolerance, or use a decimal type when the decimal-ness is the point (money, invoices, anything a human will audit):",
    fix='''import math
from decimal import Decimal

print(math.isclose(0.1 + 0.2, 0.3))
print(Decimal("0.1") + Decimal("0.2") == Decimal("0.3"))''',
    takeaway="Never write `==` between two floats that came from arithmetic. Use `math.isclose`, or move to `Decimal`.",
    refs=[("Python docs &mdash; floating point arithmetic: issues and limitations",
           "https://docs.python.org/3/tutorial/floatingpoint.html"),
          ("Python docs &mdash; math.isclose",
           "https://docs.python.org/3/library/math.html#math.isclose")],
),

dict(
    id="bankers-rounding",
    title="round(0.5) Is 0",
    subtitle="the rounding you were not taught at school",
    difficulty="beginner",
    tags=["numbers", "floats", "rounding"],
    code='''print(round(0.5), round(1.5), round(2.5), round(3.5))
print(round(-0.5), round(-1.5))
print(round(2.675, 2))''',
    guesses=["1 2 3 4", "1 2 3 4 and 2.68"],
    explanation=[
        "Python rounds halves to the nearest <em>even</em> number, not away from zero. This is banker's rounding, and it is the IEEE-754 default because it does not accumulate an upward bias over a long column of figures the way always-round-up does.",
        "The last line is a different problem wearing the same coat. <code>2.675</code> is not exactly 2.675 &mdash; the nearest double is very slightly below it &mdash; so there is no tie to break and it rounds down. The rounding rule is innocent here; the binary representation is not.",
    ],
    extra='''>>> from decimal import Decimal
>>> Decimal(2.675)
Decimal('2.67499999999999982236431605997495353221893310546875')''',
    fix_note="If you need half-up rounding, say so explicitly with <code>Decimal</code>, which also removes the representation problem:",
    fix='''from decimal import Decimal, ROUND_HALF_UP

def round_half_up(value, places=0):
    exp = Decimal(1).scaleb(-places)
    return Decimal(str(value)).quantize(exp, rounding=ROUND_HALF_UP)

print(round_half_up(0.5), round_half_up(2.5))
print(round_half_up(2.675, 2))''',
    takeaway="`round` is not the rounding your spreadsheet does. For money, use `Decimal` with an explicit rounding mode.",
    refs=[("Python docs &mdash; round",
           "https://docs.python.org/3/library/functions.html#round"),
          ("Python docs &mdash; decimal rounding modes",
           "https://docs.python.org/3/library/decimal.html#rounding-modes")],
),

dict(
    id="floor-division-goes-down",
    title="Floor Division Goes Down, Not Toward Zero",
    subtitle="-7 // 2 is -4",
    difficulty="beginner",
    tags=["numbers", "integers", "operators"],
    code='''print(7 // 2, -7 // 2)
print(int(7 / 2), int(-7 / 2))

import math
print(math.floor(-3.5), math.trunc(-3.5))''',
    guesses=["3 and -3 on the first line", "3 and -4 on both lines"],
    explanation=[
        "<code>//</code> is <em>floor</em> division: it rounds toward negative infinity, so <code>-7 // 2</code> is <code>-4</code>. It is not truncation.",
        "<code>int()</code> on a float truncates toward zero, which is why the second line disagrees. Most languages that grew out of C make <code>/</code> on integers truncate; Python deliberately did not, so that <code>a // b</code> and <code>a % b</code> stay consistent with each other for negative operands.",
        "If you have been using <code>//</code> to mean \"integer divide\" on a value that can go negative &mdash; array midpoints, time offsets, coordinates &mdash; this is a real off-by-one waiting to happen.",
    ],
    fix_note="Pick the one you actually meant. <code>math.trunc</code> or <code>int()</code> for toward-zero, <code>//</code> for floor:",
    fix='''import math

print(math.trunc(-7 / 2))
print(-7 // 2)
print(math.ceil(-7 / 2))''',
    takeaway="For non-negative operands the two agree, which is exactly why the bug survives testing.",
    refs=[("Python docs &mdash; binary arithmetic operations",
           "https://docs.python.org/3/reference/expressions.html#binary-arithmetic-operations")],
),

dict(
    id="modulo-sign-follows-divisor",
    title="The Modulo Sign Follows The Divisor",
    subtitle="-7 % 3 is 2",
    difficulty="beginner",
    tags=["numbers", "integers", "operators"],
    code='''print(-7 % 3)
print(7 % -3)
print(divmod(-7, 3))

import math
print(math.fmod(-7, 3))''',
    guesses=["-1 on the first line", "-1 and 1"],
    explanation=[
        "Python's <code>%</code> always returns a result with the sign of the <em>divisor</em>, never the dividend. C, Java, Rust and Go do the opposite. If you learned modulo anywhere else, your intuition is inverted here.",
        "The rule exists so that <code>(a // b) * b + (a % b) == a</code> holds for every pair of integers, which is what <code>divmod</code> returns as a pair.",
        "<code>math.fmod</code> gives you the C behaviour if you need it &mdash; note it returns a float.",
        "This is a feature when you are cycling an index, and a bug when you are extracting a signed remainder:",
    ],
    extra='''>>> [(-3 + i) % 4 for i in range(4)]
[1, 2, 3, 0]
>>> hours = -5
>>> hours % 12
7''',
    fix_note="For a clock or a ring buffer, <code>%</code> is already what you want. For a true signed remainder, be explicit:",
    fix='''import math

print(math.fmod(-7, 3))
print(-7 - int(-7 / 3) * 3)''',
    takeaway="Python's `%` is a modulo, not a remainder. The distinction only shows up when one operand is negative.",
    refs=[("Python docs &mdash; binary arithmetic operations",
           "https://docs.python.org/3/reference/expressions.html#binary-arithmetic-operations")],
),

dict(
    id="list-multiplication-aliases",
    title="[[0] * 3] * 3",
    subtitle="a grid with one row in it",
    difficulty="beginner",
    tags=["lists", "mutability", "aliasing"],
    code='''grid = [[0] * 3] * 3
grid[0][0] = 1

for row in grid:
    print(row)

print([id(row) == id(grid[0]) for row in grid])''',
    guesses=["[1,0,0] then [0,0,0] then [0,0,0]", "A TypeError"],
    explanation=[
        "<code>list * n</code> copies <em>references</em>, not objects. The inner <code>[0] * 3</code> is fine, because integers are immutable and rebinding <code>grid[0][0]</code> replaces the reference rather than mutating the zero. The outer multiplication is not fine: it produces three references to the one row list.",
        "So <code>grid[0][0] = 1</code> mutates the single row that all three slots point at, and it appears to show up three times because it <em>is</em> three times.",
        "The same trap sits in <code>[set()] * n</code>, <code>[{}] * n</code> and <code>[MyClass()] * n</code>.",
    ],
    fix_note="Build each row separately with a comprehension, which evaluates <code>[0] * 3</code> once per iteration:",
    fix='''grid = [[0] * 3 for _ in range(3)]
grid[0][0] = 1
for row in grid:
    print(row)''',
    takeaway="`*` on a list is safe only when the elements are immutable.",
    refs=[("Python FAQ &mdash; how do I create a multidimensional list?",
           "https://docs.python.org/3/faq/programming.html#how-do-i-create-a-multidimensional-list")],
),

dict(
    id="assignment-is-not-a-copy",
    title="b = a Does Not Copy",
    subtitle="two names, one list",
    difficulty="beginner",
    tags=["lists", "mutability", "aliasing", "copying"],
    code='''a = [1, 2, [3, 4]]
b = a
b.append(5)
print(a)

c = a[:]
c.append(6)
print(a, c)

c[2].append(99)
print(a)''',
    guesses=["[1, 2, [3, 4]] on the first line", "The last line prints [1, 2, [3, 4]]"],
    explanation=[
        "Assignment in Python binds a name to an object. It never copies. <code>b = a</code> gives the same list a second name, so <code>b.append</code> is visible through <code>a</code>.",
        "<code>a[:]</code> does copy &mdash; but only one level deep. The new outer list holds the same three references as the old one, so the nested <code>[3, 4]</code> is still shared. Mutating it through <code>c</code> shows up in <code>a</code>.",
        "<code>list(a)</code> and <code>copy.copy(a)</code> behave exactly like <code>a[:]</code>. Only <code>copy.deepcopy</code> walks the whole structure.",
    ],
    fix_note="Match the copy depth to the structure. Shallow is enough for a flat list; nested data needs <code>deepcopy</code>:",
    fix='''import copy

a = [1, 2, [3, 4]]
d = copy.deepcopy(a)
d[2].append(99)
print(a, d)''',
    takeaway="`a[:]`, `list(a)` and `copy.copy(a)` are the same shallow copy. Reach for `deepcopy` only when you know the structure is nested.",
    refs=[("Python docs &mdash; copy",
           "https://docs.python.org/3/library/copy.html")],
),

dict(
    id="chained-assignment-shares",
    title="x = y = []",
    subtitle="one list wearing two names",
    difficulty="beginner",
    tags=["lists", "mutability", "aliasing", "assignment"],
    code='''x = y = []
x.append(1)
print(x, y)

class Counter:
    hits = misses = []

a, b = Counter(), Counter()
a.hits.append("one")
print(b.misses)''',
    guesses=["[1] []", "[] on the last line"],
    explanation=[
        "<code>x = y = []</code> evaluates the right-hand side <em>once</em> and binds the single resulting object to both names, left to right. It is not shorthand for two empty lists.",
        "The class version compounds it: <code>hits</code> and <code>misses</code> are one list, it lives on the class rather than on any instance, and every instance shares it. Appending through <code>a.hits</code> is visible as <code>b.misses</code>.",
        "Read chained assignment as \"bind this one object to all of these names\" and the behaviour stops being surprising.",
    ],
    fix_note="Write the two bindings separately, and build per-instance state in <code>__init__</code>:",
    fix='''x, y = [], []
x.append(1)
print(x, y)

class Counter:
    def __init__(self):
        self.hits = []
        self.misses = []

a, b = Counter(), Counter()
a.hits.append("one")
print(b.misses)''',
    takeaway="Chained assignment is only safe for immutable values.",
    refs=[("Python docs &mdash; assignment statements",
           "https://docs.python.org/3/reference/simple_stmts.html#assignment-statements")],
),

dict(
    id="sort-returns-none",
    title="`.sort()` Returns None",
    subtitle="the one-liner that deletes your data",
    difficulty="beginner",
    tags=["lists", "mutability", "api-design"],
    code='''names = ["carol", "alice", "bob"]
names = names.sort()
print(names)

nums = [3, 1, 2]
print(nums.append(4), nums.reverse(), nums.extend([5]))
print(nums)''',
    guesses=["['alice', 'bob', 'carol']", "An AttributeError somewhere"],
    explanation=[
        "Every list method that mutates in place returns <code>None</code>: <code>sort</code>, <code>reverse</code>, <code>append</code>, <code>extend</code>, <code>insert</code>, <code>clear</code>. That is a deliberate convention &mdash; returning <code>None</code> signals \"I changed the object you gave me\" and stops you chaining a mutation onto a read.",
        "The cost is this exact bug. <code>names = names.sort()</code> sorts the list, throws it away, and rebinds <code>names</code> to <code>None</code>. Nothing raises; the failure arrives later, somewhere else, as <code>TypeError: 'NoneType' object is not iterable</code>.",
        "Note the evaluation order on the second print: the arguments are evaluated left to right, so all three mutations happen before anything is printed.",
    ],
    fix_note="Use the mutating method as a statement, or use the non-mutating builtin when you want a value:",
    fix='''names = ["carol", "alice", "bob"]
names.sort()
print(names)

original = ["carol", "alice", "bob"]
print(sorted(original), original)
print(list(reversed(original)))''',
    takeaway="`sorted`/`reversed` return, `sort`/`reverse` mutate. If you are assigning the result, you want the builtin.",
    refs=[("Python docs &mdash; sorting techniques",
           "https://docs.python.org/3/howto/sorting.html")],
),

dict(
    id="string-methods-return-new",
    title="`.replace()` Does Not Mutate",
    subtitle="the cleanup that cleans nothing",
    difficulty="beginner",
    tags=["strings", "immutability"],
    code='''line = "  user@example.com \\n"
line.strip()
line.replace("@", " at ")
line.upper()
print(repr(line))

cleaned = line.strip().replace("@", " at ").upper()
print(repr(cleaned))''',
    guesses=["'USER AT EXAMPLE.COM'", "An AttributeError on the second call"],
    explanation=[
        "Strings are immutable. No string method can change the object you called it on &mdash; every one of them builds and returns a new string, and if you throw that away nothing happened.",
        "The first three lines are legal, do real work, and discard all of it. Python will not warn you: an expression statement whose value you ignore is perfectly valid.",
        "Because each call returns a new string, they chain, which is the idiom you want.",
    ],
    fix_note="Assign the result, or chain:",
    fix='''line = "  user@example.com \\n"
line = line.strip().replace("@", " at ").upper()
print(repr(line))''',
    takeaway="If a string method's return value is not assigned or passed on, the line is dead code.",
    refs=[("Python docs &mdash; string methods",
           "https://docs.python.org/3/library/stdtypes.html#string-methods")],
),

dict(
    id="strip-is-not-removeprefix",
    title="strip('abc') Is Not removeprefix",
    subtitle="it eats characters, not the word",
    difficulty="beginner",
    tags=["strings", "api-design"],
    code='''print("abcdef".strip("abc"))
print("cbaXcba".strip("abc"))
print("test_data.csv".strip(".csv"))
print("banana".lstrip("ba"))''',
    guesses=["'def', 'cbaXcba', 'test_data', 'nana'"],
    explanation=[
        "The argument to <code>strip</code> is a <em>set of characters</em>, not a prefix. Python removes characters from both ends, in any order, for as long as they are members of that set.",
        "<code>\"abcdef\".strip(\"abc\")</code> looks like it stripped the word \"abc\" &mdash; it did not, it stripped the letters a, b and c, and the result happens to be identical. That coincidence is what makes the bug survive code review.",
        "<code>\"test_data.csv\".strip(\".csv\")</code> is the version that reaches production. The character set is <code>{'.', 'c', 's', 'v'}</code>, so it eats the extension and then keeps eating, stopping only at the first character that is not one of those four. On this input it happens to stop right where you wanted; on <code>\"sassafras.csv\"</code> it does not.",
    ],
    extra='''>>> "sassafras.csv".strip(".csv")
'assafra'
>>> "sassafras.csv".removesuffix(".csv")
'sassafras' ''',
    fix_note="Use <code>removeprefix</code> and <code>removesuffix</code> (3.9+), which do the literal thing you meant:",
    fix='''print("test_data.csv".removesuffix(".csv"))
print("banana".removeprefix("ba"))
print("nothing".removesuffix(".csv"))''',
    takeaway="`strip` takes a character set. If you passed it a word, you almost certainly wanted `removeprefix`/`removesuffix`.",
    refs=[("Python docs &mdash; str.removeprefix",
           "https://docs.python.org/3/library/stdtypes.html#str.removeprefix"),
          ("PEP 616 &mdash; string methods to remove prefixes and suffixes",
           "https://peps.python.org/pep-0616/")],
),

dict(
    id="split-versus-split-space",
    title="split() vs split(' ')",
    subtitle="the empty field that appears from nowhere",
    difficulty="beginner",
    tags=["strings", "parsing"],
    code='''line = "alice   bob  carol"
print(line.split())
print(line.split(" "))

print("  padded  ".split())
print("  padded  ".split(" "))
print("a,b,,c".split(","))''',
    guesses=["The same list both times", "['alice', 'bob', 'carol'] for both"],
    explanation=[
        "<code>split()</code> with no argument is a different algorithm, not a default. It splits on runs of <em>any</em> whitespace and discards leading and trailing whitespace, so consecutive spaces never produce empty fields.",
        "<code>split(sep)</code> splits on each single occurrence of <code>sep</code>. Two spaces in a row means there is an empty string between them, and it is faithfully returned.",
        "Neither is wrong. For human-written whitespace-separated text you want the no-argument form; for delimited data where an empty field is meaningful &mdash; CSV, TSV &mdash; you want the explicit separator, because collapsing the run would silently shift your columns.",
    ],
    fix_note="Choose deliberately, and say which you meant:",
    fix='''line = "alice   bob  carol"
print(line.split())
print([f for f in line.split(" ") if f])

row = "a,b,,c"
print(row.split(","))''',
    takeaway="`split()` is for prose. `split(sep)` is for data. Swapping them corrupts one or the other silently.",
    refs=[("Python docs &mdash; str.split",
           "https://docs.python.org/3/library/stdtypes.html#str.split")],
),

dict(
    id="bool-is-an-int",
    title="`True + True` Is 2",
    subtitle="booleans are integers wearing a costume",
    difficulty="beginner",
    tags=["bool", "integers", "type-hierarchy"],
    code='''print(True + True)
print(sum([True, True, False, True]))
print(isinstance(True, int), issubclass(bool, int))
print(True == 1, False == 0)
print(["no", "yes"][True])
print("%d apples" % True)''',
    guesses=["A TypeError on the first line", "True on the first line"],
    explanation=[
        "<code>bool</code> is a subclass of <code>int</code>, with exactly two instances whose values are 1 and 0. Every integer operation works on them.",
        "This is mostly a convenience &mdash; <code>sum(flags)</code> counting the true ones is genuinely useful, and predates <code>bool</code> existing at all, since Python 2.2 had only 1 and 0.",
        "It becomes a bug when a function that should return a count returns a boolean, or when a boolean is accidentally passed where an index or an amount was expected. Neither will raise.",
    ],
    fix_note="Counting with <code>sum</code> is idiomatic and fine. Where you need the distinction, ask about the type, not the value:",
    fix='''flags = [True, True, False, True]
print(sum(flags))

def is_strictly_int(x):
    return isinstance(x, int) and not isinstance(x, bool)

print(is_strictly_int(1), is_strictly_int(True))''',
    takeaway="`isinstance(x, int)` is True for booleans. If that matters, you must exclude `bool` explicitly.",
    refs=[("PEP 285 &mdash; adding a bool type",
           "https://peps.python.org/pep-0285/")],
),

dict(
    id="true-as-a-dict-key",
    title="{1: 'a', True: 'b'} Has One Key",
    subtitle="the key that overwrote a different key",
    difficulty="beginner",
    tags=["dicts", "sets", "hashing", "bool"],
    code='''print({1: "a", True: "b"})
print({0: "zero", False: "false", 0.0: "float"})
print(len({0, False, 0.0}))
print({True: "yes"}[1])
print(hash(1) == hash(True) == hash(1.0))''',
    guesses=["Two keys in the first dict", "A TypeError on the mixed set"],
    explanation=[
        "Dict keys and set members are deduplicated by hash-then-equality, not by type. <code>1</code>, <code>True</code> and <code>1.0</code> all hash the same and all compare equal, so they are the same key.",
        "Note which value survives and which key survives: the <em>first</em> key inserted stays in place, and each later assignment overwrites the value. That is why the output shows the key <code>1</code> but the value <code>\"b\"</code>, and <code>0</code> with <code>\"float\"</code>.",
        "This is the documented contract for numeric types &mdash; equal numbers must hash equally, or dicts would behave differently depending on whether you wrote <code>1</code> or <code>1.0</code>.",
    ],
    fix_note="If the type is part of the identity, put it in the key:",
    fix='''d = {}
for value in (1, True, 1.0):
    d[(type(value).__name__, value)] = value
print(d)''',
    takeaway="Mixing bools, ints and floats as keys silently merges them. It also merges them in sets.",
    refs=[("Python docs &mdash; hash",
           "https://docs.python.org/3/library/functions.html#hash"),
          ("Python docs &mdash; numeric types",
           "https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex")],
),

dict(
    id="slices-forgive-indexes-do-not",
    title="Slices Forgive, Indexes Do Not",
    subtitle="out of range, no complaint",
    difficulty="beginner",
    tags=["lists", "slicing", "errors"],
    code='''items = [1, 2, 3]

print(items[10:20])
print(items[1:100])
print(items[-100:2])

try:
    print(items[10])
except IndexError as exc:
    print("IndexError:", exc)''',
    guesses=["An IndexError on the first line", "None for the out-of-range slices"],
    explanation=[
        "Slicing clamps its bounds to the sequence. Anything past the end becomes the end, anything before the start becomes the start, and an empty result is a perfectly ordinary answer. Indexing does not clamp &mdash; it raises.",
        "The asymmetry is deliberate: a slice describes a region, and the empty region is meaningful, whereas an index names one element and there is no element to name.",
        "The cost is that a paging or chunking bug in slice arithmetic produces empty lists rather than errors, and empty lists flow a long way downstream before anyone notices.",
    ],
    fix_note="When an empty slice would be a bug rather than an answer, check the bounds yourself:",
    fix='''def page(items, start, size):
    if start < 0 or start >= len(items):
        raise IndexError(f"start {start} outside 0..{len(items) - 1}")
    return items[start:start + size]

print(page([1, 2, 3], 1, 2))''',
    takeaway="An unexpectedly empty list is often an out-of-range slice that never told you.",
    refs=[("Python docs &mdash; sequence types",
           "https://docs.python.org/3/library/stdtypes.html#common-sequence-operations")],
),

dict(
    id="negative-step-slices",
    title="a[3:0:-1]",
    subtitle="the reversal that drops an element",
    difficulty="beginner",
    tags=["lists", "slicing"],
    code='''a = [0, 1, 2, 3, 4]

print(a[::-1])
print(a[3:0:-1])
print(a[3::-1])
print(a[:3:-1])
print(a[3:0:-1] == list(reversed(a[1:4])))''',
    guesses=["[3, 2, 1, 0] on the second line", "[0, 1, 2, 3] on the second line"],
    explanation=[
        "A slice's <code>stop</code> is exclusive regardless of direction. With a negative step you are walking down toward <code>stop</code> and still never reach it, so <code>a[3:0:-1]</code> gives you indexes 3, 2, 1 and stops short of 0.",
        "There is no way to write \"down to and including index 0\" with an explicit stop, because the index before 0 is <code>-1</code>, which means the last element. You have to omit <code>stop</code> entirely: <code>a[3::-1]</code>.",
        "<code>a[::-1]</code> works because both bounds are omitted, so Python fills in the whole range in the step's direction.",
    ],
    fix_note="Reverse a forward slice instead of doing the arithmetic backwards &mdash; it reads the way you think:",
    fix='''a = [0, 1, 2, 3, 4]
print(a[1:4][::-1])
print(list(reversed(a[1:4])))''',
    takeaway="Negative-step slices with an explicit stop are almost always off by one. Slice forward, then reverse.",
    refs=[("Python docs &mdash; slicings",
           "https://docs.python.org/3/reference/expressions.html#slicings")],
),

dict(
    id="tuple-needs-the-comma",
    title="(1) Is Not A Tuple",
    subtitle="the comma makes it, not the parentheses",
    difficulty="beginner",
    tags=["tuples", "syntax"],
    code='''print(type((1)))
print(type((1,)))
print(type(()))

print(len(("abc")))
print(len(("abc",)))

point = 3, 4
print(type(point), point)''',
    guesses=["tuple on every line", "A SyntaxError on the empty parentheses"],
    explanation=[
        "The comma builds the tuple. Parentheses only group, exactly as they do in arithmetic, so <code>(1)</code> is the integer 1 with a redundant pair of brackets around it.",
        "The empty tuple <code>()</code> is the one exception, because there is nowhere to put a comma. And <code>point = 3, 4</code> shows the other direction: no parentheses at all, still a tuple.",
        "The failure mode is a one-element container that silently becomes the element. <code>len((\"abc\"))</code> is 3, not 1, and a function expecting a tuple of arguments gets a string it will happily iterate.",
    ],
    fix_note="Write the trailing comma, and let a linter catch the ones you forget:",
    fix='''SINGLE = ("abc",)
print(len(SINGLE), SINGLE)

def handles(*types):
    return types

print(handles(ValueError))''',
    takeaway="A one-element tuple always needs a trailing comma. Every other length is forgiving, which is why this only ever breaks at length one.",
    refs=[("Python docs &mdash; parenthesized forms",
           "https://docs.python.org/3/reference/expressions.html#parenthesized-forms")],
),

dict(
    id="tuples-are-shallowly-immutable",
    title="Tuples Are Only Shallowly Immutable",
    subtitle="frozen on the outside",
    difficulty="beginner",
    tags=["tuples", "mutability", "hashing"],
    code='''t = ([1, 2], "fixed")
t[0].append(3)
print(t)

try:
    hash(t)
except TypeError as exc:
    print("TypeError:", exc)

print(hash(("a", "b")) == hash(("a", "b")))''',
    guesses=["A TypeError on the append", "hash(t) works fine"],
    explanation=[
        "A tuple's immutability is about its own slots: you cannot rebind <code>t[0]</code> to a different object. It says nothing about the objects those slots point at. If one of them is a list, that list is as mutable as ever.",
        "The consequence people actually hit is hashing. A tuple's hash is built from its elements' hashes, so a tuple containing a list is unhashable and cannot be a dict key or a set member &mdash; which is the correct answer, since its contents can change underneath the hash.",
        "\"Immutable\" in Python is never transitive.",
    ],
    fix_note="If you need a hashable composite, make every element hashable:",
    fix='''t = ((1, 2), "fixed")
print(hash(t) is not None)

seen = {t}
print(t in seen)''',
    takeaway="Immutable containers guarantee their own structure, never their contents.",
    refs=[("Python docs &mdash; the standard type hierarchy",
           "https://docs.python.org/3/reference/datamodel.html#the-standard-type-hierarchy")],
),

dict(
    id="tuple-iadd-paradox",
    title="The t[0] += [2] Paradox",
    subtitle="it raises and it works",
    difficulty="beginner",
    tags=["tuples", "mutability", "operators"],
    question="This raises. What does the tuple look like afterwards?",
    code='''t = ([1, 2],)

try:
    t[0] += [3]
except TypeError as exc:
    print("TypeError:", exc)

print("t is now", t)''',
    guesses=["([1, 2],) &mdash; the exception rolled it back", "It cannot raise at all"],
    explanation=[
        "<code>t[0] += [3]</code> is not one operation, it is two. Python evaluates <code>t[0] = t[0].__iadd__([3])</code>: first the in-place add, then the store back into the tuple.",
        "<code>list.__iadd__</code> succeeds &mdash; it extends the list in place and returns it. Then the store raises, because tuples do not support item assignment. Both halves are correct in isolation; together they leave you with a completed mutation and a traceback saying it failed.",
        "The store is not optional even though the object is unchanged: augmented assignment <em>always</em> stores back, because it cannot know whether the target's <code>__iadd__</code> returned the same object or a new one.",
    ],
    fix_note="Mutate through a name, so there is no store back into the tuple:",
    fix='''t = ([1, 2],)
t[0].extend([3])
print(t)''',
    takeaway="An exception does not mean nothing happened. `+=` on a tuple slot is the clearest proof.",
    refs=[("Python FAQ &mdash; why does a_tuple[i] += ['item'] raise an exception when the addition works?",
           "https://docs.python.org/3/faq/programming.html#why-does-a-tuple-i-item-raise-an-exception-when-the-addition-works")],
),

dict(
    id="mutate-while-iterating",
    title="Deleting While Iterating",
    subtitle="every other element survives",
    difficulty="beginner",
    tags=["lists", "iteration", "mutability"],
    code='''items = [1, 2, 3, 4, 5, 6]
for x in items:
    if x % 2 == 0:
        items.remove(x)
print(items)

d = {"a": 1, "b": 2}
try:
    for k in d:
        d[k + "!"] = 0
except RuntimeError as exc:
    print("RuntimeError:", exc)''',
    guesses=["[1, 3, 5]", "An error on the list loop too"],
    explanation=[
        "A list iterator holds an integer index, not a copy. Removing an element shifts everything after it down by one, but the iterator still advances, so the element that slid into the vacated slot is skipped entirely.",
        "Removing 2 at index 1 pulls 3 into index 1, the iterator moves to index 2, and 3 is never examined. Half your matches escape. Nothing raises, and the result looks plausible enough to ship.",
        "Dicts are stricter: they carry a version counter and raise <code>RuntimeError</code> the moment the size changes mid-iteration. Sets do the same. Lists are the only common container that fails quietly.",
    ],
    fix_note="Build a new list rather than editing the one you are walking, or iterate over a snapshot:",
    fix='''items = [1, 2, 3, 4, 5, 6]
items = [x for x in items if x % 2]
print(items)

original = [1, 2, 3, 4, 5, 6]
for x in list(original):
    if x % 2 == 0:
        original.remove(x)
print(original)''',
    takeaway="Never mutate the container you are iterating. For lists, Python will not stop you.",
    refs=[("Python docs &mdash; the for statement",
           "https://docs.python.org/3/reference/compound_stmts.html#the-for-statement")],
),

dict(
    id="list-iadd-is-extend",
    title="+= On A List Is extend",
    subtitle="your string became four elements",
    difficulty="beginner",
    tags=["lists", "operators", "mutability"],
    code='''a = [1, 2]
a += "abc"
print(a)

b = [1, 2]
try:
    b = b + "abc"
except TypeError as exc:
    print("TypeError:", exc)

c = [1, 2]
d = c
c += [3]
print(c, d, c is d)

e = [1, 2]
f = e
e = e + [3]
print(e, f, e is f)''',
    guesses=["The same result from += and +", "A TypeError on the first line too"],
    explanation=[
        "<code>list.__iadd__</code> is <code>extend</code>, and <code>extend</code> takes any iterable. A string is an iterable of characters, so <code>a += \"abc\"</code> appends three separate characters. <code>list.__add__</code>, used by <code>+</code>, is stricter and accepts only another list.",
        "The second difference is aliasing. <code>+=</code> mutates in place and rebinds the same object, so every other name for that list sees the change. <code>c + [3]</code> builds a new list and leaves the original alone.",
        "So <code>+=</code> and <code>x = x + y</code> are not interchangeable for lists on either axis: they accept different right-hand sides, and they differ in whether anyone else notices.",
    ],
    fix_note="Say which one you mean. <code>append</code> for one element, <code>extend</code> for an iterable, <code>+</code> for a fresh list:",
    fix='''a = [1, 2]
a.append("abc")
print(a)

b = [1, 2]
b.extend(["c", "d"])
print(b)''',
    takeaway="`+=` on a list accepts any iterable and mutates in place. Both halves of that are ways to lose data.",
    refs=[("Python docs &mdash; augmented assignment statements",
           "https://docs.python.org/3/reference/simple_stmts.html#augmented-assignment-statements")],
),

dict(
    id="range-is-not-a-list",
    title="range Is Not A List",
    subtitle="lazy, sliceable, and reusable",
    difficulty="beginner",
    tags=["range", "iteration", "laziness"],
    code='''r = range(10)
print(r)
print(r[2:5])
print(r == range(10))

huge = range(10 ** 100)
print(huge[-1] == 10 ** 100 - 1)
print(10 ** 99 in huge)
try:
    len(huge)
except OverflowError as exc:
    print("OverflowError:", exc)

import sys
print(sys.getsizeof(huge) < sys.getsizeof([0] * 10))''',
    guesses=["[0, 1, 2, ...] for the first print", "A MemoryError on the huge range"],
    explanation=[
        "A <code>range</code> stores three integers &mdash; start, stop, step &mdash; and computes elements on demand. It never materialises, which is why a range of 10<sup>100</sup> elements costs the same as a range of ten.",
        "Unlike a generator it is a full sequence: it indexes, it slices (returning another <code>range</code>), and you can iterate it as many times as you like. Two ranges compare equal when they would produce the same values, so <code>range(0)</code> equals <code>range(2, 2)</code>. Membership testing is O(1) arithmetic rather than a scan, which is how the 10<sup>99</sup> test returns instantly.",
        "The one thing it cannot do is report its length. <code>len()</code> is defined to return a C <code>ssize_t</code>, so any container claiming more than about 9.2 quintillion elements overflows &mdash; the range itself is perfectly fine, and <code>huge[-1]</code> still answers. If you need the count of a giant range, compute it from <code>start</code>, <code>stop</code> and <code>step</code> yourself.",
    ],
    extra='''>>> range(0) == range(2, 2)
True
>>> range(0, 10, 2)[1:3]
range(2, 6, 2)
>>> list(range(0, 10, 2)[1:3])
[2, 4]''',
    fix_note="Nothing to fix &mdash; but call <code>list()</code> when you genuinely need the values, and do not when you do not:",
    fix='''print(list(range(5)))

for i in range(3):
    print(i, end=" ")
print()''',
    takeaway="`range` is a sequence, not an iterator. It does not exhaust, and it does not cost memory.",
    refs=[("Python docs &mdash; ranges",
           "https://docs.python.org/3/library/stdtypes.html#ranges")],
),

dict(
    id="in-checks-keys-and-substrings",
    title="in On A Dict Checks Keys",
    subtitle="and on a string it checks substrings",
    difficulty="beginner",
    tags=["dicts", "strings", "operators"],
    code='''prices = {"apple": 1, "banana": 2}
print("apple" in prices)
print(1 in prices)
print(1 in prices.values())

print("ell" in "hello")
print("h" in "hello".split())

grid = [[1, 2], [3, 4]]
print(2 in grid)
print(any(2 in row for row in grid))''',
    guesses=["True for 1 in prices", "True for 2 in grid"],
    explanation=[
        "<code>in</code> delegates to the container, and each container decides what it means. A dict tests keys. A string tests <em>substrings</em>, not characters, so a multi-character needle works. A list of lists tests its elements, which are lists, so a bare <code>2</code> is never found.",
        "The dict case is the one that causes silent bugs: <code>value in some_dict</code> reads like a value lookup, always compiles, and quietly asks a different question. You need <code>.values()</code>, which is an O(n) scan rather than the O(1) key test.",
        "The nested-list case is the same mistake one level down &mdash; you have to say which level you mean.",
    ],
    fix_note="Be explicit about which view you are searching:",
    fix='''prices = {"apple": 1, "banana": 2}
print(1 in prices.values())
print(("apple", 1) in prices.items())

grid = [[1, 2], [3, 4]]
print(any(2 in row for row in grid))''',
    takeaway="`x in d` asks about keys. Scanning values is a different operation with a different cost.",
    refs=[("Python docs &mdash; membership test operations",
           "https://docs.python.org/3/reference/expressions.html#membership-test-operations")],
),

dict(
    id="or-returns-a-value",
    title="or Returns A Value, Not A Bool",
    subtitle="the default that overrides a legitimate zero",
    difficulty="beginner",
    tags=["operators", "truthiness", "defaults"],
    code='''print(0 or "" or None)
print("a" or "b")
print([] and "never evaluated")

def make_port(port=None):
    return port or 8080

print(make_port(9000))
print(make_port(0))
print(make_port())''',
    guesses=["True/False from the first three lines", "0 from make_port(0)"],
    explanation=[
        "<code>or</code> returns the first operand that is truthy, or the last one if none are. <code>and</code> returns the first falsy operand, or the last one. Neither ever converts to <code>bool</code>, which is what makes <code>x or default</code> such a compact idiom.",
        "It is also what makes it wrong. <code>port or 8080</code> means \"8080 unless port is truthy\", and <code>0</code> is not truthy. The same bug eats empty strings, empty lists and <code>False</code> &mdash; every one of which may be a value the caller deliberately passed.",
        "The idiom is safe only when every falsy value really should be replaced.",
    ],
    fix_note="Test for the sentinel you actually mean:",
    fix='''def make_port(port=None):
    return 8080 if port is None else port

print(make_port(9000), make_port(0), make_port())''',
    takeaway="`x or default` replaces every falsy value, not just the missing one.",
    refs=[("Python docs &mdash; boolean operations",
           "https://docs.python.org/3/reference/expressions.html#boolean-operations")],
),

dict(
    id="falsy-is-not-none",
    title="Falsy Is Not None",
    subtitle="if not count fires on zero",
    difficulty="beginner",
    tags=["truthiness", "none", "conditionals"],
    code='''for value in (None, 0, "", [], 0.0, False, "0", [0]):
    print(repr(value), "falsy" if not value else "truthy",
          "| is None:", value is None)''',
    guesses=["Only None is falsy", "'0' and [0] are falsy too"],
    explanation=[
        "Truthiness is a property of the object, decided by <code>__bool__</code> or, failing that, <code>__len__</code>. Every empty container, every zero and <code>None</code> are all falsy, and Python gives you no way to tell them apart with a bare <code>if</code>.",
        "So <code>if not count:</code> catches a genuine count of zero, <code>if not name:</code> catches a deliberate empty string, and <code>if not items:</code> cannot distinguish \"no list\" from \"empty list\". Each of those is a different situation that usually wants different handling.",
        "Note the last two: <code>\"0\"</code> is a non-empty string and <code>[0]</code> is a non-empty list, so both are truthy. Truthiness never looks inside.",
    ],
    fix_note="Ask the question you mean. <code>is None</code> for absence, an explicit comparison for emptiness:",
    fix='''def describe(items=None):
    if items is None:
        return "not provided"
    if len(items) == 0:
        return "provided but empty"
    return f"{len(items)} items"

print(describe(), describe([]), describe([1, 2]))''',
    takeaway="`if x:` conflates missing, empty and zero. When those differ, say which one you mean.",
    refs=[("Python docs &mdash; truth value testing",
           "https://docs.python.org/3/library/stdtypes.html#truth-value-testing")],
),

dict(
    id="zip-stops-at-the-shortest",
    title="zip Stops At The Shortest",
    subtitle="silent data loss, one row at a time",
    difficulty="beginner",
    tags=["zip", "iteration", "data-loss"],
    code='''names = ["alice", "bob", "carol"]
scores = [90, 85]

print(list(zip(names, scores)))

try:
    print(list(zip(names, scores, strict=True)))
except ValueError as exc:
    print("ValueError:", exc)

from itertools import zip_longest
print(list(zip_longest(names, scores, fillvalue=0)))''',
    guesses=["An error by default", "carol paired with None"],
    explanation=[
        "<code>zip</code> stops as soon as any input is exhausted and discards the rest without a word. When the inputs are supposed to be parallel &mdash; names and scores, keys and values, timestamps and readings &mdash; a length mismatch is a bug, and <code>zip</code> turns it into quietly truncated output.",
        "Since Python 3.10 you can pass <code>strict=True</code> to make the mismatch raise. It is off by default for backwards compatibility, not because silence is the better answer.",
        "<code>itertools.zip_longest</code> covers the other case, where the inputs are genuinely ragged and you want padding.",
    ],
    fix_note="If the inputs must be the same length, say so:",
    fix='''names = ["alice", "bob", "carol"]
scores = [90, 85, 70]
print(list(zip(names, scores, strict=True)))''',
    takeaway="Default `zip` is only correct when a ragged input is acceptable. Otherwise pass `strict=True`.",
    refs=[("Python docs &mdash; zip",
           "https://docs.python.org/3/library/functions.html#zip"),
          ("PEP 618 &mdash; add optional length-checking to zip",
           "https://peps.python.org/pep-0618/")],
),

dict(
    id="chained-comparison-is-an-and",
    title="Chained Comparison Is Not What It Looks Like",
    subtitle="False == False in [False]",
    difficulty="beginner",
    tags=["operators", "comparisons", "syntax"],
    code='''print(1 < 2 < 3)
print((1 < 2) < 3)

print(False == False in [False])
print((False == False) in [False], False == (False in [False]))

calls = []
def side_effect():
    calls.append("called")
    return 2

print(1 < side_effect() < 3, calls)''',
    guesses=["False for the third line", "side_effect runs twice"],
    explanation=[
        "<code>a OP b OP c</code> expands to <code>a OP b and b OP c</code>, with <code>b</code> evaluated exactly once. That is why the middle call happens a single time, and why <code>1 < 2 < 3</code> is <code>True</code> while the explicitly parenthesised <code>(1 < 2) < 3</code> means <code>True < 3</code>, which is <code>1 < 3</code>.",
        "The catch is that <code>in</code>, <code>not in</code>, <code>is</code> and <code>is not</code> are comparison operators too, and they chain with the rest. <code>False == False in [False]</code> is <code>(False == False) and (False in [False])</code> &mdash; two true things and-ed together &mdash; and neither of the parenthesised readings gives the same answer.",
        "So an expression mixing <code>==</code> and <code>in</code> almost certainly does not mean what its author thought.",
    ],
    fix_note="Parenthesise the moment you mix comparison operators:",
    fix='''flag = False
print((flag == False) and (flag in [False]))
print(flag is False)''',
    takeaway="`in` and `is` chain like `<` does. Mixing them with `==` on one line is always a mistake.",
    refs=[("Python docs &mdash; comparisons",
           "https://docs.python.org/3/reference/expressions.html#comparisons")],
),

dict(
    id="dict-copy-is-shallow",
    title="dict(d) Is A Shallow Copy",
    subtitle="the nested value you forgot to clone",
    difficulty="beginner",
    tags=["dicts", "copying", "mutability"],
    code='''defaults = {"retries": 3, "tags": ["core"]}

config = dict(defaults)
config["retries"] = 5
config["tags"].append("extra")

print(defaults)
print(config)
print({**defaults} == defaults.copy() == dict(defaults))''',
    guesses=["defaults keeps ['core']", "defaults['retries'] becomes 5 too"],
    explanation=[
        "<code>dict(d)</code>, <code>d.copy()</code> and <code>{**d}</code> are all the same shallow copy: a new mapping holding the same value objects. Rebinding a key in the copy is invisible to the original, which is why <code>retries</code> behaves. Mutating a value through the copy is not, which is why <code>tags</code> does not.",
        "This bites hardest with a module-level defaults dict, because the corruption is permanent for the life of the process and shows up in a later, unrelated request.",
        "The same applies to <code>copy.copy</code>, and to <code>list(d.items())</code>.",
    ],
    fix_note="Deep-copy when the structure is nested, or build the mutable parts fresh each time:",
    fix='''import copy

defaults = {"retries": 3, "tags": ["core"]}
config = copy.deepcopy(defaults)
config["tags"].append("extra")
print(defaults, config)''',
    takeaway="Copying a dict protects the keys, never the values.",
    refs=[("Python docs &mdash; copy",
           "https://docs.python.org/3/library/copy.html")],
),

dict(
    id="class-attributes-are-shared",
    title="Class Attributes Are Shared",
    subtitle="every instance writing to the same list",
    difficulty="beginner",
    tags=["classes", "mutability", "state"],
    code='''class Basket:
    items = []
    count = 0

    def add(self, thing):
        self.items.append(thing)
        self.count += 1

a, b = Basket(), Basket()
a.add("apple")
b.add("banana")

print(a.items, b.items)
print(a.count, b.count)
print(Basket.items, Basket.count)''',
    guesses=["Each basket holds its own item", "count behaves like items"],
    explanation=[
        "<code>items</code> and <code>count</code> live on the class, and attribute lookup falls back to the class when the instance has nothing. Both instances therefore start out reading the same two objects.",
        "<code>self.items.append(...)</code> is a <em>read</em> followed by a mutation: it finds the class's list and appends to it, so both baskets see both fruits. <code>self.count += 1</code> is a read followed by an <em>assignment</em>, and assignment always targets the instance &mdash; so each object quietly grows its own <code>count</code> shadowing the class's, and the class attribute stays 0.",
        "The two attributes were written identically and behave completely differently, which is what makes this so hard to spot.",
    ],
    extra='''>>> class Basket:
...     items = []
...
>>> a = Basket()
>>> "items" in a.__dict__
False
>>> a.items = ["own"]
>>> "items" in a.__dict__
True''',
    fix_note="Per-instance state belongs in <code>__init__</code>. Keep class attributes for genuine constants:",
    fix='''class Basket:
    CAPACITY = 10

    def __init__(self):
        self.items = []
        self.count = 0

    def add(self, thing):
        self.items.append(thing)
        self.count += 1

a, b = Basket(), Basket()
a.add("apple")
b.add("banana")
print(a.items, b.items, a.count, b.count)''',
    takeaway="A mutable class attribute is global state. Mutating through `self` hits the class; assigning through `self` does not.",
    refs=[("Python docs &mdash; class and instance variables",
           "https://docs.python.org/3/tutorial/classes.html#class-and-instance-variables")],
),

# ===================== INTERMEDIATE =====================

dict(
    id="late-binding-closures",
    title="Late-Binding Closures",
    subtitle="every lambda agreed on the last value",
    difficulty="intermediate",
    tags=["closures", "lambdas", "comprehensions", "laziness"],
    question="What do these two prints produce?",
    code='''multipliers = [lambda x: i * x for i in range(4)]
print([m(2) for m in multipliers])

gen = (lambda x: i * x for i in range(4))
print([m(2) for m in gen])''',
    guesses=["[0, 2, 4, 6] for both", "[6, 6, 6, 6] for both"],
    explanation=[
        "A closure captures the <em>variable</em>, not the value it held when the closure was created. All four lambdas in the list comprehension close over the same cell for <code>i</code>. By the time you call any of them the comprehension has finished and that cell holds <code>3</code>, so every lambda computes <code>3 * 2</code>.",
        "The generator expression prints something different for a reason that has nothing to do with scoping: it is <strong>lazy</strong>. Each lambda is produced and immediately called by the outer comprehension, while <code>i</code> still holds its current value. Interleaving creation and call hides the bug; it does not fix it.",
        "Drain the generator into a list first and the bug comes straight back:",
    ],
    extra='''>>> gen = (lambda x: i * x for i in range(4))
>>> funcs = list(gen)
>>> [m(2) for m in funcs]
[6, 6, 6, 6]''',
    fix_note="Bind the value at definition time with a default argument, which is evaluated eagerly:",
    fix='''multipliers = [lambda x, i=i: i * x for i in range(4)]
print([m(2) for m in multipliers])

from functools import partial
import operator
multipliers = [partial(operator.mul, i) for i in range(4)]
print([m(2) for m in multipliers])''',
    takeaway="The same defect bites def-in-a-loop, nested functions and decorators. If a closure reads a loop variable, ask when it will be called.",
    refs=[("Python FAQ &mdash; why do lambdas defined in a loop with different values all return the same result?",
           "https://docs.python.org/3/faq/programming.html#why-do-lambdas-defined-in-a-loop-with-different-values-all-return-the-same-result")],
),

dict(
    id="loop-variable-outlives-the-loop",
    title="The Loop Variable Outlives The Loop",
    subtitle="i is still there when you are done with it",
    difficulty="intermediate",
    tags=["scope", "iteration", "comprehensions"],
    code='''for i in range(3):
    pass
print("after for:", i)

j = "untouched"
squares = [j for j in range(3)]
print("after comprehension:", j)

for k in []:
    pass
try:
    print(k)
except NameError as exc:
    print("NameError:", exc)''',
    guesses=["A NameError on the first print", "The comprehension overwrites j"],
    explanation=[
        "A <code>for</code> statement does not create a scope. It binds its target in the enclosing function or module namespace and leaves it there, holding the final value, which is why code after the loop can still read <code>i</code>.",
        "A comprehension <em>does</em> create a scope &mdash; an implicit function &mdash; so its loop variable is local to it and <code>j</code> outside is untouched. This changed in Python 3; in Python 2 comprehensions leaked too.",
        "The empty-iterable case shows the other half: the name is bound by the first iteration, so a loop that never runs leaves the name undefined. Code that reads the loop variable afterwards works right up until the input is empty.",
    ],
    fix_note="Initialise before the loop if you intend to read after it, and prefer a form that returns a value:",
    fix='''last = None
for last in []:
    pass
print("last:", last)

found = next((x for x in [] if x > 1), None)
print("found:", found)''',
    takeaway="`for` leaks its target and comprehensions do not. Reading a loop variable after the loop breaks on empty input.",
    refs=[("Python docs &mdash; the for statement",
           "https://docs.python.org/3/reference/compound_stmts.html#the-for-statement")],
),

dict(
    id="for-else",
    title="for ... else",
    subtitle="else means no break",
    difficulty="intermediate",
    tags=["control-flow", "iteration", "syntax"],
    code='''def find(haystack, needle):
    for item in haystack:
        if item == needle:
            print("found", needle)
            break
    else:
        print("no", needle)

find([1, 2, 3], 2)
find([1, 2, 3], 9)
find([], 9)

n = 0
while n < 3:
    n += 1
else:
    print("while-else ran, n =", n)''',
    guesses=["else runs when the loop body never executed", "else runs every time"],
    explanation=[
        "The <code>else</code> clause on a loop runs when the loop finished normally &mdash; that is, when it was <em>not</em> exited by <code>break</code>. It has nothing to do with whether the body ever ran, which is why the empty-list call still takes the <code>else</code> branch.",
        "The name is the problem. Everyone reads it as the <code>else</code> of an <code>if</code>. It would make instant sense if the keyword were <code>nobreak</code>, which is roughly what Guido has said he wishes it had been.",
        "It is genuinely useful for search loops: it removes the <code>found = False</code> flag that the pattern otherwise needs. It is also rare enough that many readers will misparse it, so a comment earns its place.",
    ],
    fix_note="If you would rather not rely on it, the explicit forms read the same:",
    fix='''def find(haystack, needle):
    if any(item == needle for item in haystack):
        print("found", needle)
    else:
        print("no", needle)

find([1, 2, 3], 2)
find([1, 2, 3], 9)''',
    takeaway="Loop `else` means \"the loop ran to completion without breaking\", not \"the loop did nothing\".",
    refs=[("Python docs &mdash; break, continue and else clauses on loops",
           "https://docs.python.org/3/tutorial/controlflow.html#break-and-continue-statements")],
),

dict(
    id="return-in-finally",
    title="return In finally Swallows The Exception",
    subtitle="the error that never made it out",
    difficulty="intermediate",
    tags=["exceptions", "control-flow", "finally"],
    code='''def swallow():
    try:
        raise ValueError("boom")
    finally:
        return "all fine"

print(swallow())

def which():
    try:
        return "from try"
    finally:
        return "from finally"

print(which())''',
    guesses=["A ValueError propagating out of swallow()", "'from try'"],
    explanation=[
        "<code>finally</code> runs on every exit path, and if it exits by itself &mdash; with <code>return</code>, <code>break</code> or <code>continue</code> &mdash; it discards whatever the block was already doing. A pending exception is dropped on the floor, and a pending return value is replaced.",
        "This is specified behaviour, not a bug, and it is almost never what the author wanted. The failure is total: no traceback, no log line, no non-zero exit code. A function that was supposed to fail loudly returns a cheerful string instead.",
        "CPython 3.14 finally warns about it. The <code>SyntaxWarning</code> in the output above is new &mdash; on 3.13 and earlier this code is silently accepted.",
    ],
    fix_note="Keep <code>finally</code> for cleanup only, and let control flow happen in <code>try</code> or <code>else</code>:",
    fix='''def honest():
    try:
        raise ValueError("boom")
    except ValueError as exc:
        return f"handled: {exc}"
    finally:
        print("cleanup still runs")

print(honest())''',
    takeaway="Nothing that transfers control belongs in a `finally` block.",
    refs=[("Python docs &mdash; the try statement",
           "https://docs.python.org/3/reference/compound_stmts.html#the-try-statement"),
          ("PEP 765 &mdash; disallow return/break/continue that exit a finally block",
           "https://peps.python.org/pep-0765/")],
),

dict(
    id="generator-exhausts-once",
    title="A Generator Is Empty The Second Time",
    subtitle="the data was there a moment ago",
    difficulty="intermediate",
    tags=["generators", "iteration", "laziness"],
    code='''rows = (n for n in range(4))

print("count:", sum(1 for _ in rows))
print("values:", list(rows))
print("max:", max(rows, default="nothing left"))

squares = [n * n for n in range(4)]
print(sum(squares), list(squares), max(squares))''',
    guesses=["4, then [0, 1, 2, 3]", "An error on the second read"],
    explanation=[
        "A generator is an iterator: it has a position, and consuming it moves that position forward permanently. Once it reaches the end it stays there and every further read yields nothing. It does not reset, and it cannot be rewound.",
        "So the first aggregate wins and every one after it silently sees an empty sequence. <code>sum</code> returns 0, <code>list</code> returns <code>[]</code>, <code>max</code> raises <code>ValueError</code> unless you gave it a default. None of that says \"you already consumed this\".",
        "The list comprehension on the last line is a sequence, not an iterator, so all three aggregates see all four values.",
    ],
    fix_note="Materialise once if you need more than one pass, or build a fresh generator per pass:",
    fix='''rows = list(n for n in range(4))
print(sum(rows), len(rows), max(rows))

def make_rows():
    return (n for n in range(4))

print(sum(make_rows()), max(make_rows()))''',
    takeaway="Any function that walks an iterable consumes it. Two aggregates over one generator means the second gets nothing.",
    refs=[("Python docs &mdash; generator-iterator methods",
           "https://docs.python.org/3/reference/expressions.html#generator-iterator-methods")],
),

dict(
    id="generators-defer-side-effects",
    title="Generators Defer Their Side Effects",
    subtitle="the function ran, the body did not",
    difficulty="intermediate",
    tags=["generators", "laziness", "exceptions"],
    code='''def load(path):
    print("opening", path)
    if not path:
        raise ValueError("empty path")
    yield 1
    yield 2

print("calling load")
rows = load("")
print("call returned, nothing printed yet")

try:
    print(next(rows))
except ValueError as exc:
    print("ValueError arrived late:", exc)''',
    guesses=["The ValueError is raised by the call to load", "'opening ' prints immediately"],
    explanation=[
        "Calling a generator function does not run its body. It builds a generator object and returns immediately. Nothing inside &mdash; not the <code>print</code>, not the validation, not the <code>open</code> &mdash; happens until something asks for the first value.",
        "That moves your errors. Argument validation written at the top of a generator fires at the first <code>next()</code>, which may be in a completely different function, inside a <code>try</code> that was not written to expect it, or never, if nobody iterates.",
        "The same delay applies to resources. A generator that opens a file at the top has not opened it yet.",
    ],
    fix_note="Split the eager part from the lazy part: a plain function that validates, returning an inner generator:",
    fix='''def load(path):
    if not path:
        raise ValueError("empty path")

    def rows():
        print("opening", path)
        yield 1
        yield 2

    return rows()

try:
    load("")
except ValueError as exc:
    print("raised at call time:", exc)''',
    takeaway="A generator function's body runs at `next()`, not at the call. Validation belongs in a non-generator wrapper.",
    refs=[("Python docs &mdash; yield expressions",
           "https://docs.python.org/3/reference/expressions.html#yield-expressions")],
),

dict(
    id="dict-views-are-live",
    title="Dict Views Are Live",
    subtitle="the keys you captured keep changing",
    difficulty="intermediate",
    tags=["dicts", "views", "iteration"],
    code='''d = {"a": 1}
keys = d.keys()
values = d.values()

d["b"] = 2
print(keys, values)
print(len(keys), "b" in keys)

print(d.keys() & {"a", "z"})

try:
    for k in keys:
        d[k + "!"] = 0
except RuntimeError as exc:
    print("RuntimeError:", exc)''',
    guesses=["dict_keys(['a']) &mdash; a snapshot from before the insert", "keys is a list"],
    explanation=[
        "<code>keys()</code>, <code>values()</code> and <code>items()</code> return <em>views</em>: thin objects that read the dict on demand. They are not copies, so a view captured before an insert reflects the insert afterwards.",
        "Views are cheap and they support set operations directly &mdash; <code>d.keys() &amp; other</code> is an intersection &mdash; which is why they exist. In Python 2 these methods returned real lists and people wrote <code>iterkeys()</code> to avoid the copy.",
        "The live-ness means a view is not a safe thing to iterate while mutating, exactly like the dict itself.",
    ],
    fix_note="Call <code>list()</code> when you want a snapshot that will not move under you:",
    fix='''d = {"a": 1}
keys = list(d.keys())
d["b"] = 2
print(keys)

for k in list(d):
    d[k + "!"] = 0
print(sorted(d))''',
    takeaway="A dict view is a window, not a photograph. `list()` takes the photograph.",
    refs=[("Python docs &mdash; dictionary view objects",
           "https://docs.python.org/3/library/stdtypes.html#dictionary-view-objects")],
),

dict(
    id="setdefault-always-evaluates",
    title="setdefault Always Evaluates Its Default",
    subtitle="the cache that calls the thing it is caching",
    difficulty="intermediate",
    tags=["dicts", "evaluation-order", "performance"],
    code='''calls = []

def expensive(name):
    calls.append(name)
    return f"computed-{name}"

cache = {"a": "cached-a"}

print(cache.setdefault("a", expensive("a")))
print(cache.get("a", expensive("a")))
print("expensive was called:", calls)''',
    guesses=["expensive is never called", "calls == ['a'] &mdash; once"],
    explanation=[
        "<code>setdefault</code> and <code>get</code> are ordinary methods, so their arguments are evaluated before the call happens. Python has no lazy argument evaluation and no way for a method to opt into it.",
        "So the default is computed every single time, hit or miss, and then thrown away on a hit. If it is a function call you have destroyed the point of the cache; if it has side effects &mdash; a network request, a counter increment, an insert &mdash; they happen on every lookup.",
        "The mistake is invisible when the default is a literal, which is how it survives: <code>d.setdefault(k, [])</code> only wastes an empty list.",
    ],
    fix_note="Test membership first, or use <code>defaultdict</code> / <code>functools.cache</code> when the default is real work:",
    fix='''calls = []

def expensive(name):
    calls.append(name)
    return f"computed-{name}"

cache = {"a": "cached-a"}
if "a" not in cache:
    cache["a"] = expensive("a")
print(cache["a"], "calls:", calls)''',
    takeaway="`d.get(k, f())` and `d.setdefault(k, f())` always call `f`. Only the literal-default form is free.",
    refs=[("Python docs &mdash; dict.setdefault",
           "https://docs.python.org/3/library/stdtypes.html#dict.setdefault")],
),

dict(
    id="defaultdict-inserts-on-read",
    title="defaultdict Inserts On Read",
    subtitle="looking is writing",
    difficulty="intermediate",
    tags=["dicts", "defaultdict", "collections"],
    code='''from collections import defaultdict

counts = defaultdict(int)
counts["a"] += 1

print("b" in counts)
print(counts["b"])
print("b" in counts)
print(dict(counts), len(counts))

print(counts.get("c"), "c" in counts)''',
    guesses=["'b' in counts stays False", "len is 1 at the end"],
    explanation=[
        "<code>defaultdict.__missing__</code> does two things: it calls the factory <em>and</em> stores the result under the key. So a plain read of a key that is not there is a mutation, and the dict grows.",
        "That is the entire point when you are accumulating &mdash; <code>counts[k] += 1</code> works because the read half inserts a zero first &mdash; but it makes a <code>defaultdict</code> dangerous to inspect. Printing it during debugging changes it. So does an <code>if d[k]:</code> check.",
        "<code>get</code> is the exception: it never goes through <code>__missing__</code>, so it returns <code>None</code> and inserts nothing.",
    ],
    fix_note="Use <code>get</code> or <code>in</code> to inspect, and convert to a plain dict when you are done accumulating:",
    fix='''from collections import defaultdict

counts = defaultdict(int)
counts["a"] += 1
print(counts.get("b", 0), "b" in counts)

counts = dict(counts)
print(counts)''',
    takeaway="Reading an absent key from a `defaultdict` creates it. Use `.get()` when you only want to look.",
    refs=[("Python docs &mdash; defaultdict",
           "https://docs.python.org/3/library/collections.html#collections.defaultdict")],
),

dict(
    id="fromkeys-shares-the-value",
    title="dict.fromkeys(keys, [])",
    subtitle="one list handed to every key",
    difficulty="intermediate",
    tags=["dicts", "mutability", "aliasing"],
    code='''groups = dict.fromkeys(["a", "b", "c"], [])
groups["a"].append(1)
print(groups)

print(groups["a"] is groups["b"])

ok = {k: [] for k in ["a", "b", "c"]}
ok["a"].append(1)
print(ok)''',
    guesses=["{'a': [1], 'b': [], 'c': []}", "fromkeys copies the default"],
    explanation=[
        "<code>fromkeys</code> takes a single value object and binds every key to it. It does not call it, and it does not copy it &mdash; it cannot, because it has no idea how.",
        "This is <code>[[0] * 3] * 3</code> in mapping form. With an immutable default like <code>0</code> or <code>None</code> it is perfectly safe, which is the form everyone has seen, so the mutable case sails through review.",
        "The dict comprehension on the last line evaluates <code>[]</code> once per key, which is what you wanted.",
    ],
    fix_note="Use a dict comprehension, or a <code>defaultdict</code> when the keys are not known up front:",
    fix='''from collections import defaultdict

groups = {k: [] for k in ["a", "b", "c"]}
groups["a"].append(1)
print(groups)

groups = defaultdict(list)
groups["a"].append(1)
print(dict(groups))''',
    takeaway="`fromkeys` shares one value. Safe for `None` and `0`, never for a container.",
    refs=[("Python docs &mdash; dict.fromkeys",
           "https://docs.python.org/3/library/stdtypes.html#dict.fromkeys")],
),

dict(
    id="counter-arithmetic-drops-negatives",
    title="Counter Arithmetic Drops Zeros And Negatives",
    subtitle="the difference that hides the differences",
    difficulty="intermediate",
    tags=["collections", "counter", "arithmetic"],
    code='''from collections import Counter

have = Counter(a=1, b=2)
want = Counter(a=3, b=2, c=1)

print(want - have)
print(have - want)
print(have.subtract(want) or have)''',
    guesses=["Counter({'a': 2, 'b': 0, 'c': 1}) for the first line",
             "have - want shows negative counts"],
    explanation=[
        "The <code>+</code>, <code>-</code>, <code>&amp;</code> and <code>|</code> operators on a <code>Counter</code> are <em>multiset</em> operations, and a multiset cannot hold an element a negative number of times. Every result is filtered to keep only positive counts.",
        "So <code>want - have</code> silently drops <code>b</code> (difference zero) and would drop anything you are over-supplied on. Using it to answer \"what is the delta?\" gives you half the answer, and the half it gives you looks complete.",
        "<code>Counter.subtract</code> is the one that keeps the sign. It mutates in place and returns <code>None</code>, which is why the last line prints <code>have</code> rather than the call's result.",
    ],
    fix_note="Use <code>subtract</code> when you want a true delta, and read it off a copy so you do not clobber the original:",
    fix='''from collections import Counter

have = Counter(a=1, b=2)
want = Counter(a=3, b=2, c=1)

delta = Counter(want)
delta.subtract(have)
print(dict(delta))
print({k: v for k, v in delta.items() if v})''',
    takeaway="`Counter` operators are multiset algebra, not arithmetic. `subtract` is arithmetic.",
    refs=[("Python docs &mdash; Counter",
           "https://docs.python.org/3/library/collections.html#collections.Counter")],
),

dict(
    id="all-of-empty-is-true",
    title="all([]) Is True",
    subtitle="the validator that passes on no data",
    difficulty="intermediate",
    tags=["builtins", "logic", "validation"],
    code='''print(all([]), any([]))

def all_valid(records):
    return all(r["ok"] for r in records)

print(all_valid([{"ok": True}, {"ok": True}]))
print(all_valid([{"ok": True}, {"ok": False}]))
print(all_valid([]))''',
    guesses=["all([]) is False", "all_valid([]) raises"],
    explanation=[
        "<code>all</code> asks whether any element is falsy and reports back. With no elements there is nothing falsy, so the answer is <code>True</code>. <code>any</code> is the mirror image: nothing truthy, so <code>False</code>. This is vacuous truth, and it is the only definition that keeps <code>all(a + b) == (all(a) and all(b))</code> true.",
        "It is also how an empty input passes every check you wrote. A parser that silently returns no records, a filter that matched nothing, a file that failed to load &mdash; each of them turns your validation gate into a no-op, and the pipeline downstream sees a green light.",
        "The bug is invisible in tests, because tests supply data.",
    ],
    fix_note="Decide explicitly whether empty is acceptable, and say so:",
    fix='''def all_valid(records):
    records = list(records)
    if not records:
        raise ValueError("no records to validate")
    return all(r["ok"] for r in records)

try:
    all_valid([])
except ValueError as exc:
    print("ValueError:", exc)''',
    takeaway="`all()` over an empty iterable is True. If empty input is suspicious, check for it separately.",
    refs=[("Python docs &mdash; all",
           "https://docs.python.org/3/library/functions.html#all")],
),

dict(
    id="any-short-circuits",
    title="any Short-Circuits Over A Generator",
    subtitle="the side effects that stopped halfway",
    difficulty="intermediate",
    tags=["builtins", "generators", "laziness", "side-effects"],
    code='''checked = []

def check(n):
    checked.append(n)
    return n > 2

print(any(check(n) for n in range(6)), checked)

checked.clear()
print(any([check(n) for n in range(6)]), checked)''',
    guesses=["Both lines check all six", "The first line checks none"],
    explanation=[
        "<code>any</code> stops at the first truthy element and never pulls another value. Paired with a generator expression, that means the side effects inside only happen up to the first match &mdash; here <code>check</code> runs four times, not six.",
        "Swap the generator for a list comprehension and the brackets change everything: the list is fully built <em>before</em> <code>any</code> is called, so all six run and the short-circuit saves nothing.",
        "Short-circuiting is the reason to use <code>any</code>, so this is usually a feature. It is a bug when the predicate was doing the real work &mdash; logging failures, collecting errors, writing a row &mdash; and you assumed it would see everything.",
    ],
    fix_note="If you need every element visited, do the visiting first and test afterwards:",
    fix='''checked = []

def check(n):
    checked.append(n)
    return n > 2

results = [check(n) for n in range(6)]
print(any(results), checked)''',
    takeaway="`any`/`all` over a generator visit only as far as they must. Over a list, the list already visited everything.",
    refs=[("Python docs &mdash; any",
           "https://docs.python.org/3/library/functions.html#any")],
),

dict(
    id="min-max-return-the-first-tie",
    title="min/max Return The First Tie",
    subtitle="the winner depends on insertion order",
    difficulty="intermediate",
    tags=["builtins", "sorting", "determinism"],
    code='''votes = {"alice": 3, "bob": 3, "carol": 1}
print(max(votes, key=votes.get))

votes2 = {"bob": 3, "alice": 3, "carol": 1}
print(max(votes2, key=votes2.get))

pairs = [("a", 1), ("b", 1)]
print(min(pairs, key=lambda t: t[1]), max(pairs, key=lambda t: t[1]))''',
    guesses=["The same winner both times", "An error on the tie"],
    explanation=[
        "<code>max</code> keeps the first element with the maximal key and only replaces it on a strictly greater one. <code>min</code> does the same with strictly less. So on a tie you get whichever candidate the iterable produced first.",
        "For a dict that is insertion order, which is stable but is almost never the order you reasoned about. Rebuild the dict from a differently ordered source &mdash; a different JSON payload, a different query plan, a set that got iterated &mdash; and the answer changes with no code change.",
        "This is one of the classic sources of \"it works locally, it picks a different value in production\".",
    ],
    fix_note="Break the tie explicitly by making the key total:",
    fix='''votes = {"bob": 3, "alice": 3, "carol": 1}
print(max(votes, key=lambda name: (votes[name], name)))

winners = [n for n, v in votes.items() if v == max(votes.values())]
print(sorted(winners))''',
    takeaway="If ties are possible and the choice matters, put the tiebreaker in the key.",
    refs=[("Python docs &mdash; max",
           "https://docs.python.org/3/library/functions.html#max")],
),

dict(
    id="sorted-on-mixed-types",
    title="sorted On Mixed Types",
    subtitle="Python 2 answered, Python 3 refuses",
    difficulty="intermediate",
    tags=["sorting", "comparisons", "errors"],
    code='''try:
    print(sorted([3, "1", 2]))
except TypeError as exc:
    print("TypeError:", exc)

print(sorted([3, True, 2.5]))

try:
    print(sorted([None, 1]))
except TypeError as exc:
    print("TypeError:", exc)

print(sorted([3, "1", 2], key=str))''',
    guesses=["All four lines raise", "[True, 2.5, 3] raises too"],
    explanation=[
        "Python 3 removed the universal ordering that Python 2 had. <code>&lt;</code> between unrelated types is now a <code>TypeError</code> rather than an arbitrary but consistent answer based on type name and address.",
        "Numbers are the exception, because <code>int</code>, <code>float</code> and <code>bool</code> form one numeric tower and genuinely compare. <code>None</code> does not compare with anything, which is why a column with a single missing value blows up a sort that worked on every other row.",
        "Supplying <code>key=str</code> makes it sort, but it sorts the string forms &mdash; <code>\"10\"</code> before <code>\"9\"</code> &mdash; so it fixes the traceback rather than the problem.",
    ],
    fix_note="Normalise the type first, and give missing values an explicit place:",
    fix='''rows = [3, None, 2, None, 1]
print(sorted(rows, key=lambda v: (v is None, v)))

mixed = [3, "1", 2]
print(sorted(int(v) for v in mixed))''',
    takeaway="A sort that meets its first `None` fails at runtime, in production, on real data.",
    refs=[("Python docs &mdash; value comparisons",
           "https://docs.python.org/3/reference/expressions.html#value-comparisons")],
),

dict(
    id="nan-breaks-sorting",
    title="NaN Breaks Sorting And Equality",
    subtitle="a value that is not equal to itself",
    difficulty="intermediate",
    tags=["floats", "nan", "sorting", "comparisons"],
    code='''nan = float("nan")

print(nan == nan, nan < 1, nan > 1)

print(sorted([3, 1, nan, 2]))
print(sorted([3, 1, 2, nan]))
print(max([1, nan, 3]), max([nan, 1, 3]))''',
    guesses=["A ValueError from sorted", "The same sorted result both times"],
    explanation=[
        "IEEE-754 says every comparison involving NaN is false, including equality with itself. Python implements that faithfully, so NaN is not merely unordered against other floats &mdash; it actively lies to any algorithm that assumes comparison is a total order.",
        "Timsort assumes exactly that. It does not raise; it just produces a list whose order depends on where the NaN happened to start, and the result is neither sorted nor stable in any useful sense.",
        "<code>max</code> is worse, because it is a single scan: a NaN early in the list poisons every subsequent comparison and the first element wins, while a NaN later on is simply ignored.",
    ],
    fix_note="Filter NaN out, or sort it to a known end with a key:",
    fix='''import math
nan = float("nan")
values = [3, 1, nan, 2]

print(sorted(v for v in values if not math.isnan(v)))
print(sorted(values, key=lambda v: (math.isnan(v), v)))''',
    takeaway="NaN is not a number that sorts badly. It is a value for which comparison is meaningless, and sorting silently gives up.",
    refs=[("Python docs &mdash; math.isnan",
           "https://docs.python.org/3/library/math.html#math.isnan"),
          ("Python docs &mdash; value comparisons",
           "https://docs.python.org/3/reference/expressions.html#value-comparisons")],
),

dict(
    id="nan-in-a-list",
    title="But nan in [nan] Is True",
    subtitle="containment checks identity first",
    difficulty="intermediate",
    tags=["nan", "operators", "identity", "containment"],
    code='''nan = float("nan")

print(nan == nan)
print(nan in [nan])
print(float("nan") in [float("nan")])

print([nan].count(nan), [nan].index(nan))
print(nan in {nan})

d = {nan: "stored"}
print(d[nan])''',
    guesses=["False on every line", "True only for the set"],
    explanation=[
        "<code>x in seq</code> is not defined as \"some element equals x\". It is defined as \"some element satisfies <code>e is x or e == x</code>\". The identity check comes first, as a shortcut that is normally just an optimisation.",
        "For NaN it is not an optimisation, it is the whole answer. The <em>same</em> NaN object is found because identity succeeds where equality never would. Two <em>different</em> NaN objects are not found, because then it falls through to <code>==</code> and gets <code>False</code>.",
        "So containment depends on object identity in a way that equality does not, and the same applies to <code>list.index</code>, <code>list.count</code>, <code>remove</code>, and dict and set lookup.",
    ],
    fix_note="Never rely on finding a NaN. Test for it directly:",
    fix='''import math
nan = float("nan")
values = [1.0, nan, 3.0]
print(any(math.isnan(v) for v in values))
print([i for i, v in enumerate(values) if math.isnan(v)])''',
    takeaway="`in` short-circuits on identity, so a container can find an object that is not equal to itself.",
    refs=[("Python docs &mdash; membership test operations",
           "https://docs.python.org/3/reference/expressions.html#membership-test-operations")],
),

dict(
    id="eq-without-hash",
    title="__eq__ Without __hash__",
    subtitle="defining one removes the other",
    difficulty="intermediate",
    tags=["classes", "hashing", "equality", "dunder"],
    code='''class Point:
    def __init__(self, x):
        self.x = x

    def __eq__(self, other):
        return isinstance(other, Point) and self.x == other.x

p = Point(1)
print(p == Point(1))
print(Point.__hash__)

try:
    {p}
except TypeError as exc:
    print("TypeError:", exc)

class Plain:
    pass

print(len({Plain(), Plain()}))''',
    guesses=["The set works fine", "A TypeError on the == comparison"],
    explanation=[
        "Python requires that equal objects hash equally. If you define <code>__eq__</code> and inherit the default identity-based <code>__hash__</code>, two equal objects would land in different buckets and your dict would hold duplicates.",
        "Rather than let that happen, defining <code>__eq__</code> in a class sets <code>__hash__</code> to <code>None</code>, which makes instances unhashable. The class stops working in sets and as dict keys, and the error appears wherever it is first used that way &mdash; typically far from the class definition.",
        "A class with no <code>__eq__</code> keeps the default: equality is identity and the hash is derived from it, so two distinct <code>Plain()</code> objects are two distinct set members.",
    ],
    fix_note="Define <code>__hash__</code> alongside <code>__eq__</code> over the same fields, or let <code>dataclass(frozen=True)</code> do it:",
    fix='''from dataclasses import dataclass

class Point:
    def __init__(self, x):
        self.x = x
    def __eq__(self, other):
        return isinstance(other, Point) and self.x == other.x
    def __hash__(self):
        return hash(self.x)

print(len({Point(1), Point(1)}))

@dataclass(frozen=True)
class FrozenPoint:
    x: int

print(len({FrozenPoint(1), FrozenPoint(1)}))''',
    takeaway="`__eq__` and `__hash__` are a pair. Define one and you have silently unset the other.",
    refs=[("Python docs &mdash; object.__hash__",
           "https://docs.python.org/3/reference/datamodel.html#object.__hash__")],
),

dict(
    id="unbound-local-error",
    title="UnboundLocalError From x += 1",
    subtitle="one assignment makes the name local everywhere",
    difficulty="intermediate",
    tags=["scope", "errors", "compiler"],
    code='''total = 0

def broken():
    try:
        total += 1
    except UnboundLocalError as exc:
        print("UnboundLocalError:", exc)

broken()

def also_broken():
    try:
        print(total)
        value = total
    except UnboundLocalError as exc:
        print("UnboundLocalError:", exc)
    total = 1

also_broken()

def fine():
    print("read-only access:", total)

fine()''',
    guesses=["The second function prints 0 and then assigns", "Only the += version fails"],
    explanation=[
        "Whether a name is local is decided at compile time, for the whole function, by looking for any assignment to it anywhere in the body. One <code>total = 1</code> on the last line of a function makes <code>total</code> local on the first line too.",
        "So <code>total += 1</code> is a read of a local that has not been assigned yet, and the read on the line <em>before</em> the assignment fails identically. There is no partial scoping and no \"global until first assigned\" rule.",
        "A function that only reads the name has no assignment, so it stays global and works &mdash; which is why adding one innocent assignment can break lines far above it.",
    ],
    fix_note="Declare the intent, or better, stop mutating module state and pass the value:",
    fix='''total = 0

def with_global():
    global total
    total += 1

with_global()
print(total)

def pure(current):
    return current + 1

print(pure(total))''',
    takeaway="Assigning a name anywhere in a function makes it local throughout. The error appears at the read, not the write.",
    refs=[("Python FAQ &mdash; what are the rules for local and global variables?",
           "https://docs.python.org/3/faq/programming.html#what-are-the-rules-for-local-and-global-variables-in-python")],
),

dict(
    id="global-versus-nonlocal",
    title="global vs nonlocal",
    subtitle="two keywords, two different namespaces",
    difficulty="intermediate",
    tags=["scope", "closures", "keywords"],
    code='''counter = "module"

def outer():
    counter = "outer"

    def shadows():
        counter = "inner"

    def writes_enclosing():
        nonlocal counter
        counter = "changed by nonlocal"

    def writes_module():
        global counter
        counter = "changed by global"

    shadows()
    print("after shadows:", counter)
    writes_enclosing()
    print("after nonlocal:", counter)
    writes_module()
    print("outer still:", counter)

outer()
print("module now:", counter)''',
    guesses=["nonlocal and global do the same thing here",
             "shadows() changes outer's counter"],
    explanation=[
        "<code>global</code> binds in the module namespace. <code>nonlocal</code> binds in the nearest enclosing <em>function</em> scope that already has the name &mdash; it never reaches the module, and it is a <code>SyntaxError</code> if no enclosing function defines the name.",
        "With no declaration at all, an assignment creates a fresh local that shadows both, which is what <code>shadows()</code> does: it changes nothing anyone else can see.",
        "The three functions differ by one line and write to three different variables. That is the whole difficulty &mdash; nothing in the assignment itself tells you which namespace you are hitting.",
    ],
    extra='''>>> def f():
...     nonlocal missing
...
Traceback (most recent call last):
SyntaxError: no binding for nonlocal 'missing' found''',
    fix_note="Prefer returning values to mutating enclosing state. Where you do need a shared counter, a mutable container needs no declaration at all:",
    fix='''def make_counter():
    state = {"n": 0}

    def bump():
        state["n"] += 1
        return state["n"]

    return bump

bump = make_counter()
print(bump(), bump())''',
    takeaway="`nonlocal` reaches one scope out; `global` jumps all the way to the module. Neither creates the name.",
    refs=[("Python docs &mdash; the nonlocal statement",
           "https://docs.python.org/3/reference/simple_stmts.html#the-nonlocal-statement")],
),

dict(
    id="except-as-deletes-the-name",
    title="except E as e Deletes e",
    subtitle="the exception you saved for later is gone",
    difficulty="intermediate",
    tags=["exceptions", "scope"],
    code='''saved = "before"
try:
    raise ValueError("boom")
except ValueError as saved:
    print("inside:", saved)

try:
    print("after:", saved)
except NameError as exc:
    print("NameError:", exc)

def capture():
    problem = None
    try:
        raise ValueError("boom")
    except ValueError as exc:
        problem = exc
    return problem

print("kept:", repr(capture()))''',
    guesses=["'after: boom'", "'after: before' &mdash; the old value comes back"],
    explanation=[
        "At the end of an <code>except ... as name</code> block Python runs the equivalent of <code>del name</code>. Not restore, not leave alone &mdash; delete. If the name existed beforehand it is gone too, which is why <code>saved</code> does not revert to <code>\"before\"</code>.",
        "The reason is memory. A caught exception holds a traceback, the traceback holds every frame, and every frame holds its locals &mdash; including the exception. Left bound, that cycle keeps whole call stacks alive. Python 3 broke the cycle by unbinding the name.",
        "So anything you want after the block has to be copied out to a different name first, as <code>capture</code> does.",
    ],
    fix_note="Assign to a separate variable inside the handler, or re-raise and let the caller deal with it:",
    fix='''def capture():
    try:
        raise ValueError("boom")
    except ValueError as exc:
        problem = exc
    return problem

print(repr(capture()))''',
    takeaway="The `as` name is scoped to the handler and deleted on exit, even if it shadowed something.",
    refs=[("Python docs &mdash; the try statement",
           "https://docs.python.org/3/reference/compound_stmts.html#the-try-statement"),
          ("PEP 3110 &mdash; catching exceptions in Python 3000",
           "https://peps.python.org/pep-3110/")],
),

dict(
    id="bare-except-catches-everything",
    title="Bare except: Catches Ctrl-C",
    subtitle="the handler that will not let you quit",
    difficulty="intermediate",
    tags=["exceptions", "control-flow", "operations"],
    code='''def retry_forever():
    for attempt in range(3):
        try:
            raise KeyboardInterrupt("user pressed ctrl-c")
        except:
            print("attempt", attempt, "- swallowed, retrying")

retry_forever()

try:
    raise SystemExit(1)
except Exception:
    print("not reached")
except BaseException as exc:
    print("SystemExit is a BaseException:", repr(exc))

print(KeyboardInterrupt.__mro__)''',
    guesses=["The KeyboardInterrupt escapes the loop", "SystemExit is caught by except Exception"],
    explanation=[
        "<code>KeyboardInterrupt</code>, <code>SystemExit</code> and <code>GeneratorExit</code> deliberately inherit from <code>BaseException</code> rather than <code>Exception</code>, precisely so that ordinary error handling does not catch them. They are control flow, not errors.",
        "A bare <code>except:</code> is <code>except BaseException:</code>, so it catches all three. Put one inside a retry loop and Ctrl-C becomes a message the loop shrugs off &mdash; the process becomes unkillable by normal means, which is exactly when you most want to kill it.",
        "It also swallows <code>SystemExit</code>, so <code>sys.exit()</code> stops exiting, and your exit code becomes 0 no matter what happened.",
    ],
    fix_note="Catch <code>Exception</code> when you mean \"any error\", and name the specific type when you know it:",
    fix='''import sys

def retry(attempts=3):
    for attempt in range(attempts):
        try:
            raise ValueError("transient")
        except Exception as exc:
            print("attempt", attempt, "failed:", exc)
    return None

retry()
print("Ctrl-C and sys.exit still work", file=sys.stderr)''',
    takeaway="`except:` and `except BaseException:` are the same thing, and neither belongs in application code.",
    refs=[("Python docs &mdash; exception hierarchy",
           "https://docs.python.org/3/library/exceptions.html#exception-hierarchy")],
),

dict(
    id="decorator-without-wraps",
    title="Decorators Without functools.wraps",
    subtitle="your function lost its name",
    difficulty="intermediate",
    tags=["decorators", "introspection", "metadata"],
    code='''import functools, inspect

def plain(fn):
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper

def wrapped(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper

@plain
def alpha(a, b=2):
    """Add two numbers."""
    return a + b

@wrapped
def beta(a, b=2):
    """Add two numbers."""
    return a + b

for f in (alpha, beta):
    print(f.__name__, repr(f.__doc__), str(inspect.signature(f)))''',
    guesses=["Both report alpha/beta correctly", "plain raises"],
    explanation=[
        "A decorator returns a different function object. Unless you copy the metadata across, that object carries the wrapper's identity: its <code>__name__</code>, its empty docstring, and its <code>(*args, **kwargs)</code> signature.",
        "Everything that introspects suffers. Tracebacks name <code>wrapper</code>, logging shows <code>wrapper</code>, <code>help()</code> is blank, <code>inspect.signature</code> is useless, and test frameworks that collect by name see every decorated test as the same function.",
        "<code>functools.wraps</code> copies <code>__name__</code>, <code>__doc__</code>, <code>__module__</code>, <code>__qualname__</code>, <code>__dict__</code> and sets <code>__wrapped__</code>, which is what lets <code>inspect.signature</code> see through to the original.",
    ],
    fix_note="Always apply <code>@functools.wraps(fn)</code> to the wrapper. There is no case where you want the wrapper's own metadata:",
    fix='''import functools

def log_calls(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        print("calling", fn.__name__)
        return fn(*args, **kwargs)
    return wrapper

@log_calls
def add(a, b):
    """Add two numbers."""
    return a + b

print(add(1, 2), add.__name__, add.__doc__)''',
    takeaway="An undecorated decorator makes every function it touches anonymous.",
    refs=[("Python docs &mdash; functools.wraps",
           "https://docs.python.org/3/library/functools.html#functools.wraps")],
),

dict(
    id="decorator-stacking-order",
    title="Decorator Stacking Order",
    subtitle="bottom-up to build, top-down to call",
    difficulty="intermediate",
    tags=["decorators", "order", "functions"],
    code='''def tag(name):
    def deco(fn):
        print("applying", name)
        def wrapper(*a, **k):
            print("entering", name)
            result = fn(*a, **k)
            print("leaving", name)
            return result
        return wrapper
    return deco

@tag("outer")
@tag("inner")
def work():
    print("working")

print("--- defined, now calling ---")
work()''',
    guesses=["applying outer, then applying inner", "entering inner, then entering outer"],
    explanation=[
        "Stacked decorators are applied bottom-up. <code>@outer</code> above <code>@inner</code> desugars to <code>work = outer(inner(work))</code>, so <code>inner</code> runs first and <code>outer</code> wraps its result.",
        "At call time the order inverts, because the outermost wrapper is the one you are actually calling. It enters first, delegates inward, and leaves last.",
        "This matters whenever the decorators are not commutative. <code>@app.route</code> must be outermost to register the fully-decorated function; <code>@staticmethod</code> must be outermost because the thing below it has to still be a plain function; a cache placed above a retry caches the retrying, while below it caches each attempt.",
    ],
    fix_note="Nothing to fix &mdash; just read the stack as nested calls. Written out, the order is obvious:",
    fix='''def tag(name):
    def deco(fn):
        def wrapper(*a, **k):
            print("entering", name)
            return fn(*a, **k)
        return wrapper
    return deco

def work():
    print("working")

work = tag("outer")(tag("inner")(work))
work()''',
    takeaway="Applied bottom-up, executed top-down. When order matters, write the nesting out and check.",
    refs=[("Python docs &mdash; function definitions",
           "https://docs.python.org/3/reference/compound_stmts.html#function-definitions")],
),

dict(
    id="decorators-run-at-import",
    title="Decorators Run At Import Time",
    subtitle="the registry that filled itself before main()",
    difficulty="intermediate",
    tags=["decorators", "imports", "side-effects"],
    code='''REGISTRY = {}

def register(fn):
    print("registering", fn.__name__)
    REGISTRY[fn.__name__] = fn
    return fn

print("module body starts")

@register
def alpha():
    return "a"

@register
def beta():
    return "b"

print("module body ends, registry =", sorted(REGISTRY))

def main():
    print("main() runs now")

if __name__ == "__main__":
    main()''',
    guesses=["registering happens when alpha is first called",
             "The registry is empty until main()"],
    explanation=[
        "A decorator is applied when the <code>def</code> statement executes, which for a module-level function is while the module is being imported. Whatever the decorator does &mdash; register, connect, validate, patch, read config &mdash; happens then, before any of your own startup code.",
        "This is the mechanism behind route tables, plugin registries, signal handlers and <code>pytest</code> collection, and it is genuinely useful. It also means importing a module is never free, and that import order determines registration order.",
        "The trap is a decorator that needs something not yet set up: a database connection, an environment variable read in <code>main()</code>, a logging config. It will fail at import, with a traceback that points at a <code>def</code> line.",
    ],
    fix_note="Keep import-time decorators to pure bookkeeping, and defer the real work to first call:",
    fix='''REGISTRY = {}

def register(fn):
    REGISTRY[fn.__name__] = fn
    return fn

@register
def alpha():
    return "a"

def main():
    print("resolved at call time:", REGISTRY["alpha"]())

main()''',
    takeaway="Decorating is not lazy. If a decorator needs configuration, the module cannot be imported before that configuration exists.",
    refs=[("Python docs &mdash; the import system",
           "https://docs.python.org/3/reference/import.html")],
),

dict(
    id="property-setter-name",
    title="A property Setter Must Reuse The Name",
    subtitle="two properties where you meant one",
    difficulty="intermediate",
    tags=["properties", "descriptors", "classes"],
    code='''class Broken:
    @property
    def value(self):
        return self._value

    @property
    def set_value(self, new):
        self._value = new

class Works:
    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, new):
        self._value = new

b = Broken()
b._value = 1
try:
    b.value = 99
except AttributeError as exc:
    print("AttributeError:", exc)

w = Works()
w.value = 99
print(w.value)''',
    guesses=["Broken works, it just has an odd API", "Both raise"],
    explanation=[
        "<code>@value.setter</code> is not special syntax &mdash; it is a method on the existing property object that returns a <em>new</em> property carrying both the getter and the setter, which then rebinds the same class attribute. The name has to match because that is how the new object replaces the old one.",
        "Decorate a second method with a different name and you get two independent read-only properties. Assigning to <code>b.value</code> then hits a property with no setter, and properties are data descriptors, so the instance dict cannot shadow it. <code>AttributeError</code>.",
        "The error message says the attribute has no setter, which is accurate but does not point at the typo three lines away.",
    ],
    fix_note="Getter, setter and deleter all share the property's name:",
    fix='''class Temperature:
    @property
    def celsius(self):
        return self._c

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("below absolute zero")
        self._c = value

t = Temperature()
t.celsius = 20
print(t.celsius)''',
    takeaway="The setter's name is load-bearing. Renaming it silently turns the property read-only.",
    refs=[("Python docs &mdash; property",
           "https://docs.python.org/3/library/functions.html#property")],
),

dict(
    id="bound-method-identity",
    title="a.f is a.f Is False",
    subtitle="a new method object on every lookup",
    difficulty="intermediate",
    tags=["methods", "identity", "descriptors", "callbacks"],
    code='''class Widget:
    def handler(self):
        return "handled"

w = Widget()
print(w.handler is w.handler)
print(w.handler == w.handler)
print(Widget.handler is Widget.handler)

print(w.handler.__func__ is Widget.handler)
print(w.handler.__self__ is w)

listeners = set()
listeners.add(w.handler)
listeners.discard(w.handler)
print("removed:", len(listeners) == 0)''',
    guesses=["True on the first line", "The discard fails to find the method"],
    explanation=[
        "Functions are descriptors. Looking up <code>w.handler</code> calls <code>function.__get__</code>, which builds a fresh bound-method object pairing the function with the instance. Do it twice and you get two objects, so <code>is</code> says no.",
        "They compare equal, and hash equally, because bound methods define <code>__eq__</code> and <code>__hash__</code> over <code>__func__</code> and <code>__self__</code>. That is why the set removal works, and why this is usually harmless.",
        "Where it bites is code that stores callbacks and later unregisters them by identity, or uses a <code>WeakSet</code> &mdash; the bound method you handed over has no other reference and may already be gone. Accessing the function through the <em>class</em> gives a stable object, because there is no instance to bind.",
    ],
    fix_note="Keep a reference to the exact object you registered:",
    fix='''class Widget:
    def __init__(self):
        self._handler = self.handler

    def handler(self):
        return "handled"

w = Widget()
listeners = [w._handler]
listeners.remove(w._handler)
print("clean:", listeners)''',
    takeaway="Every `obj.method` access mints a new object. Equal, hashable, but never identical.",
    refs=[("Python docs &mdash; instance methods",
           "https://docs.python.org/3/reference/datamodel.html#instance-methods")],
),

dict(
    id="staticmethod-is-now-callable",
    title="staticmethod Objects Used To Be Uncallable",
    subtitle="a gotcha that was fixed under you",
    difficulty="intermediate",
    tags=["classes", "staticmethod", "descriptors", "versions"],
    question="This works today. On Python 3.9 one of these lines raised. Which?",
    code='''class Tools:
    @staticmethod
    def helper():
        return "helped"

print(Tools.helper())
print(Tools().helper())

raw = Tools.__dict__["helper"]
print(type(raw))
print(raw())

print(callable(staticmethod(lambda: 1)))''',
    guesses=["All of them work on every version", "Tools().helper() was the broken one"],
    explanation=[
        "<code>staticmethod</code> is a descriptor object. <code>Tools.helper</code> goes through <code>__get__</code> and hands back the underlying function, which is why the normal call paths always worked.",
        "Reach into <code>__dict__</code> and you get the descriptor itself, unbound. Before Python 3.10 that object had no <code>__call__</code>, so <code>raw()</code> raised <code>TypeError: 'staticmethod' object is not callable</code>. It bit anyone writing a metaclass, a registry, or a decorator that walked a class namespace.",
        "3.10 made <code>staticmethod</code> callable and copied the wrapped function's metadata onto it. The old code is still out there working around a problem that no longer exists.",
    ],
    fix_note="If you have to support older versions, unwrap explicitly with <code>__func__</code>, which has worked since 3.0:",
    fix='''class Tools:
    @staticmethod
    def helper():
        return "helped"

raw = Tools.__dict__["helper"]
print(raw.__func__())
print(getattr(Tools, "helper")())''',
    takeaway="Class `__dict__` gives you descriptors, not the values attribute access returns. `getattr` is what triggers the protocol.",
    caveat="The callability of staticmethod objects is version-dependent: raises on 3.9 and earlier, works from 3.10. This entry was run on the version shown in the footer.",
    refs=[("Python docs &mdash; staticmethod",
           "https://docs.python.org/3/library/functions.html#staticmethod"),
          ("What's new in Python 3.10",
           "https://docs.python.org/3/whatsnew/3.10.html")],
),

dict(
    id="deepcopy-handles-cycles",
    title="deepcopy On A Cycle",
    subtitle="the memo that stops the recursion",
    difficulty="intermediate",
    tags=["copying", "recursion", "references"],
    code='''import copy

node = {"name": "a"}
node["self"] = node

clone = copy.deepcopy(node)
print(clone["name"], clone["self"] is clone, clone is node)

shared = [1, 2]
pair = {"x": shared, "y": shared}
dup = copy.deepcopy(pair)
print(dup["x"] is dup["y"], dup["x"] is shared)

def naive(obj):
    if isinstance(obj, dict):
        return {k: naive(v) for k, v in obj.items()}
    return obj

try:
    naive(node)
except RecursionError as exc:
    print("RecursionError:", type(exc).__name__)''',
    guesses=["deepcopy recurses forever too", "dup['x'] and dup['y'] become separate lists"],
    explanation=[
        "<code>deepcopy</code> carries a <code>memo</code> dict keyed by <code>id()</code> of everything it has already copied. When it meets an object a second time it returns the existing copy instead of recursing, which terminates cycles and, just as importantly, <em>preserves sharing</em>.",
        "That second property is the one people miss. Two keys pointing at the same list in the original point at the same &mdash; single &mdash; new list in the copy. A hand-rolled recursive copy would give you two, silently changing the structure's aliasing.",
        "The naive version shows what you get without a memo.",
    ],
    fix_note="Use <code>copy.deepcopy</code> rather than writing your own, and implement <code>__deepcopy__</code> when a class needs special handling:",
    fix='''import copy

class Connection:
    def __init__(self, dsn):
        self.dsn = dsn
    def __deepcopy__(self, memo):
        return Connection(self.dsn)

conn = Connection("db://x")
print(copy.deepcopy(conn).dsn)''',
    takeaway="`deepcopy` preserves the shape of the object graph, including cycles and shared references. Rolling your own does not.",
    refs=[("Python docs &mdash; copy",
           "https://docs.python.org/3/library/copy.html")],
),

dict(
    id="zip-star-transpose",
    title="zip(*matrix) Gives Tuples",
    subtitle="the transpose that changed your row type",
    difficulty="intermediate",
    tags=["zip", "unpacking", "types"],
    code='''matrix = [[1, 2, 3], [4, 5, 6]]

transposed = list(zip(*matrix))
print(transposed)
print(type(transposed[0]))

try:
    transposed[0].append(99)
except AttributeError as exc:
    print("AttributeError:", exc)

print(list(zip(*[])))
print([list(row) for row in zip(*matrix)])''',
    guesses=["[[1, 4], [2, 5], [3, 6]] with lists inside", "zip(*[]) raises"],
    explanation=[
        "<code>zip(*matrix)</code> unpacks the rows as separate arguments and pairs them up positionally, which is a transpose. It is one of the tidiest idioms in the language and it silently changes your element type: <code>zip</code> always yields tuples, whatever went in.",
        "So a matrix of lists transposes into a list of tuples, and the next line that tries to mutate a row fails with an <code>AttributeError</code> far from the transpose.",
        "The empty case is its own surprise: <code>zip()</code> with no arguments yields nothing, so transposing an empty matrix gives <code>[]</code> rather than raising &mdash; and transposing twice does not round-trip for ragged input, because <code>zip</code> truncates to the shortest row.",
    ],
    fix_note="Convert back to the container you want, and use <code>strict=True</code> if the rows must be equal length:",
    fix='''matrix = [[1, 2, 3], [4, 5, 6]]
transposed = [list(row) for row in zip(*matrix, strict=True)]
transposed[0].append(99)
print(transposed)''',
    takeaway="`zip` is a tuple factory. Any pipeline that transposes and keeps mutating needs an explicit conversion.",
    refs=[("Python docs &mdash; zip",
           "https://docs.python.org/3/library/functions.html#zip")],
),

dict(
    id="dict-merge-later-wins",
    title="{**a, **b} - Later Wins",
    subtitle="the override you did not notice",
    difficulty="intermediate",
    tags=["dicts", "unpacking", "merging"],
    code='''defaults = {"host": "localhost", "port": 80}
overrides = {"port": 8080, "debug": True}

print({**defaults, **overrides})
print({**overrides, **defaults})
print(defaults | overrides)

print(dict(defaults, **overrides))
print(defaults.update(overrides), defaults)

print({**{1: "a"}, **{2: "b"}})
try:
    print(dict({1: "a"}, **{2: "b"}))
except TypeError as exc:
    print("TypeError:", exc)''',
    guesses=["The first two lines give the same dict", "update returns the merged dict"],
    explanation=[
        "Dict unpacking applies left to right, so the rightmost occurrence of a key wins. Reversing the order reverses the precedence, and it is easy to write the operands in the order you thought of them rather than the order you meant.",
        "<code>|</code> (3.9+) is the same rule with clearer intent. <code>update</code> is the in-place version and returns <code>None</code>, which is the usual mutating-method trap.",
        "<code>dict(a, **b)</code> looks equivalent but is not: it passes <code>b</code> as keyword arguments, so every key has to be a valid identifier string. A non-string key raises, where <code>{**a, **b}</code> accepts anything hashable.",
    ],
    fix_note="Use <code>|</code> and put the winner on the right:",
    fix='''defaults = {"host": "localhost", "port": 80}
overrides = {"port": 8080}

config = defaults | overrides
print(config, defaults)''',
    takeaway="Rightmost wins in `{**a, **b}` and `a | b`. `dict(a, **b)` additionally requires string keys.",
    refs=[("PEP 584 &mdash; add union operators to dict",
           "https://peps.python.org/pep-0584/")],
),

dict(
    id="itertools-tee-buffers",
    title="itertools.tee Buffers Everything",
    subtitle="the lazy split that is not lazy",
    difficulty="intermediate",
    tags=["itertools", "generators", "memory"],
    code='''from itertools import tee

produced = []

def source():
    for n in range(5):
        produced.append(n)
        yield n

a, b = tee(source())

print("a fully:", list(a))
print("produced so far:", produced)
print("b fully:", list(b))
print("produced now:", produced)

c, d = tee(source())
print("interleaved:", next(c), next(d), next(c))''',
    guesses=["source runs twice, producing 0-4 twice", "b gets nothing"],
    explanation=[
        "<code>tee</code> does not restart the underlying iterator &mdash; it cannot, iterators have no rewind. It keeps an internal FIFO buffer per branch. Anything one branch has consumed that another has not is held in memory until the slower branch catches up.",
        "So draining <code>a</code> completely pulls all five values from the source and stores all five for <code>b</code>. The source still runs exactly once, which is the useful part, but the memory saving you expected from laziness is gone: peak usage is the whole gap between the branches.",
        "Consume the branches in lockstep, as the last line does, and the buffer never exceeds one element. The docs put it plainly: if one iterator will be consumed before another starts, <code>list()</code> is faster.",
    ],
    fix_note="If you are going to drain one branch first, just materialise the data and share it:",
    fix='''def source():
    yield from range(5)

rows = list(source())
print(sum(rows), max(rows))''',
    takeaway="`tee` trades memory for a single pass over the source. Non-overlapping consumption gets you the cost with none of the benefit.",
    refs=[("Python docs &mdash; itertools.tee",
           "https://docs.python.org/3/library/itertools.html#itertools.tee")],
),

dict(
    id="assert-disappears-under-O",
    title="assert Disappears Under -O",
    subtitle="the check that is not there in production",
    difficulty="intermediate",
    tags=["assert", "deployment", "security"],
    code='''import subprocess, sys, textwrap

program = textwrap.dedent("""
    def withdraw(balance, amount):
        assert amount <= balance, "overdraft"
        return balance - amount

    print("result:", withdraw(100, 500))
    print("__debug__ is", __debug__)
""")

for flags in ([], ["-O"]):
    label = " ".join(flags) or "(no flags)"
    done = subprocess.run([sys.executable, *flags, "-c", program],
                          capture_output=True, text=True)
    for line in (done.stdout + done.stderr).strip().splitlines():
        print(f"{label:>11}: {line}")''',
    guesses=["Both runs raise AssertionError", "-O only affects speed"],
    explanation=[
        "<code>-O</code> sets <code>__debug__</code> to <code>False</code> and the compiler removes every <code>assert</code> statement entirely. Not \"skips at runtime\" &mdash; the bytecode is not generated. The same happens with <code>PYTHONOPTIMIZE</code> set, and when a deployment ships only <code>.opt-1.pyc</code> files.",
        "So an <code>assert</code> is a developer's note about an invariant, checked in development and absent in production. That is fine for \"this cannot happen\". It is a disaster for input validation, permission checks, or anything guarding money, because the guard silently evaporates in exactly the environment that matters.",
        "Anything with a side effect inside an <code>assert</code> vanishes too.",
    ],
    fix_note="Raise real exceptions for anything a user or a caller can trigger. Keep <code>assert</code> for internal invariants:",
    fix='''def withdraw(balance, amount):
    if amount > balance:
        raise ValueError("insufficient funds")
    return balance - amount

try:
    withdraw(100, 500)
except ValueError as exc:
    print("ValueError:", exc)''',
    takeaway="If the check must run in production, it cannot be an `assert`.",
    refs=[("Python docs &mdash; the assert statement",
           "https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement")],
),

dict(
    id="default-encoding-is-platform-dependent",
    title="open() Without encoding= Is Platform-Dependent",
    subtitle="works on my machine, mojibake on yours",
    difficulty="intermediate",
    tags=["files", "encoding", "unicode", "portability"],
    code='''import locale, pathlib

print("locale encoding here:", locale.getencoding())

p = pathlib.Path("note.txt")
p.write_text("café costs 5€", encoding="utf-8")

print("as utf-8 :", p.read_text(encoding="utf-8"))
print("as cp1252:", p.read_text(encoding="cp1252"))

try:
    p.read_text(encoding="ascii")
except UnicodeDecodeError as exc:
    print("UnicodeDecodeError:", exc.reason)''',
    guesses=["Every read gives the same text", "cp1252 raises rather than mangling"],
    explanation=[
        "With no <code>encoding=</code>, <code>open()</code> and <code>Path.read_text()</code> use <code>locale.getencoding()</code>. On modern Linux and macOS that is UTF-8. On Windows it is still the legacy ANSI code page &mdash; cp1252 in Western Europe, cp932 in Japan &mdash; so the same code reads the same file differently on different machines.",
        "The dangerous case is the middle line. cp1252 maps every byte to some character, so decoding UTF-8 as cp1252 does not fail: it produces mojibake that flows straight into your database. Only a strict encoding like ASCII refuses outright.",
        "Python 3.15 will make UTF-8 mode the default, and <code>-X warn_default_encoding</code> already reports every unqualified <code>open()</code> today.",
    ],
    fix_note="Pass <code>encoding=</code> on every text-mode open. There is no good reason to omit it:",
    fix='''import pathlib

p = pathlib.Path("note.txt")
p.write_text("café costs 5€", encoding="utf-8")
print(p.read_text(encoding="utf-8"))''',
    takeaway="An unqualified `open()` is a portability bug that only appears on someone else's computer.",
    refs=[("PEP 686 &mdash; make UTF-8 mode default",
           "https://peps.python.org/pep-0686/"),
          ("PEP 597 &mdash; add optional EncodingWarning",
           "https://peps.python.org/pep-0597/")],
),

dict(
    id="len-of-non-ascii-text",
    title="len() On Non-ASCII Text",
    subtitle="one character, two code points",
    difficulty="intermediate",
    tags=["unicode", "strings", "normalisation"],
    code='''import unicodedata

nfc = unicodedata.normalize("NFC", "café")
nfd = unicodedata.normalize("NFD", "café")

print(len(nfc), len(nfd), nfc == nfd)
print(nfc == nfd, unicodedata.normalize("NFC", nfd) == nfc)

family = "👨‍👩‍👧"
print(len(family), [hex(ord(c)) for c in family])

flag = "🇮🇳"
print(len(flag), flag[0])''',
    guesses=["len is 4 for both spellings", "The emoji family has length 1"],
    explanation=[
        "<code>len()</code> counts code points, not characters as a reader perceives them. <code>é</code> can be one code point (U+00E9) or two (<code>e</code> plus a combining acute), and both render identically. Text arriving from a macOS filesystem tends to be NFD; text from a web form tends to be NFC. They are unequal strings.",
        "Emoji make it vivid: the family is three people joined by zero-width joiners, so five code points and one glyph. A regional-indicator flag is two code points, and indexing it gives you half a flag.",
        "So <code>len()</code> is not a display width, not a grapheme count, and not a safe thing to compare between two sources.",
    ],
    fix_note="Normalise at the boundary, compare normalised forms, and use a grapheme library if you need user-perceived characters:",
    fix='''import unicodedata

def key(s):
    return unicodedata.normalize("NFC", s)

a = unicodedata.normalize("NFD", "café")
b = unicodedata.normalize("NFC", "café")
print(a == b, key(a) == key(b))''',
    takeaway="Normalise text as it enters your system. Two strings that look identical are not necessarily equal.",
    refs=[("Python docs &mdash; unicodedata.normalize",
           "https://docs.python.org/3/library/unicodedata.html#unicodedata.normalize"),
          ("Unicode Standard Annex 15 &mdash; normalization forms",
           "https://unicode.org/reports/tr15/")],
),

dict(
    id="naive-versus-aware-datetimes",
    title="datetime.now() vs now(UTC)",
    subtitle="two timestamps that refuse to be compared",
    difficulty="intermediate",
    tags=["datetime", "timezones", "comparisons"],
    code='''import datetime as dt

naive = dt.datetime(2026, 1, 1, 12, 0)
aware = dt.datetime(2026, 1, 1, 12, 0, tzinfo=dt.UTC)

print(naive, "|", aware)
print(naive == aware)

try:
    print(naive < aware)
except TypeError as exc:
    print("TypeError:", exc)

print(naive.timestamp() == aware.timestamp())
print(aware.astimezone(dt.timezone(dt.timedelta(hours=5, minutes=30))))''',
    guesses=["naive == aware is True", "Comparison works, subtraction does not"],
    explanation=[
        "A naive <code>datetime</code> carries no <code>tzinfo</code> and therefore does not identify a moment in time &mdash; it is a wall-clock reading with no location. An aware one does. Python refuses to order them, because there is no correct answer.",
        "Equality is the inconsistent part: it returns <code>False</code> rather than raising, so a naive value compared against an aware one is quietly never equal. A dict keyed on timestamps, or an <code>if now == deadline</code>, fails silently rather than loudly.",
        "<code>.timestamp()</code> on a naive value interprets it as <em>local</em> time, so the answer depends on the machine's timezone. That is the line that produces \"the job ran an hour early on the production box\".",
        "<code>utcnow()</code> is the historical trap: it returns UTC wall-clock with no <code>tzinfo</code> attached, so it looks aware and is not. It is deprecated since 3.12.",
    ],
    fix_note="Use aware datetimes everywhere, and get UTC with an explicit timezone:",
    fix='''import datetime as dt

now = dt.datetime.now(dt.UTC)
deadline = now + dt.timedelta(hours=1)
print(now < deadline, (deadline - now))''',
    takeaway="Pick aware or naive and never mix. `datetime.now(dt.UTC)` is the one to reach for; `utcnow()` is not.",
    refs=[("Python docs &mdash; aware and naive objects",
           "https://docs.python.org/3/library/datetime.html#aware-and-naive-objects")],
),

dict(
    id="fstring-quotes-and-equals",
    title="f-string `=` And Nested Quotes",
    subtitle="two features you probably have not met",
    difficulty="intermediate",
    tags=["f-strings", "strings", "debugging", "versions"],
    code='''user = {"name": "ada", "id": 7}
total = 2 + 3

print(f"{total=}")
print(f"{total = }")
print(f"{user['name']=}")

print(f"{user["name"]}")

width = 8
print(f"{total:>{width}}|")
print(f"{'{literal}'} {{braces}}")''',
    guesses=["The `=` form prints just the value", "The double-quoted key is a SyntaxError"],
    explanation=[
        "<code>f\"{expr=}\"</code> prints the source text of the expression, an equals sign, and the <code>repr</code> of the result. It is a debugging shortcut that removes the copy-paste error where the label no longer matches the value. Whitespace around the <code>=</code> is preserved exactly as you wrote it.",
        "Reusing the outer quote character inside the braces &mdash; <code>f\"{user[\"name\"]}\"</code> &mdash; was a <code>SyntaxError</code> until 3.12. PEP 701 rewrote f-strings to be parsed by the real grammar rather than a bespoke scanner, which also allowed nesting, backslashes and multi-line expressions inside the braces.",
        "Format specs can themselves be f-strings, which is how <code>{total:>{width}}</code> works. And a literal brace still needs doubling.",
    ],
    fix_note="The <code>=</code> form is the one worth adopting; it replaces a whole genre of print statement:",
    fix='''def solve(a, b):
    ratio = a / b
    print(f"{a=} {b=} {ratio=:.3f}")
    return ratio

solve(22, 7)''',
    takeaway="`f\"{x=}\"` prints the expression and its value. Nested same-quotes need Python 3.12 or later.",
    caveat="The nested-quote line is a SyntaxError on 3.11 and earlier, which means the whole file fails to parse there, not just that line.",
    refs=[("PEP 701 &mdash; syntactic formalization of f-strings",
           "https://peps.python.org/pep-0701/"),
          ("Python docs &mdash; formatted string literals",
           "https://docs.python.org/3/reference/lexical_analysis.html#f-strings")],
),

dict(
    id="sum-refuses-strings",
    title="sum() Refuses Strings But Not Lists",
    subtitle="one quadratic concatenation is allowed",
    difficulty="intermediate",
    tags=["builtins", "performance", "strings", "lists"],
    code='''parts = ["a", "b", "c"]

try:
    print(sum(parts, ""))
except TypeError as exc:
    print("TypeError:", exc)

print("".join(parts))

chunks = [[1], [2], [3]]
print(sum(chunks, []))

import itertools
print(list(itertools.chain.from_iterable(chunks)))''',
    guesses=["sum works for both", "sum refuses both"],
    explanation=[
        "<code>sum</code> special-cases <code>str</code> and refuses it, with an error message that names the replacement. The reason is cost: each <code>+</code> builds a whole new string, so summing n pieces copies O(n&sup2;) characters. <code>str.join</code> measures the total once and fills a single buffer.",
        "Lists have exactly the same problem and are not refused. <code>sum(chunks, [])</code> is quadratic, works fine on the three-element example in your test, and quietly becomes the bottleneck on real data. The guard was only ever added for the case people hit most.",
        "<code>itertools.chain.from_iterable</code> is the linear answer for lists, and it does not build the intermediate results at all.",
    ],
    fix_note="<code>join</code> for strings, <code>chain</code> for iterables:",
    fix='''import itertools

parts = ["a", "b", "c"]
print("".join(parts))

chunks = [[1], [2], [3]]
print(list(itertools.chain.from_iterable(chunks)))''',
    takeaway="Repeated concatenation is quadratic whatever the type. Python only stops you for strings.",
    refs=[("Python docs &mdash; sum",
           "https://docs.python.org/3/library/functions.html#sum"),
          ("Python docs &mdash; itertools.chain.from_iterable",
           "https://docs.python.org/3/library/itertools.html#itertools.chain.from_iterable")],
),

dict(
    id="the-walrus-leaks",
    title="The Walrus Leaks Out Of A Comprehension",
    subtitle="deliberately, unlike everything else in there",
    difficulty="intermediate",
    tags=["walrus", "comprehensions", "scope"],
    code='''data = [1, 2, 3]

squares = [y := x * x for x in data]
print(squares, "and y is", y)

try:
    print(x)
except NameError as exc:
    print("NameError:", exc)

values = [0, 0, 7, 0]
if any((first := v) for v in values if v):
    print("first truthy:", first)

print([total := 0] and [total := total + v for v in data], total)''',
    guesses=["y is not defined outside", "x leaks as well"],
    explanation=[
        "A comprehension runs in its own implicit function scope, and its iteration variable stays there. The walrus operator is the deliberate exception: PEP 572 specifies that <code>:=</code> inside a comprehension binds in the <em>containing</em> scope, so the value survives.",
        "That is the point of it &mdash; it lets you capture something computed inside a comprehension, most usefully with <code>any</code>/<code>all</code>, where you want to know which element matched.",
        "It is also a trap, because it is the one name in a comprehension that behaves unlike all the others, and because it holds only the <em>last</em> value assigned. Combined with the short-circuiting of <code>any</code>, \"last\" and \"the one that matched\" happen to coincide here, but only because <code>any</code> stopped.",
    ],
    fix_note="Use it where the capture is the point, and keep the expression small enough to read:",
    fix='''import re

line = "id=42"
if match := re.search(r"id=(\\d+)", line):
    print("matched:", match.group(1))

values = [0, 0, 7, 0]
first = next((v for v in values if v), None)
print("first truthy:", first)''',
    takeaway="`:=` in a comprehension writes to the enclosing scope on purpose. It is the only name that escapes.",
    refs=[("PEP 572 &mdash; assignment expressions",
           "https://peps.python.org/pep-0572/")],
),

dict(
    id="match-bare-name-captures",
    title="match Treats A Bare Name As A Capture",
    subtitle="your constant matched everything",
    difficulty="intermediate",
    tags=["match", "pattern-matching", "constants"],
    code='''STATUS_OK = "ok"

def classify(value):
    match value:
        case STATUS_OK:
            return f"matched; STATUS_OK is now {STATUS_OK!r}"
    return "fell through"

print(classify("ok"))
print(classify("catastrophic failure"))
print("STATUS_OK after:", STATUS_OK)

class Status:
    OK = "ok"

def correct(value):
    match value:
        case Status.OK:
            return "really matched OK"
        case _:
            return "fallback"

print(correct("ok"), "|", correct("nope"))''',
    guesses=["The second call returns 'fell through'", "A SyntaxError on the bare name"],
    explanation=[
        "In a <code>match</code> statement a bare identifier is a <em>capture pattern</em>. It matches anything and binds the subject to that name &mdash; it never compares. So <code>case STATUS_OK:</code> is an irrefutable pattern that also destroys your constant.",
        "PEP 634 chose this because capture is overwhelmingly the common case, and made the disambiguation syntactic: a <em>dotted</em> name is a value pattern and is compared with <code>==</code>. There is no way to compare against an undotted name.",
        "Python does catch the worst version. If any pattern follows an irrefutable capture, compilation fails with <code>SyntaxError: name capture makes remaining patterns unreachable</code>. That safety net only covers the case where something comes after &mdash; make the bare name your <em>last</em> pattern, as here, and it compiles, runs, and is wrong.",
        "Watch what the capture writes to. Inside a function it creates a <em>local</em>, so the module-level <code>STATUS_OK</code> still reads <code>\'ok\'</code> afterwards and the damage is confined to the function. Write the same <code>match</code> at module level and it overwrites the constant for the rest of the program.",
        "The first call looks like it worked, which is what makes this dangerous. You find out when a value that should have fallen through is reported as a match.",
    ],
    extra='''>>> RED = "red"
>>> match "blue":
...     case RED:
...         print("matched", RED)
...
matched blue''',
    fix_note="Put constants on a class, an enum, or a module and refer to them with a dot:",
    fix='''from enum import Enum

class Status(Enum):
    OK = "ok"
    FAIL = "fail"

def classify(value):
    match value:
        case Status.OK:
            return "ok"
        case Status.FAIL:
            return "fail"
        case _:
            return "unknown"

print(classify(Status.OK), classify("something else"))''',
    takeaway="Only dotted names are compared in a `match`. A bare name always matches and always rebinds.",
    refs=[("PEP 634 &mdash; structural pattern matching: specification",
           "https://peps.python.org/pep-0634/"),
          ("Python docs &mdash; the match statement",
           "https://docs.python.org/3/reference/compound_stmts.html#the-match-statement")],
),

dict(
    id="decimal-from-a-float",
    title="Decimal(0.1)",
    subtitle="the exact value of an inexact number",
    difficulty="intermediate",
    tags=["decimal", "floats", "numbers"],
    code='''from decimal import Decimal, getcontext

print(Decimal(0.1))
print(Decimal("0.1"))
print(Decimal(0.1) == Decimal("0.1"))

print(Decimal("0.1") * 3 == Decimal("0.3"))
print(Decimal(1) / Decimal(3))

getcontext().prec = 5
print(Decimal(1) / Decimal(3))''',
    guesses=["Decimal(0.1) prints 0.1", "Both constructors give the same value"],
    explanation=[
        "<code>Decimal</code> from a string parses the digits you wrote. <code>Decimal</code> from a float converts the <em>exact</em> binary value that float holds &mdash; and since <code>0.1</code> is not representable in binary, that exact value is a 55-digit number slightly above a tenth.",
        "Neither is a bug. The float constructor is doing the only honest thing: showing you what was really in there. But passing a float into <code>Decimal</code> imports the error you were using <code>Decimal</code> to avoid, which defeats the entire exercise.",
        "Note also that <code>Decimal</code> is arbitrary <em>precision</em>, not infinite: division is governed by the context precision, which defaults to 28 significant digits and is global to the thread.",
    ],
    fix_note="Construct from strings or integers, never from floats, and set precision explicitly where it matters:",
    fix='''from decimal import Decimal, localcontext

price = Decimal("19.99")
qty = 3
print(price * qty)

with localcontext() as ctx:
    ctx.prec = 4
    print(Decimal(1) / Decimal(7))
print(Decimal(1) / Decimal(7))''',
    takeaway="`Decimal(some_float)` inherits the float's error. Keep the value in text form all the way to the constructor.",
    refs=[("Python docs &mdash; decimal",
           "https://docs.python.org/3/library/decimal.html")],
),

# ===================== ADVANCED =====================

dict(
    id="class-body-comprehension-scope",
    title="Comprehensions Cannot See The Class Body",
    subtitle="one line works, the next raises NameError",
    difficulty="advanced",
    tags=["scope", "classes", "comprehensions", "namespaces"],
    question="Does this class definition succeed? If not, which line fails?",
    code='''class Config:
    scale = 10
    sizes = [i for i in range(scale)]
    scaled = [scale * i for i in range(3)]

print(Config.scaled)''',
    expect_raises=True,
    guesses=["[0, 10, 20] &mdash; scale is right there", "Both comprehension lines fail"],
    explanation=[
        "A comprehension gets its own function scope, and that scope's enclosing namespace is the module, not the class body. Class bodies are deliberately skipped during name resolution &mdash; otherwise methods would silently see sibling attributes as bare names.",
        "So why does line 3 work? Because the <strong>outermost iterable</strong> is the one piece of a comprehension evaluated eagerly, in the enclosing scope, and passed into the implicit function as an argument. <code>range(scale)</code> is that iterable, so <code>scale</code> resolves. The element expression <code>scale * i</code> on line 4 runs <em>inside</em> the implicit function, which cannot see the class body at all.",
        "A function nested in another function does not have this problem, because function scopes do nest:",
    ],
    extra='''>>> def scale_visible():
...     scale = 10
...     return [scale * i for i in range(3)]
...
>>> scale_visible()
[0, 10, 20]''',
    fix_note="Pass the value in through the iterable, or lift the constant out of the class body:",
    fix='''SCALE = 10

class Config:
    scale = SCALE
    scaled = [SCALE * i for i in range(3)]

print(Config.scaled)

class Config2:
    scale = 10
    scaled = [s * i for s in (scale,) for i in range(3)]

print(Config2.scaled)''',
    takeaway="The same rule applies to generator expressions, set and dict comprehensions, and lambdas in a class body. Functions nest; class bodies do not.",
    refs=[("Python docs &mdash; execution model, resolution of names",
           "https://docs.python.org/3/reference/executionmodel.html#resolution-of-names"),
          ("Python docs &mdash; displays for lists, sets and dictionaries",
           "https://docs.python.org/3/reference/expressions.html#displays-for-lists-sets-and-dictionaries")],
),

dict(
    id="dunder-lookup-skips-the-instance",
    title="Dunder Lookup Skips The Instance",
    subtitle="assigning __len__ on an object does nothing",
    difficulty="advanced",
    tags=["dunder", "datamodel", "attribute-lookup"],
    code='''class Box:
    pass

b = Box()
b.__len__ = lambda: 42

print(b.__len__())
try:
    print(len(b))
except TypeError as exc:
    print("TypeError:", exc)

class Sized:
    def __len__(self):
        return 7

s = Sized()
s.__len__ = lambda: 99
print(len(s), s.__len__())''',
    guesses=["len(b) is 42", "len(s) is 99"],
    explanation=[
        "Implicit special-method lookup goes to the <em>type</em>, never the instance. <code>len(x)</code> is effectively <code>type(x).__len__(x)</code>, so an attribute of the same name sitting in the instance dict is simply not consulted.",
        "This is not an oversight. It makes every operator dispatch one predictable lookup on a slot rather than a full attribute search, which is a large speed difference on the hot path, and it keeps <code>type(x)</code> the single authority on how <code>x</code> behaves. It also means <code>__init__</code>, <code>__enter__</code>, <code>__iter__</code>, <code>__eq__</code> and the rest cannot be monkey-patched per object.",
        "The second class shows how confusing this can get: <code>len(s)</code> and <code>s.__len__()</code> give different answers, because only the first goes through the type.",
    ],
    fix_note="Patch the class, or give the class a hook that reads per-instance state:",
    fix='''class Box:
    def __init__(self, size):
        self._size = size
    def __len__(self):
        return self._size

print(len(Box(42)))

class Other:
    pass
Other.__len__ = lambda self: 5
print(len(Other()))''',
    takeaway="Special methods are looked up on the type. Per-instance overrides of dunders are silently ignored.",
    refs=[("Python docs &mdash; special method lookup",
           "https://docs.python.org/3/reference/datamodel.html#special-method-lookup")],
),

dict(
    id="bool-falls-back-to-len",
    title="__bool__ Falls Back To __len__",
    subtitle="your empty object became false",
    difficulty="advanced",
    tags=["dunder", "truthiness", "datamodel"],
    code='''class Basket:
    def __init__(self, items):
        self.items = items
    def __len__(self):
        return len(self.items)

empty = Basket([])
full = Basket([1])

print(bool(empty), bool(full))

if not empty:
    print("an existing Basket tested as falsy")

class Explicit(Basket):
    def __bool__(self):
        return True

print(bool(Explicit([])), len(Explicit([])))''',
    guesses=["bool(empty) is True &mdash; the object exists", "Defining __len__ has no effect on truthiness"],
    explanation=[
        "Truth testing tries <code>__bool__</code> first. If the type does not define it, Python falls back to <code>__len__</code> and calls the object false when the length is zero. Only if neither exists is every instance true.",
        "So adding <code>__len__</code> to a class &mdash; a perfectly reasonable thing to do for anything container-shaped &mdash; silently changes what <code>if obj:</code> means everywhere in the codebase. A result object, a response wrapper, a query set: each becomes falsy when empty, and <code>if result:</code> stops distinguishing \"no result\" from \"an empty result\".",
        "It is the class-level version of the <code>falsy is not None</code> trap, and it is harder to see because the <code>__len__</code> may have been added years later by someone else.",
    ],
    fix_note="Define <code>__bool__</code> explicitly whenever you define <code>__len__</code> on something that is not really a container, and test <code>is None</code> at the call site:",
    fix='''class Response:
    def __init__(self, rows):
        self.rows = rows
    def __len__(self):
        return len(self.rows)
    def __bool__(self):
        return True

r = Response([])
print(bool(r), len(r))
print("empty" if len(r) == 0 else "has rows")''',
    takeaway="Adding `__len__` makes your empty objects falsy. If that is wrong, say so with `__bool__`.",
    refs=[("Python docs &mdash; object.__bool__",
           "https://docs.python.org/3/reference/datamodel.html#object.__bool__")],
),

dict(
    id="data-versus-non-data-descriptors",
    title="Data vs Non-Data Descriptors",
    subtitle="which one the instance dict can beat",
    difficulty="advanced",
    tags=["descriptors", "attribute-lookup", "datamodel"],
    code='''class NonData:
    def __get__(self, obj, owner=None):
        return "from descriptor"

class Data(NonData):
    def __set__(self, obj, value):
        raise AttributeError("read-only")

class C:
    weak = NonData()
    strong = Data()

c = C()
print(c.weak, "|", c.strong)

c.__dict__["weak"] = "from instance dict"
c.__dict__["strong"] = "from instance dict"

print(c.weak, "|", c.strong)''',
    guesses=["Both come from the instance dict the second time",
             "Both keep coming from the descriptor"],
    explanation=[
        "<code>object.__getattribute__</code> has a fixed precedence: data descriptors on the type, then the instance <code>__dict__</code>, then non-data descriptors and plain class attributes. A descriptor counts as a <em>data</em> descriptor if its type defines <code>__set__</code> or <code>__delete__</code>.",
        "So a descriptor with only <code>__get__</code> loses to anything in the instance dict, and one that also defines <code>__set__</code> wins. Adding a single <code>__set__</code> method silently reverses the priority.",
        "This is the machinery behind everything: <code>property</code> defines <code>__set__</code>, so it always wins, which is why you cannot shadow a property by assigning to the instance. Plain functions define only <code>__get__</code>, so they are non-data &mdash; which is exactly why <code>obj.method = something</code> works and shadows the class's method for that object.",
        "It is also how <code>functools.cached_property</code> works: <code>__get__</code> only, so it computes once, writes the value into the instance dict, and every later lookup finds the dict entry first and never calls the descriptor again.",
    ],
    fix_note="Pick the side you want deliberately. Add <code>__set__</code> to make a descriptor authoritative, leave it off to allow per-instance caching or overriding:",
    fix='''import functools

class Report:
    @functools.cached_property
    def rows(self):
        print("computing once")
        return [1, 2, 3]

r = Report()
print(r.rows, r.rows)
print(r.__dict__["rows"])''',
    takeaway="`__set__` or `__delete__` on the descriptor's type is what makes it beat the instance dict. Nothing else.",
    refs=[("Python docs &mdash; descriptor HowTo",
           "https://docs.python.org/3/howto/descriptor.html"),
          ("Python docs &mdash; invoking descriptors",
           "https://docs.python.org/3/reference/datamodel.html#invoking-descriptors")],
),

dict(
    id="getattr-versus-getattribute",
    title="__getattr__ vs __getattribute__",
    subtitle="one is a fallback, the other is the whole road",
    difficulty="advanced",
    tags=["dunder", "attribute-lookup", "recursion"],
    code='''class Fallback:
    def __init__(self):
        self.real = "present"
    def __getattr__(self, name):
        return f"invented {name!r}"

f = Fallback()
print(f.real, "|", f.missing)

class Intercept:
    def __init__(self):
        self.real = "present"
    def __getattribute__(self, name):
        return object.__getattribute__(self, name)

print(Intercept().real)

class Recursive:
    def __getattribute__(self, name):
        return self.__dict__.get(name)

try:
    Recursive().anything
except RecursionError:
    print("RecursionError from self.__dict__ inside __getattribute__")''',
    guesses=["__getattr__ intercepts f.real too", "The Recursive class returns None"],
    explanation=[
        "<code>__getattribute__</code> is called for <em>every</em> attribute access. <code>__getattr__</code> is called only after normal lookup has already failed. Defining the second is a safe way to add fallbacks; defining the first replaces the entire lookup mechanism, including the descriptor protocol and the instance dict.",
        "The recursion trap follows immediately: any <code>self.anything</code> inside <code>__getattribute__</code> re-enters <code>__getattribute__</code>. Even <code>self.__dict__</code> does, because <code>__dict__</code> is itself an attribute. The only way out is to call <code>object.__getattribute__(self, name)</code> or <code>super().__getattribute__(name)</code> explicitly.",
        "<code>__getattr__</code> has a milder version of the same problem: if it references an attribute that is also missing, it calls itself.",
    ],
    fix_note="Use <code>__getattr__</code> unless you truly need to intercept everything, and route through <code>object</code> when you do:",
    fix='''class Proxy:
    def __init__(self, target):
        object.__setattr__(self, "_target", target)
    def __getattr__(self, name):
        return getattr(object.__getattribute__(self, "_target"), name)

class Real:
    value = 42

print(Proxy(Real()).value)''',
    takeaway="`__getattr__` runs only on failure. `__getattribute__` runs always, and every `self.x` inside it recurses.",
    refs=[("Python docs &mdash; customizing attribute access",
           "https://docs.python.org/3/reference/datamodel.html#customizing-attribute-access")],
),

dict(
    id="super-needs-the-class-cell",
    title="super() Needs The __class__ Cell",
    subtitle="the same function works in a class body and not outside it",
    difficulty="advanced",
    tags=["super", "classes", "closures", "compiler"],
    code='''class Base:
    def greet(self):
        return "base"

class Child(Base):
    def greet(self):
        return "child of " + super().greet()

print(Child().greet())
print(Child.greet.__code__.co_freevars)

def greet(self):
    return "patched onto " + super().greet()

Child.patched = greet
try:
    Child().patched()
except RuntimeError as exc:
    print("RuntimeError:", exc)

print(greet.__code__.co_freevars)''',
    guesses=["The patched method works the same way", "A NameError rather than a RuntimeError"],
    explanation=[
        "Zero-argument <code>super()</code> is compiler magic. When the compiler sees it inside a function defined in a class body, it adds a hidden <code>__class__</code> closure cell to that function and arranges for <code>super()</code> to read it, together with the first positional argument, to reconstruct <code>super(__class__, self)</code>.",
        "Print <code>co_freevars</code> and you can see the cell on the method and its absence on the plain function. A function written outside a class body never gets one, so attaching it later gives you a method that raises <code>RuntimeError: super(): __class__ cell not found</code> the moment it runs.",
        "The same applies to functions built with <code>exec</code>, to some class-decorator and mixin-injection tricks, and to methods moved between classes.",
    ],
    fix_note="Use the explicit two-argument form, which needs no cell:",
    fix='''class Base:
    def greet(self):
        return "base"

class Child(Base):
    pass

def greet(self):
    return "patched onto " + super(Child, self).greet()

Child.patched = greet
print(Child().patched())''',
    takeaway="`super()` with no arguments only works in a function lexically inside a class body.",
    refs=[("Python docs &mdash; super",
           "https://docs.python.org/3/library/functions.html#super"),
          ("Python docs &mdash; class definitions and __class__",
           "https://docs.python.org/3/reference/compound_stmts.html#class-definitions")],
),

dict(
    id="mro-can-be-impossible",
    title="The MRO Can Be Impossible",
    subtitle="a class that refuses to be defined",
    difficulty="advanced",
    tags=["mro", "inheritance", "classes"],
    code='''class A: pass
class B(A): pass

print([c.__name__ for c in B.__mro__])

try:
    class C(A, B):
        pass
except TypeError as exc:
    print("TypeError:", exc)

class D(B, A):
    pass

print([c.__name__ for c in D.__mro__])''',
    guesses=["C is created with A before B", "Both orderings fail"],
    explanation=[
        "Python linearises bases with the C3 algorithm, which must preserve two things: the order you listed the bases in, and the rule that a subclass always precedes its own base. <code>class C(A, B)</code> demands <code>A</code> before <code>B</code>, while <code>B</code> being a subclass of <code>A</code> demands <code>B</code> before <code>A</code>. No ordering satisfies both, so the class cannot be created at all.",
        "The failure is at <em>class definition</em> time, which means at import. A refactor that makes one mixin inherit from another can break an unrelated module three levels away, and the traceback points at a <code>class</code> statement rather than at the change.",
        "Reversing the bases to <code>(B, A)</code> is consistent and works &mdash; put the most derived base first.",
    ],
    fix_note="List bases most-derived first, and keep mixins independent of each other so any order stays legal:",
    fix='''class Loggable:
    def describe(self): return "loggable"

class Serialisable:
    def describe(self): return "serialisable"

class Model(Loggable, Serialisable):
    pass

print([c.__name__ for c in Model.__mro__])''',
    takeaway="Base order is a constraint, not a preference. A base that subclasses another base must come first.",
    refs=[("Python docs &mdash; method resolution order",
           "https://docs.python.org/3/glossary.html#term-method-resolution-order"),
          ("The Python 2.3 method resolution order",
           "https://docs.python.org/3/howto/mro.html")],
),

dict(
    id="super-is-not-the-parent-class",
    title="super() Is Not The Parent Class",
    subtitle="the next class in the instance's MRO",
    difficulty="advanced",
    tags=["super", "mro", "inheritance", "diamond"],
    code='''class Base:
    def run(self): return ["Base"]

class Left(Base):
    def run(self): return ["Left"] + super().run()

class Right(Base):
    def run(self): return ["Right"] + super().run()

class Diamond(Left, Right):
    def run(self): return ["Diamond"] + super().run()

print(Diamond().run())
print(Left().run())
print([c.__name__ for c in Diamond.__mro__])''',
    guesses=["['Diamond', 'Left', 'Base'] &mdash; Left's super is Base",
             "Base runs twice"],
    explanation=[
        "<code>super()</code> inside <code>Left.run</code> does not mean \"<code>Base</code>\". It means \"whatever follows <code>Left</code> in the MRO of <code>type(self)</code>\". For a plain <code>Left</code> instance that is <code>Base</code>; for a <code>Diamond</code> instance it is <code>Right</code> &mdash; a class <code>Left</code> knows nothing about and does not inherit from.",
        "That is the whole design. It is what lets cooperative multiple inheritance work and guarantees <code>Base</code> runs exactly once rather than once per path. It also means the author of <code>Left</code> cannot know what their <code>super()</code> call will reach.",
        "The practical consequence: every class in a cooperative hierarchy must accept and forward compatible arguments, call <code>super()</code> unconditionally, and never assume it is last. A single class that skips its <code>super()</code> call silently truncates the chain for everyone downstream.",
    ],
    fix_note="Write cooperative methods: forward <code>*args, **kwargs</code> and always call up:",
    fix='''class Base:
    def __init__(self, **kwargs):
        super().__init__()
        self.tags = []

class Left(Base):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.tags.append("left")

class Right(Base):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.tags.append("right")

class Diamond(Left, Right):
    pass

print(Diamond().tags)''',
    takeaway="`super()` is a pointer into the MRO of the runtime type, not a reference to your declared base.",
    refs=[("Python's super() considered super!",
           "https://rhettinger.wordpress.com/2011/05/26/super-considered-super/"),
          ("Python docs &mdash; super",
           "https://docs.python.org/3/library/functions.html#super")],
),

dict(
    id="slots-silently-does-nothing",
    title="__slots__ Silently Does Nothing",
    subtitle="one base without it and the saving is gone",
    difficulty="advanced",
    tags=["slots", "memory", "inheritance", "classes"],
    code='''class Slotted:
    __slots__ = ("x",)

s = Slotted()
s.x = 1
try:
    s.y = 2
except AttributeError as exc:
    print("AttributeError:", exc)

class Plain:
    pass

class Mixed(Slotted, Plain):
    __slots__ = ("z",)

m = Mixed()
m.anything = "accepted"
print("Mixed has __dict__:", hasattr(m, "__dict__"), m.__dict__)

class Child(Slotted):
    pass

print("Child has __dict__:", hasattr(Child(), "__dict__"))''',
    guesses=["Mixed rejects unknown attributes too", "Child rejects them"],
    explanation=[
        "<code>__slots__</code> stops the class creating a <code>__dict__</code> for its instances. It is not inherited as a restriction: the instance gets a <code>__dict__</code> if <em>any</em> class in the MRO fails to declare slots.",
        "So a slotted class mixed with one ordinary class, or subclassed without repeating <code>__slots__</code>, gets its dict back. Both the memory saving and the typo protection vanish, and nothing warns you &mdash; the class is created happily and the attribute assignment succeeds.",
        "Inheriting from anything with a dict has the same effect, which catches people subclassing library base classes.",
    ],
    fix_note="Declare <code>__slots__</code> on every class in the chain, including empty tuples for the ones that add nothing:",
    fix='''class Base:
    __slots__ = ("x",)

class Child(Base):
    __slots__ = ()

c = Child()
c.x = 1
try:
    c.y = 2
except AttributeError as exc:
    print("AttributeError:", exc)''',
    takeaway="`__slots__` is only effective if every ancestor declares it. One gap restores the dict for the whole chain.",
    refs=[("Python docs &mdash; __slots__",
           "https://docs.python.org/3/reference/datamodel.html#slots")],
),

dict(
    id="slots-kills-weakref",
    title="__slots__ Kills Weak References",
    subtitle="unless you ask for __weakref__ by name",
    difficulty="advanced",
    tags=["slots", "weakref", "memory", "classes"],
    code='''import weakref

class Plain:
    pass

class Slotted:
    __slots__ = ("x",)

class SlottedWeakref:
    __slots__ = ("x", "__weakref__")

print(weakref.ref(Plain()) is not None)

try:
    weakref.ref(Slotted())
except TypeError as exc:
    print("TypeError:", exc)

print(weakref.ref(SlottedWeakref()) is not None)

obj = SlottedWeakref()
cache = weakref.WeakSet([obj])
print("in cache:", len(cache))''',
    guesses=["Slots have nothing to do with weak references",
             "Adding __weakref__ is a syntax error"],
    explanation=[
        "Weak reference support costs a pointer per instance, stored in a slot named <code>__weakref__</code>. Ordinary classes get it as part of the default instance layout. A class with <code>__slots__</code> gets exactly the slots it named, and nothing else &mdash; so weak referencing stops working.",
        "The failure surfaces far from the class. <code>weakref.WeakSet</code>, <code>WeakValueDictionary</code>, observer registries, many caches and several libraries' internals all need weak references, and they raise <code>TypeError: cannot create weak reference to 'X' object</code> from inside code you did not write.",
        "The fix is to name <code>__weakref__</code> in the slots tuple. Only one class in a hierarchy may do so, which is why you add it at the root.",
    ],
    fix_note="Add <code>__weakref__</code> to the root slotted class if anything might weakly reference it:",
    fix='''import weakref

class Node:
    __slots__ = ("value", "__weakref__")
    def __init__(self, value):
        self.value = value

n = Node(1)
seen = weakref.WeakSet([n])
print(len(seen))''',
    takeaway="Slots give you exactly what you asked for. `__weakref__` and `__dict__` are opt-in by name.",
    refs=[("Python docs &mdash; __slots__",
           "https://docs.python.org/3/reference/datamodel.html#slots"),
          ("Python docs &mdash; weakref",
           "https://docs.python.org/3/library/weakref.html")],
),

dict(
    id="dataclass-mutable-default",
    title="Mutable Default In A dataclass",
    subtitle="the one place Python stops you",
    difficulty="advanced",
    tags=["dataclasses", "defaults", "mutability"],
    code='''from dataclasses import dataclass, field, fields

try:
    @dataclass
    class Broken:
        tags: list = []
except ValueError as exc:
    print("ValueError:", exc)

@dataclass
class Works:
    tags: list = field(default_factory=list)

a, b = Works(), Works()
a.tags.append("x")
print(a.tags, b.tags)

@dataclass
class Sneaky:
    tags: tuple = ()
    lookup: dict = field(default_factory=dict)

print(fields(Sneaky)[0].default, fields(Sneaky)[1].default_factory)''',
    guesses=["Broken is created and shares one list", "field(default_factory=list) shares too"],
    explanation=[
        "A dataclass turns its class attributes into <code>__init__</code> parameter defaults, which would reproduce the classic shared-mutable-default bug exactly. Rather than let that happen, <code>@dataclass</code> inspects each default and raises <code>ValueError</code> at class-creation time for anything unhashable.",
        "This is the only place in the language that catches this mistake for you, and it catches it at import, not at runtime. <code>default_factory</code> is the supported alternative: it is called once per instance, inside <code>__init__</code>.",
        "The check is by hashability, not by mutability, so it is a heuristic. A tuple default is allowed and is genuinely safe. A custom class that is mutable but defines <code>__hash__</code> slips straight through and will be shared.",
    ],
    fix_note="Any container default goes through <code>default_factory</code>:",
    fix='''from dataclasses import dataclass, field

@dataclass
class Config:
    tags: list = field(default_factory=list)
    limits: dict = field(default_factory=lambda: {"max": 10})

a, b = Config(), Config()
a.tags.append("x")
print(a.tags, b.tags, b.limits)''',
    takeaway="`@dataclass` rejects unhashable defaults. Hashable-but-mutable defaults are still shared, silently.",
    refs=[("Python docs &mdash; dataclasses, mutable default values",
           "https://docs.python.org/3/library/dataclasses.html#mutable-default-values")],
),

dict(
    id="dataclass-eq-unsets-hash",
    title="@dataclass Sets __hash__ To None",
    subtitle="your model stopped working as a dict key",
    difficulty="advanced",
    tags=["dataclasses", "hashing", "equality"],
    code='''from dataclasses import dataclass

@dataclass
class Point:
    x: int

print(Point.__eq__ is not object.__eq__, Point.__hash__)

try:
    {Point(1)}
except TypeError as exc:
    print("TypeError:", exc)

@dataclass(frozen=True)
class Frozen:
    x: int

@dataclass(eq=False)
class NoEq:
    x: int

print(len({Frozen(1), Frozen(1)}), len({NoEq(1), NoEq(1)}))

@dataclass(unsafe_hash=True)
class Unsafe:
    x: int

u = Unsafe(1)
seen = {u}
u.x = 99
print("lost in set:", u in seen)''',
    guesses=["A plain dataclass is hashable", "frozen and unsafe_hash behave the same"],
    explanation=[
        "<code>@dataclass</code> generates <code>__eq__</code> by default, and by the rule from the <code>__eq__</code>/<code>__hash__</code> entry, that means <code>__hash__</code> is set to <code>None</code>. Your model class is unhashable the moment you decorate it, and the error appears wherever someone first puts it in a set.",
        "<code>frozen=True</code> makes the instance immutable and generates a real <code>__hash__</code>. <code>eq=False</code> keeps identity-based equality and inherits <code>object.__hash__</code>. Both are safe; they just mean different things.",
        "<code>unsafe_hash=True</code> generates a hash on a mutable class, and the last three lines show why it is named that way: mutate a field after inserting and the object hashes to a different bucket, so the set contains something it can no longer find.",
    ],
    fix_note="Use <code>frozen=True</code> for anything that goes in a set or a dict key:",
    fix='''from dataclasses import dataclass, replace

@dataclass(frozen=True)
class Point:
    x: int
    y: int

p = Point(1, 2)
seen = {p}
moved = replace(p, x=5)
print(p in seen, moved)''',
    takeaway="Default dataclasses are unhashable. `frozen=True` is the answer; `unsafe_hash=True` is a trap with a warning in its name.",
    refs=[("Python docs &mdash; dataclasses and __hash__",
           "https://docs.python.org/3/library/dataclasses.html#module-contents")],
),

dict(
    id="lru-cache-on-a-method-leaks",
    title="lru_cache On A Method Leaks",
    subtitle="the cache holds self forever",
    difficulty="advanced",
    tags=["functools", "caching", "memory", "gc"],
    code='''import functools, gc, weakref

class Cached:
    @functools.lru_cache(maxsize=None)
    def compute(self, n):
        return n * n

class Plain:
    def compute(self, n):
        return n * n

def survives(cls, call):
    obj = cls()
    if call:
        obj.compute(2)
    ref = weakref.ref(obj)
    del obj
    gc.collect()
    return ref() is not None

print("cached, never called:", survives(Cached, False))
print("cached, called once :", survives(Cached, True))
print("plain,  called once :", survives(Plain, True))

print(Cached.compute.cache_info())''',
    guesses=["The cache is per-instance", "gc.collect() clears it"],
    explanation=[
        "The decorator is applied to the function in the class body, so there is one cache on the class, shared by every instance. Its keys include <code>self</code>, because <code>self</code> is just the first argument.",
        "A key is a strong reference. With <code>maxsize=None</code> nothing is ever evicted, so every instance the method is ever called on is pinned in memory for the lifetime of the process, with its entire object graph. The leak is invisible to <code>gc.collect()</code> &mdash; the object is genuinely reachable.",
        "Note the first line: an instance the method was never called on collects fine. The leak starts on first use, which is why it shows up in production and not in a unit test that constructs an object and checks a property.",
        "It also requires <code>self</code> to be hashable, so the decorator quietly imposes that on your class.",
    ],
    fix_note="Cache per instance with <code>cached_property</code>, or keep the cache on a module-level function that takes only plain values:",
    fix='''import functools

class Report:
    def __init__(self, rows):
        self._rows = rows

    @functools.cached_property
    def total(self):
        print("computing once")
        return sum(self._rows)

r = Report([1, 2, 3])
print(r.total, r.total)

@functools.lru_cache(maxsize=128)
def square(n):
    return n * n

print(square(4))''',
    takeaway="`lru_cache` on a method is a class-level cache keyed on `self`. `maxsize=None` makes it a permanent leak.",
    refs=[("Python docs &mdash; functools.lru_cache",
           "https://docs.python.org/3/library/functools.html#functools.lru_cache"),
          ("Python docs &mdash; functools.cached_property",
           "https://docs.python.org/3/library/functools.html#functools.cached_property")],
),

dict(
    id="generator-return-value",
    title="A Generator's return Value",
    subtitle="hidden on the StopIteration",
    difficulty="advanced",
    tags=["generators", "yield-from", "exceptions"],
    code='''def counted():
    yield "a"
    yield "b"
    return "counted 2"

g = counted()
print(list(g))

g2 = counted()
next(g2); next(g2)
try:
    next(g2)
except StopIteration as stop:
    print("StopIteration.value:", stop.value)

def delegating():
    result = yield from counted()
    print("yield from saw:", result)
    yield "done"

print(list(delegating()))''',
    guesses=["list(g) ends with 'counted 2'", "The return value is unreachable"],
    explanation=[
        "A <code>return</code> in a generator does not yield &mdash; it sets the <code>value</code> attribute on the <code>StopIteration</code> that ends the iteration. Every <code>for</code> loop and every <code>list()</code> catches that exception and discards it, so the value is invisible through normal iteration.",
        "The only ergonomic way to read it is <code>yield from</code>, whose expression value <em>is</em> the delegated generator's return value. That is the feature's real purpose: it turns generators into coroutines that can return results to their caller.",
        "Since PEP 479, a <code>StopIteration</code> raised inside a generator body is converted to <code>RuntimeError</code> rather than silently ending the generator, so this channel cannot be abused by accident.",
    ],
    fix_note="Use <code>yield from</code> to collect it, or return the summary separately if the caller is a plain loop:",
    fix='''def counted(items):
    n = 0
    for item in items:
        n += 1
        yield item
    return n

def run(items):
    total = yield from counted(items)
    print("total was", total)

list(run(["a", "b", "c"]))''',
    takeaway="`return x` in a generator is only reachable via `yield from` or by catching `StopIteration` yourself.",
    refs=[("PEP 380 &mdash; syntax for delegating to a subgenerator",
           "https://peps.python.org/pep-0380/"),
          ("PEP 479 &mdash; change StopIteration handling inside generators",
           "https://peps.python.org/pep-0479/")],
),

dict(
    id="yield-from-is-not-a-loop",
    title="yield from Is Not A Loop",
    subtitle="it forwards send, throw and close",
    difficulty="advanced",
    tags=["generators", "yield-from", "coroutines"],
    code='''def inner():
    while True:
        try:
            got = yield "ready"
            print("  inner received", got)
        except ValueError as exc:
            print("  inner caught", exc)

def with_yield_from():
    yield from inner()

def with_a_loop():
    for value in inner():
        yield value

a = with_yield_from()
print(next(a))
a.send("hello")

b = with_a_loop()
print(next(b))
print("loop version send:", b.send("hello"))''',
    guesses=["Both forward the sent value", "The loop version raises"],
    explanation=[
        "<code>yield from sub</code> establishes a transparent channel to the subgenerator. Values sent with <code>send()</code>, exceptions thrown with <code>throw()</code>, and <code>close()</code> all pass straight through to <code>sub</code>, and its return value becomes the expression's value.",
        "A <code>for</code> loop only pulls. It calls <code>next()</code> on the subgenerator, so anything the caller sends is delivered to the <em>outer</em> generator's own <code>yield</code> and never reaches the inner one &mdash; which is why the loop version's <code>send</code> is swallowed and only the outer generator resumes.",
        "For plain iteration the two are equivalent apart from speed. The moment the subgenerator is a coroutine that expects to receive anything, they are completely different.",
    ],
    fix_note="Use <code>yield from</code> whenever you delegate to another generator. There is no case where the manual loop is better:",
    fix='''def chain(*iterables):
    for it in iterables:
        yield from it

print(list(chain([1, 2], (3, 4), "ab")))''',
    takeaway="`for x in sub: yield x` is a one-way pipe. `yield from sub` is a two-way connection.",
    refs=[("PEP 380 &mdash; syntax for delegating to a subgenerator",
           "https://peps.python.org/pep-0380/")],
),

dict(
    id="with-open-inside-a-generator",
    title="with open(...) Inside A Generator",
    subtitle="the file closes when the generator does",
    difficulty="advanced",
    tags=["generators", "files", "resources", "context-managers"],
    code='''import pathlib

pathlib.Path("data.txt").write_text("one\\ntwo\\nthree\\n", encoding="utf-8")

def rows(path):
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            yield line.strip()

g = rows("data.txt")
print(next(g))

handle = g.gi_frame.f_locals["fh"]
print("file still open:", not handle.closed)

g.close()
print("after close():", handle.closed)

g2 = rows("data.txt")
print(list(g2))
print("after exhaustion:", g2.gi_frame is None)''',
    guesses=["The with block closes the file before next() returns",
             "The file leaks until the process exits"],
    explanation=[
        "A generator's <code>with</code> block spans suspensions. The body is paused at the <code>yield</code> with the frame, and the frame holds the open file, so the handle stays open between calls &mdash; which is exactly what makes the pattern work at all.",
        "It closes when the generator finishes: on exhaustion, on <code>close()</code>, or when the generator object is collected and CPython throws <code>GeneratorExit</code> into it. Abandon a half-consumed generator and the file stays open until that happens, which on CPython is usually immediate refcounting but is not guaranteed and is not immediate on PyPy.",
        "The consequence is that <code>rows()</code> gives you no way to guarantee cleanup from the outside unless the caller cooperates. Under Windows file locking, or against a connection pool, \"usually collected soon\" is not good enough.",
    ],
    fix_note="Make the generator itself a context manager, or take an already-open file and let the caller own it:",
    fix='''import contextlib, pathlib

pathlib.Path("data.txt").write_text("one\\ntwo\\n", encoding="utf-8")

@contextlib.contextmanager
def rows(path):
    with open(path, encoding="utf-8") as fh:
        yield (line.strip() for line in fh)

with rows("data.txt") as lines:
    print(next(lines))
print("closed deterministically")''',
    takeaway="A `with` inside a generator is scoped to the generator's life, not to one `next()`. Abandon it and cleanup is deferred.",
    refs=[("PEP 533 &mdash; deterministic cleanup for iterators",
           "https://peps.python.org/pep-0533/"),
          ("Python docs &mdash; generator.close",
           "https://docs.python.org/3/reference/expressions.html#generator.close")],
),

dict(
    id="exception-in-exit-masks-the-original",
    title="An Exception In __exit__ Masks The Original",
    subtitle="the cleanup error you see instead of the real one",
    difficulty="advanced",
    tags=["context-managers", "exceptions", "chaining"],
    code='''class Noisy:
    def __enter__(self): return self
    def __exit__(self, *exc_info):
        raise RuntimeError("cleanup failed")

try:
    with Noisy():
        raise ValueError("the actual bug")
except RuntimeError as exc:
    print("surfaced:", repr(exc))
    print("context :", repr(exc.__context__))

class Swallow:
    def __enter__(self): return self
    def __exit__(self, *exc_info):
        return True

with Swallow():
    raise ValueError("never seen again")
print("execution continued")''',
    guesses=["The ValueError wins", "Both exceptions are raised"],
    explanation=[
        "If <code>__exit__</code> raises, its exception replaces whatever was propagating. The original is not lost &mdash; it is attached as <code>__context__</code> and printed under \"During handling of the above exception, another exception occurred\" &mdash; but the exception that reaches your <code>except</code> clause, your logging, and your monitoring is the cleanup error.",
        "So a flaky <code>close()</code> in a context manager turns every failure in the block into the same misleading error, and the real cause is one attribute deeper than anyone looks.",
        "The second class is the other half of the protocol: returning a truthy value from <code>__exit__</code> <em>suppresses</em> the exception entirely. Returning <code>None</code> is what you almost always want, and it is easy to write a <code>return</code> that accidentally is not.",
    ],
    fix_note="Never let cleanup raise. Catch, log, and chain explicitly if you must re-raise:",
    fix='''import contextlib

class Careful:
    def __enter__(self): return self
    def __exit__(self, exc_type, exc, tb):
        try:
            raise RuntimeError("cleanup failed")
        except RuntimeError as cleanup_error:
            print("logged, not raised:", cleanup_error)
        return False

with contextlib.suppress(ValueError):
    with Careful():
        raise ValueError("the actual bug")
print("original still propagated to suppress()")''',
    takeaway="`__exit__` raising replaces the real error; `__exit__` returning truthy deletes it. Both are easy to do by accident.",
    refs=[("Python docs &mdash; with statement context managers",
           "https://docs.python.org/3/reference/datamodel.html#with-statement-context-managers")],
),

dict(
    id="forgetting-await",
    title="Forgetting await",
    subtitle="a truthy object and a warning at exit",
    difficulty="advanced",
    tags=["asyncio", "coroutines", "warnings"],
    code='''import asyncio, gc, warnings

async def fetch():
    return {"rows": 3}

async def main():
    result = fetch()
    print("type:", type(result).__name__)
    print("truthy:", bool(result))
    print("awaited:", await fetch())
    await result

asyncio.run(main())

with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter("always")
    fetch()
    gc.collect()
    print("warning:", caught[0].message)''',
    guesses=["fetch() returns the dict", "Forgetting await raises immediately"],
    explanation=[
        "Calling an <code>async def</code> function does not run it. It builds a coroutine object, exactly as calling a generator function builds a generator. Nothing executes until something awaits it or schedules it on a loop.",
        "The coroutine object is truthy and has no useful <code>__eq__</code>, so <code>if fetch():</code> is always true and <code>result[\"rows\"]</code> fails with an unhelpful <code>TypeError</code> somewhere else. The only signal you get is a <code>RuntimeWarning: coroutine 'fetch' was never awaited</code>, emitted when the object is collected &mdash; long after the mistake, and suppressed entirely under some test runners.",
        "The same applies to forgetting <code>await</code> on <code>asyncio.sleep</code>, on a lock's <code>acquire</code>, or on anything that returns an awaitable.",
    ],
    fix_note="Turn the warning into an error while developing, and let a type checker catch the rest:",
    fix='''import asyncio, warnings

async def fetch():
    return {"rows": 3}

async def main():
    warnings.simplefilter("error", RuntimeWarning)
    print(await fetch())

asyncio.run(main(), debug=True)''',
    takeaway="An un-awaited coroutine is a silent no-op that passes every truthiness check.",
    refs=[("Python docs &mdash; coroutines",
           "https://docs.python.org/3/library/asyncio-task.html#coroutines"),
          ("Python docs &mdash; asyncio debug mode",
           "https://docs.python.org/3/library/asyncio-dev.html#debug-mode")],
),

dict(
    id="coroutines-cannot-be-reused",
    title="A Coroutine Can Only Be Awaited Once",
    subtitle="unlike the function that made it",
    difficulty="advanced",
    tags=["asyncio", "coroutines", "reuse"],
    code='''import asyncio

async def work():
    return "done"

async def main():
    coro = work()
    print(await coro)
    try:
        print(await coro)
    except RuntimeError as exc:
        print("RuntimeError:", exc)

    again = work()
    print("a fresh one:", await again)

    shared = work()
    try:
        await asyncio.gather(shared, shared)
    except RuntimeError as exc:
        print("gather:", exc)

asyncio.run(main())''',
    guesses=["Awaiting twice returns the cached result", "gather handles the duplicate fine"],
    explanation=[
        "A coroutine object holds a frame and a position in it, just like a generator. Awaiting runs it to completion and leaves it exhausted; there is no result cached on the object and no way to rewind.",
        "This catches people who store a coroutine as a retry target, pass the same one to <code>gather</code> twice, or build a list of coroutines and then iterate it more than once. The error is clear when it fires, but it fires at await time, far from where the object was created.",
        "The distinction to hold onto: an <code>async def</code> <em>function</em> is reusable, a coroutine <em>object</em> is not. A <code>Task</code> is different again &mdash; it wraps a coroutine, runs it once, and can be awaited any number of times, returning the same result.",
    ],
    fix_note="Call the function again for each use, or wrap it in a task if several places need the one result:",
    fix='''import asyncio

async def work():
    return "done"

async def main():
    print(await asyncio.gather(work(), work()))

    task = asyncio.create_task(work())
    print(await task, await task)

asyncio.run(main())''',
    takeaway="Coroutines are single-use. Tasks are the reusable handle on a single execution.",
    refs=[("Python docs &mdash; awaitables",
           "https://docs.python.org/3/library/asyncio-task.html#awaitables")],
),

dict(
    id="gather-versus-taskgroup",
    title="gather vs TaskGroup",
    subtitle="what happens to the siblings when one fails",
    difficulty="advanced",
    tags=["asyncio", "cancellation", "taskgroup", "error-handling"],
    code='''import asyncio

finished = []

async def boom():
    await asyncio.sleep(0.01)
    raise ValueError("boom")

async def slow(name):
    try:
        await asyncio.sleep(0.2)
        finished.append(name)
    except asyncio.CancelledError:
        finished.append(f"{name}-cancelled")
        raise

async def main():
    finished.clear()
    try:
        await asyncio.gather(boom(), slow("gather"))
    except ValueError as exc:
        print("gather raised:", exc)
    await asyncio.sleep(0.3)
    print("after gather:", finished)

    finished.clear()
    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(boom())
            tg.create_task(slow("taskgroup"))
    except* ValueError as eg:
        print("taskgroup raised:", [str(e) for e in eg.exceptions])
    print("after taskgroup:", finished)

asyncio.run(main())''',
    guesses=["Both cancel the sibling", "Neither cancels the sibling"],
    explanation=[
        "<code>gather</code> reports the first exception to its caller but does <em>not</em> cancel the other awaitables. They keep running, unsupervised, and their results and failures are discarded. If the caller then returns, you have orphaned work still touching your database.",
        "<code>TaskGroup</code> (3.11+) is structured concurrency: on any failure it cancels every sibling, waits for them to finish unwinding, and only then leaves the <code>async with</code> block. Nothing escapes the scope. Because several tasks can fail at once it always raises an <code>ExceptionGroup</code>, which is why you need <code>except*</code>.",
        "The <code>finished</code> list shows the difference plainly: under <code>gather</code> the sibling runs to completion after the error; under <code>TaskGroup</code> it records its own cancellation.",
    ],
    fix_note="Use <code>TaskGroup</code> for anything where the tasks belong together, and <code>return_exceptions=True</code> when you genuinely want all results:",
    fix='''import asyncio

async def ok(n):
    return n

async def main():
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(ok(n)) for n in range(3)]
    print([t.result() for t in tasks])

    print(await asyncio.gather(ok(1), ok(2), return_exceptions=True))

asyncio.run(main())''',
    takeaway="`gather` leaves failed siblings running. `TaskGroup` cancels them and waits. Prefer `TaskGroup`.",
    refs=[("Python docs &mdash; asyncio.TaskGroup",
           "https://docs.python.org/3/library/asyncio-task.html#task-groups"),
          ("PEP 654 &mdash; exception groups and except*",
           "https://peps.python.org/pep-0654/")],
),

dict(
    id="blocking-call-in-the-event-loop",
    title="A Blocking Call In The Event Loop",
    subtitle="one time.sleep stalls everything",
    difficulty="advanced",
    tags=["asyncio", "concurrency", "blocking"],
    code='''import asyncio, time

log = []

async def polite(name):
    for _ in range(3):
        log.append(name)
        await asyncio.sleep(0.01)

async def rude(name):
    for _ in range(3):
        log.append(name)
        time.sleep(0.01)

async def main():
    log.clear()
    await asyncio.gather(polite("a"), polite("b"))
    print("both polite :", log)

    log.clear()
    await asyncio.gather(rude("rude"), polite("polite"))
    print("one blocking:", log)

asyncio.run(main())''',
    guesses=["The blocking version interleaves too", "asyncio raises on the blocking call"],
    explanation=[
        "An event loop is one thread running one callback at a time. <code>await</code> is the only point at which control returns to it, so a coroutine that calls a synchronous blocking function holds the entire loop for the duration &mdash; every other task, every timer and every socket read is frozen.",
        "The interleaving in the first line is what concurrency looks like. The second shows the blocking task running to completion before the polite one gets a single turn.",
        "Nothing raises, so this is invisible until latency shows up under load. The usual culprits are <code>time.sleep</code>, <code>requests</code>, a synchronous database driver, a large <code>json.loads</code>, <code>hashlib</code> on a big buffer, and ordinary file I/O &mdash; <code>open()</code> has no async form.",
    ],
    fix_note="Push blocking work to a thread with <code>asyncio.to_thread</code>, or use an async-native library:",
    fix='''import asyncio, time

log = []

async def offloaded(name):
    for _ in range(3):
        log.append(name)
        await asyncio.to_thread(time.sleep, 0.01)

async def polite(name):
    for _ in range(3):
        log.append(name)
        await asyncio.sleep(0.01)

async def main():
    await asyncio.gather(offloaded("thread"), polite("loop"))
    print(log)

asyncio.run(main())''',
    takeaway="If a line inside a coroutine has no `await`, it is blocking the whole loop while it runs.",
    refs=[("Python docs &mdash; asyncio.to_thread",
           "https://docs.python.org/3/library/asyncio-task.html#asyncio.to_thread"),
          ("Python docs &mdash; running blocking code",
           "https://docs.python.org/3/library/asyncio-dev.html#running-blocking-code")],
),

dict(
    id="threading-local-is-wrong-in-async",
    title="threading.local Is Wrong In async",
    subtitle="every task shares one thread",
    difficulty="advanced",
    tags=["asyncio", "contextvars", "threading", "state"],
    code='''import asyncio, threading, contextvars

tl = threading.local()
cv = contextvars.ContextVar("request_id")

async def handler(name):
    tl.request_id = name
    cv.set(name)
    await asyncio.sleep(0.01)
    print(f"{name}: threading.local={tl.request_id} contextvar={cv.get()}")

async def main():
    await asyncio.gather(handler("req-1"), handler("req-2"))

asyncio.run(main())''',
    guesses=["Both report their own id from threading.local",
             "contextvars leak between tasks the same way"],
    explanation=[
        "<code>threading.local</code> isolates state per OS thread. An event loop runs every task on the <em>same</em> thread, so all of them share one <code>threading.local</code> namespace. Each task overwrites the previous one's value, and after the first <code>await</code> you read whichever task ran most recently.",
        "This is the classic way request-scoped state &mdash; a request id, a user, a tenant, a database session &mdash; gets attributed to the wrong request in an async service. It is also why porting a threaded web app to async breaks logging correlation in a way that only shows up under concurrency.",
        "<code>contextvars</code> is the async-aware equivalent. Each task starts with a copy of the current context, so a <code>set()</code> inside a task is invisible to its siblings, and it still works correctly across threads.",
    ],
    fix_note="Use <code>ContextVar</code> for anything request-scoped, and reset it with the token if you need to restore:",
    fix='''import asyncio, contextvars

request_id = contextvars.ContextVar("request_id", default="-")

async def handler(name):
    token = request_id.set(name)
    try:
        await asyncio.sleep(0.01)
        print("handling", request_id.get())
    finally:
        request_id.reset(token)

async def main():
    await asyncio.gather(handler("req-1"), handler("req-2"))
    print("outside:", request_id.get())

asyncio.run(main())''',
    takeaway="Tasks are not threads. `threading.local` gives every task the same storage.",
    refs=[("Python docs &mdash; contextvars",
           "https://docs.python.org/3/library/contextvars.html"),
          ("PEP 567 &mdash; context variables",
           "https://peps.python.org/pep-0567/")],
),

dict(
    id="from-import-binds-a-copy",
    title="from module import name Binds A Copy",
    subtitle="rebinding the original does not reach you",
    difficulty="advanced",
    tags=["imports", "modules", "namespaces"],
    code='''import pathlib, subprocess, sys

pathlib.Path("settings.py").write_text(
    "DEBUG = False\\n"
    "def enable():\\n"
    "    global DEBUG\\n"
    "    DEBUG = True\\n",
    encoding="utf-8")

program = """
import settings
from settings import DEBUG, enable

enable()
print("from-import name :", DEBUG)
print("attribute lookup :", settings.DEBUG)
"""
pathlib.Path("app.py").write_text(program, encoding="utf-8")
print(subprocess.run([sys.executable, "app.py"], capture_output=True,
                     text=True).stdout.strip())''',
    guesses=["Both print True", "Both print False"],
    explanation=[
        "<code>from m import x</code> imports the module, reads <code>m.x</code> once, and binds the <em>value</em> into your namespace. It does not create a link. When <code>m</code> later rebinds its own global, your name still points at the object it found at import time.",
        "Attribute access through the module goes to the module's namespace every time, so it sees the new value. The two lines disagree permanently.",
        "This is why flags, settings, patched objects and lazily-initialised singletons should be reached through the module. It is also why <code>unittest.mock.patch(\"m.thing\")</code> fails to take effect in a module that did <code>from m import thing</code> &mdash; you have to patch the name where it was imported <em>to</em>.",
        "Mutating a shared object works fine either way; only rebinding breaks.",
    ],
    fix_note="Import the module and reach through it for anything that can change:",
    fix='''import pathlib, subprocess, sys

pathlib.Path("settings.py").write_text(
    "DEBUG = False\\n"
    "def enable():\\n"
    "    global DEBUG\\n"
    "    DEBUG = True\\n",
    encoding="utf-8")

pathlib.Path("app.py").write_text(
    "import settings\\n"
    "settings.enable()\\n"
    "print('current:', settings.DEBUG)\\n",
    encoding="utf-8")

print(subprocess.run([sys.executable, "app.py"], capture_output=True,
                     text=True).stdout.strip())''',
    takeaway="`from m import x` is a snapshot. Mutation propagates; rebinding does not.",
    refs=[("Python docs &mdash; the import statement",
           "https://docs.python.org/3/reference/simple_stmts.html#the-import-statement")],
),

dict(
    id="circular-imports-give-a-half-built-module",
    title="Circular Imports Give A Half-Built Module",
    subtitle="the name exists a line too late",
    difficulty="advanced",
    tags=["imports", "modules", "initialisation"],
    code='''import pathlib, subprocess, sys

pathlib.Path("alpha.py").write_text(
    "print('alpha: starting')\\n"
    "import beta\\n"
    "ALPHA = 'alpha-value'\\n"
    "print('alpha: done')\\n", encoding="utf-8")

pathlib.Path("beta.py").write_text(
    "print('beta: starting')\\n"
    "from alpha import ALPHA\\n"
    "print('beta: got', ALPHA)\\n", encoding="utf-8")

pathlib.Path("main.py").write_text("import alpha\\n", encoding="utf-8")

done = subprocess.run([sys.executable, "main.py"], capture_output=True, text=True)
print(done.stdout.strip())
print(done.stderr.strip().splitlines()[-1])''',
    guesses=["An infinite import loop", "beta simply gets alpha-value"],
    explanation=[
        "Importing a module runs its body top to bottom and registers it in <code>sys.modules</code> <em>before</em> the body finishes. That registration is what stops the recursion &mdash; when <code>beta</code> imports <code>alpha</code>, the partially built module is already there and is handed back immediately.",
        "Partially built is the problem. <code>alpha</code> was only three lines in when it handed control to <code>beta</code>, so <code>ALPHA</code> does not exist yet. The <code>from alpha import ALPHA</code> fails on a module that is perfectly healthy and will define that name two lines later.",
        "Note which form fails: <code>from alpha import ALPHA</code> needs the attribute <em>now</em>. A plain <code>import alpha</code> succeeds, because the lookup is deferred to first use &mdash; which is the standard workaround, along with moving the import inside the function that needs it.",
        "One oddity in the output: <code>alpha: starting</code> and <code>beta: starting</code> each appear <em>twice</em>. CPython 3.14 builds the \"consider renaming\" hint by re-importing the module in a fresh context to check whether it shadows a standard-library name &mdash; so your module body runs a second time, side effects and all, purely to produce a better error message. (stdout and stderr are shown here concatenated, so the duplicates appear above the traceback rather than after it.)",
        "The entry point matters too. Running <code>alpha.py</code> directly would <em>not</em> reproduce this: alpha would be <code>__main__</code>, so beta's import of <code>alpha</code> would build a second, complete copy and succeed. That is the next entry's problem wearing a disguise, and it is why the cycle here is triggered from a separate <code>main.py</code>.",
    ],
    fix_note="Use a plain <code>import</code> and defer the attribute access, or move the import into the function:",
    fix='''import pathlib, subprocess, sys

pathlib.Path("alpha.py").write_text(
    "import beta\\n"
    "ALPHA = 'alpha-value'\\n"
    "print(beta.read())\\n", encoding="utf-8")

pathlib.Path("beta.py").write_text(
    "import alpha\\n"
    "def read():\\n"
    "    return 'beta got ' + alpha.ALPHA\\n", encoding="utf-8")

print(subprocess.run([sys.executable, "alpha.py"],
                     capture_output=True, text=True).stdout.strip())''',
    takeaway="A cycle is survivable with `import m`; it is fatal with `from m import name`, because the name may not exist yet.",
    refs=[("Python docs &mdash; the import system",
           "https://docs.python.org/3/reference/import.html#the-module-cache")],
),

dict(
    id="python-m-imports-twice",
    title="python -m pkg.mod Imports It Twice",
    subtitle="two copies of every global",
    difficulty="advanced",
    tags=["imports", "modules", "main", "state"],
    code='''import pathlib, subprocess, sys

pathlib.Path("pkg").mkdir(exist_ok=True)
pathlib.Path("pkg/__init__.py").write_text("", encoding="utf-8")
pathlib.Path("pkg/mod.py").write_text(
    "import sys\\n"
    "print('body runs as', __name__)\\n"
    "REGISTRY = []\\n"
    "def register(x):\\n"
    "    REGISTRY.append(x)\\n"
    "\\n"
    "if __name__ == '__main__':\\n"
    "    import pkg.mod\\n"
    "    pkg.mod.register('added via pkg.mod')\\n"
    "    print('__main__ REGISTRY :', REGISTRY)\\n"
    "    print('pkg.mod REGISTRY  :', pkg.mod.REGISTRY)\\n"
    "    print('same module object:', sys.modules['__main__'] is sys.modules['pkg.mod'])\\n",
    encoding="utf-8")

print(subprocess.run([sys.executable, "-m", "pkg.mod"],
                     capture_output=True, text=True).stdout.strip())''',
    guesses=["The body runs once", "Both registries show the added item"],
    explanation=[
        "<code>python -m pkg.mod</code> executes the file under the name <code>__main__</code>. If anything then imports <code>pkg.mod</code> &mdash; directly, or through any other module in the package &mdash; the import machinery finds no <code>pkg.mod</code> in <code>sys.modules</code> and runs the file again, producing a second, independent module object.",
        "Every module-level object exists twice. Two registries, two caches, two singletons, two sets of class objects &mdash; so <code>isinstance</code> against the other copy's class fails, and state written to one is invisible to the other.",
        "The body printing twice under two different <code>__name__</code> values is the tell. Any import-time side effect &mdash; connecting, registering, spawning a thread &mdash; also happens twice.",
    ],
    fix_note="Keep the entry point separate from the library module, so the thing that runs as <code>__main__</code> holds no state:",
    fix='''import pathlib, subprocess, sys

pathlib.Path("pkg2").mkdir(exist_ok=True)
pathlib.Path("pkg2/__init__.py").write_text("", encoding="utf-8")
pathlib.Path("pkg2/core.py").write_text(
    "REGISTRY = []\\n"
    "def register(x):\\n"
    "    REGISTRY.append(x)\\n", encoding="utf-8")
pathlib.Path("pkg2/__main__.py").write_text(
    "from pkg2 import core\\n"
    "core.register('once')\\n"
    "print('registry:', core.REGISTRY)\\n", encoding="utf-8")

print(subprocess.run([sys.executable, "-m", "pkg2"],
                     capture_output=True, text=True).stdout.strip())''',
    takeaway="A module run as `__main__` and imported by name is two modules. Put the entry point in `__main__.py`.",
    refs=[("Python docs &mdash; __main__",
           "https://docs.python.org/3/library/__main__.html")],
),

dict(
    id="mutating-locals-does-nothing",
    title="Mutating locals() Does Nothing",
    subtitle="inside a function it is a snapshot",
    difficulty="advanced",
    tags=["scope", "locals", "exec", "compiler"],
    code='''def in_function():
    x = 1
    locals()["x"] = 99
    exec("x = 77")
    return x

print("function:", in_function())

y = 1
locals()["y"] = 99
print("module  :", y)

def with_explicit_namespace():
    scope = {"x": 1}
    exec("x = 77", {}, scope)
    return scope["x"]

print("explicit:", with_explicit_namespace())''',
    guesses=["99 inside the function", "exec at least works"],
    explanation=[
        "Function locals live in a fixed array on the frame, decided at compile time, and are read with <code>LOAD_FAST</code> by index. <code>locals()</code> builds a dict <em>describing</em> that array; writing to the dict writes to the description, not the array.",
        "<code>exec(\"x = 77\")</code> with no explicit namespace uses that same dict, so it has the same non-effect. This is the single most common reason people conclude that <code>exec</code> is broken.",
        "At module level <code>locals()</code> <em>is</em> <code>globals()</code> &mdash; the real namespace dict &mdash; so the write takes effect, which makes the behaviour look inconsistent until you know why.",
        "PEP 667 in Python 3.13 made this explicit: <code>locals()</code> in a function now documentedly returns an independent snapshot, rather than a CPython-specific \"sometimes works\" dict.",
    ],
    fix_note="Pass an explicit namespace to <code>exec</code> and read the result back out of it:",
    fix='''def compute(source, **inputs):
    scope = dict(inputs)
    exec(source, {"__builtins__": {}}, scope)
    return scope

print(compute("total = a + b", a=2, b=3)["total"])''',
    takeaway="Function locals cannot be written through `locals()` or a bare `exec`. Use a real dict you own.",
    refs=[("PEP 667 &mdash; consistent views of namespaces",
           "https://peps.python.org/pep-0667/"),
          ("Python docs &mdash; locals",
           "https://docs.python.org/3/library/functions.html#locals")],
),

dict(
    id="del-is-not-a-destructor",
    title="__del__ Is Not A Destructor",
    subtitle="it runs eventually, and its errors vanish",
    difficulty="advanced",
    tags=["gc", "dunder", "resources", "exceptions"],
    code='''import gc

class Resource:
    def __init__(self, name):
        self.name = name
    def __del__(self):
        print("closing", self.name)

r = Resource("plain")
del r

cyclic = Resource("cyclic")
cyclic.self = cyclic
del cyclic
print("before collect")
gc.collect()

class Noisy:
    def __del__(self):
        raise RuntimeError("cleanup blew up")

n = Noisy()
del n
gc.collect()
print("still running - the exception was swallowed")''',
    guesses=["The cyclic one is never collected", "The RuntimeError propagates"],
    explanation=[
        "<code>__del__</code> runs when the last reference goes away, which on CPython is usually immediately but is a refcounting implementation detail. On PyPy or any tracing collector it happens later, or not before exit.",
        "Reference cycles used to be fatal: before PEP 442 (Python 3.4) an object with <code>__del__</code> in a cycle was never collected at all and went into <code>gc.garbage</code>. That is fixed &mdash; the cyclic object above is collected &mdash; but the <em>order</em> in which a cycle's finalisers run is still unspecified, so one object's <code>__del__</code> may find another already torn down.",
        "The part that has not improved: an exception inside <code>__del__</code> cannot propagate, because there is no call site to propagate to. It is printed to stderr as \"Exception ignored in\" and execution continues. Cleanup that fails, fails silently.",
        "At interpreter shutdown module globals may already be <code>None</code>, so a <code>__del__</code> that calls anything imported can fail in ways that only happen on exit.",
    ],
    fix_note="Use a context manager for deterministic cleanup, and keep <code>__del__</code> as a last-resort backstop if at all:",
    fix='''import contextlib

class Resource:
    def __init__(self, name):
        self.name = name
    def close(self):
        print("closing", self.name)
    def __enter__(self):
        return self
    def __exit__(self, *exc):
        self.close()
        return False

with Resource("deterministic") as r:
    print("using", r.name)

with contextlib.closing(Resource("closing helper")) as r2:
    print("using", r2.name)''',
    takeaway="`__del__` gives you no guarantee about when it runs, in what order, or whether its failures are reported.",
    refs=[("Python docs &mdash; object.__del__",
           "https://docs.python.org/3/reference/datamodel.html#object.__del__"),
          ("PEP 442 &mdash; safe object finalization",
           "https://peps.python.org/pep-0442/")],
),

dict(
    id="enum-members-with-equal-values-alias",
    title="Enum Members With Equal Values Are Aliases",
    subtitle="two names, one member",
    difficulty="advanced",
    tags=["enum", "classes", "aliasing"],
    code='''from enum import Enum, unique, auto

class Colour(Enum):
    RED = 1
    CRIMSON = 1
    BLUE = 2

print(list(Colour))
print(Colour.CRIMSON is Colour.RED, Colour.CRIMSON.name)
print(Colour(1), len(Colour), len(Colour.__members__))

try:
    @unique
    class Strict(Enum):
        RED = 1
        CRIMSON = 1
except ValueError as exc:
    print("ValueError:", exc)

class Auto(Enum):
    A = auto()
    B = auto()

print(list(Auto))''',
    guesses=["Colour has three members", "CRIMSON keeps its own name"],
    explanation=[
        "An <code>Enum</code> member is uniquely identified by its <em>value</em>. A second name with an existing value does not create a member &mdash; it creates an alias, an extra entry in <code>__members__</code> pointing at the first member.",
        "So <code>Colour.CRIMSON</code> is literally <code>Colour.RED</code>: same object, and <code>.name</code> reports <code>RED</code>. Iteration yields two members, <code>len()</code> is 2, but <code>__members__</code> has three keys, and serialising by name silently rewrites <code>CRIMSON</code> to <code>RED</code>.",
        "Aliases are a deliberate feature for deprecated spellings. They are a bug when two members were meant to be distinct and someone copy-pasted a value &mdash; which is why <code>auto()</code> exists and why <code>@unique</code> exists.",
    ],
    fix_note="Apply <code>@unique</code> to any enum where duplicate values would be a mistake, and use <code>auto()</code> when the numbers do not matter:",
    fix='''from enum import Enum, unique, auto

@unique
class Colour(Enum):
    RED = auto()
    CRIMSON = auto()
    BLUE = auto()

print(list(Colour), Colour.RED is Colour.CRIMSON)''',
    takeaway="Duplicate enum values silently collapse into one member. `@unique` turns that into an error.",
    refs=[("Python docs &mdash; enum, allowed members and attributes",
           "https://docs.python.org/3/howto/enum.html#duplicating-enum-members-and-values")],
),

dict(
    id="future-annotations-are-strings",
    title="from __future__ import annotations",
    subtitle="every annotation becomes text",
    difficulty="advanced",
    tags=["annotations", "typing", "introspection", "versions"],
    code='''import pathlib, subprocess, sys

body = """
import typing

class Config:
    retries: int
    tags: list[str]

print("annotations:", Config.__annotations__)
print("resolved   :", typing.get_type_hints(Config))

def check(obj, name):
    expected = Config.__annotations__[name]
    return isinstance(getattr(obj, name), expected)

c = Config()
c.retries = 3
try:
    print("isinstance check:", check(c, "retries"))
except TypeError as exc:
    print("TypeError:", exc)
"""

for header in ("", "from __future__ import annotations\\n"):
    label = "with future " if header else "without     "
    pathlib.Path("m.py").write_text(header + body, encoding="utf-8")
    out = subprocess.run([sys.executable, "m.py"], capture_output=True, text=True)
    for line in (out.stdout + out.stderr).strip().splitlines():
        print(label + "|", line)''',
    guesses=["The two runs are identical", "get_type_hints fails with the future import"],
    explanation=[
        "<code>from __future__ import annotations</code> (PEP 563) stops annotations being evaluated and stores their source text instead. That is what lets you reference a class before it is defined, and removes the import-time cost of building type objects.",
        "It also breaks everything that reads <code>__annotations__</code> expecting real objects: runtime validators, serialisers, dependency injection, and any <code>isinstance</code> check against an annotation, which now gets a string. <code>typing.get_type_hints</code> is the supported way to resolve them, and it needs the right module globals to do it.",
        "Python 3.14 changed the default. Under PEP 649 annotations are now <em>lazily</em> evaluated: you get the forward-reference benefit without the stringification, and <code>__annotations__</code> holds real objects again. The <code>__future__</code> import still forces the old string behaviour, so code that relies on it keeps working &mdash; and keeps breaking introspection.",
    ],
    fix_note="Read annotations through <code>typing.get_type_hints</code>, never off <code>__annotations__</code> directly:",
    fix='''import typing

class Config:
    retries: int
    tags: list[str]

hints = typing.get_type_hints(Config)
print(hints)
print(isinstance(3, hints["retries"]))''',
    takeaway="Annotations are not guaranteed to be objects. `get_type_hints` is the only portable way to read them.",
    caveat="The default behaviour is version-dependent: strings under the __future__ import, real objects eagerly before 3.14, and lazily evaluated real objects from 3.14 under PEP 649.",
    refs=[("PEP 563 &mdash; postponed evaluation of annotations",
           "https://peps.python.org/pep-0563/"),
          ("PEP 649 &mdash; deferred evaluation of annotations using descriptors",
           "https://peps.python.org/pep-0649/")],
),

dict(
    id="init-subclass-and-set-name",
    title="__init_subclass__ And __set_name__",
    subtitle="two hooks that need no metaclass",
    difficulty="advanced",
    tags=["classes", "hooks", "descriptors", "metaclasses"],
    code='''class Field:
    def __set_name__(self, owner, name):
        print(f"  __set_name__: {owner.__name__}.{name}")
        self.name = name
    def __get__(self, obj, owner=None):
        return f"<{self.name}>"

REGISTRY = {}

class Base:
    def __init_subclass__(cls, /, label=None, **kwargs):
        super().__init_subclass__(**kwargs)
        print(f"  __init_subclass__: {cls.__name__} label={label!r}")
        REGISTRY[label or cls.__name__] = cls

print("defining User:")
class User(Base, label="user"):
    name = Field()
    email = Field()

print("registry:", REGISTRY)
print("descriptor knows its name:", User().name)
print("Base itself was not registered:", "Base" not in REGISTRY)''',
    guesses=["__init_subclass__ runs for Base too", "__set_name__ needs to be called manually"],
    explanation=[
        "Both hooks run during class creation, and neither needs a metaclass. <code>__set_name__</code> is called on every class attribute that defines it, with the owning class and the attribute's name &mdash; which is how a descriptor learns what it is called without you repeating the name as an argument.",
        "<code>__init_subclass__</code> is called on the <em>parent</em> whenever a subclass is created, and receives any extra keyword arguments from the <code>class</code> statement. That is the <code>label=\"user\"</code> above. It is implicitly a class method, and it does not fire for the class that defines it.",
        "Together they cover most of what people used to reach for metaclasses to do: registration, validation, attribute naming, plugin discovery. Since Python 3.6 a metaclass is rarely the right answer.",
        "The ordering matters: <code>__set_name__</code> calls happen before <code>__init_subclass__</code>, so the hook sees fully named descriptors.",
    ],
    fix_note="Prefer these hooks to a metaclass &mdash; they compose, where metaclasses conflict on multiple inheritance:",
    fix='''class Plugin:
    registry = {}
    def __init_subclass__(cls, /, name, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.registry[name] = cls

class Json(Plugin, name="json"): pass
class Yaml(Plugin, name="yaml"): pass

print(sorted(Plugin.registry))''',
    takeaway="`__set_name__` for \"what am I called\", `__init_subclass__` for \"someone subclassed me\". No metaclass required.",
    refs=[("PEP 487 &mdash; simpler customisation of class creation",
           "https://peps.python.org/pep-0487/"),
          ("Python docs &mdash; __set_name__",
           "https://docs.python.org/3/reference/datamodel.html#object.__set_name__")],
),

dict(
    id="abc-is-enforced-at-instantiation",
    title="abc Does Not Stop You",
    subtitle="the abstract class that instantiates fine",
    difficulty="advanced",
    tags=["abc", "classes", "inheritance", "validation"],
    code='''from abc import ABC, ABCMeta, abstractmethod

class Base(ABC):
    @abstractmethod
    def run(self): ...

class Incomplete(Base):
    pass

print("class created fine:", Incomplete.__name__)
try:
    Incomplete()
except TypeError as exc:
    print("TypeError:", exc)

class NotAbstract:
    @abstractmethod
    def run(self): ...

print("no ABCMeta, so no check:", NotAbstract().run())

class Late(Base):
    def run(self): return "ok"

Late.run = None
print("abstractmethods frozen at creation:", Late.__abstractmethods__)
print("still instantiable:", Late() is not None)''',
    guesses=["Creating Incomplete raises", "NotAbstract cannot be instantiated"],
    explanation=[
        "<code>@abstractmethod</code> only sets a flag on the function. The enforcement lives in <code>ABCMeta</code>, which at class-creation time collects the names still abstract into <code>__abstractmethods__</code>, and in <code>object.__new__</code>, which refuses to instantiate a class whose set is non-empty.",
        "So the check happens at <em>instantiation</em>, not at class definition. A subclass that forgets a method is created successfully, imports successfully, passes <code>issubclass</code>, and only fails when someone constructs it. On a plugin loaded at request time, that means production.",
        "Without <code>ABCMeta</code> in the metaclass chain there is no enforcement at all &mdash; <code>@abstractmethod</code> on an ordinary class is decoration with no effect, and this is a common copy-paste error.",
        "The set is also computed once, at class creation. Removing the implementation afterwards does not restore abstractness.",
    ],
    fix_note="Inherit from <code>ABC</code> so the metaclass is present, and use <code>__init_subclass__</code> if you want failure at definition time:",
    fix='''from abc import ABC, abstractmethod

class Base(ABC):
    @abstractmethod
    def run(self): ...

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        missing = {n for n in ("run",) if getattr(cls, n, None) is getattr(Base, n)}
        if missing:
            raise TypeError(f"{cls.__name__} must implement {sorted(missing)}")

try:
    class Incomplete(Base):
        pass
except TypeError as exc:
    print("TypeError at definition:", exc)

class Complete(Base):
    def run(self): return "ok"

print(Complete().run())''',
    takeaway="ABCs fail at construction, not at import. `@abstractmethod` without `ABCMeta` does nothing at all.",
    refs=[("Python docs &mdash; abc",
           "https://docs.python.org/3/library/abc.html")],
),

]
