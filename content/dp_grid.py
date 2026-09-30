# -*- coding: utf-8 -*-
"""DP pattern 3: grid DP, written as a ladder."""

GRID = dict(
    id="grid",
    title="Grid DP",
    summary="state = (row, col); pull from the cell above and the cell to the left",
    idea=[
        "Movement is restricted to right and down (or down and diagonally), so a cell can only be reached from the cells above and to its left. That gives the recurrence immediately: <code>f(r, c)</code> combines <code>f(r-1, c)</code> and <code>f(r, c-1)</code> &mdash; add them to count paths, take the min to find the cheapest.",
        "Fill row by row, left to right, and both inputs are ready when you need them. The first row and column are the base cases, because they have only one neighbour to pull from.",
        "Every grid problem here shrinks the same way. <strong>Two rows:</strong> row <code>r</code> reads only row <code>r-1</code> and itself. <strong>One row:</strong> before the update <code>row[c]</code> is still \"the cell above\", and <code>row[c-1]</code> has just become \"the cell to the left\". O(rows&middot;cols) time, O(cols) space.",
        "Sometimes you must go <strong>backwards</strong>. In Dungeon Game what a cell needs depends on the path <em>after</em> it, not before, so the table is filled from the bottom-right corner. When the forward direction does not give a clean recurrence, try the other end.",
    ],
    problems=[

    dict(
        id="unique-paths",
        lc=62, slug="unique-paths",
        name="Unique Paths",
        difficulty="medium",
        recurrence=dict(
            state="<code>f(r, c)</code> = the number of paths from the top-left corner to cell <code>(r, c)</code>.",
            derive=[
                "The last move into <code>(r, c)</code> came from above, <code>(r-1, c)</code>, or from the left, <code>(r, c-1)</code>.",
                "Those two groups of paths differ in their last move, so they do not overlap: add them.",
                "Every cell in the top row or left column has exactly one path: straight along the edge.",
            ],
            formula='''f(r, c) = f(r-1, c) + f(r, c-1)
f(0, c) = 1          top row
f(r, 0) = 1          left column
answer: f(m-1, n-1)''',
        ),
        approaches=[
            dict(
                name="Plain recursion",
                time="O(2<sup>m+n</sup>)",
                space="O(m + n)",
                tag="brute force",
                why=[
                    "Each call branches into up and left, and every path is walked separately. The answer itself grows exponentially, and so does the work.",
                    "The stack holds one path, at most <code>m + n</code> cells long.",
                ],
                code='''def unique_paths(m, n):
    def f(r, c):               # paths from (0, 0) to (r, c)
        if r == 0 or c == 0:
            return 1
        return f(r - 1, c) + f(r, c - 1)
    return f(m - 1, n - 1)''',
            ),
            dict(
                name="Top-down memo",
                time="O(m&middot;n)",
                space="O(m&middot;n)",
                change="Cache on <code>(r, c)</code>: one entry per cell.",
                why=[
                    "Every cell is computed once from two cached neighbours.",
                ],
                code='''def unique_paths(m, n):
    @cache
    def f(r, c):
        if r == 0 or c == 0:
            return 1
        return f(r - 1, c) + f(r, c - 1)
    return f(m - 1, n - 1)''',
            ),
            dict(
                name="Bottom-up 2-D table",
                time="O(m&middot;n)",
                space="O(m&middot;n)",
                change="Fill the grid row by row, left to right. Start every cell at 1, which sets the top row and left column for free.",
                why=[
                    "For an inner cell, the cell above (previous row) and the cell to the left (earlier in this row) are both already filled.",
                ],
                code='''def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]''',
            ),
            dict(
                name="Two rows",
                time="O(m&middot;n)",
                space="O(n)",
                change="Row <code>r</code> reads only row <code>r-1</code> (\"above\") and itself (\"left\"). Keep <code>prev</code> and build <code>cur</code>.",
                why=[
                    "Rows older than <code>r-1</code> are never read again.",
                    "<code>cur[0] = 1</code> is the left-column base case.",
                ],
                code='''def unique_paths(m, n):
    prev = [1] * n             # row r-1
    for _ in range(1, m):
        cur = [1] * n
        for c in range(1, n):
            cur[c] = prev[c] + cur[c - 1]
        prev = cur
    return prev[-1]''',
            ),
            dict(
                name="One row",
                time="O(m&middot;n)",
                space="O(n)",
                best=True,
                change="Write into a single row in place: <code>row[c] += row[c-1]</code>.",
                why=[
                    "Before the update, <code>row[c]</code> still holds the value from the previous row: that is \"above\".",
                    "<code>row[c-1]</code> was updated a moment ago in this pass: that is \"left\".",
                    "So <code>row[c] = above + left</code> is exactly <code>row[c] += row[c-1]</code>. Half the memory of two rows, and no new list per row.",
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
                    "Every path is exactly <code>m-1</code> downs and <code>n-1</code> rights in some order. Choosing where the downs go fixes the path: <code>C(m+n-2, m-1)</code> paths.",
                    "Good to mention, but it is the DP that generalises to obstacles in the next problem.",
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
        recurrence=dict(
            state="<code>f(r, c)</code> = the number of paths from the top-left corner to cell <code>(r, c)</code> that avoid every obstacle.",
            derive=[
                "Same split as Unique Paths: the last move came from above or from the left.",
                "An obstacle cell has 0 paths into it, so nothing flows through it.",
                "Instead of \"the edge is all 1s\", let cells outside the grid have 0 paths and the start have 1. Then an obstacle on the edge correctly blocks everything after it.",
            ],
            formula='''f(r, c) = 0                       if grid[r][c] == 1   (obstacle)
f(0, 0) = 1                       start, if it is free
f(r, c) = f(r-1, c) + f(r, c-1)   otherwise
f(r, c) = 0  when r < 0 or c < 0  outside the grid
answer: f(m-1, n-1)''',
        ),
        approaches=[
            dict(
                name="Plain recursion",
                time="O(2<sup>m+n</sup>)",
                space="O(m + n)",
                tag="brute force",
                why=[
                    "Walks every obstacle-free path separately.",
                ],
                code='''def unique_paths_with_obstacles(grid):
    def f(r, c):               # obstacle-free paths from (0, 0) to (r, c)
        if r < 0 or c < 0 or grid[r][c] == 1:
            return 0
        if r == 0 and c == 0:
            return 1
        return f(r - 1, c) + f(r, c - 1)
    return f(len(grid) - 1, len(grid[0]) - 1)''',
            ),
            dict(
                name="Top-down memo",
                time="O(m&middot;n)",
                space="O(m&middot;n)",
                change="Cache on <code>(r, c)</code>.",
                why=[
                    "One computation per cell.",
                ],
                code='''def unique_paths_with_obstacles(grid):
    @cache
    def f(r, c):
        if r < 0 or c < 0 or grid[r][c] == 1:
            return 0
        if r == 0 and c == 0:
            return 1
        return f(r - 1, c) + f(r, c - 1)
    return f(len(grid) - 1, len(grid[0]) - 1)''',
            ),
            dict(
                name="Bottom-up 2-D table",
                time="O(m&middot;n)",
                space="O(m&middot;n)",
                change="Fill row by row. Cells outside the grid count as 0, so the edges need no special starting values.",
                why=[
                    "<code>up</code> and <code>left</code> default to 0 on the top row and left column, which is exactly the recurrence's \"outside the grid\" case.",
                ],
                code='''def unique_paths_with_obstacles(grid):
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 1:
                dp[r][c] = 0
            elif r == 0 and c == 0:
                dp[r][c] = 1
            else:
                up = dp[r - 1][c] if r else 0
                left = dp[r][c - 1] if c else 0
                dp[r][c] = up + left
    return dp[m - 1][n - 1]''',
            ),
            dict(
                name="Two rows",
                time="O(m&middot;n)",
                space="O(n)",
                change="Keep <code>prev</code> (the row above) and build <code>cur</code>. Start <code>prev</code> as a phantom row of zeros with a 1 over the start, so the first real row needs no special case.",
                why=[
                    "The phantom row feeds exactly 1 path into <code>(0, 0)</code> from \"above\", and 0 into the rest of the top row.",
                ],
                code='''def unique_paths_with_obstacles(grid):
    n = len(grid[0])
    prev = [0] * n
    prev[0] = 1                # phantom row: one way to enter the start
    for cells in grid:
        cur = [0] * n
        for c in range(n):
            if cells[c] == 0:
                cur[c] = prev[c] + (cur[c - 1] if c else 0)
        prev = cur
    return prev[-1]''',
            ),
            dict(
                name="One row, zero at obstacles",
                time="O(m&middot;n)",
                space="O(n)",
                best=True,
                change="Update one row in place. An obstacle sets its cell to 0; any other cell adds its left neighbour.",
                why=[
                    "Before the update <code>row[c]</code> is \"above\"; <code>row[c-1]</code> is already \"left\". Same argument as Unique Paths.",
                    "Column 0 has no left neighbour, so it just keeps \"above\" &mdash; or becomes 0 at an obstacle, which then blocks every row below it.",
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
        recurrence=dict(
            state="<code>f(r, c)</code> = the smallest sum of any path from the top-left corner to <code>(r, c)</code>, including both ends.",
            derive=[
                "The last move came from above or from the left. Whichever it was, the path up to there should itself be as cheap as possible.",
                "So pay for this cell and add the cheaper of the two predecessors: the same shape as Unique Paths with <code>min</code> in place of <code>+</code>.",
                "Outside the grid is infinity, so it never wins the <code>min</code>.",
            ],
            formula='''f(r, c) = grid[r][c] + min(f(r-1, c), f(r, c-1))
f(0, 0) = grid[0][0]
f(r, c) = inf  when r < 0 or c < 0
answer: f(m-1, n-1)''',
        ),
        approaches=[
            dict(
                name="Plain recursion",
                time="O(2<sup>m+n</sup>)",
                space="O(m + n)",
                tag="brute force",
                why=[
                    "Prices every path separately.",
                ],
                code='''def min_path_sum(grid):
    def f(r, c):               # cheapest path from (0, 0) to (r, c)
        if r < 0 or c < 0:
            return inf
        if r == 0 and c == 0:
            return grid[0][0]
        return grid[r][c] + min(f(r - 1, c), f(r, c - 1))
    return f(len(grid) - 1, len(grid[0]) - 1)''',
            ),
            dict(
                name="Top-down memo",
                time="O(m&middot;n)",
                space="O(m&middot;n)",
                change="Cache on <code>(r, c)</code>.",
                why=[
                    "One computation per cell.",
                ],
                code='''def min_path_sum(grid):
    @cache
    def f(r, c):
        if r < 0 or c < 0:
            return inf
        if r == 0 and c == 0:
            return grid[0][0]
        return grid[r][c] + min(f(r - 1, c), f(r, c - 1))
    return f(len(grid) - 1, len(grid[0]) - 1)''',
            ),
            dict(
                name="Bottom-up 2-D table",
                time="O(m&middot;n)",
                space="O(m&middot;n)",
                change="Fill row by row, treating anything outside the grid as infinity.",
                why=[
                    "The start cell is the only one with no finite neighbour, so it is special-cased once.",
                ],
                code='''def min_path_sum(grid):
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    for r in range(m):
        for c in range(n):
            if r == 0 and c == 0:
                dp[r][c] = grid[0][0]
                continue
            up = dp[r - 1][c] if r else inf
            left = dp[r][c - 1] if c else inf
            dp[r][c] = grid[r][c] + min(up, left)
    return dp[m - 1][n - 1]''',
            ),
            dict(
                name="Two rows",
                time="O(m&middot;n)",
                space="O(n)",
                change="Keep <code>prev</code> and build <code>cur</code>. Start <code>prev</code> as a phantom row: infinity everywhere except a 0 above the start.",
                why=[
                    "The phantom 0 lets <code>(0, 0)</code> use the same formula as every other cell: <code>grid[0][0] + min(0, inf)</code>.",
                ],
                code='''def min_path_sum(grid):
    n = len(grid[0])
    prev = [inf] * n
    prev[0] = 0                # phantom row above the start
    for cells in grid:
        cur = [0] * n
        for c in range(n):
            left = cur[c - 1] if c else inf
            cur[c] = cells[c] + min(prev[c], left)
        prev = cur
    return prev[-1]''',
            ),
            dict(
                name="One row",
                time="O(m&middot;n)",
                space="O(n)",
                best=True,
                change="Update one row in place: <code>row[c] = cell + min(row[c], row[c-1])</code>.",
                why=[
                    "<code>row[c]</code> before the update is \"above\"; <code>row[c-1]</code> is \"left\", already updated this pass.",
                    "Column 0 has only \"above\", so it just adds the cell.",
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
        recurrence=dict(
            state="<code>f(r, i)</code> = the smallest sum of a path from position <code>i</code> of row <code>r</code> down to the base.",
            derive=[
                "From <code>(r, i)</code> you move to <code>(r+1, i)</code> or <code>(r+1, i+1)</code>. Pay for this cell, then take the cheaper way down.",
                "Why measure <em>down to the base</em> rather than from the apex? Going down, the paths end in <code>n</code> different places and you would need a <code>min</code> over all of them. Going up, every path ends at the single apex, so the answer is just one cell.",
                "Below the last row there is nothing left to pay.",
            ],
            formula='''f(r, i) = triangle[r][i] + min(f(r+1, i), f(r+1, i+1))
f(n, i) = 0            below the base
answer: f(0, 0)''',
        ),
        approaches=[
            dict(
                name="Plain recursion",
                time="O(2<sup>n</sup>)",
                space="O(n)",
                tag="brute force",
                why=[
                    "Two choices per row: all 2<sup>n-1</sup> paths are priced separately.",
                ],
                code='''def minimum_total(triangle):
    n = len(triangle)

    def f(r, i):               # cheapest path from (r, i) to the base
        if r == n:
            return 0
        return triangle[r][i] + min(f(r + 1, i), f(r + 1, i + 1))
    return f(0, 0)''',
            ),
            dict(
                name="Top-down memo",
                time="O(n&sup2;)",
                space="O(n&sup2;)",
                change="Cache on <code>(r, i)</code>. The triangle has <code>n(n+1)/2</code> cells.",
                why=[
                    "Two neighbouring cells share a child, which is why the plain recursion repeated work. The cache prices each cell once.",
                ],
                code='''def minimum_total(triangle):
    n = len(triangle)

    @cache
    def f(r, i):
        if r == n:
            return 0
        return triangle[r][i] + min(f(r + 1, i), f(r + 1, i + 1))
    return f(0, 0)''',
            ),
            dict(
                name="Bottom-up 2-D table",
                time="O(n&sup2;)",
                space="O(n&sup2;)",
                change="Fill from the base row upwards. An extra row of zeros below the base is the base case.",
                why=[
                    "Row <code>r</code> reads only row <code>r+1</code>, which is already filled.",
                ],
                code='''def minimum_total(triangle):
    n = len(triangle)
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for r in range(n - 1, -1, -1):
        for i in range(r + 1):
            dp[r][i] = triangle[r][i] + min(dp[r + 1][i], dp[r + 1][i + 1])
    return dp[0][0]''',
            ),
            dict(
                name="Two rows",
                time="O(n&sup2;)",
                space="O(n)",
                change="Only the row below is read. Keep it as <code>below</code> and build <code>cur</code>.",
                why=[
                    "<code>below</code> starts as the base row itself, so the loop begins one row up.",
                ],
                code='''def minimum_total(triangle):
    below = list(triangle[-1])
    for r in range(len(triangle) - 2, -1, -1):
        cur = [0] * (r + 1)
        for i in range(r + 1):
            cur[i] = triangle[r][i] + min(below[i], below[i + 1])
        below = cur
    return below[0]''',
            ),
            dict(
                name="One row",
                time="O(n&sup2;)",
                space="O(n)",
                best=True,
                change="Overwrite <code>best</code> in place, <code>i</code> left to right.",
                why=[
                    "Cell <code>i</code> reads <code>best[i]</code> and <code>best[i+1]</code> &mdash; itself and the cell to its <em>right</em>.",
                    "Going left to right, <code>best[i+1]</code> has not been overwritten yet, so it still holds the row below. Safe.",
                    "O(n) extra space is the follow-up LeetCode asks for.",
                ],
                code='''def minimum_total(triangle):
    best = list(triangle[-1])
    for r in range(len(triangle) - 2, -1, -1):
        for i in range(r + 1):
            best[i] = triangle[r][i] + min(best[i], best[i + 1])
    return best[0]''',
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
        recurrence=dict(
            state="<code>need(r, c)</code> = the least health the knight must have when <em>entering</em> room <code>(r, c)</code> to reach the princess alive.",
            derive=[
                "Forward DP fails: along a path two numbers matter &mdash; the health you have now and the lowest it has dipped to &mdash; and neither alone decides which path is best.",
                "Backwards needs only one number. From <code>(r, c)</code> you step right or down, so you need enough to survive into the cheaper of those two: <code>min(right, down)</code>.",
                "This room changes your health by <code>dungeon[r][c]</code> before you step on, so subtract it.",
                "Health can never be below 1, so clamp with <code>max(1, &hellip;)</code>. A big potion does not bank credit for earlier; it just lowers the requirement to 1.",
            ],
            formula='''need(r, c) = max(1, min(need(r+1, c), need(r, c+1)) - dungeon[r][c])
need(m-1, n-1) = max(1, 1 - dungeon[m-1][n-1])     princess's room
need(r, c) = inf  when r == m or c == n            off the grid
answer: need(0, 0)''',
            notes=[
                "When the future decides the present, fill the table from the end.",
            ],
        ),
        approaches=[
            dict(
                name="Plain recursion",
                time="O(2<sup>m+n</sup>)",
                space="O(m + n)",
                tag="brute force",
                why=[
                    "Walks every path from each room to the princess separately.",
                ],
                code='''def calculate_minimum_hp(dungeon):
    m, n = len(dungeon), len(dungeon[0])

    def need(r, c):            # least health on entering (r, c)
        if r == m or c == n:
            return inf
        if r == m - 1 and c == n - 1:
            return max(1, 1 - dungeon[r][c])
        return max(1, min(need(r + 1, c), need(r, c + 1)) - dungeon[r][c])
    return need(0, 0)''',
            ),
            dict(
                name="Top-down memo",
                time="O(m&middot;n)",
                space="O(m&middot;n)",
                change="Cache on <code>(r, c)</code>.",
                why=[
                    "One computation per room.",
                ],
                code='''def calculate_minimum_hp(dungeon):
    m, n = len(dungeon), len(dungeon[0])

    @cache
    def need(r, c):
        if r == m or c == n:
            return inf
        if r == m - 1 and c == n - 1:
            return max(1, 1 - dungeon[r][c])
        return max(1, min(need(r + 1, c), need(r, c + 1)) - dungeon[r][c])
    return need(0, 0)''',
            ),
            dict(
                name="Bottom-up 2-D table",
                time="O(m&middot;n)",
                space="O(m&middot;n)",
                change="Fill from the bottom-right corner, rows upwards and columns leftwards. Add an extra row and column of infinity for \"off the grid\", with a 1 just past the princess so her room uses the same formula.",
                why=[
                    "The two phantom cells beside the princess are set to 1: \"after rescuing her, you need 1 health\". Then <code>max(1, 1 - dungeon)</code> falls out of the general formula.",
                ],
                code='''def calculate_minimum_hp(dungeon):
    m, n = len(dungeon), len(dungeon[0])
    need = [[inf] * (n + 1) for _ in range(m + 1)]
    need[m][n - 1] = need[m - 1][n] = 1
    for r in range(m - 1, -1, -1):
        for c in range(n - 1, -1, -1):
            need[r][c] = max(1, min(need[r + 1][c], need[r][c + 1]) - dungeon[r][c])
    return need[0][0]''',
            ),
            dict(
                name="Two rows",
                time="O(m&middot;n)",
                space="O(n)",
                change="Row <code>r</code> reads only row <code>r+1</code> (\"down\") and itself (\"right\"). Keep <code>below</code> and build <code>cur</code>.",
                why=[
                    "<code>below</code> starts as the phantom row under the grid: infinity, except 1 under the princess.",
                ],
                code='''def calculate_minimum_hp(dungeon):
    m, n = len(dungeon), len(dungeon[0])
    below = [inf] * (n + 1)
    below[n - 1] = 1           # phantom row: 1 hp after the princess
    for r in range(m - 1, -1, -1):
        cur = [inf] * (n + 1)
        for c in range(n - 1, -1, -1):
            cur[c] = max(1, min(below[c], cur[c + 1]) - dungeon[r][c])
        below = cur
    return below[0]''',
            ),
            dict(
                name="One row",
                time="O(m&middot;n)",
                space="O(n)",
                best=True,
                change="Update one row in place, right to left.",
                why=[
                    "Before the update, <code>need[c]</code> still holds the row below: \"down\".",
                    "<code>need[c+1]</code> was updated a moment ago in this pass: \"right\".",
                    "After the first row, reset the phantom column <code>need[n]</code> to infinity, because only the princess's own row had a real exit there.",
                ],
                code='''def calculate_minimum_hp(dungeon):
    m, n = len(dungeon), len(dungeon[0])
    need = [inf] * (n + 1)
    need[n - 1] = 1
    for r in range(m - 1, -1, -1):
        for c in range(n - 1, -1, -1):
            need[c] = max(1, min(need[c], need[c + 1]) - dungeon[r][c])
        need[n] = inf          # the phantom column stays unreachable
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

SECTIONS = [GRID]
