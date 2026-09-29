/* GENERATED FILE - do not edit by hand.
   Source: content/dsa.py   Build: python3 build.py
   Every solution below was executed against the problem's tests. */

window.GRAIL_PRELUDE = "from collections import deque\n\n\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n\ndef build(values):\n    \"\"\"Build a tree from LeetCode's level-order list, None for a missing child.\"\"\"\n    if not values:\n        return None\n    root = TreeNode(values[0])\n    queue = deque([root])\n    i = 1\n    while queue and i < len(values):\n        node = queue.popleft()\n        if i < len(values):\n            v = values[i]; i += 1\n            if v is not None:\n                node.left = TreeNode(v)\n                queue.append(node.left)\n        if i < len(values):\n            v = values[i]; i += 1\n            if v is not None:\n                node.right = TreeNode(v)\n                queue.append(node.right)\n    return root\n\n\ndef level_order(root):\n    \"\"\"Flatten back to a LeetCode-style list, for comparing trees in tests.\"\"\"\n    if root is None:\n        return []\n    out, queue = [], deque([root])\n    while queue:\n        node = queue.popleft()\n        if node is None:\n            out.append(None)\n            continue\n        out.append(node.val)\n        queue.append(node.left)\n        queue.append(node.right)\n    while out and out[-1] is None:\n        out.pop()\n    return out";
window.GRAIL_DSA = [
  {
    "id": "trees",
    "title": "Binary Trees",
    "subtitle": "eighteen problems, in the order they teach each other",
    "blurb": [
      "Almost every binary-tree interview question is one of a small number of shapes wearing different clothes. This path works through those shapes in the order that each one makes the next one easier &mdash; not in difficulty order, and not in the order LeetCode numbers them.",
      "Traversals come first because they give you the vocabulary. Once you know what <em>preorder</em>, <em>postorder</em> and <em>level order</em> mean, every later explanation is one sentence instead of three."
    ],
    "convention": [
      "<code>n</code> is the node count, <code>h</code> the height, <code>w</code> the widest level. <code>h</code> is <code>O(log n)</code> when the tree is balanced and <code>O(n)</code> when it is a single chain &mdash; and interviewers pick the chain.",
      "Every space figure is <strong>auxiliary</strong> space and excludes the returned output. A traversal that returns n values obviously costs O(n) to return them; what tells the approaches apart is what they allocate on top."
    ],
    "status": "ready",
    "target": 20,
    "sections": [
      {
        "id": "dfs-orders",
        "title": "The recursive template and the three DFS orders",
        "idea": [
          "Every recursive tree function has the same skeleton: handle the empty tree, solve the left subtree, solve the right subtree, combine. What changes between problems is only <em>where</em> you do the work relative to those two recursive calls.",
          "Do it before them and you have <strong>preorder</strong> (root, left, right). Between them, <strong>inorder</strong> (left, root, right). After them, <strong>postorder</strong> (left, right, root). That is the entire distinction, and it is worth more than it looks: postorder is the only one of the three where a node already knows both children's answers, which is why every \"aggregate over subtrees\" problem later in this path is postorder.",
          "Write the iterative versions too. Not because an interviewer will demand them, but because doing so forces you to notice that recursion's call stack <em>is</em> a stack of pending work, and that the recursion limit is a real constraint: CPython's default is 1000 frames, so a 10,000-node chain crashes a recursive solution that is otherwise correct."
        ],
        "problems": [
          {
            "id": "preorder-traversal",
            "num": 1,
            "lc": 144,
            "slug": "binary-tree-preorder-traversal",
            "url": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
            "name": "Binary Tree Preorder Traversal",
            "difficulty": "easy",
            "framing": [
              "Emit each node before its children. This is the order you want whenever a node's work does not depend on its children &mdash; serialising a tree, copying it, or printing an indented outline."
            ],
            "pitfall": "Pushing left before right. The output looks plausible on a symmetric test tree and wrong on everything else.",
            "approaches": [
              {
                "name": "Recursive",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "Every node is visited exactly once and does constant work, so time is O(n) with no way to do better &mdash; you have to name all n values.",
                  "Space is the call stack, which holds one frame per node on the path from the root to wherever you currently are. That path is at most <code>h</code> long, so O(h): O(log n) balanced, O(n) for a chain."
                ],
                "code": "def preorder(root):\n    out = []\n\n    def walk(node):\n        if node is None:\n            return\n        out.append(node.val)   # root\n        walk(node.left)        # left\n        walk(node.right)       # right\n\n    walk(root)\n    return out",
                "best": true,
                "tag": ""
              },
              {
                "name": "Iterative, one stack",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "Pop a node, emit it, then push its children. Push <strong>right before left</strong>, because a stack reverses what you put in and you want left to come out first. Getting that backwards is the single most common bug here.",
                  "The stack holds the right children you have deferred. Along any root-to-node path there is at most one deferred right child per level, so the stack never exceeds O(h) &mdash; the same bound as the recursion it replaces, which is the point: this version is not more space-efficient, it just moves the stack somewhere you control and cannot overflow."
                ],
                "code": "def preorder(root):\n    if root is None:\n        return []\n    out, stack = [], [root]\n    while stack:\n        node = stack.pop()\n        out.append(node.val)\n        if node.right is not None:\n            stack.append(node.right)   # pushed first, popped second\n        if node.left is not None:\n            stack.append(node.left)\n    return out",
                "best": false,
                "tag": ""
              },
              {
                "name": "Morris traversal",
                "time": "O(n)",
                "space": "O(1)",
                "why": [
                  "The only way to beat O(h) is to stop storing the path and store it <em>in the tree</em>. Morris temporarily points the rightmost node of the left subtree back at the current node, uses that thread to climb back up, and removes it on the way through.",
                  "Time stays O(n) despite the extra walking: each edge is traversed at most three times &mdash; once going down, once to find a predecessor, once to unthread it &mdash; so the total is bounded by 3 &times; the edge count, which is O(n).",
                  "The catch, and the reason you should not lead with this in an interview: it <strong>mutates the tree</strong> mid-traversal. It restores it, but if anything else reads the tree concurrently, or if an exception escapes halfway through, the tree is left corrupt."
                ],
                "code": "def preorder(root):\n    out, node = [], root\n    while node is not None:\n        if node.left is None:\n            out.append(node.val)\n            node = node.right\n            continue\n        pred = node.left\n        while pred.right is not None and pred.right is not node:\n            pred = pred.right\n        if pred.right is None:\n            out.append(node.val)   # emit before descending: preorder\n            pred.right = node      # thread\n            node = node.left\n        else:\n            pred.right = None      # unthread, left subtree done\n            node = node.right\n    return out",
                "best": false,
                "tag": "constant space"
              }
            ],
            "tests": "t = build([1, 2, 3, 4, 5, None, 8, None, None, 6, 7])\nassert preorder(t) == [1, 2, 4, 5, 6, 7, 3, 8]\nassert preorder(None) == []\nassert preorder(build([1])) == [1]\nchain = build([1, 2, None, 3, None, 4])\nassert preorder(chain) == [1, 2, 3, 4]\nassert level_order(t) == [1, 2, 3, 4, 5, None, 8, None, None, 6, 7]",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "dfs-orders",
            "sectionTitle": "The recursive template and the three DFS orders"
          },
          {
            "id": "inorder-traversal",
            "num": 2,
            "lc": 94,
            "slug": "binary-tree-inorder-traversal",
            "url": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
            "name": "Binary Tree Inorder Traversal",
            "difficulty": "easy",
            "framing": [
              "Emit each node between its two subtrees. On a <strong>binary search tree</strong> this yields the keys in sorted order, which is why inorder shows up in every BST validation and k-th-smallest problem &mdash; it is the order that makes the BST property visible."
            ],
            "pitfall": "",
            "approaches": [
              {
                "name": "Recursive",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "Identical cost to preorder, and for the same reasons: one visit per node, one stack frame per level of the current path.",
                  "Only the position of the <code>append</code> moves. That is worth internalising &mdash; the three DFS orders are the same traversal with the work in a different place, not three different algorithms."
                ],
                "code": "def inorder(root):\n    out = []\n\n    def walk(node):\n        if node is None:\n            return\n        walk(node.left)        # left\n        out.append(node.val)   # root\n        walk(node.right)       # right\n\n    walk(root)\n    return out",
                "best": true,
                "tag": ""
              },
              {
                "name": "Iterative, one stack",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "Run left as far as you can, pushing every node you pass. When you cannot go further left, the top of the stack is the next node in order: pop it, emit it, and move to its right child.",
                  "The invariant to say out loud: <em>the stack holds exactly the nodes whose left subtree is finished but which have not been emitted yet.</em> Once you can state that, the loop writes itself.",
                  "Space is O(h) because the descent pushes one node per level. Time is O(n) even though the <code>while</code> loops look nested &mdash; each node is pushed once and popped once, so the total work is 2n steps, not n&sup2;."
                ],
                "code": "def inorder(root):\n    out, stack, node = [], [], root\n    while stack or node is not None:\n        while node is not None:     # descend, remembering the path\n            stack.append(node)\n            node = node.left\n        node = stack.pop()          # leftmost unvisited\n        out.append(node.val)\n        node = node.right           # its left side is done\n    return out",
                "best": false,
                "tag": ""
              },
              {
                "name": "Morris traversal",
                "time": "O(n)",
                "space": "O(1)",
                "why": [
                  "The same threading trick as preorder, with the emit moved to the moment you <em>return</em> along a thread rather than the moment you create it. Inorder is Morris's natural fit &mdash; this is the version the technique was invented for.",
                  "Still O(n): three traversals of each edge at most. Still mutating: the tree is inconsistent while the loop runs."
                ],
                "code": "def inorder(root):\n    out, node = [], root\n    while node is not None:\n        if node.left is None:\n            out.append(node.val)\n            node = node.right\n            continue\n        pred = node.left\n        while pred.right is not None and pred.right is not node:\n            pred = pred.right\n        if pred.right is None:\n            pred.right = node      # thread, do not emit yet\n            node = node.left\n        else:\n            pred.right = None\n            out.append(node.val)   # emit on the way back up: inorder\n            node = node.right\n    return out",
                "best": false,
                "tag": "constant space"
              }
            ],
            "tests": "t = build([1, 2, 3, 4, 5, None, 8, None, None, 6, 7])\nassert inorder(t) == [4, 2, 6, 5, 7, 1, 3, 8]\nassert inorder(None) == []\nbst = build([5, 3, 8, 2, 4, 7, 9])\nassert inorder(bst) == sorted(inorder(bst)) == [2, 3, 4, 5, 7, 8, 9]\nassert level_order(t) == [1, 2, 3, 4, 5, None, 8, None, None, 6, 7]",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "dfs-orders",
            "sectionTitle": "The recursive template and the three DFS orders"
          },
          {
            "id": "postorder-traversal",
            "num": 3,
            "lc": 145,
            "slug": "binary-tree-postorder-traversal",
            "url": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
            "name": "Binary Tree Postorder Traversal",
            "difficulty": "easy",
            "framing": [
              "Emit each node after both children. This is the important one. A node in postorder position already has both children's results, so it can combine them &mdash; which is exactly what heights, sums, diameters, balance checks and deletions need. Sections 2, 5 and 6 of this path are all postorder in disguise."
            ],
            "pitfall": "In the one-stack version, forgetting the <code>is not last</code> check sends you into the right subtree forever.",
            "approaches": [
              {
                "name": "Recursive",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "One visit per node, one frame per path level. Same O(n) / O(h) as its two siblings.",
                  "Note what the shape buys you: by the time <code>out.append</code> runs, both recursive calls have returned. Swap <code>out.append</code> for <code>return 1 + max(left, right)</code> and you have Maximum Depth. That substitution is the whole of section 2."
                ],
                "code": "def postorder(root):\n    out = []\n\n    def walk(node):\n        if node is None:\n            return\n        walk(node.left)        # left\n        walk(node.right)       # right\n        out.append(node.val)   # root\n\n    walk(root)\n    return out",
                "best": true,
                "tag": ""
              },
              {
                "name": "Reversed modified preorder",
                "time": "O(n)",
                "space": "O(h) stack",
                "why": [
                  "Postorder is <code>left, right, root</code>. Reverse it and you get <code>root, right, left</code> &mdash; which is just preorder with the children swapped. So run that, then reverse the answer.",
                  "This is the version to reach for under pressure: it is preorder with two characters changed plus a <code>reverse()</code>. The stack is O(h), exactly as in preorder.",
                  "The reversal is O(n) time and, done in place with <code>list.reverse()</code>, no extra space. <code>reversed(out)</code> or <code>out[::-1]</code> would allocate a second list &mdash; still O(n), which is free here only because the output is already O(n)."
                ],
                "code": "def postorder(root):\n    if root is None:\n        return []\n    out, stack = [], [root]\n    while stack:\n        node = stack.pop()\n        out.append(node.val)\n        if node.left is not None:\n            stack.append(node.left)    # left first so right pops first\n        if node.right is not None:\n            stack.append(node.right)\n    out.reverse()                      # root,right,left -> left,right,root\n    return out",
                "best": false,
                "tag": "easiest iterative"
              },
              {
                "name": "One stack, true postorder",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "If you must emit in genuine postorder as you go &mdash; freeing resources, say, where collecting then reversing is not an option &mdash; you need to distinguish \"arriving at this node\" from \"returning to it after the right subtree\".",
                  "Tracking the <code>last</code> node emitted does it: if the right child is what you just finished, this node is ready. Otherwise descend right.",
                  "Each node is pushed and popped a bounded number of times, so still O(n); the stack still tracks one node per path level, so still O(h). This is the version most people get wrong in an interview, which is a good reason to know the reversal trick as your first answer and this one as your follow-up."
                ],
                "code": "def postorder(root):\n    out, stack, last = [], [], None\n    node = root\n    while stack or node is not None:\n        while node is not None:\n            stack.append(node)\n            node = node.left\n        peek = stack[-1]\n        if peek.right is not None and peek.right is not last:\n            node = peek.right          # right subtree still to do\n        else:\n            out.append(peek.val)\n            last = stack.pop()\n    return out",
                "best": false,
                "tag": ""
              }
            ],
            "tests": "t = build([1, 2, 3, 4, 5, None, 8, None, None, 6, 7])\nassert postorder(t) == [4, 6, 7, 5, 2, 8, 3, 1]\nassert postorder(None) == []\nassert postorder(build([1])) == [1]\nassert postorder(build([1, 2, None, 3])) == [3, 2, 1]",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "dfs-orders",
            "sectionTitle": "The recursive template and the three DFS orders"
          }
        ]
      },
      {
        "id": "depth",
        "title": "Depth: returning a value upward",
        "idea": [
          "Now put the postorder skeleton to work. Instead of appending to a list, each call <em>returns</em> a number describing its own subtree, and the parent combines the two numbers it gets back. This is the single most reusable pattern in tree problems.",
          "These two problems look like mirror images and are not. Maximum depth combines with <code>max</code>; minimum depth cannot simply combine with <code>min</code>, because a missing child is not a path to a leaf. Understanding exactly why that asymmetry exists is worth more than either solution."
        ],
        "problems": [
          {
            "id": "maximum-depth",
            "num": 4,
            "lc": 104,
            "slug": "maximum-depth-of-binary-tree",
            "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
            "name": "Maximum Depth of Binary Tree",
            "difficulty": "easy",
            "framing": [
              "The number of nodes on the longest root-to-leaf path. An empty tree is 0, a single node is 1. This is the canonical first tree problem and the cleanest possible instance of the postorder template."
            ],
            "pitfall": "",
            "approaches": [
              {
                "name": "Recursive postorder",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "Every node must be inspected &mdash; the deepest one could be anywhere &mdash; so O(n) is a lower bound, and one constant-work visit each meets it.",
                  "The call stack holds the current root-to-node path, so O(h). For a balanced tree that is O(log n); for a 10,000-node left chain it is 10,000 frames, which exceeds CPython's default recursion limit of 1000 and raises <code>RecursionError</code>. On adversarial input this correct solution crashes, which is the honest argument for the iterative versions."
                ],
                "code": "def max_depth(root):\n    if root is None:\n        return 0\n    return 1 + max(max_depth(root.left), max_depth(root.right))",
                "best": true,
                "tag": ""
              },
              {
                "name": "BFS, counting levels",
                "time": "O(n)",
                "space": "O(w)",
                "why": [
                  "Peel one whole level per outer iteration and count the iterations. The depth is the number of levels.",
                  "Space is the queue, which holds at most one level: O(w). In a perfect tree the last level has n/2 nodes, so this is O(n) in the worst case &mdash; <em>worse</em> than the recursive O(h) = O(log n) for a balanced tree.",
                  "So the trade is genuinely two-sided: BFS is O(w) and immune to recursion limits, DFS is O(h) and not. For a balanced tree DFS wins on space; for a wide shallow tree BFS loses badly; for a chain BFS is O(1) space and DFS crashes."
                ],
                "code": "def max_depth(root):\n    if root is None:\n        return 0\n    depth, queue = 0, deque([root])\n    while queue:\n        depth += 1\n        for _ in range(len(queue)):     # snapshot: exactly this level\n            node = queue.popleft()\n            if node.left is not None:\n                queue.append(node.left)\n            if node.right is not None:\n                queue.append(node.right)\n    return depth",
                "best": false,
                "tag": ""
              },
              {
                "name": "Iterative DFS with explicit depth",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "Carry the depth alongside each node on the stack. Keeps DFS's O(h) space while removing the recursion-limit failure mode.",
                  "The stack holds pairs rather than frames, so the constant factor is smaller than recursion's, but the asymptotic bound is identical: O(h)."
                ],
                "code": "def max_depth(root):\n    if root is None:\n        return 0\n    best, stack = 0, [(root, 1)]\n    while stack:\n        node, depth = stack.pop()\n        if depth > best:\n            best = depth\n        if node.left is not None:\n            stack.append((node.left, depth + 1))\n        if node.right is not None:\n            stack.append((node.right, depth + 1))\n    return best",
                "best": false,
                "tag": ""
              }
            ],
            "tests": "assert max_depth(None) == 0\nassert max_depth(build([1])) == 1\nassert max_depth(build([3, 9, 20, None, None, 15, 7])) == 3\nassert max_depth(build([1, 2, None, 3, None, 4, None])) == 4\nassert max_depth(build([1, 2, 3, 4, 5, 6, 7])) == 3",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "depth",
            "sectionTitle": "Depth: returning a value upward"
          },
          {
            "id": "minimum-depth",
            "num": 5,
            "lc": 111,
            "slug": "minimum-depth-of-binary-tree",
            "url": "https://leetcode.com/problems/minimum-depth-of-binary-tree/",
            "name": "Minimum Depth of Binary Tree",
            "difficulty": "easy",
            "framing": [
              "The shortest root-to-<strong>leaf</strong> path, where a leaf has no children at all. The word \"leaf\" is the whole problem: <code>1 + min(left, right)</code> is wrong, because for a node with one child the missing side returns 0 and you report a depth that ends at a node which is not a leaf."
            ],
            "pitfall": "Writing <code>1 + min(...)</code> by symmetry with Maximum Depth. On <code>[1,2]</code> it returns 1; the answer is 2.",
            "approaches": [
              {
                "name": "Recursive, with the one-child case",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "Three cases, not two. No children: this is a leaf, depth 1. Two children: <code>1 + min(...)</code> is correct because both sides really do reach leaves. <strong>Exactly one</strong> child: you must take that side, because the empty side is not a path to a leaf.",
                  "The idiom <code>if node.left is None or node.right is None: return 1 + left + right</code> collapses the leaf and one-child cases &mdash; when one side is 0, the sum is the other side. Neat, and worth being able to explain rather than just recite.",
                  "O(n) time: the shallowest leaf may be the last node examined, so no ordering saves you. O(h) stack."
                ],
                "code": "def min_depth(root):\n    if root is None:\n        return 0\n    left, right = min_depth(root.left), min_depth(root.right)\n    if root.left is None or root.right is None:\n        return 1 + left + right    # leaf, or the one real child\n    return 1 + min(left, right)",
                "best": false,
                "tag": ""
              },
              {
                "name": "BFS with early exit",
                "time": "O(n) worst case",
                "space": "O(w)",
                "why": [
                  "BFS reaches nodes in nondecreasing depth order, so the <em>first</em> leaf it meets is at the minimum depth. Return immediately.",
                  "This is the approach to prefer, and the reason is not the asymptotic bound &mdash; that stays O(n), because the shallowest leaf can sit at the bottom of a perfectly balanced tree. It is that the work is proportional to the answer: a tree with a leaf at depth 2 and a million nodes below is settled in three levels, where DFS explores everything.",
                  "Space is the queue: O(w), bounded by the widest level BFS actually reaches, which early exit also keeps small."
                ],
                "code": "def min_depth(root):\n    if root is None:\n        return 0\n    depth, queue = 1, deque([root])\n    while queue:\n        for _ in range(len(queue)):\n            node = queue.popleft()\n            if node.left is None and node.right is None:\n                return depth               # first leaf wins\n            if node.left is not None:\n                queue.append(node.left)\n            if node.right is not None:\n                queue.append(node.right)\n        depth += 1\n    return depth",
                "best": true,
                "tag": "best in practice"
              }
            ],
            "tests": "assert min_depth(None) == 0\nassert min_depth(build([1])) == 1\nassert min_depth(build([1, 2])) == 2          # the classic trap\nassert min_depth(build([3, 9, 20, None, None, 15, 7])) == 2\nassert min_depth(build([2, None, 3, None, 4, None, 5, None, 6])) == 5\nassert min_depth(build([1, 2, 3, 4, 5])) == 2",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "depth",
            "sectionTitle": "Depth: returning a value upward"
          }
        ]
      },
      {
        "id": "level-order",
        "title": "Level order: the queue and the size snapshot",
        "idea": [
          "Depth-first recursion cannot tell you which nodes share a level, because it finishes one branch before starting the next. For anything per-level you need breadth-first search and a queue.",
          "The one technique that matters here is the <strong>size snapshot</strong>. Before draining the queue, record <code>len(queue)</code>. Those are exactly the nodes of the current level; anything appended during the loop belongs to the next one. Without the snapshot the level boundaries dissolve and you get one flat list.",
          "In Python the queue must be <code>collections.deque</code>. A list's <code>pop(0)</code> shifts every remaining element, turning an O(n) traversal into O(n&sup2;) &mdash; a real and commonly shipped mistake, not a theoretical one."
        ],
        "problems": [
          {
            "id": "level-order-traversal",
            "num": 6,
            "lc": 102,
            "slug": "binary-tree-level-order-traversal",
            "url": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
            "name": "Binary Tree Level Order Traversal",
            "difficulty": "medium",
            "framing": [
              "Return a list of lists, one per level, each left to right. Every later per-level problem is this with one line changed, so get the skeleton into muscle memory."
            ],
            "pitfall": "Taking the size snapshot inside the loop, or using <code>list.pop(0)</code> instead of a deque.",
            "approaches": [
              {
                "name": "BFS with a size snapshot",
                "time": "O(n)",
                "space": "O(w)",
                "why": [
                  "Each node is enqueued once and dequeued once, both O(1) on a deque, so O(n) total.",
                  "The queue never holds more than two adjacent levels' worth of nodes, which is O(w). For a perfect tree the bottom level is n/2 nodes, so this is O(n) in the worst case &mdash; unavoidable here, since the output itself groups by level.",
                  "<code>for _ in range(len(queue))</code> evaluates <code>len</code> once, before any children are appended. That is the snapshot. Writing <code>while queue:</code> inside instead would consume the next level too."
                ],
                "code": "def level_order_lists(root):\n    if root is None:\n        return []\n    out, queue = [], deque([root])\n    while queue:\n        level = []\n        for _ in range(len(queue)):        # snapshot, taken once\n            node = queue.popleft()\n            level.append(node.val)\n            if node.left is not None:\n                queue.append(node.left)\n            if node.right is not None:\n                queue.append(node.right)\n        out.append(level)\n    return out",
                "best": true,
                "tag": ""
              },
              {
                "name": "DFS carrying the depth",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "Pass the depth down. If it equals the number of levels collected so far, start a new level; otherwise append to the existing one. Because DFS always descends left before right, each level fills left to right anyway.",
                  "Space is O(h) rather than O(w), which for a deep narrow tree is a genuine win: a 10,000-node chain costs 10,000 stack frames with DFS but only O(1) queue with BFS &mdash; and for a wide shallow tree it is the reverse. Neither dominates.",
                  "Useful to know because it shows the level structure does not <em>require</em> BFS; it only requires knowing each node's depth."
                ],
                "code": "def level_order_lists(root):\n    out = []\n\n    def walk(node, depth):\n        if node is None:\n            return\n        if depth == len(out):\n            out.append([])                 # first node seen at this depth\n        out[depth].append(node.val)\n        walk(node.left, depth + 1)\n        walk(node.right, depth + 1)\n\n    walk(root, 0)\n    return out",
                "best": false,
                "tag": "less space when deep"
              }
            ],
            "tests": "assert level_order_lists(None) == []\nassert level_order_lists(build([1])) == [[1]]\nassert level_order_lists(build([3, 9, 20, None, None, 15, 7])) == [[3], [9, 20], [15, 7]]\nassert level_order_lists(build([1, 2, 3, 4, 5, 6, 7])) == [[1], [2, 3], [4, 5, 6, 7]]\nassert level_order_lists(build([1, 2, None, 3])) == [[1], [2], [3]]",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "level-order",
            "sectionTitle": "Level order: the queue and the size snapshot"
          },
          {
            "id": "level-order-bottom-up",
            "num": 7,
            "lc": 107,
            "slug": "binary-tree-level-order-traversal-ii",
            "url": "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/",
            "name": "Binary Tree Level Order Traversal II",
            "difficulty": "medium",
            "framing": [
              "The same levels, bottom to top. Nodes stay left to right <em>within</em> each level &mdash; only the order of the levels flips. Do not reverse the rows."
            ],
            "pitfall": "",
            "approaches": [
              {
                "name": "BFS, then reverse once",
                "time": "O(n)",
                "space": "O(w)",
                "why": [
                  "Build it top-down exactly as in problem 102, then call <code>out.reverse()</code>. One O(L) pass over L levels, in place, no extra allocation.",
                  "This is the answer to give. It reuses a solution you already trust and the modification is one line at the end &mdash; the cheapest possible change."
                ],
                "code": "def level_order_bottom(root):\n    if root is None:\n        return []\n    out, queue = [], deque([root])\n    while queue:\n        level = []\n        for _ in range(len(queue)):\n            node = queue.popleft()\n            level.append(node.val)\n            if node.left is not None:\n                queue.append(node.left)\n            if node.right is not None:\n                queue.append(node.right)\n        out.append(level)\n    out.reverse()\n    return out",
                "best": true,
                "tag": ""
              },
              {
                "name": "Prepend each level to a deque",
                "time": "O(n)",
                "space": "O(w)",
                "why": [
                  "Push each finished level onto the <em>front</em> of a deque as you go, so no reversal is needed at the end.",
                  "This needs a deque, not a list: <code>list.insert(0, level)</code> shifts every element already there, so over L levels it costs 1+2+&hellip;+L = O(L&sup2;). <code>deque.appendleft</code> is O(1), making the total O(L).",
                  "For a balanced tree L is only O(log n), so the quadratic version is not catastrophic &mdash; but for a chain L = n and <code>insert(0, ...)</code> turns an O(n) algorithm into O(n&sup2;). Same trap as <code>pop(0)</code>, one level up."
                ],
                "code": "def level_order_bottom(root):\n    if root is None:\n        return []\n    out, queue = deque(), deque([root])\n    while queue:\n        level = []\n        for _ in range(len(queue)):\n            node = queue.popleft()\n            level.append(node.val)\n            if node.left is not None:\n                queue.append(node.left)\n            if node.right is not None:\n                queue.append(node.right)\n        out.appendleft(level)         # O(1); list.insert(0, ...) is O(len)\n    return list(out)",
                "best": false,
                "tag": ""
              }
            ],
            "tests": "assert level_order_bottom(None) == []\nassert level_order_bottom(build([1])) == [[1]]\nassert level_order_bottom(build([3, 9, 20, None, None, 15, 7])) == [[15, 7], [9, 20], [3]]\nassert level_order_bottom(build([1, 2, 3, 4, 5, 6, 7])) == [[4, 5, 6, 7], [2, 3], [1]]",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "level-order",
            "sectionTitle": "Level order: the queue and the size snapshot"
          },
          {
            "id": "zigzag-level-order",
            "num": 8,
            "lc": 103,
            "slug": "binary-tree-zigzag-level-order-traversal",
            "url": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
            "name": "Binary Tree Zigzag Level Order Traversal",
            "difficulty": "medium",
            "framing": [
              "Alternate direction per level: level 0 left to right, level 1 right to left, and so on. The traversal does not change &mdash; only how you write each level down."
            ],
            "pitfall": "Reversing the traversal itself rather than the collected level &mdash; you must still enqueue left then right, or the next level comes out scrambled.",
            "approaches": [
              {
                "name": "BFS, reverse alternate levels",
                "time": "O(n)",
                "space": "O(w)",
                "why": [
                  "Collect every level left to right as usual and reverse the odd-numbered ones. Reversing a level of size k is O(k), and every node belongs to exactly one level, so the reversals add O(n) across the whole run &mdash; not O(n) per level.",
                  "Prefer this. The traversal stays the well-tested one from 102 and the zigzag is a presentation detail applied afterwards, which is how it should be factored."
                ],
                "code": "def zigzag(root):\n    if root is None:\n        return []\n    out, queue, left_to_right = [], deque([root]), True\n    while queue:\n        level = []\n        for _ in range(len(queue)):\n            node = queue.popleft()\n            level.append(node.val)\n            if node.left is not None:\n                queue.append(node.left)\n            if node.right is not None:\n                queue.append(node.right)\n        if not left_to_right:\n            level.reverse()\n        out.append(level)\n        left_to_right = not left_to_right\n    return out",
                "best": true,
                "tag": ""
              },
              {
                "name": "Build each level into a deque",
                "time": "O(n)",
                "space": "O(w)",
                "why": [
                  "Write into a deque per level, appending right when going left-to-right and <code>appendleft</code> when going the other way. No post-hoc reversal at all.",
                  "Same O(n) total and the same O(w) queue. Marginally fewer passes over the data, at the cost of tangling the direction logic into the traversal."
                ],
                "code": "def zigzag(root):\n    if root is None:\n        return []\n    out, queue, left_to_right = [], deque([root]), True\n    while queue:\n        level = deque()\n        for _ in range(len(queue)):\n            node = queue.popleft()\n            if left_to_right:\n                level.append(node.val)\n            else:\n                level.appendleft(node.val)\n            if node.left is not None:\n                queue.append(node.left)\n            if node.right is not None:\n                queue.append(node.right)\n        out.append(list(level))\n        left_to_right = not left_to_right\n    return out",
                "best": false,
                "tag": ""
              }
            ],
            "tests": "assert zigzag(None) == []\nassert zigzag(build([1])) == [[1]]\nassert zigzag(build([3, 9, 20, None, None, 15, 7])) == [[3], [20, 9], [15, 7]]\nassert zigzag(build([1, 2, 3, 4, 5, 6, 7])) == [[1], [3, 2], [4, 5, 6, 7]]",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "level-order",
            "sectionTitle": "Level order: the queue and the size snapshot"
          }
        ]
      },
      {
        "id": "compare-transform",
        "title": "Two trees at once, and rewriting one",
        "idea": [
          "So far every recursion walked one tree. Now walk two in lockstep: the function takes a node from each, checks or combines them, and recurses on the corresponding pairs. The base cases multiply &mdash; both empty, one empty, neither &mdash; and getting all three right is most of the work.",
          "Symmetric Tree is the one to study hardest, because it is the first problem where the pairing is <em>not</em> left-with-left. Once you see that mirroring means comparing <code>a.left</code> with <code>b.right</code>, a whole family of problems opens up."
        ],
        "problems": [
          {
            "id": "same-tree",
            "num": 9,
            "lc": 100,
            "slug": "same-tree",
            "url": "https://leetcode.com/problems/same-tree/",
            "name": "Same Tree",
            "difficulty": "easy",
            "framing": [
              "Identical structure and identical values. Structure matters as much as content: <code>[1,2]</code> and <code>[1,null,2]</code> hold the same values and are not the same tree."
            ],
            "pitfall": "",
            "approaches": [
              {
                "name": "Parallel recursion",
                "time": "O(min(n, m))",
                "space": "O(min(h, h'))",
                "why": [
                  "Three base cases in order: both <code>None</code> means equal; exactly one <code>None</code> means unequal shape; values differing means unequal. Only then recurse.",
                  "Time is bounded by the <em>smaller</em> tree, because the first structural mismatch returns immediately and you can never descend deeper than the shallower tree allows. For identical trees that is O(n); for trees differing at the root it is O(1). Quoting plain O(n) is not wrong but it misses the early exit.",
                  "Python's <code>and</code> short-circuits, so a mismatch in the left subtree means the right is never walked."
                ],
                "code": "def is_same_tree(p, q):\n    if p is None and q is None:\n        return True\n    if p is None or q is None:\n        return False\n    if p.val != q.val:\n        return False\n    return (is_same_tree(p.left, q.left)\n            and is_same_tree(p.right, q.right))",
                "best": true,
                "tag": ""
              },
              {
                "name": "Iterative, stack of pairs",
                "time": "O(min(n, m))",
                "space": "O(min(h, h'))",
                "why": [
                  "Push the two roots as a pair; pop, apply the same three checks, push the two child pairs. Avoids the recursion limit on deep trees.",
                  "The stack holds pairs along one path, so O(h). Use a deque as a queue instead and it becomes BFS with O(w) space &mdash; which finds shallow mismatches sooner, a real advantage when you expect trees to differ near the root."
                ],
                "code": "def is_same_tree(p, q):\n    stack = [(p, q)]\n    while stack:\n        a, b = stack.pop()\n        if a is None and b is None:\n            continue\n        if a is None or b is None or a.val != b.val:\n            return False\n        stack.append((a.left, b.left))\n        stack.append((a.right, b.right))\n    return True",
                "best": false,
                "tag": ""
              }
            ],
            "tests": "assert is_same_tree(build([1, 2, 3]), build([1, 2, 3])) is True\nassert is_same_tree(build([1, 2]), build([1, None, 2])) is False\nassert is_same_tree(build([1, 2, 1]), build([1, 1, 2])) is False\nassert is_same_tree(None, None) is True\nassert is_same_tree(build([1]), None) is False",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "compare-transform",
            "sectionTitle": "Two trees at once, and rewriting one"
          },
          {
            "id": "symmetric-tree",
            "num": 10,
            "lc": 101,
            "slug": "symmetric-tree",
            "url": "https://leetcode.com/problems/symmetric-tree/",
            "name": "Symmetric Tree",
            "difficulty": "easy",
            "framing": [
              "Is the tree a mirror of itself about its root? The trap is comparing the two subtrees for <em>equality</em>. A mirror is not a copy: you must compare the left subtree's left child against the right subtree's <strong>right</strong> child."
            ],
            "pitfall": "Calling <code>is_same_tree(root.left, root.right)</code>. That tests for a duplicated subtree, not a mirrored one, and passes trees that are not symmetric.",
            "approaches": [
              {
                "name": "Recursive mirror helper",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "The helper takes two nodes that <em>should</em> mirror each other and makes two cross-wise recursive calls: the outer pair (<code>a.left</code>, <code>b.right</code>) and the inner pair (<code>a.right</code>, <code>b.left</code>).",
                  "Every node is visited once as part of exactly one pair, so O(n); a mismatch short-circuits the rest. Stack depth follows the path length, O(h).",
                  "Same Tree and Symmetric Tree differ by <em>only</em> which children get paired. Writing them next to each other is the fastest way to make that stick."
                ],
                "code": "def is_symmetric(root):\n    def mirror(a, b):\n        if a is None and b is None:\n            return True\n        if a is None or b is None or a.val != b.val:\n            return False\n        return (mirror(a.left, b.right)       # outer pair\n                and mirror(a.right, b.left))  # inner pair\n\n    return root is None or mirror(root.left, root.right)",
                "best": true,
                "tag": ""
              },
              {
                "name": "Iterative, queue of mirrored pairs",
                "time": "O(n)",
                "space": "O(w)",
                "why": [
                  "Enqueue the root's two children as a pair, then repeatedly dequeue a pair, check it, and enqueue the two mirrored pairs. The invariant is that every pair in the queue is one that must mirror.",
                  "O(w) space because it is breadth-first, so it holds a level of pairs. It also detects an asymmetry at a shallow level without descending, which the recursive version does not."
                ],
                "code": "def is_symmetric(root):\n    if root is None:\n        return True\n    queue = deque([(root.left, root.right)])\n    while queue:\n        a, b = queue.popleft()\n        if a is None and b is None:\n            continue\n        if a is None or b is None or a.val != b.val:\n            return False\n        queue.append((a.left, b.right))\n        queue.append((a.right, b.left))\n    return True",
                "best": false,
                "tag": ""
              }
            ],
            "tests": "assert is_symmetric(build([1, 2, 2, 3, 4, 4, 3])) is True\nassert is_symmetric(build([1, 2, 2, None, 3, None, 3])) is False\nassert is_symmetric(build([1])) is True\nassert is_symmetric(None) is True\nassert is_symmetric(build([1, 2, 2, 2, None, 2])) is False",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "compare-transform",
            "sectionTitle": "Two trees at once, and rewriting one"
          },
          {
            "id": "invert-binary-tree",
            "num": 11,
            "lc": 226,
            "slug": "invert-binary-tree",
            "url": "https://leetcode.com/problems/invert-binary-tree/",
            "name": "Invert Binary Tree",
            "difficulty": "easy",
            "framing": [
              "Swap every node's two children, in place. Famous for being the problem that got Max Howell rejected by Google, and genuinely a three-liner."
            ],
            "pitfall": "",
            "approaches": [
              {
                "name": "Recursive swap",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "Swap this node's children, then invert each subtree. The order does not matter &mdash; swap first or recurse first, each original subtree is processed exactly once either way &mdash; because the swap only rearranges pointers, it does not duplicate or drop work.",
                  "O(n) because every node's children are swapped once. O(h) call stack. In place, so no new nodes."
                ],
                "code": "def invert(root):\n    if root is None:\n        return None\n    root.left, root.right = invert(root.right), invert(root.left)\n    return root",
                "best": true,
                "tag": ""
              },
              {
                "name": "Iterative with a worklist",
                "time": "O(n)",
                "space": "O(h) as a stack, O(w) as a queue",
                "why": [
                  "Pull a node off the worklist, swap its children, push both children. Whether the worklist is a stack (DFS, O(h)) or a queue (BFS, O(w)) is irrelevant to correctness here &mdash; unlike a traversal, the <em>order</em> of swaps does not matter, since each swap is independent.",
                  "That independence is the interesting property: it is why this problem parallelises trivially and why the iterative form needs no bookkeeping at all."
                ],
                "code": "def invert(root):\n    if root is None:\n        return None\n    work = [root]\n    while work:\n        node = work.pop()\n        node.left, node.right = node.right, node.left\n        if node.left is not None:\n            work.append(node.left)\n        if node.right is not None:\n            work.append(node.right)\n    return root",
                "best": false,
                "tag": ""
              }
            ],
            "tests": "assert level_order(invert(build([4, 2, 7, 1, 3, 6, 9]))) == [4, 7, 2, 9, 6, 3, 1]\nassert level_order(invert(build([2, 1, 3]))) == [2, 3, 1]\nassert invert(None) is None\nassert level_order(invert(build([1, 2]))) == [1, None, 2]",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "compare-transform",
            "sectionTitle": "Two trees at once, and rewriting one"
          },
          {
            "id": "merge-two-binary-trees",
            "num": 12,
            "lc": 617,
            "slug": "merge-two-binary-trees",
            "url": "https://leetcode.com/problems/merge-two-binary-trees/",
            "name": "Merge Two Binary Trees",
            "difficulty": "easy",
            "framing": [
              "Overlay two trees. Where both have a node, sum the values; where only one does, keep that node &mdash; and its whole subtree &mdash; as is."
            ],
            "pitfall": "",
            "approaches": [
              {
                "name": "Recursive, reusing the first tree",
                "time": "O(min(n, m))",
                "space": "O(min(h, h'))",
                "why": [
                  "If either node is <code>None</code>, return the other <em>immediately</em>. You do not walk into it &mdash; you graft the entire existing subtree by returning one pointer.",
                  "That is why the bound is O(min(n, m)) and not O(n + m): recursion only continues where <strong>both</strong> trees have a node, so the work is proportional to the overlap, which is at most the size of the smaller tree. Non-overlapping regions cost O(1) each, however large.",
                  "Destructive: it mutates tree 1. Acceptable when the caller owns both, but say so out loud in an interview &mdash; noticing that a solution mutates its input is exactly the kind of thing being assessed."
                ],
                "code": "def merge_trees(root1, root2):\n    if root1 is None:\n        return root2          # whole subtree grafted, not walked\n    if root2 is None:\n        return root1\n    root1.val += root2.val\n    root1.left = merge_trees(root1.left, root2.left)\n    root1.right = merge_trees(root1.right, root2.right)\n    return root1",
                "best": true,
                "tag": ""
              },
              {
                "name": "Non-destructive, allocating a new tree",
                "time": "O(n + m)",
                "space": "O(n + m)",
                "why": [
                  "If the inputs must survive, every node of the result has to be a fresh allocation &mdash; including the non-overlapping subtrees, which now must be <em>copied</em> rather than pointed at.",
                  "That is the whole cost difference: copying forces you to visit every node of both trees, so O(n + m) time, and the result holds up to n + m nodes, so O(n + m) space on top of the O(h) stack.",
                  "State the trade precisely: reuse is O(min(n, m)) and destroys an input; copying is O(n + m) and does not."
                ],
                "code": "def merge_trees(root1, root2):\n    if root1 is None and root2 is None:\n        return None\n    if root1 is None:\n        return copy_tree(root2)\n    if root2 is None:\n        return copy_tree(root1)\n    node = TreeNode(root1.val + root2.val)\n    node.left = merge_trees(root1.left, root2.left)\n    node.right = merge_trees(root1.right, root2.right)\n    return node\n\n\ndef copy_tree(node):\n    if node is None:\n        return None\n    return TreeNode(node.val, copy_tree(node.left), copy_tree(node.right))",
                "best": false,
                "tag": "preserves inputs"
              }
            ],
            "tests": "a = build([1, 3, 2, 5])\nb = build([2, 1, 3, None, 4, None, 7])\nassert level_order(merge_trees(a, b)) == [3, 4, 5, 5, 4, None, 7]\nassert level_order(merge_trees(build([1]), None)) == [1]\nassert merge_trees(None, None) is None\nassert level_order(merge_trees(None, build([1, 2]))) == [1, 2]",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "compare-transform",
            "sectionTitle": "Two trees at once, and rewriting one"
          },
          {
            "id": "subtree-of-another-tree",
            "num": 13,
            "lc": 572,
            "slug": "subtree-of-another-tree",
            "url": "https://leetcode.com/problems/subtree-of-another-tree/",
            "name": "Subtree of Another Tree",
            "difficulty": "easy",
            "framing": [
              "Does <code>subRoot</code> appear in <code>root</code> as a complete subtree? Complete is the operative word: the match must include <em>all</em> of that node's descendants, not just the top few."
            ],
            "pitfall": "Serialising without null markers or without a value separator. Both produce false positives that the sample tests do not catch.",
            "approaches": [
              {
                "name": "Same-Tree at every node",
                "time": "O(n &times; m)",
                "space": "O(h)",
                "why": [
                  "Walk the host tree; at each node run the Same Tree check against the candidate. Reuses a function you already have and is obviously correct.",
                  "The bound is O(n &times; m) because each of n host nodes may trigger a comparison costing up to O(m). It is genuinely reached when the trees are near-duplicates &mdash; a 1000-long chain of identical values against a 500-long chain of the same value does the full quadratic work.",
                  "Still the right first answer: n and m are small on real inputs, and the linear alternative has correctness traps that cost more interview time than they are worth."
                ],
                "code": "def is_subtree(root, sub_root):\n    if sub_root is None:\n        return True\n    if root is None:\n        return False\n    if same(root, sub_root):\n        return True\n    return is_subtree(root.left, sub_root) or is_subtree(root.right, sub_root)\n\n\ndef same(a, b):\n    if a is None and b is None:\n        return True\n    if a is None or b is None or a.val != b.val:\n        return False\n    return same(a.left, b.left) and same(a.right, b.right)",
                "best": true,
                "tag": "what to write first"
              },
              {
                "name": "Serialise both, then substring search",
                "time": "O(n + m)",
                "space": "O(n + m)",
                "why": [
                  "Serialise each tree to a string in preorder and ask whether the candidate's string occurs inside the host's. CPython's <code>in</code> on <code>str</code> uses a Crochemore-Perrin / Horspool mix that is linear in practice; writing KMP yourself guarantees O(n + m).",
                  "Two delimiters are load-bearing and both are easy to forget. <strong>Null markers</strong> are required or different shapes serialise identically &mdash; without them a left child and a right child are indistinguishable. And values need a <strong>separator</strong>, or <code>12</code> matches inside <code>112</code>; here the leading <code>^</code> on each value does that job.",
                  "Space is the two strings, O(n + m). The payoff is real for large near-duplicate trees; the risk is that a missing marker gives a solution that passes the samples and is wrong."
                ],
                "code": "def is_subtree(root, sub_root):\n    return serialise(sub_root) in serialise(root)\n\n\ndef serialise(node):\n    if node is None:\n        return \"#\"                      # null marker: shape matters\n    return f\"^{node.val}({serialise(node.left)}{serialise(node.right)})\"",
                "best": false,
                "tag": "linear"
              }
            ],
            "tests": "assert is_subtree(build([3, 4, 5, 1, 2]), build([4, 1, 2])) is True\nassert is_subtree(build([3, 4, 5, 1, 2, None, None, None, None, 0]), build([4, 1, 2])) is False\nassert is_subtree(build([1, 1]), build([1])) is True\nassert is_subtree(build([12]), build([2])) is False\nassert is_subtree(build([1, None, 1, None, 1]), build([1, None, 1])) is True",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "compare-transform",
            "sectionTitle": "Two trees at once, and rewriting one"
          }
        ]
      },
      {
        "id": "aggregates",
        "title": "Bottom-up aggregates and the global answer",
        "idea": [
          "These three problems share one shape, and it is the shape that separates people who have understood tree recursion from people who are pattern-matching. Each node must <strong>return one thing to its parent</strong> while <strong>recording a different thing</strong> in a variable outside the recursion.",
          "Diameter is the clearest case. A node returns its <em>height</em> upward, because that is what its parent needs. But the answer being computed is the longest path, which may bend at this node and never reach the parent at all &mdash; so it cannot be the return value. It goes to a <code>nonlocal</code> accumulator instead.",
          "Once you see \"return one thing, record another\", Balanced, Diameter and Tilt are the same function three times. They are also the template for harder problems &mdash; maximum path sum, longest univalue path, lowest common ancestor."
        ],
        "problems": [
          {
            "id": "balanced-binary-tree",
            "num": 14,
            "lc": 110,
            "slug": "balanced-binary-tree",
            "url": "https://leetcode.com/problems/balanced-binary-tree/",
            "name": "Balanced Binary Tree",
            "difficulty": "easy",
            "framing": [
              "Height-balanced means every node's two subtree heights differ by at most 1. <em>Every</em> node &mdash; checking only the root is not enough."
            ],
            "pitfall": "",
            "approaches": [
              {
                "name": "Top-down, recomputing heights",
                "time": "O(n log n)",
                "space": "O(h)",
                "why": [
                  "At each node, measure both subtree heights and compare, then recurse. Correct, and the obvious first thing to write.",
                  "The cost is worth deriving rather than guessing. <code>height()</code> at a node costs O(size of that subtree), and you call it at every node you reach, so the total is the sum of the sizes of all reached subtrees.",
                  "The worst case is a <strong>fully balanced</strong> tree, because then nothing exits early and every node is reached. Its height is O(log n), so the sum is O(n) per level across O(log n) levels: <strong>O(n log n)</strong>. Measured on a perfect tree of 16,383 nodes, this makes about 426,000 <code>height()</code> calls, or 1.9 &times; n log&#8322; n.",
                  "You will often see O(n&sup2;) quoted for this approach. It does not hold for the code as written. The quadratic sum n + (n-1) + &hellip; + 1 needs a deep tree with no early exit &mdash; but a deep tree is exactly the one that fails <code>abs(...) &gt; 1</code> at the root and returns immediately. A left chain of 800 nodes takes 1,600 <code>height()</code> calls, which is 2n, not n&sup2;.",
                  "So the honest answer is O(n log n), and the shape that triggers it is the balanced one, not the skewed one. That is the opposite of the usual intuition, and the bottom-up version below still beats it."
                ],
                "code": "def is_balanced(root):\n    if root is None:\n        return True\n    if abs(height(root.left) - height(root.right)) > 1:\n        return False\n    return is_balanced(root.left) and is_balanced(root.right)\n\n\ndef height(node):\n    if node is None:\n        return 0\n    return 1 + max(height(node.left), height(node.right))",
                "best": false,
                "tag": "the slow one"
              },
              {
                "name": "Bottom-up with a sentinel",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "Compute each height exactly once, on the way back up, and have the same return value carry the failure. Returning <code>-1</code> means \"already unbalanced below here\", which propagates without any further work.",
                  "Time is O(n) because each node's height is computed once and reused by its parent, instead of being recomputed from scratch. This is the difference between the two approaches in one sentence: <em>memoise by returning</em>.",
                  "The sentinel keeps it to a single return value. Returning a <code>(height, ok)</code> tuple is equally valid and arguably clearer; it costs a tuple allocation per node, which is irrelevant asymptotically."
                ],
                "code": "def is_balanced(root):\n    return check(root) != -1\n\n\ndef check(node):\n    \"\"\"Return the height, or -1 if this subtree is already unbalanced.\"\"\"\n    if node is None:\n        return 0\n    left = check(node.left)\n    if left == -1:\n        return -1                      # propagate failure, stop working\n    right = check(node.right)\n    if right == -1:\n        return -1\n    if abs(left - right) > 1:\n        return -1\n    return 1 + max(left, right)",
                "best": true,
                "tag": ""
              }
            ],
            "tests": "assert is_balanced(None) is True\nassert is_balanced(build([3, 9, 20, None, None, 15, 7])) is True\nassert is_balanced(build([1, 2, 2, 3, 3, None, None, 4, 4])) is False\nassert is_balanced(build([1, 2, None, 3])) is False\nassert is_balanced(build([1, 2, 3])) is True",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "aggregates",
            "sectionTitle": "Bottom-up aggregates and the global answer"
          },
          {
            "id": "diameter-of-binary-tree",
            "num": 15,
            "lc": 543,
            "slug": "diameter-of-binary-tree",
            "url": "https://leetcode.com/problems/diameter-of-binary-tree/",
            "name": "Diameter of Binary Tree",
            "difficulty": "easy",
            "framing": [
              "The longest path between any two nodes, measured in <strong>edges</strong>. The path need not pass through the root, which is exactly what makes a plain return value insufficient."
            ],
            "pitfall": "Returning the diameter from the recursion. The parent needs the <em>height</em>; the diameter of a subtree tells it nothing it can extend.",
            "approaches": [
              {
                "name": "Postorder height with a nonlocal best",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "Each call returns its subtree's height. Before returning, it considers the path that bends at this node &mdash; <code>left + right</code> edges &mdash; and updates a shared maximum. Every possible path bends at exactly one highest node, so considering each node once considers every path once.",
                  "Because height is defined so a leaf returns 0, <code>left + right</code> is already an edge count and needs no adjustment. Defining a leaf's height as 1 instead is the usual source of an off-by-two here.",
                  "O(n) time: one visit, constant work. O(h) stack. The <code>nonlocal</code> is not a hack &mdash; it is the correct way to express \"this value is not what my parent asked for\"."
                ],
                "code": "def diameter(root):\n    best = 0\n\n    def height(node):\n        nonlocal best\n        if node is None:\n            return 0\n        left = height(node.left)\n        right = height(node.right)\n        best = max(best, left + right)   # path bending here, in edges\n        return 1 + max(left, right)      # what the parent actually needs\n\n    height(root)\n    return best",
                "best": true,
                "tag": ""
              },
              {
                "name": "Returning a (height, diameter) pair",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "The same algorithm with the accumulator folded into the return value, so the function is pure. Each call returns both its height and the best diameter found anywhere in its subtree.",
                  "Identical O(n) / O(h) bounds; the tuple per node is a constant factor. Worth knowing because in languages without closures over mutable locals it is the only option, and because a pure function is easier to test."
                ],
                "code": "def diameter(root):\n    return solve(root)[1]\n\n\ndef solve(node):\n    \"\"\"Return (height, best diameter in this subtree).\"\"\"\n    if node is None:\n        return 0, 0\n    lh, ld = solve(node.left)\n    rh, rd = solve(node.right)\n    here = lh + rh\n    return 1 + max(lh, rh), max(ld, rd, here)",
                "best": false,
                "tag": "no shared state"
              }
            ],
            "tests": "assert diameter(build([1, 2, 3, 4, 5])) == 3\nassert diameter(build([1, 2])) == 1\nassert diameter(build([1])) == 0\nassert diameter(None) == 0\nassert diameter(build([1, 2, 3, 4, None, None, 5, 6, None, None, 7])) == 6",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "aggregates",
            "sectionTitle": "Bottom-up aggregates and the global answer"
          },
          {
            "id": "binary-tree-tilt",
            "num": 16,
            "lc": 563,
            "slug": "binary-tree-tilt",
            "url": "https://leetcode.com/problems/binary-tree-tilt/",
            "name": "Binary Tree Tilt",
            "difficulty": "easy",
            "framing": [
              "A node's tilt is the absolute difference between its two subtree sums. Return the sum of every node's tilt. Same shape as Diameter with <em>sum</em> in place of <em>height</em>."
            ],
            "pitfall": "",
            "approaches": [
              {
                "name": "Postorder sum with an accumulator",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "Return the subtree sum upward; add <code>abs(left - right)</code> to a running total on the way. The parent needs the sum, not the tilt &mdash; identical division of labour to Diameter.",
                  "O(n) because each subtree sum is computed once and reused by the parent. The naive alternative &mdash; calling a <code>subtree_sum()</code> helper fresh at every node &mdash; costs the sum of all subtree sizes, which on a chain is genuinely O(n&sup2;): measured at exactly n&sup2; helper visits for n = 200, 400 and 800.",
                  "Note this degrades harder than top-down Balanced does. Tilt has to visit every node to total the answer, so there is no early exit to rescue it &mdash; where the balance check bails out at the root on a skewed tree, this does the full quadratic work.",
                  "O(h) stack. Note an empty subtree must contribute sum 0, which makes a leaf's tilt <code>abs(0 - 0) = 0</code>, as required."
                ],
                "code": "def find_tilt(root):\n    total = 0\n\n    def subtree_sum(node):\n        nonlocal total\n        if node is None:\n            return 0\n        left = subtree_sum(node.left)\n        right = subtree_sum(node.right)\n        total += abs(left - right)        # this node's tilt\n        return node.val + left + right    # what the parent needs\n\n    subtree_sum(root)\n    return total",
                "best": true,
                "tag": ""
              },
              {
                "name": "Returning a (sum, tilt) pair",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "The pure version, for the same reasons as Diameter's. Each call returns its subtree sum and the accumulated tilt below it.",
                  "Same O(n) / O(h). Putting this next to the Diameter pair version makes the shared template obvious: return what the parent needs, accumulate what the answer needs."
                ],
                "code": "def find_tilt(root):\n    return solve(root)[1]\n\n\ndef solve(node):\n    \"\"\"Return (subtree sum, accumulated tilt).\"\"\"\n    if node is None:\n        return 0, 0\n    ls, lt = solve(node.left)\n    rs, rt = solve(node.right)\n    return node.val + ls + rs, lt + rt + abs(ls - rs)",
                "best": false,
                "tag": "no shared state"
              }
            ],
            "tests": "assert find_tilt(build([1, 2, 3])) == 1\nassert find_tilt(build([4, 2, 9, 3, 5, None, 7])) == 15\nassert find_tilt(build([21, 7, 14, 1, 1, 2, 2, 3, 3])) == 9\nassert find_tilt(None) == 0\nassert find_tilt(build([1])) == 0",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "aggregates",
            "sectionTitle": "Bottom-up aggregates and the global answer"
          }
        ]
      },
      {
        "id": "shape",
        "title": "Exploiting a shape guarantee",
        "idea": [
          "Everything so far was O(n), and for a general binary tree O(n) is optimal &mdash; you cannot answer a question about all the nodes without looking at them.",
          "But when the problem <em>promises</em> a shape, that lower bound no longer applies. A complete tree is almost fully determined by its node count, so you can count its nodes without visiting them all. This is the one genuinely clever idea in the set, and it is the reason Count Complete Tree Nodes is the hardest problem here despite being about counting.",
          "Save these for last. They only make sense once the O(n) baseline is automatic, because the whole point is beating it."
        ],
        "problems": [
          {
            "id": "count-complete-tree-nodes",
            "num": 17,
            "lc": 222,
            "slug": "count-complete-tree-nodes",
            "url": "https://leetcode.com/problems/count-complete-tree-nodes/",
            "name": "Count Complete Tree Nodes",
            "difficulty": "medium",
            "framing": [
              "Count the nodes in a <strong>complete</strong> tree: every level full except possibly the last, which is filled left to right. The problem explicitly asks for better than O(n), which is the whole exercise &mdash; an O(n) count is trivial and is not the answer being looked for."
            ],
            "pitfall": "Using this on a tree that is not complete. It will return a confidently wrong number rather than fail.",
            "approaches": [
              {
                "name": "Plain DFS count",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "<code>1 + left + right</code>. Works on any binary tree, ignores the completeness guarantee entirely.",
                  "O(n) time, O(h) stack. Worth writing first to establish correctness, then improving &mdash; but if you stop here you have not answered the question."
                ],
                "code": "def count_nodes(root):\n    if root is None:\n        return 0\n    return 1 + count_nodes(root.left) + count_nodes(root.right)",
                "best": false,
                "tag": "the baseline to beat"
              },
              {
                "name": "Compare left spine heights",
                "time": "O(log&sup2; n)",
                "space": "O(log n)",
                "why": [
                  "In a complete tree, walking only left children from any node gives that subtree's height in O(log n). Compare the left child's left-spine height with the right child's.",
                  "If they are <strong>equal</strong>, the left subtree is <em>perfect</em>: it has exactly 2<sup>h</sup> - 1 nodes, computable by arithmetic with no traversal. Add that plus this node, and recurse into the right subtree only. If they <strong>differ</strong> (the left is taller by one), the <em>right</em> subtree is perfect one level shorter &mdash; count it by formula and recurse left.",
                  "Either way you recurse into exactly <strong>one</strong> child, never both. That gives O(log n) levels of recursion, each doing O(log n) spine-walking work, so O(log&sup2; n) total. On a tree of a million nodes that is roughly 400 node visits instead of a million.",
                  "Space is the recursion depth, O(log n). Written as a loop it is O(1). Note this is correct <em>only</em> because completeness is guaranteed &mdash; on an arbitrary tree the spine height tells you nothing about the subtree's fullness and the count is wrong."
                ],
                "code": "def count_nodes(root):\n    if root is None:\n        return 0\n    left_h = spine(root.left)\n    right_h = spine(root.right)\n    if left_h == right_h:\n        # left subtree is perfect: 2**left_h - 1 nodes, plus root\n        return (1 << left_h) + count_nodes(root.right)\n    # right subtree is perfect: 2**right_h - 1 nodes, plus root\n    return (1 << right_h) + count_nodes(root.left)\n\n\ndef spine(node):\n    \"\"\"Height along left children only - exact, given completeness.\"\"\"\n    h = 0\n    while node is not None:\n        h += 1\n        node = node.left\n    return h",
                "best": true,
                "tag": ""
              }
            ],
            "tests": "assert count_nodes(None) == 0\nassert count_nodes(build([1])) == 1\nassert count_nodes(build([1, 2, 3, 4, 5, 6])) == 6\nassert count_nodes(build([1, 2, 3, 4, 5, 6, 7])) == 7\nassert count_nodes(build(list(range(1, 32)))) == 31\nfor size in range(1, 40):\n    assert count_nodes(build(list(range(1, size + 1)))) == size",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "shape",
            "sectionTitle": "Exploiting a shape guarantee"
          },
          {
            "id": "check-completeness",
            "num": 18,
            "lc": 958,
            "slug": "check-completeness-of-a-binary-tree",
            "url": "https://leetcode.com/problems/check-completeness-of-a-binary-tree/",
            "name": "Check Completeness of a Binary Tree",
            "difficulty": "medium",
            "framing": [
              "Verify the guarantee the previous problem assumed. Every level full except possibly the last, which must be packed to the left with no gaps."
            ],
            "pitfall": "",
            "approaches": [
              {
                "name": "BFS, allowing None into the queue",
                "time": "O(n)",
                "space": "O(w)",
                "why": [
                  "Enqueue children unconditionally, <code>None</code> included. Drain until the first <code>None</code> appears. The tree is complete precisely when nothing but <code>None</code> follows &mdash; a real node after a gap means the level was not packed left.",
                  "This works because BFS visits the array positions of the tree in index order, so \"no gaps\" becomes \"no non-<code>None</code> after the first <code>None</code>\", which is a single flag.",
                  "O(n) time; each node and each null slot is handled once, and the null slots are at most n+1. O(w) queue space. This is the approach to give &mdash; short, and its correctness argument is one sentence."
                ],
                "code": "def is_complete(root):\n    if root is None:\n        return True\n    queue = deque([root])\n    seen_gap = False\n    while queue:\n        node = queue.popleft()\n        if node is None:\n            seen_gap = True\n            continue\n        if seen_gap:\n            return False          # a real node after a gap\n        queue.append(node.left)\n        queue.append(node.right)\n    return True",
                "best": true,
                "tag": ""
              },
              {
                "name": "Index-based DFS",
                "time": "O(n)",
                "space": "O(h)",
                "why": [
                  "Number the nodes as in an array heap: the root is 1, and a node at <code>i</code> has children at <code>2i</code> and <code>2i+1</code>. A tree is complete exactly when the largest index equals the node count.",
                  "O(n) time and O(h) stack, so on a deep narrow tree it beats BFS's O(w). The catch is the index itself: it doubles per level, reaching 2<sup>h</sup>. In C++ or Java a tree deeper than about 63 levels overflows a 64-bit integer and the check silently breaks.",
                  "Python's integers are arbitrary precision, so there is no overflow &mdash; but arithmetic on a 10,000-bit integer is no longer O(1), so a pathologically deep tree makes the \"O(n)\" claim untrue in Python for a different reason. BFS has neither problem, which is why it is the better default."
                ],
                "code": "def is_complete(root):\n    count, largest = tally(root, 1)\n    return largest == count\n\n\ndef tally(node, index):\n    \"\"\"Return (node count, largest index) for this subtree.\"\"\"\n    if node is None:\n        return 0, 0\n    lc, li = tally(node.left, 2 * index)\n    rc, ri = tally(node.right, 2 * index + 1)\n    return 1 + lc + rc, max(index, li, ri)",
                "best": false,
                "tag": ""
              }
            ],
            "tests": "assert is_complete(None) is True\nassert is_complete(build([1])) is True\nassert is_complete(build([1, 2, 3, 4, 5, 6])) is True\nassert is_complete(build([1, 2, 3, 4, 5, None, 7])) is False\nassert is_complete(build([1, 2, 3, 5, None, 7, 8])) is False\nassert is_complete(build([1, 2, 3, 4, 5, 6, 7])) is True\nassert is_complete(build([1, 2])) is True\nassert is_complete(build([1, None, 2])) is False",
            "topic": "trees",
            "topicTitle": "Binary Trees",
            "section": "shape",
            "sectionTitle": "Exploiting a shape guarantee"
          }
        ]
      }
    ],
    "count": 18
  },
  {
    "id": "heap",
    "title": "Heaps and Priority Queues",
    "subtitle": "planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover <code>heapq</code>'s min-heap-only API and the negation trick, sift-up and sift-down, why <code>heapify</code> is O(n) and not O(n log n), and the k-th-largest / merge-k-lists / running-median family of problems."
    ],
    "convention": [],
    "status": "stub",
    "target": null,
    "sections": [],
    "count": 0
  },
  {
    "id": "dp",
    "title": "Dynamic Programming",
    "subtitle": "planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover spotting overlapping subproblems, top-down memoisation with <code>functools.cache</code> versus bottom-up tables, shrinking a table to O(1) rolling state, and the 1-D, grid, knapsack, subsequence and interval families."
    ],
    "convention": [],
    "status": "stub",
    "target": null,
    "sections": [],
    "count": 0
  },
  {
    "id": "backtracking",
    "title": "Backtracking",
    "subtitle": "planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover the choose / explore / un-choose template, subsets, permutations and combinations with and without duplicates, pruning, and why the output size &mdash; not the recursion &mdash; is what sets the time bound."
    ],
    "convention": [],
    "status": "stub",
    "target": null,
    "sections": [],
    "count": 0
  },
  {
    "id": "graphs",
    "title": "Graphs",
    "subtitle": "20 problems planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover adjacency lists from edge lists, BFS and DFS on grids and general graphs, visited-set discipline, topological sort (Kahn's and DFS), cycle detection, multi-source BFS, and Dijkstra with <code>heapq</code>."
    ],
    "convention": [],
    "status": "stub",
    "target": 20,
    "sections": [],
    "count": 0
  },
  {
    "id": "greedy",
    "title": "Greedy",
    "subtitle": "3 problems planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover when a locally best choice is provably globally best, the exchange argument that proves it, and the interval and jump-game problems where greedy wins."
    ],
    "convention": [],
    "status": "stub",
    "target": 3,
    "sections": [],
    "count": 0
  },
  {
    "id": "linked-lists",
    "title": "Linked Lists",
    "subtitle": "3 problems planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover the dummy head, fast and slow pointers, and in-place reversal &mdash; the three moves nearly every linked-list problem is built from."
    ],
    "convention": [],
    "status": "stub",
    "target": 3,
    "sections": [],
    "count": 0
  },
  {
    "id": "bits",
    "title": "Bit Manipulation",
    "subtitle": "3 problems planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover masks, <code>x &amp; (x - 1)</code>, XOR cancellation, and Python's unbounded integers, which make negative numbers behave differently from C or Java."
    ],
    "convention": [],
    "status": "stub",
    "target": 3,
    "sections": [],
    "count": 0
  },
  {
    "id": "sliding-window",
    "title": "Sliding Window",
    "subtitle": "2 problems planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover fixed and variable windows, the expand-right / shrink-left loop, and the counter that tells you when a window is valid."
    ],
    "convention": [],
    "status": "stub",
    "target": 2,
    "sections": [],
    "count": 0
  },
  {
    "id": "hashing",
    "title": "Grouping and Lookup",
    "subtitle": "2 problems planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover hash maps and sets as O(1) lookups, choosing a canonical key to group by, and <code>defaultdict</code> / <code>Counter</code> for the bookkeeping."
    ],
    "convention": [],
    "status": "stub",
    "target": 2,
    "sections": [],
    "count": 0
  },
  {
    "id": "binary-search",
    "title": "Binary Search",
    "subtitle": "4 problems planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover one loop invariant that never goes off by one, <code>bisect</code>, searching rotated arrays, and binary search on the answer rather than on an array."
    ],
    "convention": [],
    "status": "stub",
    "target": 4,
    "sections": [],
    "count": 0
  },
  {
    "id": "monotonic-stack",
    "title": "Monotonic Stack",
    "subtitle": "2 problems planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover keeping a stack sorted so each element is pushed and popped once, and the next-greater-element problems that fall out of it in O(n)."
    ],
    "convention": [],
    "status": "stub",
    "target": 2,
    "sections": [],
    "count": 0
  },
  {
    "id": "union-find",
    "title": "Union Find (DSU)",
    "subtitle": "2 problems planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover parent arrays, path compression and union by rank, and why together they make each operation effectively O(1)."
    ],
    "convention": [],
    "status": "stub",
    "target": 2,
    "sections": [],
    "count": 0
  },
  {
    "id": "trie",
    "title": "Tries",
    "subtitle": "3 problems planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover a dict-of-dicts prefix tree, insert and prefix search, and using a trie to prune a word search."
    ],
    "convention": [],
    "status": "stub",
    "target": 3,
    "sections": [],
    "count": 0
  },
  {
    "id": "sorting",
    "title": "Sorting with Greedy and Two Pointers",
    "subtitle": "1 problem planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover sorting first so that a greedy scan or a pair of converging pointers becomes correct, and what the O(n log n) sort buys you."
    ],
    "convention": [],
    "status": "stub",
    "target": 1,
    "sections": [],
    "count": 0
  },
  {
    "id": "math",
    "title": "Math and Number Theory",
    "subtitle": "2 problems planned - not written up yet",
    "blurb": [
      "This topic is on the path but nothing has been written up yet, so this page is a placeholder rather than a partial lesson &mdash; the rest of the site only publishes solutions that the build has executed, and there is nothing here to execute.",
      "When it lands it will cover gcd, modular arithmetic and <code>pow(a, b, m)</code>, primes with a sieve, and the overflow traps Python lets you ignore."
    ],
    "convention": [],
    "status": "stub",
    "target": 2,
    "sections": [],
    "count": 0
  }
];
