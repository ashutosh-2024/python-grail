# Entry backlog

**All 100 of these have now been written up and shipped.** They live in
[`content/entries.py`](content/entries.py) and are on the site. This file is
kept as a readable index of what the collection covers; it is not a to-do list
any more. For the authoritative list, use [Browse](browse.html).

Ground rule from the README still applies: **run it before you write it up.**
Some of these are CPython implementation details rather than language
guarantees — where that is the case, the entry has to say so, because "works on
my interpreter" is not the same as "specified".

Numbering here is a backlog index only. The `num` field on a published entry is
assigned when it ships.

---

## Beginner — 30

Already published: **Mutable default arguments** — the default list is created once, at `def` time.

1. **`is` is not `==`** — `a = 256; b = 256; a is b` is `True`, but with `257` it is `False`. The small-int cache, `[-5, 256]`.
2. **The same literal, two answers** — `a = 257; b = 257; a is b` is `False` in the REPL but `True` inside a script. Per-code-object constant folding.
3. **0.1 + 0.2** — `!= 0.3`. The classic binary-float entry; pair it with `Decimal` and `math.isclose`.
4. **`round(0.5)` is 0** — banker's rounding. `round(2.5)` is `2`, `round(1.5)` is `2`.
5. **Floor division goes down, not toward zero** — `-7 // 2` is `-4`, not `-3`.
6. **The modulo sign follows the divisor** — `-7 % 3` is `2`, not `-1`.
7. **`[[0] * 3] * 3`** — a grid of three references to *one* row. Write to `grid[0][0]`, watch all three change.
8. **`b = a` does not copy** — aliasing a list, and how `a[:]` / `list(a)` / `copy.copy` differ from `deepcopy`.
9. **`x = y = []`** — one list, two names.
10. **`.sort()` returns None** — `a = a.sort()` silently destroys your list. Same for `.reverse()` and `.append()`.
11. **`.replace()` does not mutate** — strings are immutable, so the return value is the whole point.
12. **`strip("abc")` is not `removeprefix`** — it strips *characters*, so `"abcdef".strip("abc")` is `"def"` but `"cbaXcba".strip("abc")` is `"X"`.
13. **`split()` vs `split(" ")`** — on `"a  b"` the first gives two items, the second gives three.
14. **`True + True` is 2** — `bool` subclasses `int`, so `sum([True, True, False])` is `2`.
15. **`{1: "a", True: "b"}` has one key** — `hash(1) == hash(True)` and they compare equal. Also `{0, False}`.
16. **Slices forgive, indexes do not** — `[1,2,3][10:20]` is `[]`, `[1,2,3][10]` raises.
17. **`a[5:1:-1]`** — negative-step slices, and why `a[::-1]` works but `a[3:0:-1]` drops an element.
18. **`(1)` is not a tuple** — the trailing comma makes the tuple, not the parentheses.
19. **Tuples are only shallowly immutable** — `t = ([1],); t[0].append(2)` works fine.
20. **The `t[0] += [2]` paradox** — raises `TypeError` *and* mutates the list anyway. Both halves are correct.
21. **Deleting while iterating** — `for x in items: items.remove(x)` skips every other element.
22. **`+=` on a list is `extend`** — so `l += "abc"` appends three characters, while `l = l + "abc"` raises.
23. **`range` is not a list** — it is lazy, it is sliceable, and `range(10)[2:5]` is another `range`.
24. **`in` on a dict checks keys** — and `in` on a string checks substrings, not characters.
25. **`or` returns a value, not a bool** — `0 or "" or None` is `None`, and `x = x or default` is a bug when `x` is `0`.
26. **Falsy is not None** — `if not count:` fires on `0`; `if count is None:` is what you meant.
27. **`zip` stops at the shortest** — silent data loss. `strict=True` since 3.10.
28. **Chained comparison is not what it looks like** — `a < b < c` is an `and` that evaluates `b` once, and `False == False in [False]` is `True`.
29. **`dict(d)` is a shallow copy** — nested values are still shared.
30. **Class attributes are shared** — a mutable class-level list is shared by every instance until someone rebinds it.

## Intermediate — 40

Already published: **Late-binding closures** — the lambdas capture the variable, not the value.

31. **The loop variable outlives the loop** — `for i in range(3): pass` leaves `i == 2`; comprehensions do not leak.
32. **`for ... else`** — the `else` runs when the loop was *not* broken out of. Almost everyone guesses backwards.
33. **`return` in `finally` swallows the exception** — and discards the `return` in the `try`.
34. **A generator is empty the second time** — `list(g)` twice gives you the data, then nothing.
35. **Generators defer their side effects** — the `print` inside a generator does not fire until you iterate.
36. **Mutating a dict while iterating** — `RuntimeError: dictionary changed size during iteration`, and why `list(d)` fixes it.
37. **`setdefault` always evaluates its default** — `d.setdefault(k, expensive())` calls `expensive()` on every hit. Same for `dict.get`.
38. **`defaultdict` inserts on read** — a bare `d[k]` lookup grows the dict.
39. **`Counter` arithmetic drops zeros and negatives** — `Counter(a) - Counter(b)` is not symmetric difference.
40. **`all([])` is True** — vacuous truth, and the bug it causes in validation code.
41. **`any` short-circuits over a generator** — side effects after the first `True` never happen.
42. **`min`/`max` return the first tie** — which makes `max(d, key=d.get)` depend on insertion order.
43. **`sorted` on mixed types** — `TypeError` in Python 3, silently "worked" in Python 2.
44. **NaN breaks sorting and equality** — `nan != nan`, and a list containing NaN cannot be reliably sorted.
45. **But `nan in [nan]` is True** — containment checks identity before equality.
46. **`__eq__` without `__hash__`** — defining one makes your class unhashable, silently breaking sets and dict keys.
47. **`UnboundLocalError` from `x += 1`** — one assignment anywhere makes the name local for the *whole* function.
48. **`global` vs `nonlocal`** — and why `nonlocal` at module level is a `SyntaxError`.
49. **`except E as e` deletes `e`** — the name is unbound after the block, on purpose.
50. **Bare `except:` catches `KeyboardInterrupt`** — and `SystemExit`, which is why Ctrl-C stops working.
51. **`self.count += 1` on a class attribute** — reads the class, writes the instance, and the shared counter silently forks.
52. **Decorators without `functools.wraps`** — `__name__`, `__doc__` and the signature all vanish.
53. **Decorator stacking order** — bottom-up at decoration time, top-down at call time.
54. **Decorators run at import time** — a decorator with a side effect fires when the module loads.
55. **`@property` setter must reuse the name** — `@value.setter def set_value` silently creates a second property.
56. **`a.f is a.f` is False** — a new bound method object is created on every attribute access.
57. **`staticmethod` was not callable** — `Klass.__dict__["f"]()` raised before 3.10.
58. **`copy` vs `deepcopy` on a cycle** — `deepcopy` handles it with a memo; naive recursion does not.
59. **`zip(*matrix)` gives tuples** — a transpose that quietly changes the element type.
60. **`{**a, **b}` — later wins** — and how that differs from `a.update(b)` returning `None`.
61. **`itertools.tee` buffers** — tee a large generator, consume one branch fully, and everything is held in memory.
62. **`assert` disappears under `-O`** — never put a side effect or a security check in an `assert`.
63. **Default encoding is platform-dependent** — `open()` without `encoding=` reads differently on Windows. `encoding="locale"` and PEP 686.
64. **`len()` on non-ASCII** — `len("é")` depends on NFC vs NFD normalisation, and `len("👨‍👩‍👧")` is 5.
65. **`datetime.now()` vs `utcnow()`** — both naive, one lies about the timezone. Deprecated in 3.12.
66. **f-string `=` and nested quotes** — `f"{x=}"`, and why reusing the outer quote was a `SyntaxError` before 3.12.
67. **`"".join` vs `+=` in a loop** — CPython's in-place concat optimisation is real but fragile, and vanishes the moment there is a second reference.
68. **The walrus leaks** — `[y := f(x) for x in data]` binds `y` in the *enclosing* scope, deliberately.
69. **`match` treats a bare name as a capture** — `case STATUS_OK:` matches everything and rebinds `STATUS_OK`. It needs a dotted name.
70. **`Decimal(0.1)`** — the full binary expansion appears; `Decimal("0.1")` does not.

## Advanced — 30

Already published: **Comprehensions cannot see the class body** — only the outermost iterable is evaluated eagerly.

71. **Dunder lookup skips the instance** — `len(x)` calls `type(x).__len__`; assigning `x.__len__` does nothing.
72. **`__bool__` falls back to `__len__`** — an object whose `__len__` returns 0 is falsy whether you meant it or not.
73. **Data vs non-data descriptors** — a data descriptor beats the instance `__dict__`, a non-data one loses to it.
74. **`__getattr__` vs `__getattribute__`** — and the `self.x` inside `__getattribute__` that recurses until the stack dies.
75. **`super()` needs the `__class__` cell** — zero-argument `super()` fails outside a class body, and inside `exec`.
76. **The MRO can be impossible** — `TypeError: Cannot create a consistent method resolution order` from a C3 linearisation failure.
77. **`super()` is not "the parent class"** — in a diamond it is the next class in the *instance's* MRO, which the author never saw.
78. **`__slots__` silently does nothing** — if any base lacks it, or if you also define `__dict__`.
79. **`__slots__` kills weak references** — unless you add `__weakref__` explicitly.
80. **Mutable default in a dataclass** — `ValueError` at class definition, and why `field(default_factory=list)` exists.
81. **`@dataclass(eq=True)` sets `__hash__ = None`** — your dataclass silently stops working as a dict key.
82. **`lru_cache` on a method leaks** — the cache holds `self` forever, so instances are never collected.
83. **A generator's `return` value** — lands on `StopIteration.value`, reachable only through `yield from`.
84. **`yield from` is not a loop** — it forwards `send`, `throw` and `close`, which a `for` loop does not.
85. **`with open(...)` inside a generator** — the file stays open until the generator is exhausted or collected.
86. **An exception in `__exit__` masks the original** — and how to chain instead of swallow.
87. **Forgetting `await`** — you get a coroutine object, a truthy one, and a `RuntimeWarning` at exit rather than an error.
88. **Tasks are garbage collected** — `asyncio.create_task` without keeping a reference can vanish mid-flight.
89. **`gather` vs `TaskGroup`** — different cancellation semantics on first failure.
90. **A blocking call in the event loop** — `time.sleep` in a coroutine stalls every other task.
91. **`threading.local` is wrong in async** — `contextvars` is the async-safe equivalent.
92. **`from module import name` binds a copy** — rebinding `module.name` later does not update the importer.
93. **Circular imports give you a half-built module** — `ImportError: cannot import name ... (most likely due to a circular import)`.
94. **`python -m pkg.mod` imports it twice** — once as `__main__`, once as `pkg.mod`, with two copies of every global.
95. **Mutating `locals()` does nothing** — inside a function it is a snapshot. PEP 667 made that explicit in 3.13.
96. **`__del__` and reference cycles** — historically uncollectable, and still unpredictable at interpreter shutdown.
97. **Enum members with equal values become aliases** — `RED = 1; CRIMSON = 1` gives you one member and a silent alias.
98. **`from __future__ import annotations`** — every annotation becomes a string, and runtime introspection breaks.
99. **`__init_subclass__` and `__set_name__`** — the two hooks that run without a metaclass.
100. **`abc` does not stop you** — abstract methods are enforced at instantiation, not at class creation.
