/* ------------------------------------------------------------------
   python-grail entry data.
   Every snippet here was actually run before it was written up.
   Outputs come from CPython 3.12+ unless the entry says otherwise.
   ------------------------------------------------------------------ */

window.GRAIL_ENTRIES = [
  {
    id: "mutable-default-argument",
    num: 1,
    title: "Mutable Default Arguments",
    subtitle: "the list that remembers",
    difficulty: "beginner",
    tags: ["functions", "mutability", "defaults"],
    question: "What does this print?",
    code: `def add_item(item, basket=[]):
    basket.append(item)
    return basket

print(add_item("apple"))
print(add_item("banana"))
print(add_item("cherry", []))
print(add_item("date"))`,
    output: `['apple']
['apple', 'banana']
['cherry']
['apple', 'banana', 'date']`,
    guesses: [
      "['apple'] then ['banana'] then ['cherry'] then ['date']",
      "A fresh empty list on every call"
    ],
    explanation: [
      "Default arguments are evaluated <strong>once</strong>, when the <code>def</code> statement runs &mdash; not on every call. That single list object is stashed on the function and reused forever.",
      "So <code>add_item(\"apple\")</code> mutates the shared default in place. The next bare call sees the leftovers. Passing an explicit <code>[]</code> sidesteps the default entirely, which is why <code>\"cherry\"</code> lands in a clean list &mdash; but that call does nothing to reset the default, so <code>\"date\"</code> joins apple and banana.",
      "You can watch the default rot in real time:"
    ],
    extraCode: `>>> add_item.__defaults__
([],)
>>> add_item("x")
['x']
>>> add_item.__defaults__
(['x'],)`,
    fixNote: "Use <code>None</code> as the sentinel and build the real default inside the body:",
    fixCode: `def add_item(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket`,
    takeaway: "Immutable defaults (numbers, strings, tuples, None) are safe. Anything you can mutate is a trap.",
    refs: [
      { label: "Python docs &mdash; default argument values", url: "https://docs.python.org/3/reference/compound_stmts.html#function-definitions" }
    ]
  },

  {
    id: "late-binding-closures",
    num: 2,
    title: "Late-Binding Closures",
    subtitle: "every lambda agreed on the last value",
    difficulty: "intermediate",
    tags: ["closures", "lambdas", "comprehensions", "laziness"],
    question: "What do these two prints produce?",
    code: `multipliers = [lambda x: i * x for i in range(4)]
print([m(2) for m in multipliers])

gen = (lambda x: i * x for i in range(4))
print([m(2) for m in gen])`,
    output: `[6, 6, 6, 6]
[0, 2, 4, 6]`,
    guesses: [
      "[0, 2, 4, 6] for both",
      "[6, 6, 6, 6] for both"
    ],
    explanation: [
      "A closure captures the <em>variable</em>, not the value it held when the closure was created. All four lambdas in the list comprehension close over the same cell for <code>i</code>. By the time you call any of them the comprehension has finished and that cell holds <code>3</code>, so every lambda computes <code>3 * 2</code>.",
      "The generator expression prints something different for a reason that has nothing to do with scoping rules: it is <strong>lazy</strong>. Each lambda is produced, and immediately called by the outer comprehension, while <code>i</code> still holds its current value. Interleaving the creation and the call hides the bug &mdash; it does not fix it.",
      "Drain the generator into a list first and the bug comes right back:"
    ],
    extraCode: `>>> gen = (lambda x: i * x for i in range(4))
>>> funcs = list(gen)
>>> [m(2) for m in funcs]
[6, 6, 6, 6]`,
    fixNote: "Bind the value at definition time with a default argument, which (per entry 01) is evaluated eagerly:",
    fixCode: `multipliers = [lambda x, i=i: i * x for i in range(4)]
print([m(2) for m in multipliers])
# [0, 2, 4, 6]

# or, more readably:
from functools import partial
import operator
multipliers = [partial(operator.mul, i) for i in range(4)]`,
    takeaway: "The same defect bites def-in-a-loop, nested functions and decorators. If a closure reads a loop variable, ask when it will be called.",
    refs: [
      { label: "Python FAQ &mdash; why do lambdas defined in a loop with different values all return the same result?", url: "https://docs.python.org/3/faq/programming.html#why-do-lambdas-defined-in-a-loop-with-different-values-all-return-the-same-result" }
    ]
  },

  {
    id: "class-body-comprehension-scope",
    num: 3,
    title: "Comprehensions Cannot See The Class Body",
    subtitle: "one line works, the next line raises NameError",
    difficulty: "advanced",
    tags: ["scope", "classes", "comprehensions", "namespaces"],
    question: "Does this class definition succeed? If not, which line fails?",
    code: `class Config:
    scale = 10
    sizes = [i for i in range(scale)]
    scaled = [scale * i for i in range(3)]

print(Config.scaled)`,
    output: `Traceback (most recent call last):
  File "config.py", line 1, in <module>
    class Config:
  File "config.py", line 4, in Config
    scaled = [scale * i for i in range(3)]
              ^^^^^
NameError: name 'scale' is not defined`,
    guesses: [
      "[0, 10, 20] &mdash; scale is right there",
      "Both comprehension lines fail"
    ],
    explanation: [
      "A comprehension gets its own function scope, and that scope's enclosing namespace is the module, not the class body. Class bodies are deliberately skipped during name resolution &mdash; otherwise methods would silently see sibling attributes as bare names.",
      "So why does line 3 work? Because the <strong>outermost iterable</strong> is the one piece of a comprehension that is evaluated eagerly, in the enclosing scope, and passed into the implicit function as an argument. <code>range(scale)</code> is that iterable, so <code>scale</code> resolves fine. The element expression <code>scale * i</code> on line 4 runs <em>inside</em> the implicit function, which cannot see the class body at all.",
      "Disassembling makes the split explicit &mdash; the iterable is built by the class body and handed over:"
    ],
    extraCode: `>>> class Config:
...     scale = 10
...     sizes = [i for i in range(scale)]   # fine: range(scale) is eager
...     first = [scale for _ in range(1)]   # NameError: scale
...
>>> def scale_visible():
...     scale = 10
...     return [scale * i for i in range(3)]   # fine: function scope nests
...
>>> scale_visible()
[0, 10, 20]`,
    fixNote: "Pass the value in through the iterable, or lift the constant out of the class body:",
    fixCode: `SCALE = 10

class Config:
    scale = SCALE
    scaled = [SCALE * i for i in range(3)]

# or keep it local to the comprehension:
class Config:
    scale = 10
    scaled = [s * i for s in (scale,) for i in range(3)]`,
    takeaway: "Same rule applies to generator expressions, set and dict comprehensions, and to lambdas written in a class body. Functions nest; class bodies do not.",
    refs: [
      { label: "Python docs &mdash; execution model, resolution of names", url: "https://docs.python.org/3/reference/executionmodel.html#resolution-of-names" },
      { label: "Python docs &mdash; displays for lists, sets and dictionaries", url: "https://docs.python.org/3/reference/expressions.html#displays-for-lists-sets-and-dictionaries" }
    ]
  }
];
