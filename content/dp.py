# -*- coding: utf-8 -*-
"""Dynamic programming topic for the DSA path.

Same contract as content/dsa.py: every `code` block is executed by build.py
with PRELUDE + this topic's `prelude` + the problem's `tests` appended.

Unlike the other topics, DP is organised into *patterns*. The topic page lists
the patterns; each pattern page opens with `idea` (what the state is and why
the recurrence has the shape it has) and then its problems. `summary` is the
one-liner shown on the pattern's box.

Problems with a `slug` get their statement, examples, constraints and tags
from content/leetcode.json. The GeeksforGeeks classics supply their own and
carry a `ref` link instead of a LeetCode one.
"""

PRELUDE_DP = '''import bisect
import itertools
import random
from functools import cache
from math import comb, inf, isqrt
'''


# =================================================================== pattern 0
P0 = dict(
    id="foundations",
    title="Recursion, memo, table",
    summary="the same answer three ways: brute force, top-down memo, bottom-up table",
    idea=[
        "Every DP problem starts life as a recursion that recomputes the same subproblems over and over. Fibonacci is the purest example: <code>fib(n)</code> calls <code>fib(n-1)</code> and <code>fib(n-2)</code>, and both of those call <code>fib(n-3)</code>, and so on &mdash; an exponential tree of calls over only <code>n</code> distinct arguments.",
        "<strong>Top-down (memoisation)</strong> keeps the recursion and caches each answer the first time it is computed. In Python that is one decorator, <code>@functools.cache</code>. <strong>Bottom-up (tabulation)</strong> fills a table from the smallest subproblem upwards so every value you need is already there. Same recurrence, same complexity; bottom-up avoids Python's 1000-frame recursion limit and makes the next step visible.",
        "That next step is <strong>rolling state</strong>: if row <code>i</code> only reads rows <code>i-1</code> and <code>i-2</code>, you only ever need two variables, not a table of <code>n</code>. Learn the three moves here, on problems where the recurrence is obvious, and the rest of the patterns are just new recurrences.",
    ],
    problems=[

    dict(
        id="nth-fibonacci",
        name="Nth Fibonacci Number",
        difficulty="easy",
        ref=("Read on GeeksforGeeks",
             "https://www.geeksforgeeks.org/dsa/program-for-nth-fibonacci-number/"),
        tags=["Dynamic Programming", "Recursion", "Memoization", "Math"],
        statement=[
            "Given a non-negative integer <code>n</code>, return the <code>n</code>-th Fibonacci number, where <code>F(0) = 0</code>, <code>F(1) = 1</code> and <code>F(n) = F(n-1) + F(n-2)</code> for <code>n &gt; 1</code>.",
            "It is here not because it is hard but because it is the cleanest possible place to see the brute force &rarr; memo &rarr; table &rarr; rolling-variables progression that every later problem follows.",
        ],
        examples=[
            dict(input="n = 5", output="5", explanation="0, 1, 1, 2, 3, 5"),
            dict(input="n = 10", output="55"),
        ],
        constraints=["<code>0 &lt;= n &lt;= 90</code>"],
        approaches=[
            dict(
                name="Plain recursion",
                time="O(&phi;<sup>n</sup>) &asymp; O(1.618<sup>n</sup>)",
                space="O(n)",
                tag="the problem DP solves",
                why=[
                    "A direct translation of the definition. It is correct and hopeless: the call tree branches twice at every level and recomputes the same arguments exponentially many times &mdash; <code>fib(40)</code> makes over 300 million calls.",
                    "Space is O(n) because only one root-to-leaf path of the call tree is on the stack at a time.",
                ],
                code='''def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)''',
            ),
            dict(
                name="Top-down memo",
                time="O(n)",
                space="O(n)",
                why=[
                    "Same recursion, but each distinct <code>n</code> is computed once and then served from the cache. There are n+1 distinct arguments and each does O(1) work beyond its cached calls, so O(n).",
                    "The cache and the recursion stack are both O(n). The stack is the practical limit: CPython stops at 1000 frames by default, so top-down breaks long before bottom-up does.",
                ],
                code='''def fib(n):
    @cache
    def go(i):
        if i < 2:
            return i
        return go(i - 1) + go(i - 2)
    return go(n)''',
            ),
            dict(
                name="Bottom-up, two variables",
                time="O(n)",
                space="O(1)",
                best=True,
                why=[
                    "Fill from <code>F(0)</code> upwards. Each value only needs the previous two, so instead of a table of n+1 entries keep just those two and slide them forward.",
                    "This is the shape to aim for in every 1-D DP: write the table version first, look at which cells each step reads, and keep only those.",
                ],
                code='''def fib(n):
    a, b = 0, 1          # F(i), F(i+1)
    for _ in range(n):
        a, b = b, a + b
    return a''',
            ),
            dict(
                name="Fast doubling",
                time="O(log n)",
                space="O(log n)",
                tag="beyond DP",
                why=[
                    "Uses the identities <code>F(2k) = F(k)(2F(k+1) - F(k))</code> and <code>F(2k+1) = F(k)<sup>2</sup> + F(k+1)<sup>2</sup></code> to halve n at each step, so only log n levels are needed.",
                    "Worth mentioning as the follow-up answer to \"can you beat O(n)?\" &mdash; it is the matrix-power method without the matrices.",
                ],
                code='''def fib(n):
    def pair(k):                    # returns (F(k), F(k+1))
        if k == 0:
            return 0, 1
        a, b = pair(k // 2)
        c = a * (2 * b - a)
        d = a * a + b * b
        return (d, c + d) if k % 2 else (c, d)
    return pair(n)[0]''',
            ),
        ],
        tests='''assert [fib(i) for i in range(11)] == [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
assert fib(20) == 6765
assert fib(24) == 46368''',
    ),

    dict(
        id="climbing-stairs",
        lc=70, slug="climbing-stairs",
        name="Climbing Stairs",
        difficulty="easy",
        approaches=[
            dict(
                name="Top-down memo",
                time="O(n)",
                space="O(n)",
                why=[
                    "The last move onto step n was either a 1-step from n-1 or a 2-step from n-2, and those two cases never overlap. So <code>ways(n) = ways(n-1) + ways(n-2)</code> &mdash; Fibonacci shifted by one.",
                    "Finding that recurrence is the whole problem. Ask \"what was the last decision?\" and split on it; that question is the DP method.",
                ],
                code='''def climb_stairs(n):
    @cache
    def ways(i):
        if i <= 1:
            return 1        # one way to stand still, one way to take a single step
        return ways(i - 1) + ways(i - 2)
    return ways(n)''',
            ),
            dict(
                name="Bottom-up, two variables",
                time="O(n)",
                space="O(1)",
                best=True,
                why=[
                    "Each step only reads the two below it, so two variables replace the table.",
                    "The base case <code>ways(0) = 1</code> surprises people: there is exactly one way to climb zero stairs &mdash; do nothing. Getting it wrong shifts every answer by one.",
                ],
                code='''def climb_stairs(n):
    a, b = 1, 1          # ways(0), ways(1)
    for _ in range(n - 1):
        a, b = b, a + b
    return b''',
            ),
        ],
        tests='''assert climb_stairs(1) == 1
assert climb_stairs(2) == 2
assert climb_stairs(3) == 3
assert climb_stairs(5) == 8


def brute(n):
    return 1 if n <= 1 else brute(n - 1) + brute(n - 2)


for n in range(1, 20):
    assert climb_stairs(n) == brute(n), n
assert climb_stairs(45) == 1836311903''',
    ),
    ],
)


# =================================================================== pattern 1
P1 = dict(
    id="linear",
    title="1-D linear DP",
    summary="state = the best answer for the prefix ending at i",
    idea=[
        "The state is a single index: <code>dp[i]</code> is the answer for the first <code>i</code> elements, or for the best choice that <em>ends</em> at element <code>i</code>. The recurrence decides what to do with element <code>i</code> given the answers for smaller prefixes &mdash; usually take it or skip it.",
        "House Robber is the template: rob house <code>i</code> and add <code>dp[i-2]</code>, or skip it and keep <code>dp[i-1]</code>. Nearly every problem in this pattern is that sentence with different nouns. Maximum Subarray asks \"extend the run ending at <code>i-1</code>, or start fresh?\"; Decode Ways asks \"read one digit or two?\"; Delete and Earn is House Robber after you rearrange the input.",
        "Because each step reads only the last one or two states, the answer is almost always O(n) time and O(1) space once you roll the variables. If your 1-D solution uses a full array, look again.",
    ],
    problems=[

    dict(
        id="house-robber",
        lc=198, slug="house-robber",
        name="House Robber",
        difficulty="medium",
        approaches=[
            dict(
                name="Two rolling variables",
                time="O(n)",
                space="O(1)",
                best=True,
                why=[
                    "Let <code>dp[i]</code> be the most you can take from the first <code>i</code> houses. For house <code>i</code> there are two options: skip it (<code>dp[i-1]</code>) or rob it, which rules out its neighbour (<code>dp[i-2] + nums[i]</code>). Take the larger.",
                    "Only the previous two values are ever read, so keep <code>prev</code> and <code>cur</code> instead of an array. One pass, constant space.",
                ],
                code='''def rob(nums):
    prev, cur = 0, 0         # best for houses[:i-1], houses[:i]
    for x in nums:
        prev, cur = cur, max(cur, prev + x)
    return cur''',
            ),
            dict(
                name="Top-down memo",
                time="O(n)",
                space="O(n)",
                why=[
                    "<code>best(i)</code> = the most you can take from house <code>i</code> onwards: <code>max(best(i+1), nums[i] + best(i+2))</code>. Same recurrence read from the other end, n distinct states, O(1) each.",
                    "Fine for explaining your thinking; recursion depth is n, so it fails past about a thousand houses in CPython without raising the limit.",
                ],
                code='''def rob(nums):
    @cache
    def best(i):
        if i >= len(nums):
            return 0
        return max(best(i + 1), nums[i] + best(i + 2))
    return best(0)''',
            ),
        ],
        tests='''assert rob([1, 2, 3, 1]) == 4
assert rob([2, 7, 9, 3, 1]) == 12
assert rob([5]) == 5
assert rob([2, 1, 1, 2]) == 4


def brute(nums):
    n, best = len(nums), 0
    for mask in range(1 << n):
        if mask & (mask >> 1) == 0:
            best = max(best, sum(nums[i] for i in range(n) if mask >> i & 1))
    return best


random.seed(2)
for _ in range(60):
    data = [random.randint(0, 40) for _ in range(random.randint(1, 12))]
    assert rob(data) == brute(data), data''',
        pitfall="Assuming the answer alternates houses (all evens or all odds). <code>[2, 1, 1, 2]</code> is best robbed at both ends, skipping two in a row.",
    ),

    dict(
        id="house-robber-ii",
        lc=213, slug="house-robber-ii",
        name="House Robber II",
        difficulty="medium",
        approaches=[
            dict(
                name="Two linear passes",
                time="O(n)",
                space="O(1)",
                best=True,
                why=[
                    "The circle adds one constraint: the first and last house cannot both be robbed. So at least one of them is skipped &mdash; which means the answer is the better of <em>House Robber on <code>nums[1:]</code></em> and <em>House Robber on <code>nums[:-1]</code></em>.",
                    "That reduction, \"break the cycle by fixing one endpoint\", is the idea to carry away. It turns a circular DP into two straight ones.",
                    "A single house is its own special case: both slices would be empty.",
                ],
                code='''def rob(nums):
    def line(houses):
        prev, cur = 0, 0
        for x in houses:
            prev, cur = cur, max(cur, prev + x)
        return cur

    if len(nums) == 1:
        return nums[0]
    return max(line(nums[1:]), line(nums[:-1]))''',
            ),
        ],
        tests='''assert rob([2, 3, 2]) == 3
assert rob([1, 2, 3, 1]) == 4
assert rob([1, 2, 3]) == 3
assert rob([7]) == 7
assert rob([1, 7]) == 7


def brute(nums):
    n, best = len(nums), 0
    for mask in range(1 << n):
        ok = mask & (mask >> 1) == 0 and not (n > 1 and mask & 1 and mask >> (n - 1) & 1)
        if ok:
            best = max(best, sum(nums[i] for i in range(n) if mask >> i & 1))
    return best


random.seed(3)
for _ in range(60):
    data = [random.randint(0, 30) for _ in range(random.randint(1, 12))]
    assert rob(data) == brute(data), data''',
    ),

    dict(
        id="maximum-subarray",
        lc=53, slug="maximum-subarray",
        name="Maximum Subarray",
        difficulty="medium",
        approaches=[
            dict(
                name="Kadane's algorithm",
                time="O(n)",
                space="O(1)",
                best=True,
                why=[
                    "Let <code>end_here</code> be the best sum of a subarray that <em>ends exactly at</em> index <code>i</code>. It either extends the best run ending at <code>i-1</code> or starts fresh at <code>i</code>: <code>max(end_here + x, x)</code>. The answer is the best <code>end_here</code> seen.",
                    "The \"ends exactly at i\" framing is what makes this DP. \"Best subarray in the prefix\" does not give a recurrence on its own; \"best ending here\" does, because a subarray ending at i is always one ending at i-1 plus one element, or just that element.",
                    "Start from <code>nums[0]</code>, not 0, or an all-negative array returns 0 for an empty subarray the problem does not allow.",
                ],
                code='''def max_sub_array(nums):
    best = end_here = nums[0]
    for x in nums[1:]:
        end_here = max(end_here + x, x)
        best = max(best, end_here)
    return best''',
            ),
            dict(
                name="Every start, running sum",
                time="O(n&sup2;)",
                space="O(1)",
                tag="baseline",
                why=[
                    "Fix a start, extend the end one step at a time and keep a running sum. Correct, and the version to beat &mdash; it redoes work Kadane shares between neighbouring starts.",
                ],
                code='''def max_sub_array(nums):
    best = nums[0]
    for i in range(len(nums)):
        total = 0
        for j in range(i, len(nums)):
            total += nums[j]
            best = max(best, total)
    return best''',
            ),
        ],
        tests='''assert max_sub_array([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == 6
assert max_sub_array([1]) == 1
assert max_sub_array([5, 4, -1, 7, 8]) == 23
assert max_sub_array([-3, -1, -2]) == -1
random.seed(4)
for _ in range(60):
    data = [random.randint(-20, 20) for _ in range(random.randint(1, 25))]
    expect = max(sum(data[i:j]) for i in range(len(data)) for j in range(i + 1, len(data) + 1))
    assert max_sub_array(data) == expect, data''',
        pitfall="Initialising the answer to 0. With every number negative the answer is the largest single element, and 0 is not a legal subarray sum.",
    ),

    dict(
        id="decode-ways",
        lc=91, slug="decode-ways",
        name="Decode Ways",
        difficulty="medium",
        approaches=[
            dict(
                name="Two rolling counts",
                time="O(n)",
                space="O(1)",
                best=True,
                why=[
                    "Let <code>dp[i]</code> be the number of ways to decode the first <code>i</code> characters. The last letter used either one digit (valid if it is not <code>'0'</code>) or two digits (valid if they form 10&ndash;26). So <code>dp[i]</code> adds <code>dp[i-1]</code> and/or <code>dp[i-2]</code>.",
                    "It is Climbing Stairs where some steps are forbidden. The zeros are the whole difficulty: <code>'0'</code> alone decodes to nothing, so <code>\"06\"</code> has zero ways and <code>\"10\"</code> has exactly one.",
                ],
                code='''def num_decodings(s):
    prev, cur = 0, 1         # dp[i-1], dp[i]; dp[0] = 1 (empty prefix)
    for i in range(len(s)):
        nxt = cur if s[i] != "0" else 0
        if i > 0 and "10" <= s[i - 1:i + 1] <= "26":
            nxt += prev
        prev, cur = cur, nxt
    return cur''',
            ),
            dict(
                name="Top-down memo",
                time="O(n)",
                space="O(n)",
                why=[
                    "<code>ways(i)</code> = decodings of <code>s[i:]</code>. A leading <code>'0'</code> kills the branch; otherwise take one digit, and also two if they are &le; 26.",
                    "Reads more naturally than the table and is the version to write first in an interview; convert to rolling variables once the recurrence is agreed.",
                ],
                code='''def num_decodings(s):
    @cache
    def ways(i):
        if i == len(s):
            return 1
        if s[i] == "0":
            return 0
        total = ways(i + 1)
        if i + 1 < len(s) and int(s[i:i + 2]) <= 26:
            total += ways(i + 2)
        return total
    return ways(0)''',
            ),
        ],
        tests='''assert num_decodings("12") == 2
assert num_decodings("226") == 3
assert num_decodings("06") == 0
assert num_decodings("10") == 1
assert num_decodings("2101") == 1
assert num_decodings("100") == 0
assert num_decodings("27") == 1


def brute(s):
    if not s:
        return 1
    total = 0
    for k in (1, 2):
        if len(s) >= k and s[0] != "0" and 1 <= int(s[:k]) <= 26:
            total += brute(s[k:])
    return total


random.seed(5)
for _ in range(200):
    s = "".join(random.choice("0112226789") for _ in range(random.randint(1, 12)))
    assert num_decodings(s) == brute(s), s''',
        pitfall="Treating <code>\"0\"</code> like any other digit. It can only appear as the second half of 10 or 20.",
    ),

    dict(
        id="delete-and-earn",
        lc=740, slug="delete-and-earn",
        name="Delete and Earn",
        difficulty="medium",
        approaches=[
            dict(
                name="Bucket by value, then House Robber",
                time="O(n + m)",
                space="O(m)",
                best=True,
                why=[
                    "If you take any copy of value <code>v</code> you may as well take every copy, earning <code>v &times; count(v)</code>, and you lose all <code>v-1</code> and <code>v+1</code>. So collapse the input into <code>points[v]</code> and the problem becomes: pick values, no two adjacent, maximise points.",
                    "That is exactly House Robber on the array <code>points[0..m]</code> where <code>m</code> is the largest value. Recognising a known problem after a transformation is the skill this one tests.",
                    "O(n) to bucket, O(m) to scan. With m up to 10<sup>4</sup> that is cheaper than sorting.",
                ],
                code='''def delete_and_earn(nums):
    points = [0] * (max(nums) + 1)
    for x in nums:
        points[x] += x
    prev, cur = 0, 0
    for p in points:
        prev, cur = cur, max(cur, prev + p)
    return cur''',
            ),
            dict(
                name="Sorted distinct values",
                time="O(n log n)",
                space="O(n)",
                why=[
                    "Walk the distinct values in order. If the current value is exactly one more than the previous, it conflicts and you choose House Robber style; if there is a gap, there is no conflict and you simply add.",
                    "Better when values are huge and sparse (say up to 10<sup>9</sup>), where an array indexed by value would not fit.",
                ],
                code='''def delete_and_earn(nums):
    from collections import Counter
    count = Counter(nums)
    prev, cur, last = 0, 0, None
    for v in sorted(count):
        gain = v * count[v]
        if last is not None and v == last + 1:
            prev, cur = cur, max(cur, prev + gain)
        else:
            prev, cur = cur, cur + gain
        last = v
    return cur''',
            ),
        ],
        tests='''assert delete_and_earn([3, 4, 2]) == 6
assert delete_and_earn([2, 2, 3, 3, 3, 4]) == 9
assert delete_and_earn([1]) == 1
assert delete_and_earn([1, 1, 1, 2, 4, 5, 5, 5, 6]) == 18


def brute(nums):
    vals = sorted(set(nums))
    best = 0
    for r in range(len(vals) + 1):
        for pick in itertools.combinations(vals, r):
            if all(b - a != 1 for a, b in zip(pick, pick[1:])):
                best = max(best, sum(v * nums.count(v) for v in pick))
    return best


random.seed(6)
for _ in range(80):
    data = [random.randint(1, 10) for _ in range(random.randint(1, 12))]
    assert delete_and_earn(data) == brute(data), data''',
    ),
    ],
)


# =================================================================== pattern 2
P2 = dict(
    id="knapsack",
    title="Knapsack: 0/1 and unbounded",
    summary="state = (item, capacity); take it or leave it, once or as often as you like",
    idea=[
        "You have items and a budget &mdash; weight, a target sum, a count of zeros and ones. The state is <code>(i, c)</code>: using only the first <code>i</code> items, what is the best (or the number of ways) with capacity <code>c</code>? Item <code>i</code> is either left out, <code>dp[i-1][c]</code>, or taken, <code>dp[i-1][c - w<sub>i</sub>] + v<sub>i</sub></code>.",
        "Row <code>i</code> only reads row <code>i-1</code>, so collapse the table to one array indexed by capacity. The <strong>loop direction</strong> then carries the meaning. In <strong>0/1 knapsack</strong> each item is used at most once, so capacity runs <em>downwards</em>: when you read <code>dp[c - w]</code> it still holds the previous row's value, before this item was added. In <strong>unbounded knapsack</strong> items are reusable, so capacity runs <em>upwards</em>: <code>dp[c - w]</code> may already include this item, which is exactly what reuse means.",
        "The second subtlety is in counting problems. Coin Change II counts <em>combinations</em>, so coins go in the outer loop: each coin is introduced once and ways never list the same multiset in two orders. Swap the loops and you count <em>permutations</em> instead &mdash; a different problem with a bigger answer.",
        "Many problems here are knapsack in disguise. Partition, Target Sum and Last Stone Weight II all reduce to \"which subset sums are reachable?\" after a line of algebra. Finding that line is the interview.",
    ],
    problems=[

    dict(
        id="knapsack-01",
        name="0/1 Knapsack",
        difficulty="medium",
        ref=("Read on GeeksforGeeks",
             "https://www.geeksforgeeks.org/dsa/0-1-knapsack-problem-dp-10/"),
        tags=["Dynamic Programming", "Array", "Knapsack"],
        statement=[
            "Given <code>n</code> items, where item <code>i</code> has weight <code>wt[i]</code> and value <code>val[i]</code>, and a bag of capacity <code>W</code>, return the maximum total value of items you can put in the bag. Each item is either taken whole or left out, and each can be used at most once.",
            "This is the concept problem for the whole pattern. Every problem after it in this section is this table with a different cell type (boolean, count, minimum) or a different loop direction.",
        ],
        examples=[
            dict(input="W = 4, val = [1, 2, 3], wt = [4, 5, 1]", output="3",
                 explanation="Only item 3 (weight 1) and item 1 (weight 4) fit alone; together they weigh 5. Item 3 is worth more."),
            dict(input="W = 3, val = [1, 2, 3], wt = [4, 5, 6]", output="0",
                 explanation="Nothing fits."),
        ],
        constraints=[
            "<code>1 &lt;= n &lt;= 10<sup>3</sup></code>",
            "<code>1 &lt;= W &lt;= 10<sup>3</sup></code>",
            "<code>1 &lt;= wt[i], val[i] &lt;= 10<sup>3</sup></code>",
        ],
        approaches=[
            dict(
                name="2-D table",
                time="O(n&middot;W)",
                space="O(n&middot;W)",
                why=[
                    "<code>dp[i][c]</code> = best value using the first <code>i</code> items with capacity <code>c</code>. Leave item <code>i</code>: <code>dp[i-1][c]</code>. Take it, if it fits: <code>dp[i-1][c - wt] + val</code>.",
                    "Write this version first. It makes the dependency visible: every cell in row <code>i</code> reads only row <code>i-1</code>, at the same or a smaller capacity.",
                ],
                code='''def knapsack(W, val, wt):
    n = len(val)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        w, v = wt[i - 1], val[i - 1]
        for c in range(W + 1):
            dp[i][c] = dp[i - 1][c]
            if w <= c:
                dp[i][c] = max(dp[i][c], dp[i - 1][c - w] + v)
    return dp[n][W]''',
            ),
            dict(
                name="1-D array, capacity downwards",
                time="O(n&middot;W)",
                space="O(W)",
                best=True,
                why=[
                    "Since row <code>i</code> only reads row <code>i-1</code> at smaller-or-equal capacity, one array suffices &mdash; if you iterate capacity from high to low. Then when <code>dp[c]</code> reads <code>dp[c - w]</code>, that cell has not been updated for this item yet and still holds the previous row.",
                    "Iterate upwards and <code>dp[c - w]</code> may already include this item, so it can be taken twice. That is the unbounded knapsack, and it is the most common bug in this pattern.",
                ],
                code='''def knapsack(W, val, wt):
    dp = [0] * (W + 1)
    for w, v in zip(wt, val):
        for c in range(W, w - 1, -1):     # downwards: each item once
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[W]''',
            ),
            dict(
                name="Top-down memo",
                time="O(n&middot;W)",
                space="O(n&middot;W)",
                why=[
                    "<code>best(i, c)</code> over the items from <code>i</code> onwards. Only the (i, c) pairs actually reached get computed, which can be far fewer than n&middot;W when weights are large.",
                ],
                code='''def knapsack(W, val, wt):
    @cache
    def best(i, c):
        if i == len(val):
            return 0
        skip = best(i + 1, c)
        if wt[i] <= c:
            return max(skip, val[i] + best(i + 1, c - wt[i]))
        return skip
    return best(0, W)''',
            ),
        ],
        tests='''assert knapsack(4, [1, 2, 3], [4, 5, 1]) == 3
assert knapsack(3, [1, 2, 3], [4, 5, 6]) == 0
assert knapsack(50, [60, 100, 120], [10, 20, 30]) == 220
assert knapsack(5, [10, 40, 30, 50], [5, 4, 6, 3]) == 50


def brute(W, val, wt):
    best = 0
    for mask in range(1 << len(val)):
        items = [i for i in range(len(val)) if mask >> i & 1]
        if sum(wt[i] for i in items) <= W:
            best = max(best, sum(val[i] for i in items))
    return best


random.seed(7)
for _ in range(60):
    n = random.randint(1, 10)
    val = [random.randint(1, 30) for _ in range(n)]
    wt = [random.randint(1, 15) for _ in range(n)]
    W = random.randint(1, 40)
    assert knapsack(W, val, wt) == brute(W, val, wt), (W, val, wt)''',
        pitfall="Looping capacity upwards in the 1-D version, which silently lets each item be taken many times.",
    ),

    dict(
        id="partition-equal-subset-sum",
        lc=416, slug="partition-equal-subset-sum",
        name="Partition Equal Subset Sum",
        difficulty="medium",
        approaches=[
            dict(
                name="Boolean knapsack, 1-D",
                time="O(n&middot;S)",
                space="O(S)",
                best=True,
                why=[
                    "Two equal halves exist exactly when some subset sums to <code>total / 2</code>. If the total is odd, stop. Otherwise it is 0/1 knapsack with boolean cells: <code>can[s]</code> is whether some subset of the items so far sums to <code>s</code>.",
                    "Adding item <code>x</code>: <code>can[s] |= can[s - x]</code>, with <code>s</code> running downwards so each number is used once. <code>S</code> is the half-sum, at most 10<sup>4</sup>, so this is about 2&times;10<sup>6</sup> steps.",
                ],
                code='''def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    half = total // 2
    can = [True] + [False] * half
    for x in nums:
        for s in range(half, x - 1, -1):
            if can[s - x]:
                can[s] = True
        if can[half]:
            return True
    return can[half]''',
            ),
            dict(
                name="Bitset of reachable sums",
                time="O(n&middot;S / w)",
                space="O(S)",
                tag="Python int trick",
                why=[
                    "Represent the set of reachable sums as the bits of one integer: bit <code>s</code> is set if <code>s</code> is reachable. Adding <code>x</code> is <code>bits |= bits &lt;&lt; x</code> &mdash; every reachable sum also becomes reachable plus <code>x</code>.",
                    "Same DP, but each shift processes a whole machine word of states at once, and Python's big integers make it one line. Typically an order of magnitude faster than the list version.",
                ],
                code='''def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    bits = 1                      # only sum 0 reachable
    for x in nums:
        bits |= bits << x
    return bool(bits >> (total // 2) & 1)''',
            ),
        ],
        tests='''assert can_partition([1, 5, 11, 5]) is True
assert can_partition([1, 2, 3, 5]) is False
assert can_partition([1]) is False
assert can_partition([2, 2]) is True
assert can_partition([1, 2, 5]) is False


def brute(nums):
    total = sum(nums)
    return any(2 * sum(c) == total
               for r in range(len(nums) + 1)
               for c in itertools.combinations(nums, r))


random.seed(8)
for _ in range(80):
    data = [random.randint(1, 20) for _ in range(random.randint(1, 12))]
    assert can_partition(data) == brute(data), data''',
    ),

    dict(
        id="target-sum",
        lc=494, slug="target-sum",
        name="Target Sum",
        difficulty="medium",
        approaches=[
            dict(
                name="Reduce to subset-sum count",
                time="O(n&middot;P)",
                space="O(P)",
                best=True,
                why=[
                    "Split the numbers into the ones given <code>+</code> (sum <code>P</code>) and the ones given <code>-</code> (sum <code>N</code>). Then <code>P - N = target</code> and <code>P + N = total</code>, so <code>P = (total + target) / 2</code>. The question becomes: <em>how many subsets sum to P?</em>",
                    "If <code>total + target</code> is odd or negative, or <code>|target| &gt; total</code>, the answer is 0. Otherwise it is counting 0/1 knapsack: <code>ways[s] += ways[s - x]</code>, capacity downwards.",
                    "Zeros need no special case: a 0 doubles the count, since it can be <code>+0</code> or <code>-0</code>, and <code>ways[s] += ways[s - 0]</code> does exactly that.",
                ],
                code='''def find_target_sum_ways(nums, target):
    total = sum(nums)
    if abs(target) > total or (total + target) % 2:
        return 0
    P = (total + target) // 2
    ways = [1] + [0] * P
    for x in nums:
        for s in range(P, x - 1, -1):
            ways[s] += ways[s - x]
    return ways[P]''',
            ),
            dict(
                name="Memo on (index, running sum)",
                time="O(n&middot;total)",
                space="O(n&middot;total)",
                why=[
                    "Assign signs left to right; the state is how far along you are and the sum so far. Running sums lie in <code>[-total, total]</code>, so there are at most <code>n &times; (2&middot;total + 1)</code> states.",
                    "The direct model of the problem, with no algebra. It works, but it is roughly 4&times; the state space of the reduction and does not get the space win.",
                ],
                code='''def find_target_sum_ways(nums, target):
    @cache
    def count(i, s):
        if i == len(nums):
            return 1 if s == target else 0
        return count(i + 1, s + nums[i]) + count(i + 1, s - nums[i])
    return count(0, 0)''',
            ),
        ],
        tests='''assert find_target_sum_ways([1, 1, 1, 1, 1], 3) == 5
assert find_target_sum_ways([1], 1) == 1
assert find_target_sum_ways([1], 2) == 0
assert find_target_sum_ways([0, 0, 1], 1) == 4
assert find_target_sum_ways([100], -200) == 0


def brute(nums, target):
    return sum(1 for signs in itertools.product((1, -1), repeat=len(nums))
               if sum(s * x for s, x in zip(signs, nums)) == target)


random.seed(9)
for _ in range(60):
    data = [random.randint(0, 6) for _ in range(random.randint(1, 10))]
    t = random.randint(-10, 10)
    assert find_target_sum_ways(data, t) == brute(data, t), (data, t)''',
    ),

    dict(
        id="last-stone-weight-ii",
        lc=1049, slug="last-stone-weight-ii",
        name="Last Stone Weight II",
        difficulty="medium",
        approaches=[
            dict(
                name="Closest subset sum to half",
                time="O(n&middot;S)",
                space="O(S)",
                best=True,
                why=[
                    "Every smash subtracts one stone from another, so the final stone is some signed sum <code>&plusmn;s<sub>1</sub> &plusmn; s<sub>2</sub> &hellip;</code> &mdash; the stones split into two groups and the answer is the difference of their totals. Every split is achievable by some smash order, so minimise <code>total - 2&middot;A</code> over subset sums <code>A &le; total / 2</code>.",
                    "That is a reachable-sums knapsack up to half the total, then take the largest reachable sum. Once the reduction is seen, this is Partition Equal Subset Sum asking \"how close?\" instead of \"exactly?\".",
                ],
                code='''def last_stone_weight_ii(stones):
    total = sum(stones)
    half = total // 2
    can = [True] + [False] * half
    for x in stones:
        for s in range(half, x - 1, -1):
            if can[s - x]:
                can[s] = True
    best = max(s for s in range(half + 1) if can[s])
    return total - 2 * best''',
            ),
            dict(
                name="Set of reachable sums",
                time="O(n&middot;S)",
                space="O(S)",
                why=[
                    "Same DP with a Python set: start from <code>{0}</code> and for each stone add <code>s + x</code> for every reachable <code>s</code>. Short and clear; slower constant factor than the boolean array.",
                ],
                code='''def last_stone_weight_ii(stones):
    total = sum(stones)
    sums = {0}
    for x in stones:
        sums |= {s + x for s in sums}
    return min(abs(total - 2 * s) for s in sums)''',
            ),
        ],
        tests='''assert last_stone_weight_ii([2, 7, 4, 1, 8, 1]) == 1
assert last_stone_weight_ii([31, 26, 33, 21, 40]) == 5
assert last_stone_weight_ii([1]) == 1
assert last_stone_weight_ii([3, 3]) == 0


def brute(stones):
    return min(abs(sum(s * x for s, x in zip(signs, stones)))
               for signs in itertools.product((1, -1), repeat=len(stones)))


random.seed(10)
for _ in range(60):
    data = [random.randint(1, 30) for _ in range(random.randint(1, 10))]
    assert last_stone_weight_ii(data) == brute(data), data''',
    ),

    dict(
        id="ones-and-zeroes",
        lc=474, slug="ones-and-zeroes",
        name="Ones and Zeroes",
        difficulty="medium",
        approaches=[
            dict(
                name="2-D knapsack, both capacities downwards",
                time="O(L&middot;m&middot;n)",
                space="O(m&middot;n)",
                best=True,
                why=[
                    "Each string is an item with two weights, its count of zeros and of ones, and value 1. The bag has two capacities, <code>m</code> zeros and <code>n</code> ones. So the table gains a dimension: <code>dp[z][o]</code> = most strings fitting in <code>z</code> zeros and <code>o</code> ones.",
                    "It is still 0/1, so both capacity loops run downwards for the same reason as the 1-D case. <code>L</code> strings times <code>m&middot;n</code> cells.",
                ],
                code='''def find_max_form(strs, m, n):
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for s in strs:
        zeros = s.count("0")
        ones = len(s) - zeros
        for z in range(m, zeros - 1, -1):
            for o in range(n, ones - 1, -1):
                dp[z][o] = max(dp[z][o], dp[z - zeros][o - ones] + 1)
    return dp[m][n]''',
            ),
            dict(
                name="Top-down memo",
                time="O(L&middot;m&middot;n)",
                space="O(L&middot;m&middot;n)",
                why=[
                    "<code>best(i, z, o)</code>: skip string <code>i</code>, or take it if it fits. Three-dimensional state, so the memo holds up to L&middot;m&middot;n entries &mdash; the price of not rolling the item dimension away.",
                ],
                code='''def find_max_form(strs, m, n):
    cost = [(s.count("0"), s.count("1")) for s in strs]

    @cache
    def best(i, z, o):
        if i == len(cost):
            return 0
        skip = best(i + 1, z, o)
        cz, co = cost[i]
        if cz <= z and co <= o:
            return max(skip, 1 + best(i + 1, z - cz, o - co))
        return skip
    return best(0, m, n)''',
            ),
        ],
        tests='''assert find_max_form(["10", "0001", "111001", "1", "0"], 5, 3) == 4
assert find_max_form(["10", "0", "1"], 1, 1) == 2
assert find_max_form(["111"], 5, 2) == 0


def brute(strs, m, n):
    best = 0
    for r in range(len(strs) + 1):
        for pick in itertools.combinations(strs, r):
            text = "".join(pick)
            if text.count("0") <= m and text.count("1") <= n:
                best = max(best, r)
    return best


random.seed(11)
for _ in range(50):
    strs = ["".join(random.choice("01") for _ in range(random.randint(1, 4)))
            for _ in range(random.randint(1, 8))]
    m, n = random.randint(0, 6), random.randint(0, 6)
    assert find_max_form(strs, m, n) == brute(strs, m, n), (strs, m, n)''',
    ),

    dict(
        id="coin-change",
        lc=322, slug="coin-change",
        name="Coin Change",
        difficulty="medium",
        approaches=[
            dict(
                name="Unbounded knapsack, amount upwards",
                time="O(A&middot;k)",
                space="O(A)",
                best=True,
                why=[
                    "<code>dp[a]</code> = fewest coins making amount <code>a</code>. The last coin used was some <code>c</code>, leaving <code>a - c</code>: <code>dp[a] = 1 + min(dp[a - c])</code>. Coins are reusable, so amount runs upwards and <code>dp[a - c]</code> is allowed to have used <code>c</code> already.",
                    "Unreachable amounts stay at infinity, and the answer is -1 if <code>dp[A]</code> is still infinite. <code>A</code> amounts &times; <code>k</code> coins.",
                    "Greedy (always take the biggest coin) is wrong in general: with coins [1, 3, 4] and amount 6, greedy takes 4+1+1 = 3 coins but 3+3 is 2.",
                ],
                code='''def coin_change(coins, amount):
    dp = [0] + [inf] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] != inf else -1''',
            ),
            dict(
                name="BFS over amounts",
                time="O(A&middot;k)",
                space="O(A)",
                tag="shortest path view",
                why=[
                    "Amounts are nodes and each coin is an edge of weight 1, so the fewest coins is the shortest path from 0 to <code>A</code>. BFS finds it level by level and stops as soon as it arrives.",
                    "Same worst case as the table, but often faster when the answer uses few coins, because it never explores past the answer's level.",
                ],
                code='''def coin_change(coins, amount):
    from collections import deque
    if amount == 0:
        return 0
    seen = {0}
    queue = deque([(0, 0)])
    while queue:
        value, steps = queue.popleft()
        for c in coins:
            nxt = value + c
            if nxt == amount:
                return steps + 1
            if nxt < amount and nxt not in seen:
                seen.add(nxt)
                queue.append((nxt, steps + 1))
    return -1''',
            ),
        ],
        tests='''assert coin_change([1, 2, 5], 11) == 3
assert coin_change([2], 3) == -1
assert coin_change([1], 0) == 0
assert coin_change([1, 3, 4], 6) == 2
assert coin_change([186, 419, 83, 408], 6249) == 20


def brute(coins, amount):
    @cache
    def go(a):
        if a == 0:
            return 0
        opts = [go(a - c) for c in coins if c <= a]
        opts = [o for o in opts if o >= 0]
        return 1 + min(opts) if opts else -1
    return go(amount)


random.seed(12)
for _ in range(60):
    coins = random.sample(range(1, 15), random.randint(1, 4))
    amount = random.randint(0, 60)
    assert coin_change(coins, amount) == brute(coins, amount), (coins, amount)''',
    ),

    dict(
        id="coin-change-ii",
        lc=518, slug="coin-change-ii",
        name="Coin Change II",
        difficulty="medium",
        approaches=[
            dict(
                name="Coins outer, amount inner",
                time="O(A&middot;k)",
                space="O(A)",
                best=True,
                why=[
                    "<code>ways[a]</code> counts combinations making <code>a</code>. For each coin in turn, <code>ways[a] += ways[a - c]</code> with amount upwards (coins are reusable).",
                    "The loop order is the entire problem. With coins outside, by the time coin <code>c</code> is processed the table only contains ways built from earlier coins, so every combination is counted once, in coin order. Put amount outside and coins inside and each amount considers every coin as its <em>last</em> coin &mdash; that counts <code>1+2</code> and <code>2+1</code> separately. That is Combination Sum IV (LeetCode 377), not this.",
                    "Compare with Coin Change I: there the loop order does not matter, because a minimum does not care how many orders reach it.",
                ],
                code='''def change(amount, coins):
    ways = [1] + [0] * amount
    for c in coins:
        for a in range(c, amount + 1):
            ways[a] += ways[a - c]
    return ways[amount]''',
            ),
            dict(
                name="Memo on (coin index, amount)",
                time="O(A&middot;k)",
                space="O(A&middot;k)",
                why=[
                    "<code>count(i, a)</code>: either use coin <code>i</code> again (stay at <code>i</code>) or move past it for good (<code>i + 1</code>). Never going back to an earlier coin is what forbids reorderings &mdash; the same idea as the outer loop, expressed as recursion.",
                ],
                code='''def change(amount, coins):
    @cache
    def count(i, a):
        if a == 0:
            return 1
        if i == len(coins) or a < 0:
            return 0
        return count(i, a - coins[i]) + count(i + 1, a)
    return count(0, amount)''',
            ),
        ],
        tests='''assert change(5, [1, 2, 5]) == 4
assert change(3, [2]) == 0
assert change(10, [10]) == 1
assert change(0, [7]) == 1


def brute(amount, coins):
    def go(i, a):
        if a == 0:
            return 1
        if i == len(coins):
            return 0
        return sum(go(i + 1, a - k * coins[i]) for k in range(a // coins[i] + 1))
    return go(0, amount)


random.seed(13)
for _ in range(60):
    coins = random.sample(range(1, 12), random.randint(1, 4))
    amount = random.randint(0, 40)
    assert change(amount, coins) == brute(amount, coins), (amount, coins)''',
        pitfall="Nesting the loops the other way round, which counts ordered sequences: <code>change(5, [1, 2, 5])</code> becomes 9 instead of 4.",
    ),

    dict(
        id="perfect-squares",
        lc=279, slug="perfect-squares",
        name="Perfect Squares",
        difficulty="medium",
        approaches=[
            dict(
                name="Unbounded knapsack over squares",
                time="O(n&radic;n)",
                space="O(n)",
                best=True,
                why=[
                    "This is Coin Change where the coins are <code>1, 4, 9, &hellip;</code> up to <code>n</code>: <code>dp[a] = 1 + min(dp[a - s&sup2;])</code>. There are about &radic;n squares, so n&middot;&radic;n work.",
                    "An answer always exists because 1 is a square, so there is no -1 case.",
                ],
                code='''def num_squares(n):
    squares = [k * k for k in range(1, isqrt(n) + 1)]
    dp = [0] + [inf] * n
    for a in range(1, n + 1):
        for s in squares:
            if s > a:
                break
            if dp[a - s] + 1 < dp[a]:
                dp[a] = dp[a - s] + 1
    return dp[n]''',
            ),
            dict(
                name="Lagrange's four-square theorem",
                time="O(&radic;n)",
                space="O(1)",
                tag="math shortcut",
                why=[
                    "Every positive integer is a sum of at most four squares, and Legendre showed it needs all four exactly when <code>n = 4<sup>a</sup>(8b + 7)</code>. So: answer 1 if n is a square, 2 if it splits into two squares, 4 if it has that form, otherwise 3.",
                    "Excellent as a follow-up once the DP is written. Not something an interviewer expects you to derive.",
                ],
                code='''def num_squares(n):
    if isqrt(n) ** 2 == n:
        return 1
    for a in range(1, isqrt(n) + 1):
        rest = n - a * a
        if isqrt(rest) ** 2 == rest:
            return 2
    m = n
    while m % 4 == 0:
        m //= 4
    return 4 if m % 8 == 7 else 3''',
            ),
        ],
        tests='''assert num_squares(12) == 3
assert num_squares(13) == 2
assert num_squares(1) == 1
assert num_squares(7) == 4
assert num_squares(28) == 4


def brute(n):
    from collections import deque
    seen, queue = {n}, deque([(n, 0)])
    while queue:
        v, d = queue.popleft()
        if v == 0:
            return d
        k = 1
        while k * k <= v:
            if v - k * k not in seen:
                seen.add(v - k * k)
                queue.append((v - k * k, d + 1))
            k += 1


for n in range(1, 300):
    assert num_squares(n) == brute(n), n''',
    ),
    ],
)


# =================================================================== pattern 3
P3 = dict(
    id="grid",
    title="Grid DP",
    summary="state = (row, col); pull from the cell above and the cell to the left",
    idea=[
        "Movement is restricted to right and down (or down and diagonally), so a cell can only be reached from the cells above and to its left. That gives the recurrence immediately: <code>dp[r][c]</code> combines <code>dp[r-1][c]</code> and <code>dp[r][c-1]</code> &mdash; add them to count paths, take the min to find the cheapest.",
        "Fill row by row, left to right, and both inputs are ready when you need them. The first row and column are the base cases, because they have only one neighbour to pull from.",
        "Row <code>r</code> only reads row <code>r-1</code> and itself, so a single array of length <code>cols</code> is enough: before the update <code>dp[c]</code> is still \"the cell above\", and <code>dp[c-1]</code> has just become \"the cell to the left\". O(rows&middot;cols) time, O(cols) space.",
        "Sometimes you must go <strong>backwards</strong>. In Dungeon Game what a cell needs depends on the path <em>after</em> it, not before, so the table is filled from the bottom-right corner. When the forward direction does not give a clean recurrence, try the other end.",
    ],
    problems=[

    dict(
        id="unique-paths",
        lc=62, slug="unique-paths",
        name="Unique Paths",
        difficulty="medium",
        approaches=[
            dict(
                name="One rolling row",
                time="O(m&middot;n)",
                space="O(n)",
                best=True,
                why=[
                    "Paths into a cell = paths into the cell above + paths into the cell to its left. The top row and left column have exactly one path each.",
                    "Keep one row: <code>row[c] += row[c-1]</code>. Before the addition <code>row[c]</code> is the cell above; <code>row[c-1]</code> is already this row's left neighbour.",
                ],
                code='''def unique_paths(m, n):
    row = [1] * n
    for _ in range(1, m):
        for c in range(1, n):
            row[c] += row[c - 1]
    return row[-1]''',
            ),
            dict(
                name="Binomial coefficient",
                time="O(min(m, n))",
                space="O(1)",
                tag="math shortcut",
                why=[
                    "Every path is a sequence of exactly <code>m-1</code> downs and <code>n-1</code> rights in some order. Choosing where the downs go fixes the path, so there are <code>C(m+n-2, m-1)</code> paths.",
                    "The DP counts the same thing one cell at a time. Good to mention; but the DP is what generalises to obstacles in the next problem.",
                ],
                code='''def unique_paths(m, n):
    return comb(m + n - 2, m - 1)''',
            ),
        ],
        tests='''assert unique_paths(3, 7) == 28
assert unique_paths(3, 2) == 3
assert unique_paths(1, 1) == 1
assert unique_paths(1, 9) == 1
assert unique_paths(10, 10) == 48620


def brute(r, c):
    return 1 if r == 1 or c == 1 else brute(r - 1, c) + brute(r, c - 1)


for r in range(1, 9):
    for c in range(1, 9):
        assert unique_paths(r, c) == brute(r, c)''',
    ),

    dict(
        id="unique-paths-ii",
        lc=63, slug="unique-paths-ii",
        name="Unique Paths II",
        difficulty="medium",
        approaches=[
            dict(
                name="One rolling row, zero at obstacles",
                time="O(m&middot;n)",
                space="O(n)",
                best=True,
                why=[
                    "Same recurrence as Unique Paths, with one rule added: an obstacle has 0 paths into it, so nothing flows through it.",
                    "The formula no longer works, which is why the DP was worth learning. Note the base cases change too: once the first row hits an obstacle, every cell to its right is unreachable. Seeding <code>row[0] = 1</code> and running the same update for every row, including the first, handles that with no special case.",
                ],
                code='''def unique_paths_with_obstacles(grid):
    n = len(grid[0])
    row = [0] * n
    row[0] = 1
    for cells in grid:
        for c in range(n):
            if cells[c] == 1:
                row[c] = 0
            elif c > 0:
                row[c] += row[c - 1]
    return row[-1]''',
            ),
        ],
        tests='''assert unique_paths_with_obstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]) == 2
assert unique_paths_with_obstacles([[0, 1], [0, 0]]) == 1
assert unique_paths_with_obstacles([[1]]) == 0
assert unique_paths_with_obstacles([[0]]) == 1
assert unique_paths_with_obstacles([[0, 0], [0, 1]]) == 0
assert unique_paths_with_obstacles([[0, 1, 0, 0]]) == 0


def brute(g, r=0, c=0):
    if r >= len(g) or c >= len(g[0]) or g[r][c]:
        return 0
    if (r, c) == (len(g) - 1, len(g[0]) - 1):
        return 1
    return brute(g, r + 1, c) + brute(g, r, c + 1)


random.seed(14)
for _ in range(80):
    g = [[int(random.random() < 0.25) for _ in range(random.randint(1, 6))]]
    g += [[int(random.random() < 0.25) for _ in g[0]] for _ in range(random.randint(0, 5))]
    assert unique_paths_with_obstacles(g) == brute(g), g''',
        pitfall="Initialising the whole first row and column to 1. An obstacle in the first row blocks everything after it.",
    ),

    dict(
        id="minimum-path-sum",
        lc=64, slug="minimum-path-sum",
        name="Minimum Path Sum",
        difficulty="medium",
        approaches=[
            dict(
                name="One rolling row",
                time="O(m&middot;n)",
                space="O(n)",
                best=True,
                why=[
                    "The cheapest path into a cell comes through the cheaper of its two predecessors: <code>dp[r][c] = grid[r][c] + min(above, left)</code>. The same shape as Unique Paths with <code>min</code> in place of <code>+</code>.",
                    "Seeding the row with infinity except for a zero before the start means the first row and column need no special handling &mdash; the infinite neighbour always loses the <code>min</code>.",
                ],
                code='''def min_path_sum(grid):
    n = len(grid[0])
    row = [inf] * n
    row[0] = 0
    for cells in grid:
        row[0] += cells[0]
        for c in range(1, n):
            row[c] = cells[c] + min(row[c], row[c - 1])
    return row[-1]''',
            ),
            dict(
                name="In place",
                time="O(m&middot;n)",
                space="O(1)",
                tag="mutates input",
                why=[
                    "Write each cell's best cost over the grid itself. O(1) extra space, but it destroys the caller's data &mdash; say so if you do this in an interview.",
                ],
                code='''def min_path_sum(grid):
    m, n = len(grid), len(grid[0])
    for r in range(m):
        for c in range(n):
            if r == 0 and c == 0:
                continue
            up = grid[r - 1][c] if r else inf
            left = grid[r][c - 1] if c else inf
            grid[r][c] += min(up, left)
    return grid[-1][-1]''',
            ),
        ],
        tests='''assert min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]) == 7
assert min_path_sum([[1, 2, 3], [4, 5, 6]]) == 12
assert min_path_sum([[5]]) == 5
assert min_path_sum([[1], [2], [3]]) == 6


def brute(g, r=0, c=0):
    if r >= len(g) or c >= len(g[0]):
        return inf
    if (r, c) == (len(g) - 1, len(g[0]) - 1):
        return g[r][c]
    return g[r][c] + min(brute(g, r + 1, c), brute(g, r, c + 1))


random.seed(15)
for _ in range(60):
    cols = random.randint(1, 6)
    g = [[random.randint(0, 9) for _ in range(cols)] for _ in range(random.randint(1, 6))]
    expect = brute(g)
    assert min_path_sum([row[:] for row in g]) == expect, g''',
    ),

    dict(
        id="triangle",
        lc=120, slug="triangle",
        name="Triangle",
        difficulty="medium",
        approaches=[
            dict(
                name="Bottom-up from the base",
                time="O(n&sup2;)",
                space="O(n)",
                best=True,
                why=[
                    "From row <code>r</code>, index <code>i</code>, you move to <code>i</code> or <code>i+1</code> in the row below. Going top-down, the last row has n possible endings and you would need a <code>min</code> over them. Going <strong>bottom-up</strong>, every path ends at the single apex, so the answer is just <code>best[0]</code>.",
                    "Start with the last row as <code>best</code>, then for each row above: <code>best[i] = tri[r][i] + min(best[i], best[i+1])</code>. Updating left to right is safe because <code>best[i+1]</code> has not been overwritten yet. O(n) space, the follow-up the problem asks for.",
                ],
                code='''def minimum_total(triangle):
    best = list(triangle[-1])
    for r in range(len(triangle) - 2, -1, -1):
        for i in range(r + 1):
            best[i] = triangle[r][i] + min(best[i], best[i + 1])
    return best[0]''',
            ),
            dict(
                name="Top-down memo",
                time="O(n&sup2;)",
                space="O(n&sup2;)",
                why=[
                    "<code>go(r, i)</code> = cheapest path from <code>(r, i)</code> to the base. n(n+1)/2 cells, each O(1). The recursion is the clearest statement of the recurrence; the table version is its bottom-up unrolling.",
                ],
                code='''def minimum_total(triangle):
    @cache
    def go(r, i):
        if r == len(triangle):
            return 0
        return triangle[r][i] + min(go(r + 1, i), go(r + 1, i + 1))
    return go(0, 0)''',
            ),
        ],
        tests='''assert minimum_total([[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]) == 11
assert minimum_total([[-10]]) == -10
assert minimum_total([[1], [2, 3]]) == 3
assert minimum_total([[-1], [2, 3], [1, -1, -3]]) == -1


def brute(t, r=0, i=0):
    if r == len(t):
        return 0
    return t[r][i] + min(brute(t, r + 1, i), brute(t, r + 1, i + 1))


random.seed(16)
for _ in range(60):
    t = [[random.randint(-9, 9) for _ in range(r + 1)] for r in range(random.randint(1, 8))]
    assert minimum_total(t) == brute(t), t''',
    ),

    dict(
        id="dungeon-game",
        lc=174, slug="dungeon-game",
        name="Dungeon Game",
        difficulty="hard",
        approaches=[
            dict(
                name="Backwards from the princess",
                time="O(m&middot;n)",
                space="O(n)",
                best=True,
                why=[
                    "Forward DP fails here, because two numbers matter along a path &mdash; the health you have now and the lowest it has dipped to &mdash; and neither alone decides which path is best. Going <strong>backwards</strong> needs only one number: <code>need[r][c]</code>, the minimum health to <em>enter</em> this cell and still reach the end.",
                    "From a cell you step right or down, so you need enough to survive into the cheaper of the two: <code>need = min(right, down) - dungeon[r][c]</code>. Health can never drop below 1, so clamp: <code>max(1, &hellip;)</code>. A big potion does not bank credit for earlier; it just lowers the requirement to 1.",
                    "The lesson is general: when the future decides the present, fill the table from the end.",
                ],
                code='''def calculate_minimum_hp(dungeon):
    m, n = len(dungeon), len(dungeon[0])
    need = [inf] * (n + 1)
    need[n - 1] = 1              # standing just past the princess: need 1 hp
    for r in range(m - 1, -1, -1):
        for c in range(n - 1, -1, -1):
            need[c] = max(1, min(need[c], need[c + 1]) - dungeon[r][c])
        need[n] = inf            # the phantom column stays unreachable
    return need[0]''',
            ),
        ],
        tests='''assert calculate_minimum_hp([[-2, -3, 3], [-5, -10, 1], [10, 30, -5]]) == 7
assert calculate_minimum_hp([[0]]) == 1
assert calculate_minimum_hp([[100]]) == 1
assert calculate_minimum_hp([[-5]]) == 6
assert calculate_minimum_hp([[1, -3, 3], [0, -2, 0], [-3, -3, -3]]) == 3


def brute(d):
    m, n = len(d), len(d[0])
    best = inf

    def walk(r, c, hp, low):
        nonlocal best
        hp += d[r][c]
        low = min(low, hp)
        if (r, c) == (m - 1, n - 1):
            best = min(best, 1 - low if low < 1 else 1)
            return
        if r + 1 < m:
            walk(r + 1, c, hp, low)
        if c + 1 < n:
            walk(r, c + 1, hp, low)

    walk(0, 0, 0, 0)
    return max(best, 1)


random.seed(17)
for _ in range(80):
    cols = random.randint(1, 5)
    d = [[random.randint(-10, 8) for _ in range(cols)] for _ in range(random.randint(1, 5))]
    assert calculate_minimum_hp(d) == brute(d), d''',
        pitfall="Filling top-left to bottom-right and tracking current health. The best path so far is not the best path to extend, because a later room can punish a low minimum.",
    ),
    ],
)


# =================================================================== pattern 4
P4 = dict(
    id="lis",
    title="LIS family",
    summary="state = the best subsequence ending at index i; then O(n log n) with binary search",
    idea=[
        "Subsequences skip elements, so \"the best in the prefix\" does not build on itself cleanly. The fix, as in Maximum Subarray, is to anchor the state: <code>dp[i]</code> = length of the longest increasing subsequence that <em>ends at</em> <code>nums[i]</code>. It extends any earlier <code>dp[j]</code> with <code>nums[j] &lt; nums[i]</code>, so <code>dp[i] = 1 + max(dp[j])</code>. The answer is the largest <code>dp[i]</code>. O(n&sup2;).",
        "The famous follow-up is <strong>O(n log n)</strong>. Keep <code>tails[k]</code> = the smallest possible last element of an increasing subsequence of length <code>k+1</code>. That array is always sorted, so for each new number binary-search the first tail &ge; it and overwrite it (or append, if the number beats every tail). The length of <code>tails</code> is the answer. Replacing a tail with something smaller never hurts: it keeps every length reachable and makes it easier to extend.",
        "Many problems are LIS after a sort. Russian Doll Envelopes sorts by one dimension so only the other needs an increasing subsequence; Maximum Length of Pair Chain sorts intervals so a chain becomes a subsequence. The skill is seeing which sort turns the problem into LIS &mdash; and handling ties so that equal keys cannot chain.",
    ],
    problems=[

    dict(
        id="longest-increasing-subsequence",
        lc=300, slug="longest-increasing-subsequence",
        name="Longest Increasing Subsequence",
        difficulty="medium",
        approaches=[
            dict(
                name="dp[i] = longest ending at i",
                time="O(n&sup2;)",
                space="O(n)",
                why=[
                    "For each <code>i</code>, look back at every <code>j &lt; i</code> with a smaller value and extend the best one. The answer is <code>max(dp)</code>, not <code>dp[-1]</code>: the longest subsequence need not end at the last element.",
                    "Write this first, then offer the improvement.",
                ],
                code='''def length_of_lis(nums):
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i] and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
    return max(dp)''',
            ),
            dict(
                name="Patience sorting with bisect",
                time="O(n log n)",
                space="O(n)",
                best=True,
                why=[
                    "<code>tails[k]</code> is the smallest tail of any increasing subsequence of length <code>k+1</code> found so far. It is strictly increasing, so <code>bisect_left</code> finds where each number belongs: past the end means it extends the longest subsequence; otherwise it becomes a smaller, better tail for that length.",
                    "<code>bisect_left</code>, not <code>bisect_right</code>: an equal value must replace the existing tail, not extend past it, because the problem wants <em>strictly</em> increasing.",
                    "<code>tails</code> is not itself a valid subsequence &mdash; only its length is meaningful. Recovering the actual sequence needs parent pointers.",
                ],
                code='''def length_of_lis(nums):
    tails = []
    for x in nums:
        k = bisect.bisect_left(tails, x)
        if k == len(tails):
            tails.append(x)
        else:
            tails[k] = x
    return len(tails)''',
            ),
        ],
        tests='''assert length_of_lis([10, 9, 2, 5, 3, 7, 101, 18]) == 4
assert length_of_lis([0, 1, 0, 3, 2, 3]) == 4
assert length_of_lis([7, 7, 7, 7, 7, 7, 7]) == 1
assert length_of_lis([5]) == 1
assert length_of_lis([4, 10, 4, 3, 8, 9]) == 3


def brute(nums):
    return max(r for r in range(1, len(nums) + 1)
               for c in itertools.combinations(nums, r)
               if all(a < b for a, b in zip(c, c[1:])))


random.seed(18)
for _ in range(60):
    data = [random.randint(0, 12) for _ in range(random.randint(1, 11))]
    assert length_of_lis(data) == brute(data), data''',
    ),

    dict(
        id="russian-doll-envelopes",
        lc=354, slug="russian-doll-envelopes",
        name="Russian Doll Envelopes",
        difficulty="hard",
        approaches=[
            dict(
                name="Sort (w asc, h desc), then LIS on h",
                time="O(n log n)",
                space="O(n)",
                best=True,
                why=[
                    "Sort by width, and a nesting chain becomes a subsequence of the sorted list whose heights strictly increase: LIS on the heights.",
                    "The trap is equal widths. Two envelopes of width 5 cannot nest, but if their heights are increasing LIS would happily chain them. Sorting equal widths by height <strong>descending</strong> fixes it: within a width group the heights now decrease, so no increasing subsequence can take two of them.",
                    "With n up to 10<sup>5</sup>, the O(n&sup2;) LIS times out, so the binary-search version is required here.",
                ],
                code='''def max_envelopes(envelopes):
    envelopes = sorted(envelopes, key=lambda e: (e[0], -e[1]))
    tails = []
    for _, h in envelopes:
        k = bisect.bisect_left(tails, h)
        if k == len(tails):
            tails.append(h)
        else:
            tails[k] = h
    return len(tails)''',
            ),
            dict(
                name="Sort, then O(n&sup2;) LIS",
                time="O(n&sup2;)",
                space="O(n)",
                tag="too slow at 10<sup>5</sup>",
                why=[
                    "Sort by width and run the quadratic LIS, checking both dimensions strictly. Easy to get right and a fine first answer, but it will time out on LeetCode's limits.",
                ],
                code='''def max_envelopes(envelopes):
    envelopes = sorted(envelopes)
    dp = [1] * len(envelopes)
    for i, (w, h) in enumerate(envelopes):
        for j in range(i):
            if envelopes[j][0] < w and envelopes[j][1] < h:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)''',
            ),
        ],
        tests='''assert max_envelopes([[5, 4], [6, 4], [6, 7], [2, 3]]) == 3
assert max_envelopes([[1, 1], [1, 1], [1, 1]]) == 1
assert max_envelopes([[4, 5], [4, 6], [6, 7], [2, 3], [1, 1]]) == 4
assert max_envelopes([[2, 100], [3, 200], [4, 300], [5, 500], [5, 400], [5, 250], [6, 370], [6, 360], [7, 380]]) == 5


def brute(env):
    best = 1
    for r in range(2, len(env) + 1):
        for c in itertools.permutations(env, r):
            if all(a[0] < b[0] and a[1] < b[1] for a, b in zip(c, c[1:])):
                best = max(best, r)
    return best


random.seed(19)
for _ in range(50):
    env = [[random.randint(1, 5), random.randint(1, 5)] for _ in range(random.randint(1, 6))]
    assert max_envelopes(env) == brute(env), env''',
        pitfall="Sorting heights ascending within the same width, which lets two same-width envelopes nest.",
    ),

    dict(
        id="maximum-length-of-pair-chain",
        lc=646, slug="maximum-length-of-pair-chain",
        name="Maximum Length of Pair Chain",
        difficulty="medium",
        approaches=[
            dict(
                name="LIS-style DP after sorting",
                time="O(n&sup2;)",
                space="O(n)",
                tag="the LIS shape",
                why=[
                    "Sort by start. Then pair <code>j</code> can precede pair <code>i</code> only if <code>j &lt; i</code> and <code>pairs[j][1] &lt; pairs[i][0]</code>, and a chain is a subsequence: <code>dp[i] = 1 + max(dp[j])</code> over compatible <code>j</code>.",
                    "Included because it is the pattern this section teaches. For this problem there is a better answer.",
                ],
                code='''def find_longest_chain(pairs):
    pairs = sorted(pairs)
    dp = [1] * len(pairs)
    for i in range(len(pairs)):
        for j in range(i):
            if pairs[j][1] < pairs[i][0]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)''',
            ),
            dict(
                name="Greedy by earliest end",
                time="O(n log n)",
                space="O(1)",
                best=True,
                why=[
                    "Sort by <em>end</em> and take every pair whose start is past the last end taken. This is activity selection: finishing as early as possible leaves the most room for everything after, and an exchange argument shows any optimal chain can be rewritten to start with the earliest-ending pair.",
                    "A useful reminder that some DP-shaped problems have a greedy solution. When the DP's choice is always \"the one that ends first\", the table is unnecessary.",
                ],
                code='''def find_longest_chain(pairs):
    count, end = 0, -inf
    for a, b in sorted(pairs, key=lambda p: p[1]):
        if a > end:
            count += 1
            end = b
    return count''',
            ),
        ],
        tests='''assert find_longest_chain([[1, 2], [2, 3], [3, 4]]) == 2
assert find_longest_chain([[1, 2], [7, 8], [4, 5]]) == 3
assert find_longest_chain([[1, 5]]) == 1
assert find_longest_chain([[-10, -8], [8, 9], [-5, 0], [6, 10], [-6, -4], [1, 7], [9, 10], [-4, 7]]) == 4


def brute(pairs):
    best = 1
    for r in range(2, len(pairs) + 1):
        for c in itertools.permutations(pairs, r):
            if all(a[1] < b[0] for a, b in zip(c, c[1:])):
                best = max(best, r)
    return best


random.seed(20)
for _ in range(50):
    pairs = []
    for _ in range(random.randint(1, 6)):
        a = random.randint(-5, 5)
        pairs.append([a, a + random.randint(1, 4)])
    assert find_longest_chain(pairs) == brute(pairs), pairs''',
    ),
    ],
)


# =================================================================== pattern 5
P5 = dict(
    id="two-strings",
    title="LCS family and two-string DP",
    summary="state = (i, j), a position in each string; compare, then decide",
    idea=[
        "Two sequences, two pointers. <code>dp[i][j]</code> is the answer for the prefixes <code>a[:i]</code> and <code>b[:j]</code>, and every step compares <code>a[i-1]</code> with <code>b[j-1]</code>. If they match, both pointers advance together (<code>dp[i-1][j-1]</code>); if not, you choose which pointer to move (<code>dp[i-1][j]</code> or <code>dp[i][j-1]</code>).",
        "Longest Common Subsequence is that sentence verbatim. Edit Distance is the same table with three moves &mdash; delete, insert, replace &mdash; each costing one. Distinct Subsequences counts instead of maximising. Interleaving String asks whether the next character of a third string can come from either pointer. Longest Palindromic Subsequence is LCS of a string with its own reverse. Once LCS clicks the rest are a different transition in the same grid.",
        "Index the table from 0 to <code>len</code> inclusive, so row 0 and column 0 mean \"empty prefix\". The base cases then sit in the table instead of in <code>if</code> statements. Each cell reads only the previous row and its own row, so one row of length <code>len(b) + 1</code>, plus a saved diagonal, is enough.",
    ],
    problems=[

    dict(
        id="longest-common-subsequence",
        lc=1143, slug="longest-common-subsequence",
        name="Longest Common Subsequence",
        difficulty="medium",
        approaches=[
            dict(
                name="2-D table",
                time="O(m&middot;n)",
                space="O(m&middot;n)",
                why=[
                    "<code>dp[i][j]</code> = LCS of <code>a[:i]</code> and <code>b[:j]</code>. If the last characters match, they can both be in the LCS: <code>dp[i-1][j-1] + 1</code>. If not, at least one of them is not, so drop one: <code>max(dp[i-1][j], dp[i][j-1])</code>.",
                    "The full table lets you walk back from <code>dp[m][n]</code> to recover the subsequence itself, which the space-optimised version cannot.",
                ],
                code='''def longest_common_subsequence(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]''',
            ),
            dict(
                name="One row plus the diagonal",
                time="O(m&middot;n)",
                space="O(n)",
                best=True,
                why=[
                    "Each cell reads above, left and above-left. Keep one row: before overwriting <code>row[j]</code> it still holds \"above\"; <code>row[j-1]</code> is already \"left\"; and \"above-left\" is the old <code>row[j-1]</code>, which you save in a variable just before it is overwritten.",
                    "Make <code>b</code> the shorter string and the space is O(min(m, n)).",
                ],
                code='''def longest_common_subsequence(a, b):
    if len(b) > len(a):
        a, b = b, a
    row = [0] * (len(b) + 1)
    for ch in a:
        diag = 0                     # dp[i-1][j-1]
        for j in range(1, len(b) + 1):
            above = row[j]
            row[j] = diag + 1 if ch == b[j - 1] else max(above, row[j - 1])
            diag = above
    return row[-1]''',
            ),
        ],
        tests='''assert longest_common_subsequence("abcde", "ace") == 3
assert longest_common_subsequence("abc", "abc") == 3
assert longest_common_subsequence("abc", "def") == 0
assert longest_common_subsequence("a", "a") == 1
assert longest_common_subsequence("bsbininm", "jmjkbkjkv") == 1


def brute(a, b):
    subs = {"".join(c) for r in range(len(a) + 1) for c in itertools.combinations(a, r)}
    def is_sub(s, t):
        it = iter(t)
        return all(ch in it for ch in s)
    return max(len(s) for s in subs if is_sub(s, b))


random.seed(21)
for _ in range(60):
    a = "".join(random.choice("abc") for _ in range(random.randint(1, 8)))
    b = "".join(random.choice("abc") for _ in range(random.randint(1, 8)))
    assert longest_common_subsequence(a, b) == brute(a, b), (a, b)''',
    ),

    dict(
        id="edit-distance",
        lc=72, slug="edit-distance",
        name="Edit Distance",
        difficulty="medium",
        approaches=[
            dict(
                name="2-D table",
                time="O(m&middot;n)",
                space="O(m&middot;n)",
                why=[
                    "<code>dp[i][j]</code> = edits to turn <code>a[:i]</code> into <code>b[:j]</code>. Row 0 and column 0 are the base cases: turning a prefix into the empty string takes that many deletes, and vice versa inserts.",
                    "If the last characters match, no edit is needed: <code>dp[i-1][j-1]</code>. Otherwise take the cheapest of <strong>replace</strong> (<code>dp[i-1][j-1]</code>), <strong>delete</strong> from a (<code>dp[i-1][j]</code>) and <strong>insert</strong> into a (<code>dp[i][j-1]</code>), plus one. The same grid as LCS with a three-way transition.",
                ],
                code='''def min_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]''',
            ),
            dict(
                name="One row plus the diagonal",
                time="O(m&middot;n)",
                space="O(n)",
                best=True,
                why=[
                    "Exactly the LCS space trick. The one difference is the left edge: <code>dp[i][0] = i</code>, so each new row starts with <code>row[0] = i</code> and the saved diagonal starts at <code>i - 1</code>.",
                ],
                code='''def min_distance(a, b):
    row = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        diag, row[0] = row[0], i
        for j in range(1, len(b) + 1):
            above = row[j]
            if a[i - 1] == b[j - 1]:
                row[j] = diag
            else:
                row[j] = 1 + min(diag, above, row[j - 1])
            diag = above
    return row[-1]''',
            ),
        ],
        tests='''assert min_distance("horse", "ros") == 3
assert min_distance("intention", "execution") == 5
assert min_distance("", "") == 0
assert min_distance("", "abc") == 3
assert min_distance("abc", "") == 3
assert min_distance("kitten", "sitting") == 3


def brute(a, b):
    if not a or not b:
        return len(a) + len(b)
    if a[0] == b[0]:
        return brute(a[1:], b[1:])
    return 1 + min(brute(a[1:], b[1:]), brute(a[1:], b), brute(a, b[1:]))


random.seed(22)
for _ in range(60):
    a = "".join(random.choice("abc") for _ in range(random.randint(0, 5)))
    b = "".join(random.choice("abc") for _ in range(random.randint(0, 5)))
    assert min_distance(a, b) == brute(a, b), (a, b)
    assert min_distance(a, b) == min_distance(b, a)''',
        pitfall="Forgetting the base row and column. <code>dp[0][j]</code> is <code>j</code>, not 0: turning the empty string into <code>b[:j]</code> takes j inserts.",
    ),

    dict(
        id="distinct-subsequences",
        lc=115, slug="distinct-subsequences",
        name="Distinct Subsequences",
        difficulty="hard",
        approaches=[
            dict(
                name="1-D counts, j downwards",
                time="O(m&middot;n)",
                space="O(n)",
                best=True,
                why=[
                    "<code>dp[i][j]</code> = number of ways <code>s[:i]</code> contains <code>t[:j]</code> as a subsequence. Character <code>s[i-1]</code> is either not used (<code>dp[i-1][j]</code>) or, if it equals <code>t[j-1]</code>, used as that character (<code>dp[i-1][j-1]</code>). Counts add, so the cell is the sum.",
                    "<code>dp[i][0] = 1</code>: the empty target is contained exactly once. Rolling to one row, iterate <code>j</code> <strong>downwards</strong> so <code>ways[j-1]</code> is still last row's value &mdash; the 0/1 knapsack trick again, for the same reason: each character of <code>s</code> is used at most once per match.",
                ],
                code='''def num_distinct(s, t):
    ways = [1] + [0] * len(t)
    for ch in s:
        for j in range(len(t), 0, -1):
            if t[j - 1] == ch:
                ways[j] += ways[j - 1]
    return ways[-1]''',
            ),
            dict(
                name="Top-down memo",
                time="O(m&middot;n)",
                space="O(m&middot;n)",
                why=[
                    "<code>count(i, j)</code>: ways to match <code>t[j:]</code> within <code>s[i:]</code>. Skip <code>s[i]</code>, or use it if it equals <code>t[j]</code>. Prune when <code>s</code> has fewer characters left than <code>t</code> still needs.",
                ],
                code='''def num_distinct(s, t):
    @cache
    def count(i, j):
        if j == len(t):
            return 1
        if len(s) - i < len(t) - j:
            return 0
        total = count(i + 1, j)
        if s[i] == t[j]:
            total += count(i + 1, j + 1)
        return total
    return count(0, 0)''',
            ),
        ],
        tests='''assert num_distinct("rabbbit", "rabbit") == 3
assert num_distinct("babgbag", "bag") == 5
assert num_distinct("abc", "") == 1
assert num_distinct("", "a") == 0
assert num_distinct("aaa", "aa") == 3


def brute(s, t):
    return sum(1 for c in itertools.combinations(range(len(s)), len(t))
               if "".join(s[i] for i in c) == t)


random.seed(23)
for _ in range(60):
    s = "".join(random.choice("ab") for _ in range(random.randint(0, 10)))
    t = "".join(random.choice("ab") for _ in range(random.randint(0, 4)))
    assert num_distinct(s, t) == brute(s, t), (s, t)''',
    ),

    dict(
        id="longest-palindromic-subsequence",
        lc=516, slug="longest-palindromic-subsequence",
        name="Longest Palindromic Subsequence",
        difficulty="medium",
        approaches=[
            dict(
                name="LCS of the string and its reverse",
                time="O(n&sup2;)",
                space="O(n)",
                best=True,
                why=[
                    "A palindromic subsequence of <code>s</code> reads the same backwards, so it is a common subsequence of <code>s</code> and <code>s[::-1]</code> &mdash; and the longest common one is always a palindrome of that length. So the answer is LCS(s, reversed s), reusing the rolling-row code unchanged.",
                    "The reduction is the point. Spotting that a one-string question is really a two-string question is a recurring move.",
                ],
                code='''def longest_palindrome_subseq(s):
    r = s[::-1]
    row = [0] * (len(r) + 1)
    for ch in s:
        diag = 0
        for j in range(1, len(r) + 1):
            above = row[j]
            row[j] = diag + 1 if ch == r[j - 1] else max(above, row[j - 1])
            diag = above
    return row[-1]''',
            ),
            dict(
                name="Interval DP on (i, j)",
                time="O(n&sup2;)",
                space="O(n&sup2;)",
                tag="previews pattern 6",
                why=[
                    "<code>dp[i][j]</code> = answer for <code>s[i..j]</code>. If the ends match they wrap the best inner answer: <code>dp[i+1][j-1] + 2</code>; otherwise drop one end: <code>max(dp[i+1][j], dp[i][j-1])</code>. Fill by increasing length, or with <code>i</code> descending.",
                    "This is the interval shape of the next section. Either view is accepted in an interview; this one extends to problems that have no reverse-string trick.",
                ],
                code='''def longest_palindrome_subseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]''',
            ),
        ],
        tests='''assert longest_palindrome_subseq("bbbab") == 4
assert longest_palindrome_subseq("cbbd") == 2
assert longest_palindrome_subseq("a") == 1
assert longest_palindrome_subseq("abcde") == 1
assert longest_palindrome_subseq("agbdba") == 5


def brute(s):
    return max(r for r in range(1, len(s) + 1)
               for c in itertools.combinations(s, r) if c == c[::-1])


random.seed(24)
for _ in range(60):
    s = "".join(random.choice("abc") for _ in range(random.randint(1, 10)))
    assert longest_palindrome_subseq(s) == brute(s), s''',
    ),

    dict(
        id="interleaving-string",
        lc=97, slug="interleaving-string",
        name="Interleaving String",
        difficulty="medium",
        approaches=[
            dict(
                name="Boolean grid, one row",
                time="O(m&middot;n)",
                space="O(n)",
                best=True,
                why=[
                    "<code>ok[i][j]</code> = can <code>s1[:i]</code> and <code>s2[:j]</code> interleave to form <code>s3[:i+j]</code>? The last character of that prefix, <code>s3[i+j-1]</code>, came from <code>s1</code> or from <code>s2</code>. So <code>ok[i][j] = (ok[i-1][j] and s1[i-1] matches) or (ok[i][j-1] and s2[j-1] matches)</code>.",
                    "The third string is not a third dimension, because its position is always <code>i + j</code>. That observation is what keeps the table two-dimensional. Check the lengths first: if <code>m + n != len(s3)</code> the answer is immediately false.",
                    "Greedy (take from whichever string matches) fails when both match; the DP explores both choices without the exponential blow-up.",
                ],
                code='''def is_interleave(s1, s2, s3):
    m, n = len(s1), len(s2)
    if m + n != len(s3):
        return False
    ok = [False] * (n + 1)
    for i in range(m + 1):
        for j in range(n + 1):
            if i == 0 and j == 0:
                ok[0] = True
            else:
                from_s1 = i > 0 and ok[j] and s1[i - 1] == s3[i + j - 1]
                from_s2 = j > 0 and ok[j - 1] and s2[j - 1] == s3[i + j - 1]
                ok[j] = from_s1 or from_s2
    return ok[n]''',
            ),
            dict(
                name="Top-down memo",
                time="O(m&middot;n)",
                space="O(m&middot;n)",
                why=[
                    "<code>go(i, j)</code>: can <code>s1[i:]</code> and <code>s2[j:]</code> form <code>s3[i+j:]</code>? Try taking the next character from each string that matches. At most (m+1)(n+1) states.",
                ],
                code='''def is_interleave(s1, s2, s3):
    if len(s1) + len(s2) != len(s3):
        return False

    @cache
    def go(i, j):
        if i == len(s1) and j == len(s2):
            return True
        k = i + j
        if i < len(s1) and s1[i] == s3[k] and go(i + 1, j):
            return True
        return j < len(s2) and s2[j] == s3[k] and go(i, j + 1)
    return go(0, 0)''',
            ),
        ],
        tests='''assert is_interleave("aabcc", "dbbca", "aadbbcbcac") is True
assert is_interleave("aabcc", "dbbca", "aadbbbaccc") is False
assert is_interleave("", "", "") is True
assert is_interleave("a", "", "a") is True
assert is_interleave("a", "b", "a") is False
assert is_interleave("ab", "ba", "abba") is True


def brute(s1, s2, s3):
    if not s3:
        return not s1 and not s2
    return bool((s1 and s1[0] == s3[0] and brute(s1[1:], s2, s3[1:])) or
                (s2 and s2[0] == s3[0] and brute(s1, s2[1:], s3[1:])))


random.seed(25)
for _ in range(120):
    s1 = "".join(random.choice("ab") for _ in range(random.randint(0, 5)))
    s2 = "".join(random.choice("ab") for _ in range(random.randint(0, 5)))
    s3 = list(s1 + s2)
    if random.random() < 0.5:
        random.shuffle(s3)
    s3 = "".join(s3)
    assert is_interleave(s1, s2, s3) == brute(s1, s2, s3), (s1, s2, s3)''',
    ),
    ],
)


# =================================================================== pattern 6
P6 = dict(
    id="interval",
    title="Interval (range) DP",
    summary="state = (i, j), a subarray; solve short ranges first, combine at a split point k",
    idea=[
        "The state is a range <code>[i, j]</code> of the input, and a range's answer is built from strictly shorter ranges inside it. So fill in order of <strong>length</strong>: every range of length 1, then 2, and so on up to the whole input. (Equivalently, <code>i</code> descending and <code>j</code> ascending.) That fill order is the thing to remember; get it wrong and you read cells that have not been computed yet.",
        "There are two shapes. <strong>Shrink from the ends</strong>: the range <code>[i, j]</code> depends on <code>[i+1, j-1]</code>, as in the palindrome problems &mdash; O(n&sup2;). <strong>Pick a split point</strong>: try every <code>k</code> between <code>i</code> and <code>j</code> and combine <code>[i, k]</code> with <code>[k, j]</code>, as in Matrix Chain Multiplication &mdash; O(n&sup3;).",
        "The hard part of split-point problems is choosing what <code>k</code> <em>means</em>. In Burst Balloons, thinking of <code>k</code> as the first balloon to burst breaks the independence of the two halves; thinking of it as the <em>last</em> makes them independent, because its neighbours are then fixed as the range's boundaries. When the obvious split couples the subproblems, try reversing time.",
    ],
    problems=[

    dict(
        id="palindromic-substrings",
        lc=647, slug="palindromic-substrings",
        name="Palindromic Substrings",
        difficulty="medium",
        approaches=[
            dict(
                name="is_pal[i][j] table",
                time="O(n&sup2;)",
                space="O(n&sup2;)",
                tag="the interval DP",
                why=[
                    "<code>s[i..j]</code> is a palindrome when its ends match and the inside <code>s[i+1..j-1]</code> is one (ranges of length 1 or 2 need only the ends). Each cell depends on a strictly shorter range, so fill with <code>i</code> descending and count the true cells.",
                    "This is the \"shrink from the ends\" interval shape at its simplest.",
                ],
                code='''def count_substrings(s):
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    count = 0
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            if s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1]):
                pal[i][j] = True
                count += 1
    return count''',
            ),
            dict(
                name="Expand around each centre",
                time="O(n&sup2;)",
                space="O(1)",
                best=True,
                why=[
                    "Every palindrome has a centre: a character (odd length) or a gap between two (even length). There are <code>2n - 1</code> centres; from each, expand outwards while the ends match, counting one palindrome per step.",
                    "Same O(n&sup2;) worst case as the table with no table, which is why interviewers prefer it. The table is still worth knowing because the same recurrence answers range queries, and it is the stepping stone to the split-point problems below.",
                ],
                code='''def count_substrings(s):
    count = 0
    for centre in range(2 * len(s) - 1):
        lo, hi = centre // 2, (centre + 1) // 2
        while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
            count += 1
            lo -= 1
            hi += 1
    return count''',
            ),
        ],
        tests='''assert count_substrings("abc") == 3
assert count_substrings("aaa") == 6
assert count_substrings("a") == 1
assert count_substrings("abba") == 6
random.seed(26)
for _ in range(80):
    s = "".join(random.choice("ab") for _ in range(random.randint(1, 12)))
    expect = sum(1 for i in range(len(s)) for j in range(i + 1, len(s) + 1)
                 if s[i:j] == s[i:j][::-1])
    assert count_substrings(s) == expect, s''',
    ),

    dict(
        id="longest-palindromic-substring",
        lc=5, slug="longest-palindromic-substring",
        name="Longest Palindromic Substring",
        difficulty="medium",
        approaches=[
            dict(
                name="Expand around each centre",
                time="O(n&sup2;)",
                space="O(1)",
                best=True,
                why=[
                    "The Palindromic Substrings expansion, but instead of counting, remember the widest window seen. Each of the 2n-1 centres expands at most n/2 steps.",
                    "Substring, not subsequence: this one must be contiguous, which is why it is an expansion and not the LCS-with-reverse trick of problem 516. That trick gives the wrong answer here.",
                    "Manacher's algorithm does this in O(n) by reusing mirror information across centres. Worth naming; rarely expected in full.",
                ],
                code='''def longest_palindrome(s):
    best_lo, best_hi = 0, 0
    for centre in range(2 * len(s) - 1):
        lo, hi = centre // 2, (centre + 1) // 2
        while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
            lo -= 1
            hi += 1
        # the loop overshoots by one on each side
        if hi - lo - 1 > best_hi - best_lo:
            best_lo, best_hi = lo + 1, hi
    return s[best_lo:best_hi]''',
            ),
            dict(
                name="is_pal[i][j] table",
                time="O(n&sup2;)",
                space="O(n&sup2;)",
                why=[
                    "Fill the palindrome table exactly as in problem 647 and track the longest true cell. Correct and systematic; the O(n&sup2;) memory makes it the weaker answer for n = 1000.",
                ],
                code='''def longest_palindrome(s):
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    lo, hi = 0, 1
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            if s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1]):
                pal[i][j] = True
                if j + 1 - i > hi - lo:
                    lo, hi = i, j + 1
    return s[lo:hi]''',
            ),
        ],
        tests='''def check(s, got):
    best = max(j - i for i in range(len(s)) for j in range(i + 1, len(s) + 1)
               if s[i:j] == s[i:j][::-1])
    assert got in s and got == got[::-1] and len(got) == best, (s, got)


assert longest_palindrome("babad") in ("bab", "aba")
assert longest_palindrome("cbbd") == "bb"
assert longest_palindrome("a") == "a"
assert longest_palindrome("forgeeksskeegfor") == "geeksskeeg"
random.seed(27)
for _ in range(80):
    s = "".join(random.choice("abc") for _ in range(random.randint(1, 12)))
    check(s, longest_palindrome(s))''',
    ),

    dict(
        id="matrix-chain-multiplication",
        name="Matrix Chain Multiplication",
        difficulty="hard",
        ref=("Read on GeeksforGeeks",
             "https://www.geeksforgeeks.org/dsa/matrix-chain-multiplication-dp-8/"),
        tags=["Dynamic Programming", "Interval DP", "Array"],
        statement=[
            "Given an array <code>arr</code> of length <code>n</code>, matrix <code>i</code> (for <code>1 &le; i &lt; n</code>) has dimensions <code>arr[i-1] &times; arr[i]</code>. Multiplying a <code>p &times; q</code> matrix by a <code>q &times; r</code> matrix costs <code>p&middot;q&middot;r</code> scalar multiplications. Return the minimum total cost to multiply the whole chain, choosing where to put the brackets.",
            "Matrix multiplication is associative, so every bracketing gives the same result, but the cost can differ enormously. This is the canonical split-point interval DP: every later problem in the section is this one wearing a costume.",
        ],
        examples=[
            dict(input="arr = [2, 1, 3, 4]", output="20",
                 explanation="Matrices 2×1, 1×3, 3×4. A(BC) costs 1·3·4 + 2·1·4 = 20; (AB)C costs 2·1·3 + 2·3·4 = 30."),
            dict(input="arr = [1, 2, 3, 4, 3]", output="30"),
            dict(input="arr = [3, 4]", output="0",
                 explanation="A single matrix needs no multiplication."),
        ],
        constraints=[
            "<code>2 &lt;= arr.length &lt;= 100</code>",
            "<code>1 &lt;= arr[i] &lt;= 200</code>",
        ],
        approaches=[
            dict(
                name="Split point, bottom-up by length",
                time="O(n&sup3;)",
                space="O(n&sup2;)",
                best=True,
                why=[
                    "Let <code>dp[i][j]</code> be the cheapest way to multiply matrices <code>i..j</code>. The <em>last</em> multiplication combines some <code>(i..k)</code> with <code>(k+1..j)</code>; the two sides are independent, and the final product costs <code>arr[i-1]&middot;arr[k]&middot;arr[j]</code>. Try every <code>k</code> and take the minimum.",
                    "Every <code>dp[i][j]</code> reads only shorter ranges, so fill by increasing chain length. n&sup2; ranges &times; up to n split points = O(n&sup3;).",
                    "\"Choose the last operation, and the rest splits into independent halves\" is the idea to carry into Burst Balloons and Cutting a Stick.",
                ],
                code='''def matrix_chain_order(arr):
    n = len(arr) - 1                     # number of matrices, 1-indexed
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(2, n + 1):
        for i in range(1, n - length + 2):
            j = i + length - 1
            dp[i][j] = min(dp[i][k] + dp[k + 1][j] + arr[i - 1] * arr[k] * arr[j]
                           for k in range(i, j))
    return dp[1][n] if n else 0''',
            ),
            dict(
                name="Top-down memo",
                time="O(n&sup3;)",
                space="O(n&sup2;)",
                why=[
                    "The recurrence as written, cached on <code>(i, j)</code>. Often easier to get right than the length-ordered loops, since the recursion works out the fill order for you.",
                ],
                code='''def matrix_chain_order(arr):
    @cache
    def cost(i, j):                      # multiply matrices i..j
        if i >= j:
            return 0
        return min(cost(i, k) + cost(k + 1, j) + arr[i - 1] * arr[k] * arr[j]
                   for k in range(i, j))
    return cost(1, len(arr) - 1)''',
            ),
        ],
        tests='''assert matrix_chain_order([2, 1, 3, 4]) == 20
assert matrix_chain_order([1, 2, 3, 4, 3]) == 30
assert matrix_chain_order([3, 4]) == 0
assert matrix_chain_order([10, 20, 30]) == 6000
assert matrix_chain_order([40, 20, 30, 10, 30]) == 26000


def brute(arr):
    def go(i, j):
        if i >= j:
            return 0
        return min(go(i, k) + go(k + 1, j) + arr[i - 1] * arr[k] * arr[j]
                   for k in range(i, j))
    return go(1, len(arr) - 1)


random.seed(28)
for _ in range(40):
    arr = [random.randint(1, 20) for _ in range(random.randint(2, 8))]
    assert matrix_chain_order(arr) == brute(arr), arr''',
    ),

    dict(
        id="burst-balloons",
        lc=312, slug="burst-balloons",
        name="Burst Balloons",
        difficulty="hard",
        approaches=[
            dict(
                name="Last balloon to burst, bottom-up",
                time="O(n&sup3;)",
                space="O(n&sup2;)",
                best=True,
                why=[
                    "Pad the array with a 1 at each end. <code>dp[l][r]</code> = the most coins from bursting every balloon strictly between <code>l</code> and <code>r</code>, with <code>l</code> and <code>r</code> themselves still standing.",
                    "Choosing the <em>first</em> balloon to burst does not split the problem: its two neighbours become adjacent, so the halves interact. Choose the <strong>last</strong> one, <code>k</code>, instead. Everything else between <code>l</code> and <code>r</code> is gone by then, so <code>k</code> scores <code>nums[l]&middot;nums[k]&middot;nums[r]</code>, and the balloons left of <code>k</code> and right of <code>k</code> were burst independently, bounded by <code>l, k</code> and <code>k, r</code>.",
                    "That is Matrix Chain Multiplication exactly &mdash; <code>k</code> is the split, the boundaries are fixed &mdash; which is why MCM is the problem to learn first.",
                ],
                code='''def max_coins(nums):
    vals = [1] + nums + [1]
    n = len(vals)
    dp = [[0] * n for _ in range(n)]
    for gap in range(2, n):
        for l in range(n - gap):
            r = l + gap
            dp[l][r] = max(dp[l][k] + vals[l] * vals[k] * vals[r] + dp[k][r]
                           for k in range(l + 1, r))
    return dp[0][n - 1]''',
            ),
            dict(
                name="Top-down memo",
                time="O(n&sup3;)",
                space="O(n&sup2;)",
                why=[
                    "<code>best(l, r)</code> with the same \"last to burst\" choice of <code>k</code>, cached. The empty range, <code>r = l + 1</code>, scores 0.",
                ],
                code='''def max_coins(nums):
    vals = [1] + nums + [1]

    @cache
    def best(l, r):
        if r - l < 2:
            return 0
        return max(best(l, k) + vals[l] * vals[k] * vals[r] + best(k, r)
                   for k in range(l + 1, r))
    return best(0, len(vals) - 1)''',
            ),
        ],
        tests='''assert max_coins([3, 1, 5, 8]) == 167
assert max_coins([1, 5]) == 10
assert max_coins([7]) == 7


def brute(nums):
    best = 0
    for order in itertools.permutations(range(len(nums))):
        alive, total = list(range(len(nums))), 0
        for b in order:
            p = alive.index(b)
            left = nums[alive[p - 1]] if p > 0 else 1
            right = nums[alive[p + 1]] if p + 1 < len(alive) else 1
            total += left * nums[b] * right
            alive.pop(p)
        best = max(best, total)
    return best


random.seed(29)
for _ in range(40):
    nums = [random.randint(0, 9) for _ in range(random.randint(1, 6))]
    assert max_coins(nums) == brute(nums), nums''',
        pitfall="Letting <code>k</code> be the first balloon burst. Its neighbours then depend on what happens to the other side, and the subproblems are not independent.",
    ),

    dict(
        id="minimum-cost-to-cut-a-stick",
        lc=1547, slug="minimum-cost-to-cut-a-stick",
        name="Minimum Cost to Cut a Stick",
        difficulty="hard",
        approaches=[
            dict(
                name="Interval DP over sorted cut positions",
                time="O(m&sup3;)",
                space="O(m&sup2;)",
                best=True,
                why=[
                    "The stick can be up to 10<sup>6</sup> long, but only the <code>m &le; 100</code> cut positions matter. So work over <strong>indices into the sorted cuts</strong>, with 0 and <code>n</code> added as the ends &mdash; a small coordinate compression that makes the state space O(m&sup2;) instead of O(n&sup2;).",
                    "<code>dp[i][j]</code> = cheapest way to make every cut strictly between <code>pos[i]</code> and <code>pos[j]</code>. The <em>first</em> cut <code>k</code> on that piece costs its length, <code>pos[j] - pos[i]</code>, and splits it into two independent pieces: <code>dp[i][k] + dp[k][j]</code>.",
                    "Here \"first\" works where Burst Balloons needed \"last\", because a cut really does separate the stick &mdash; after it, the two sides never interact. The question to ask each time is: which choice makes the halves independent?",
                ],
                code='''def min_cost(n, cuts):
    pos = [0] + sorted(cuts) + [n]
    m = len(pos)
    dp = [[0] * m for _ in range(m)]
    for gap in range(2, m):
        for i in range(m - gap):
            j = i + gap
            dp[i][j] = pos[j] - pos[i] + min(dp[i][k] + dp[k][j]
                                             for k in range(i + 1, j))
    return dp[0][m - 1]''',
            ),
            dict(
                name="Top-down memo",
                time="O(m&sup3;)",
                space="O(m&sup2;)",
                why=[
                    "<code>cost(i, j)</code> over the same sorted positions, cached. With m &le; 102 positions the recursion depth is at most m, safely under Python's limit.",
                ],
                code='''def min_cost(n, cuts):
    pos = [0] + sorted(cuts) + [n]

    @cache
    def cost(i, j):
        if j - i < 2:
            return 0
        return pos[j] - pos[i] + min(cost(i, k) + cost(k, j)
                                     for k in range(i + 1, j))
    return cost(0, len(pos) - 1)''',
            ),
        ],
        tests='''assert min_cost(7, [1, 3, 4, 5]) == 16
assert min_cost(9, [5, 6, 1, 4, 2]) == 22
assert min_cost(10, [5]) == 10


def brute(n, cuts):
    best = inf
    for order in itertools.permutations(cuts):
        pieces, total = [(0, n)], 0
        for c in order:
            for idx, (a, b) in enumerate(pieces):
                if a < c < b:
                    total += b - a
                    pieces[idx:idx + 1] = [(a, c), (c, b)]
                    break
        best = min(best, total)
    return best


random.seed(30)
for _ in range(40):
    n = random.randint(2, 20)
    cuts = random.sample(range(1, n), random.randint(1, min(5, n - 1)))
    assert min_cost(n, list(cuts)) == brute(n, cuts), (n, cuts)''',
    ),
    ],
)


DP_TOPIC = dict(
    id="dp",
    title="Dynamic Programming",
    prelude=PRELUDE_DP,
    layout="patterns",
    sections=[P0, P1, P2, P3, P4, P5, P6],
)
