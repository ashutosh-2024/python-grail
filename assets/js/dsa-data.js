/* GENERATED FILE - do not edit by hand.
   Source: content/dsa.py   Build: python3 build.py
   Every solution below was executed against the problem's tests. */

window.GRAIL_PRELUDE = "from collections import deque\n\n\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n\ndef build(values):\n    \"\"\"Build a tree from LeetCode's level-order list, None for a missing child.\"\"\"\n    if not values:\n        return None\n    root = TreeNode(values[0])\n    queue = deque([root])\n    i = 1\n    while queue and i < len(values):\n        node = queue.popleft()\n        if i < len(values):\n            v = values[i]; i += 1\n            if v is not None:\n                node.left = TreeNode(v)\n                queue.append(node.left)\n        if i < len(values):\n            v = values[i]; i += 1\n            if v is not None:\n                node.right = TreeNode(v)\n                queue.append(node.right)\n    return root\n\n\ndef level_order(root):\n    \"\"\"Flatten back to a LeetCode-style list, for comparing trees in tests.\"\"\"\n    if root is None:\n        return []\n    out, queue = [], deque([root])\n    while queue:\n        node = queue.popleft()\n        if node is None:\n            out.append(None)\n            continue\n        out.append(node.val)\n        queue.append(node.left)\n        queue.append(node.right)\n    while out and out[-1] is None:\n        out.pop()\n    return out";
window.GRAIL_DSA = [
  {
    "id": "trees",
    "title": "Binary Trees",
    "status": "ready",
    "target": 20,
    "sections": [
      {
        "id": "dfs-orders",
        "title": "The recursive template and the three DFS orders",
        "problems": [
          {
            "id": "preorder-traversal",
            "num": 1,
            "lc": 144,
            "slug": "binary-tree-preorder-traversal",
            "url": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
            "premium": false,
            "name": "Binary Tree Preorder Traversal",
            "difficulty": "easy",
            "tags": [
              "Stack",
              "Tree",
              "Depth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "Given the <code>root</code> of a binary tree, return <em>the preorder traversal of its nodes&#39; values</em>."
            ],
            "examples": [
              {
                "input": "root = [1,null,2,3]",
                "output": "[1,2,3]"
              },
              {
                "input": "root = [1,2,3,4,5,null,8,null,null,6,7,9]",
                "output": "[1,2,4,5,6,7,3,8,9]"
              },
              {
                "input": "root = []",
                "output": "[]"
              },
              {
                "input": "root = [1]",
                "output": "[1]"
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[0, 100]</code>.",
              "<code>-100 &lt;= Node.val &lt;= 100</code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          },
          {
            "id": "inorder-traversal",
            "num": 2,
            "lc": 94,
            "slug": "binary-tree-inorder-traversal",
            "url": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
            "premium": false,
            "name": "Binary Tree Inorder Traversal",
            "difficulty": "easy",
            "tags": [
              "Stack",
              "Tree",
              "Depth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "Given the <code>root</code> of a binary tree, return <em>the inorder traversal of its nodes&#39; values</em>."
            ],
            "examples": [
              {
                "input": "root = [1,null,2,3]",
                "output": "[1,3,2]"
              },
              {
                "input": "root = [1,2,3,4,5,null,8,null,null,6,7,9]",
                "output": "[4,2,6,5,7,1,3,9,8]"
              },
              {
                "input": "root = []",
                "output": "[]"
              },
              {
                "input": "root = [1]",
                "output": "[1]"
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[0, 100]</code>.",
              "<code>-100 &lt;= Node.val &lt;= 100</code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          },
          {
            "id": "postorder-traversal",
            "num": 3,
            "lc": 145,
            "slug": "binary-tree-postorder-traversal",
            "url": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
            "premium": false,
            "name": "Binary Tree Postorder Traversal",
            "difficulty": "easy",
            "tags": [
              "Stack",
              "Tree",
              "Depth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "Given the <code>root</code> of a binary tree, return <em>the postorder traversal of its nodes&#39; values</em>."
            ],
            "examples": [
              {
                "input": "root = [1,null,2,3]",
                "output": "[3,2,1]"
              },
              {
                "input": "root = [1,2,3,4,5,null,8,null,null,6,7,9]",
                "output": "[4,6,7,5,2,9,8,3,1]"
              },
              {
                "input": "root = []",
                "output": "[]"
              },
              {
                "input": "root = [1]",
                "output": "[1]"
              }
            ],
            "constraints": [
              "The number of the nodes in the tree is in the range <code>[0, 100]</code>.",
              "<code>-100 &lt;= Node.val &lt;= 100</code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          }
        ]
      },
      {
        "id": "depth",
        "title": "Depth: returning a value upward",
        "problems": [
          {
            "id": "maximum-depth",
            "num": 4,
            "lc": 104,
            "slug": "maximum-depth-of-binary-tree",
            "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
            "premium": false,
            "name": "Maximum Depth of Binary Tree",
            "difficulty": "easy",
            "tags": [
              "Tree",
              "Depth-First Search",
              "Breadth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "Given the <code>root</code> of a binary tree, return <em>its maximum depth</em>.",
              "A binary tree&#39;s <strong>maximum depth</strong> is the number of nodes along the longest path from the root node down to the farthest leaf node."
            ],
            "examples": [
              {
                "input": "root = [3,9,20,null,null,15,7] Output: 3",
                "output": "3"
              },
              {
                "input": "root = [1,null,2] Output: 2",
                "output": "2"
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[0, 10<sup>4</sup>]</code>.",
              "<code>-100 &lt;= Node.val &lt;= 100</code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          },
          {
            "id": "minimum-depth",
            "num": 5,
            "lc": 111,
            "slug": "minimum-depth-of-binary-tree",
            "url": "https://leetcode.com/problems/minimum-depth-of-binary-tree/",
            "premium": false,
            "name": "Minimum Depth of Binary Tree",
            "difficulty": "easy",
            "tags": [
              "Tree",
              "Depth-First Search",
              "Breadth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "Given a binary tree, find its minimum depth.",
              "The minimum depth is the number of nodes along the shortest path from the root node down to the nearest leaf node.",
              "<strong>Note:</strong> A leaf is a node with no children."
            ],
            "examples": [
              {
                "input": "root = [3,9,20,null,null,15,7] Output: 2",
                "output": "2"
              },
              {
                "input": "root = [2,null,3,null,4,null,5,null,6] Output: 5",
                "output": "5"
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[0, 10<sup>5</sup>]</code>.",
              "<code>-1000 &lt;= Node.val &lt;= 1000</code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          }
        ]
      },
      {
        "id": "level-order",
        "title": "Level order: the queue and the size snapshot",
        "problems": [
          {
            "id": "level-order-traversal",
            "num": 6,
            "lc": 102,
            "slug": "binary-tree-level-order-traversal",
            "url": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
            "premium": false,
            "name": "Binary Tree Level Order Traversal",
            "difficulty": "medium",
            "tags": [
              "Tree",
              "Breadth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "Given the <code>root</code> of a binary tree, return <em>the level order traversal of its nodes&#39; values</em>. (i.e., from left to right, level by level)."
            ],
            "examples": [
              {
                "input": "root = [3,9,20,null,null,15,7] Output: [[3],[9,20],[15,7]]",
                "output": "[[3],[9,20],[15,7]]"
              },
              {
                "input": "root = [1] Output: [[1]]",
                "output": "[[1]]"
              },
              {
                "input": "root = [] Output: []",
                "output": "[]"
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[0, 2000]</code>.",
              "<code>-1000 &lt;= Node.val &lt;= 1000</code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          },
          {
            "id": "level-order-bottom-up",
            "num": 7,
            "lc": 107,
            "slug": "binary-tree-level-order-traversal-ii",
            "url": "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/",
            "premium": false,
            "name": "Binary Tree Level Order Traversal II",
            "difficulty": "medium",
            "tags": [
              "Tree",
              "Breadth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "Given the <code>root</code> of a binary tree, return <em>the bottom-up level order traversal of its nodes&#39; values</em>. (i.e., from left to right, level by level from leaf to root)."
            ],
            "examples": [
              {
                "input": "root = [3,9,20,null,null,15,7] Output: [[15,7],[9,20],[3]]",
                "output": "[[15,7],[9,20],[3]]"
              },
              {
                "input": "root = [1] Output: [[1]]",
                "output": "[[1]]"
              },
              {
                "input": "root = [] Output: []",
                "output": "[]"
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[0, 2000]</code>.",
              "<code>-1000 &lt;= Node.val &lt;= 1000</code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          },
          {
            "id": "zigzag-level-order",
            "num": 8,
            "lc": 103,
            "slug": "binary-tree-zigzag-level-order-traversal",
            "url": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
            "premium": false,
            "name": "Binary Tree Zigzag Level Order Traversal",
            "difficulty": "medium",
            "tags": [
              "Tree",
              "Breadth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "Given the <code>root</code> of a binary tree, return <em>the zigzag level order traversal of its nodes&#39; values</em>. (i.e., from left to right, then right to left for the next level and alternate between)."
            ],
            "examples": [
              {
                "input": "root = [3,9,20,null,null,15,7] Output: [[3],[20,9],[15,7]]",
                "output": "[[3],[20,9],[15,7]]"
              },
              {
                "input": "root = [1] Output: [[1]]",
                "output": "[[1]]"
              },
              {
                "input": "root = [] Output: []",
                "output": "[]"
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[0, 2000]</code>.",
              "<code>-100 &lt;= Node.val &lt;= 100</code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          }
        ]
      },
      {
        "id": "compare-transform",
        "title": "Two trees at once, and rewriting one",
        "problems": [
          {
            "id": "same-tree",
            "num": 9,
            "lc": 100,
            "slug": "same-tree",
            "url": "https://leetcode.com/problems/same-tree/",
            "premium": false,
            "name": "Same Tree",
            "difficulty": "easy",
            "tags": [
              "Tree",
              "Depth-First Search",
              "Breadth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "Given the roots of two binary trees <code>p</code> and <code>q</code>, write a function to check if they are the same or not.",
              "Two binary trees are considered the same if they are structurally identical, and the nodes have the same value."
            ],
            "examples": [
              {
                "input": "p = [1,2,3], q = [1,2,3] Output: true",
                "output": "true"
              },
              {
                "input": "p = [1,2], q = [1,null,2] Output: false",
                "output": "false"
              },
              {
                "input": "p = [1,2,1], q = [1,1,2] Output: false",
                "output": "false"
              }
            ],
            "constraints": [
              "The number of nodes in both trees is in the range <code>[0, 100]</code>.",
              "<code>-10<sup>4</sup> &lt;= Node.val &lt;= 10<sup>4</sup></code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          },
          {
            "id": "symmetric-tree",
            "num": 10,
            "lc": 101,
            "slug": "symmetric-tree",
            "url": "https://leetcode.com/problems/symmetric-tree/",
            "premium": false,
            "name": "Symmetric Tree",
            "difficulty": "easy",
            "tags": [
              "Tree",
              "Depth-First Search",
              "Breadth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "Given the <code>root</code> of a binary tree, <em>check whether it is a mirror of itself</em> (i.e., symmetric around its center)."
            ],
            "examples": [
              {
                "input": "root = [1,2,2,3,4,4,3] Output: true",
                "output": "true"
              },
              {
                "input": "root = [1,2,2,null,3,null,3] Output: false",
                "output": "false"
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[1, 1000]</code>.",
              "<code>-100 &lt;= Node.val &lt;= 100</code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          },
          {
            "id": "invert-binary-tree",
            "num": 11,
            "lc": 226,
            "slug": "invert-binary-tree",
            "url": "https://leetcode.com/problems/invert-binary-tree/",
            "premium": false,
            "name": "Invert Binary Tree",
            "difficulty": "easy",
            "tags": [
              "Tree",
              "Depth-First Search",
              "Breadth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "Given the <code>root</code> of a binary tree, invert the tree, and return <em>its root</em>."
            ],
            "examples": [
              {
                "input": "root = [4,2,7,1,3,6,9] Output: [4,7,2,9,6,3,1]",
                "output": "[4,7,2,9,6,3,1]"
              },
              {
                "input": "root = [2,1,3] Output: [2,3,1]",
                "output": "[2,3,1]"
              },
              {
                "input": "root = [] Output: []",
                "output": "[]"
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[0, 100]</code>.",
              "<code>-100 &lt;= Node.val &lt;= 100</code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          },
          {
            "id": "merge-two-binary-trees",
            "num": 12,
            "lc": 617,
            "slug": "merge-two-binary-trees",
            "url": "https://leetcode.com/problems/merge-two-binary-trees/",
            "premium": false,
            "name": "Merge Two Binary Trees",
            "difficulty": "easy",
            "tags": [
              "Tree",
              "Depth-First Search",
              "Breadth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "You are given two binary trees <code>root1</code> and <code>root2</code>.",
              "Imagine that when you put one of them to cover the other, some nodes of the two trees are overlapped while the others are not. You need to merge the two trees into a new binary tree. The merge rule is that if two nodes overlap, then sum node values up as the new value of the merged node. Otherwise, the NOT null node will be used as the node of the new tree.",
              "Return <em>the merged tree</em>.",
              "<strong>Note:</strong> The merging process must start from the root nodes of both trees."
            ],
            "examples": [
              {
                "input": "root1 = [1,3,2,5], root2 = [2,1,3,null,4,null,7] Output: [3,4,5,5,4,null,7]",
                "output": "[3,4,5,5,4,null,7]"
              },
              {
                "input": "root1 = [1], root2 = [1,2] Output: [2,2]",
                "output": "[2,2]"
              }
            ],
            "constraints": [
              "The number of nodes in both trees is in the range <code>[0, 2000]</code>.",
              "<code>-10<sup>4</sup> &lt;= Node.val &lt;= 10<sup>4</sup></code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          },
          {
            "id": "subtree-of-another-tree",
            "num": 13,
            "lc": 572,
            "slug": "subtree-of-another-tree",
            "url": "https://leetcode.com/problems/subtree-of-another-tree/",
            "premium": false,
            "name": "Subtree of Another Tree",
            "difficulty": "easy",
            "tags": [
              "Tree",
              "Depth-First Search",
              "String Matching",
              "Binary Tree",
              "Hash Function"
            ],
            "statement": [
              "Given the roots of two binary trees <code>root</code> and <code>subRoot</code>, return <code>true</code> if there is a subtree of <code>root</code> with the same structure and node values of<code> subRoot</code> and <code>false</code> otherwise.",
              "A subtree of a binary tree <code>tree</code> is a tree that consists of a node in <code>tree</code> and all of this node&#39;s descendants. The tree <code>tree</code> could also be considered as a subtree of itself."
            ],
            "examples": [
              {
                "input": "root = [3,4,5,1,2], subRoot = [4,1,2] Output: true",
                "output": "true"
              },
              {
                "input": "root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2] Output: false",
                "output": "false"
              }
            ],
            "constraints": [
              "The number of nodes in the <code>root</code> tree is in the range <code>[1, 2000]</code>.",
              "The number of nodes in the <code>subRoot</code> tree is in the range <code>[1, 1000]</code>.",
              "<code>-10<sup>4</sup> &lt;= root.val &lt;= 10<sup>4</sup></code>",
              "<code>-10<sup>4</sup> &lt;= subRoot.val &lt;= 10<sup>4</sup></code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          }
        ]
      },
      {
        "id": "aggregates",
        "title": "Bottom-up aggregates and the global answer",
        "problems": [
          {
            "id": "balanced-binary-tree",
            "num": 14,
            "lc": 110,
            "slug": "balanced-binary-tree",
            "url": "https://leetcode.com/problems/balanced-binary-tree/",
            "premium": false,
            "name": "Balanced Binary Tree",
            "difficulty": "easy",
            "tags": [
              "Tree",
              "Depth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "Given a binary tree, determine if it is <strong>height-balanced</strong>."
            ],
            "examples": [
              {
                "input": "root = [3,9,20,null,null,15,7] Output: true",
                "output": "true"
              },
              {
                "input": "root = [1,2,2,3,3,null,null,4,4] Output: false",
                "output": "false"
              },
              {
                "input": "root = [] Output: true",
                "output": "true"
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[0, 5000]</code>.",
              "<code>-10<sup>4</sup> &lt;= Node.val &lt;= 10<sup>4</sup></code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          },
          {
            "id": "diameter-of-binary-tree",
            "num": 15,
            "lc": 543,
            "slug": "diameter-of-binary-tree",
            "url": "https://leetcode.com/problems/diameter-of-binary-tree/",
            "premium": false,
            "name": "Diameter of Binary Tree",
            "difficulty": "easy",
            "tags": [
              "Tree",
              "Depth-First Search",
              "Binary Tree",
              "DP on Trees"
            ],
            "statement": [
              "Given the <code>root</code> of a binary tree, return <em>the length of the <strong>diameter</strong> of the tree</em>.",
              "The <strong>diameter</strong> of a binary tree is the <strong>length</strong> of the longest path between any two nodes in a tree. This path may or may not pass through the <code>root</code>.",
              "The <strong>length</strong> of a path between two nodes is represented by the number of edges between them."
            ],
            "examples": [
              {
                "input": "root = [1,2,3,4,5] Output: 3 Explanation: 3 is the length of the path [4,2,1,3] or [5,2,1,3].",
                "output": "3 Explanation: 3 is the length of the path [4,2,1,3] or [5,2,1,3].",
                "explanation": "3 is the length of the path [4,2,1,3] or [5,2,1,3]."
              },
              {
                "input": "root = [1,2] Output: 1",
                "output": "1"
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[1, 10<sup>4</sup>]</code>.",
              "<code>-100 &lt;= Node.val &lt;= 100</code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          },
          {
            "id": "binary-tree-tilt",
            "num": 16,
            "lc": 563,
            "slug": "binary-tree-tilt",
            "url": "https://leetcode.com/problems/binary-tree-tilt/",
            "premium": false,
            "name": "Binary Tree Tilt",
            "difficulty": "easy",
            "tags": [
              "Tree",
              "Depth-First Search",
              "Binary Tree",
              "DP on Trees"
            ],
            "statement": [
              "Given the <code>root</code> of a binary tree, return <em>the sum of every tree node&#39;s <strong>tilt</strong>.</em>",
              "The <strong>tilt</strong> of a tree node is the <strong>absolute difference</strong> between the sum of all left subtree node <strong>values</strong> and all right subtree node <strong>values</strong>. If a node does not have a left child, then the sum of the left subtree node <strong>values</strong> is treated as <code>0</code>. The rule is similar if the node does not have a right child."
            ],
            "examples": [
              {
                "input": "root = [1,2,3] Output: 1",
                "output": "1",
                "explanation": "Tilt of node 2 : |0-0| = 0 (no children) Tilt of node 3 : |0-0| = 0 (no children) Tilt of node 1 : |2-3| = 1 (left subtree is just left child, so sum is 2; right subtree is just right child, so sum is 3) Sum of every tilt : 0 + 0 + 1 = 1"
              },
              {
                "input": "root = [4,2,9,3,5,null,7] Output: 15",
                "output": "15",
                "explanation": "Tilt of node 3 : |0-0| = 0 (no children) Tilt of node 5 : |0-0| = 0 (no children) Tilt of node 7 : |0-0| = 0 (no children) Tilt of node 2 : |3-5| = 2 (left subtree is just left child, so sum is 3; right subtree is just right child, so sum is 5) Tilt of node 9 : |0-7| = 7 (no left child, so sum is 0; right subtree is just right child, so sum is 7) Tilt of node 4 : |(3+5+2)-(9+7)| = |10-16| = 6 (left subtree values are 3, 5, and 2, which sums to 10; right subtree values are 9 and 7, which sums to 16) Sum of every tilt : 0 + 0 + 0 + 2 + 7 + 6 = 15"
              },
              {
                "input": "root = [21,7,14,1,1,2,2,3,3] Output: 9",
                "output": "9"
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[0, 10<sup>4</sup>]</code>.",
              "<code>-1000 &lt;= Node.val &lt;= 1000</code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          }
        ]
      },
      {
        "id": "shape",
        "title": "Exploiting a shape guarantee",
        "problems": [
          {
            "id": "count-complete-tree-nodes",
            "num": 17,
            "lc": 222,
            "slug": "count-complete-tree-nodes",
            "url": "https://leetcode.com/problems/count-complete-tree-nodes/",
            "premium": false,
            "name": "Count Complete Tree Nodes",
            "difficulty": "medium",
            "tags": [
              "Binary Search",
              "Bit Manipulation",
              "Tree",
              "Binary Tree"
            ],
            "statement": [
              "Given the <code>root</code> of a <strong>complete</strong> binary tree, return the number of the nodes in the tree.",
              "According to <strong><a href=\"http://en.wikipedia.org/wiki/Binary_tree#Types_of_binary_trees\" target=\"_blank\">Wikipedia</a></strong>, every level, except possibly the last, is completely filled in a complete binary tree, and all nodes in the last level are as far left as possible. It can have between <code>1</code> and <code>2<sup>h</sup></code> nodes inclusive at the last level <code>h</code>.",
              "Design an algorithm that runs in less than <code data-stringify-type=\"code\">O(n)</code> time complexity."
            ],
            "examples": [
              {
                "input": "root = [1,2,3,4,5,6] Output: 6",
                "output": "6"
              },
              {
                "input": "root = [] Output: 0",
                "output": "0"
              },
              {
                "input": "root = [1] Output: 1",
                "output": "1"
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[0, 5 * 10<sup>4</sup>]</code>.",
              "<code>0 &lt;= Node.val &lt;= 5 * 10<sup>4</sup></code>",
              "The tree is guaranteed to be <strong>complete</strong>."
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          },
          {
            "id": "check-completeness",
            "num": 18,
            "lc": 958,
            "slug": "check-completeness-of-a-binary-tree",
            "url": "https://leetcode.com/problems/check-completeness-of-a-binary-tree/",
            "premium": false,
            "name": "Check Completeness of a Binary Tree",
            "difficulty": "medium",
            "tags": [
              "Tree",
              "Breadth-First Search",
              "Binary Tree"
            ],
            "statement": [
              "Given the <code>root</code> of a binary tree, determine if it is a <em>complete binary tree</em>.",
              "In a <strong><a href=\"http://en.wikipedia.org/wiki/Binary_tree#Types_of_binary_trees\" target=\"_blank\">complete binary tree</a></strong>, every level, except possibly the last, is completely filled, and all nodes in the last level are as far left as possible. It can have between <code>1</code> and <code>2<sup>h</sup></code> nodes inclusive at the last level <code>h</code>."
            ],
            "examples": [
              {
                "input": "root = [1,2,3,4,5,6] Output: true Explanation: Every level before the last is full (ie. levels with node-values {1} and {2, 3}), and all nodes in the last level ({4, 5, 6}) are as far left as possible.",
                "output": "true Explanation: Every level before the last is full (ie. levels with node-values {1} and {2, 3}), and all nodes in the last level ({4, 5, 6}) are as far left as possible.",
                "explanation": "Every level before the last is full (ie. levels with node-values {1} and {2, 3}), and all nodes in the last level ({4, 5, 6}) are as far left as possible."
              },
              {
                "input": "root = [1,2,3,4,5,null,7] Output: false Explanation: The node with value 7 isn't as far left as possible.",
                "output": "false Explanation: The node with value 7 isn't as far left as possible.",
                "explanation": "The node with value 7 isn't as far left as possible."
              }
            ],
            "constraints": [
              "The number of nodes in the tree is in the range <code>[1, 100]</code>.",
              "<code>1 &lt;= Node.val &lt;= 1000</code>"
            ],
            "note": "",
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
            "topicTitle": "Binary Trees"
          }
        ]
      }
    ],
    "problems": [
      {
        "id": "preorder-traversal",
        "num": 1,
        "lc": 144,
        "slug": "binary-tree-preorder-traversal",
        "url": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
        "premium": false,
        "name": "Binary Tree Preorder Traversal",
        "difficulty": "easy",
        "tags": [
          "Stack",
          "Tree",
          "Depth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "Given the <code>root</code> of a binary tree, return <em>the preorder traversal of its nodes&#39; values</em>."
        ],
        "examples": [
          {
            "input": "root = [1,null,2,3]",
            "output": "[1,2,3]"
          },
          {
            "input": "root = [1,2,3,4,5,null,8,null,null,6,7,9]",
            "output": "[1,2,4,5,6,7,3,8,9]"
          },
          {
            "input": "root = []",
            "output": "[]"
          },
          {
            "input": "root = [1]",
            "output": "[1]"
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[0, 100]</code>.",
          "<code>-100 &lt;= Node.val &lt;= 100</code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "inorder-traversal",
        "num": 2,
        "lc": 94,
        "slug": "binary-tree-inorder-traversal",
        "url": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
        "premium": false,
        "name": "Binary Tree Inorder Traversal",
        "difficulty": "easy",
        "tags": [
          "Stack",
          "Tree",
          "Depth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "Given the <code>root</code> of a binary tree, return <em>the inorder traversal of its nodes&#39; values</em>."
        ],
        "examples": [
          {
            "input": "root = [1,null,2,3]",
            "output": "[1,3,2]"
          },
          {
            "input": "root = [1,2,3,4,5,null,8,null,null,6,7,9]",
            "output": "[4,2,6,5,7,1,3,9,8]"
          },
          {
            "input": "root = []",
            "output": "[]"
          },
          {
            "input": "root = [1]",
            "output": "[1]"
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[0, 100]</code>.",
          "<code>-100 &lt;= Node.val &lt;= 100</code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "postorder-traversal",
        "num": 3,
        "lc": 145,
        "slug": "binary-tree-postorder-traversal",
        "url": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
        "premium": false,
        "name": "Binary Tree Postorder Traversal",
        "difficulty": "easy",
        "tags": [
          "Stack",
          "Tree",
          "Depth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "Given the <code>root</code> of a binary tree, return <em>the postorder traversal of its nodes&#39; values</em>."
        ],
        "examples": [
          {
            "input": "root = [1,null,2,3]",
            "output": "[3,2,1]"
          },
          {
            "input": "root = [1,2,3,4,5,null,8,null,null,6,7,9]",
            "output": "[4,6,7,5,2,9,8,3,1]"
          },
          {
            "input": "root = []",
            "output": "[]"
          },
          {
            "input": "root = [1]",
            "output": "[1]"
          }
        ],
        "constraints": [
          "The number of the nodes in the tree is in the range <code>[0, 100]</code>.",
          "<code>-100 &lt;= Node.val &lt;= 100</code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "maximum-depth",
        "num": 4,
        "lc": 104,
        "slug": "maximum-depth-of-binary-tree",
        "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
        "premium": false,
        "name": "Maximum Depth of Binary Tree",
        "difficulty": "easy",
        "tags": [
          "Tree",
          "Depth-First Search",
          "Breadth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "Given the <code>root</code> of a binary tree, return <em>its maximum depth</em>.",
          "A binary tree&#39;s <strong>maximum depth</strong> is the number of nodes along the longest path from the root node down to the farthest leaf node."
        ],
        "examples": [
          {
            "input": "root = [3,9,20,null,null,15,7] Output: 3",
            "output": "3"
          },
          {
            "input": "root = [1,null,2] Output: 2",
            "output": "2"
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[0, 10<sup>4</sup>]</code>.",
          "<code>-100 &lt;= Node.val &lt;= 100</code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "minimum-depth",
        "num": 5,
        "lc": 111,
        "slug": "minimum-depth-of-binary-tree",
        "url": "https://leetcode.com/problems/minimum-depth-of-binary-tree/",
        "premium": false,
        "name": "Minimum Depth of Binary Tree",
        "difficulty": "easy",
        "tags": [
          "Tree",
          "Depth-First Search",
          "Breadth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "Given a binary tree, find its minimum depth.",
          "The minimum depth is the number of nodes along the shortest path from the root node down to the nearest leaf node.",
          "<strong>Note:</strong> A leaf is a node with no children."
        ],
        "examples": [
          {
            "input": "root = [3,9,20,null,null,15,7] Output: 2",
            "output": "2"
          },
          {
            "input": "root = [2,null,3,null,4,null,5,null,6] Output: 5",
            "output": "5"
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[0, 10<sup>5</sup>]</code>.",
          "<code>-1000 &lt;= Node.val &lt;= 1000</code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "level-order-traversal",
        "num": 6,
        "lc": 102,
        "slug": "binary-tree-level-order-traversal",
        "url": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
        "premium": false,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "medium",
        "tags": [
          "Tree",
          "Breadth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "Given the <code>root</code> of a binary tree, return <em>the level order traversal of its nodes&#39; values</em>. (i.e., from left to right, level by level)."
        ],
        "examples": [
          {
            "input": "root = [3,9,20,null,null,15,7] Output: [[3],[9,20],[15,7]]",
            "output": "[[3],[9,20],[15,7]]"
          },
          {
            "input": "root = [1] Output: [[1]]",
            "output": "[[1]]"
          },
          {
            "input": "root = [] Output: []",
            "output": "[]"
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[0, 2000]</code>.",
          "<code>-1000 &lt;= Node.val &lt;= 1000</code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "level-order-bottom-up",
        "num": 7,
        "lc": 107,
        "slug": "binary-tree-level-order-traversal-ii",
        "url": "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/",
        "premium": false,
        "name": "Binary Tree Level Order Traversal II",
        "difficulty": "medium",
        "tags": [
          "Tree",
          "Breadth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "Given the <code>root</code> of a binary tree, return <em>the bottom-up level order traversal of its nodes&#39; values</em>. (i.e., from left to right, level by level from leaf to root)."
        ],
        "examples": [
          {
            "input": "root = [3,9,20,null,null,15,7] Output: [[15,7],[9,20],[3]]",
            "output": "[[15,7],[9,20],[3]]"
          },
          {
            "input": "root = [1] Output: [[1]]",
            "output": "[[1]]"
          },
          {
            "input": "root = [] Output: []",
            "output": "[]"
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[0, 2000]</code>.",
          "<code>-1000 &lt;= Node.val &lt;= 1000</code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "zigzag-level-order",
        "num": 8,
        "lc": 103,
        "slug": "binary-tree-zigzag-level-order-traversal",
        "url": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
        "premium": false,
        "name": "Binary Tree Zigzag Level Order Traversal",
        "difficulty": "medium",
        "tags": [
          "Tree",
          "Breadth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "Given the <code>root</code> of a binary tree, return <em>the zigzag level order traversal of its nodes&#39; values</em>. (i.e., from left to right, then right to left for the next level and alternate between)."
        ],
        "examples": [
          {
            "input": "root = [3,9,20,null,null,15,7] Output: [[3],[20,9],[15,7]]",
            "output": "[[3],[20,9],[15,7]]"
          },
          {
            "input": "root = [1] Output: [[1]]",
            "output": "[[1]]"
          },
          {
            "input": "root = [] Output: []",
            "output": "[]"
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[0, 2000]</code>.",
          "<code>-100 &lt;= Node.val &lt;= 100</code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "same-tree",
        "num": 9,
        "lc": 100,
        "slug": "same-tree",
        "url": "https://leetcode.com/problems/same-tree/",
        "premium": false,
        "name": "Same Tree",
        "difficulty": "easy",
        "tags": [
          "Tree",
          "Depth-First Search",
          "Breadth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "Given the roots of two binary trees <code>p</code> and <code>q</code>, write a function to check if they are the same or not.",
          "Two binary trees are considered the same if they are structurally identical, and the nodes have the same value."
        ],
        "examples": [
          {
            "input": "p = [1,2,3], q = [1,2,3] Output: true",
            "output": "true"
          },
          {
            "input": "p = [1,2], q = [1,null,2] Output: false",
            "output": "false"
          },
          {
            "input": "p = [1,2,1], q = [1,1,2] Output: false",
            "output": "false"
          }
        ],
        "constraints": [
          "The number of nodes in both trees is in the range <code>[0, 100]</code>.",
          "<code>-10<sup>4</sup> &lt;= Node.val &lt;= 10<sup>4</sup></code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "symmetric-tree",
        "num": 10,
        "lc": 101,
        "slug": "symmetric-tree",
        "url": "https://leetcode.com/problems/symmetric-tree/",
        "premium": false,
        "name": "Symmetric Tree",
        "difficulty": "easy",
        "tags": [
          "Tree",
          "Depth-First Search",
          "Breadth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "Given the <code>root</code> of a binary tree, <em>check whether it is a mirror of itself</em> (i.e., symmetric around its center)."
        ],
        "examples": [
          {
            "input": "root = [1,2,2,3,4,4,3] Output: true",
            "output": "true"
          },
          {
            "input": "root = [1,2,2,null,3,null,3] Output: false",
            "output": "false"
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[1, 1000]</code>.",
          "<code>-100 &lt;= Node.val &lt;= 100</code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "invert-binary-tree",
        "num": 11,
        "lc": 226,
        "slug": "invert-binary-tree",
        "url": "https://leetcode.com/problems/invert-binary-tree/",
        "premium": false,
        "name": "Invert Binary Tree",
        "difficulty": "easy",
        "tags": [
          "Tree",
          "Depth-First Search",
          "Breadth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "Given the <code>root</code> of a binary tree, invert the tree, and return <em>its root</em>."
        ],
        "examples": [
          {
            "input": "root = [4,2,7,1,3,6,9] Output: [4,7,2,9,6,3,1]",
            "output": "[4,7,2,9,6,3,1]"
          },
          {
            "input": "root = [2,1,3] Output: [2,3,1]",
            "output": "[2,3,1]"
          },
          {
            "input": "root = [] Output: []",
            "output": "[]"
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[0, 100]</code>.",
          "<code>-100 &lt;= Node.val &lt;= 100</code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "merge-two-binary-trees",
        "num": 12,
        "lc": 617,
        "slug": "merge-two-binary-trees",
        "url": "https://leetcode.com/problems/merge-two-binary-trees/",
        "premium": false,
        "name": "Merge Two Binary Trees",
        "difficulty": "easy",
        "tags": [
          "Tree",
          "Depth-First Search",
          "Breadth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "You are given two binary trees <code>root1</code> and <code>root2</code>.",
          "Imagine that when you put one of them to cover the other, some nodes of the two trees are overlapped while the others are not. You need to merge the two trees into a new binary tree. The merge rule is that if two nodes overlap, then sum node values up as the new value of the merged node. Otherwise, the NOT null node will be used as the node of the new tree.",
          "Return <em>the merged tree</em>.",
          "<strong>Note:</strong> The merging process must start from the root nodes of both trees."
        ],
        "examples": [
          {
            "input": "root1 = [1,3,2,5], root2 = [2,1,3,null,4,null,7] Output: [3,4,5,5,4,null,7]",
            "output": "[3,4,5,5,4,null,7]"
          },
          {
            "input": "root1 = [1], root2 = [1,2] Output: [2,2]",
            "output": "[2,2]"
          }
        ],
        "constraints": [
          "The number of nodes in both trees is in the range <code>[0, 2000]</code>.",
          "<code>-10<sup>4</sup> &lt;= Node.val &lt;= 10<sup>4</sup></code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "subtree-of-another-tree",
        "num": 13,
        "lc": 572,
        "slug": "subtree-of-another-tree",
        "url": "https://leetcode.com/problems/subtree-of-another-tree/",
        "premium": false,
        "name": "Subtree of Another Tree",
        "difficulty": "easy",
        "tags": [
          "Tree",
          "Depth-First Search",
          "String Matching",
          "Binary Tree",
          "Hash Function"
        ],
        "statement": [
          "Given the roots of two binary trees <code>root</code> and <code>subRoot</code>, return <code>true</code> if there is a subtree of <code>root</code> with the same structure and node values of<code> subRoot</code> and <code>false</code> otherwise.",
          "A subtree of a binary tree <code>tree</code> is a tree that consists of a node in <code>tree</code> and all of this node&#39;s descendants. The tree <code>tree</code> could also be considered as a subtree of itself."
        ],
        "examples": [
          {
            "input": "root = [3,4,5,1,2], subRoot = [4,1,2] Output: true",
            "output": "true"
          },
          {
            "input": "root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2] Output: false",
            "output": "false"
          }
        ],
        "constraints": [
          "The number of nodes in the <code>root</code> tree is in the range <code>[1, 2000]</code>.",
          "The number of nodes in the <code>subRoot</code> tree is in the range <code>[1, 1000]</code>.",
          "<code>-10<sup>4</sup> &lt;= root.val &lt;= 10<sup>4</sup></code>",
          "<code>-10<sup>4</sup> &lt;= subRoot.val &lt;= 10<sup>4</sup></code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "balanced-binary-tree",
        "num": 14,
        "lc": 110,
        "slug": "balanced-binary-tree",
        "url": "https://leetcode.com/problems/balanced-binary-tree/",
        "premium": false,
        "name": "Balanced Binary Tree",
        "difficulty": "easy",
        "tags": [
          "Tree",
          "Depth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "Given a binary tree, determine if it is <strong>height-balanced</strong>."
        ],
        "examples": [
          {
            "input": "root = [3,9,20,null,null,15,7] Output: true",
            "output": "true"
          },
          {
            "input": "root = [1,2,2,3,3,null,null,4,4] Output: false",
            "output": "false"
          },
          {
            "input": "root = [] Output: true",
            "output": "true"
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[0, 5000]</code>.",
          "<code>-10<sup>4</sup> &lt;= Node.val &lt;= 10<sup>4</sup></code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "diameter-of-binary-tree",
        "num": 15,
        "lc": 543,
        "slug": "diameter-of-binary-tree",
        "url": "https://leetcode.com/problems/diameter-of-binary-tree/",
        "premium": false,
        "name": "Diameter of Binary Tree",
        "difficulty": "easy",
        "tags": [
          "Tree",
          "Depth-First Search",
          "Binary Tree",
          "DP on Trees"
        ],
        "statement": [
          "Given the <code>root</code> of a binary tree, return <em>the length of the <strong>diameter</strong> of the tree</em>.",
          "The <strong>diameter</strong> of a binary tree is the <strong>length</strong> of the longest path between any two nodes in a tree. This path may or may not pass through the <code>root</code>.",
          "The <strong>length</strong> of a path between two nodes is represented by the number of edges between them."
        ],
        "examples": [
          {
            "input": "root = [1,2,3,4,5] Output: 3 Explanation: 3 is the length of the path [4,2,1,3] or [5,2,1,3].",
            "output": "3 Explanation: 3 is the length of the path [4,2,1,3] or [5,2,1,3].",
            "explanation": "3 is the length of the path [4,2,1,3] or [5,2,1,3]."
          },
          {
            "input": "root = [1,2] Output: 1",
            "output": "1"
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[1, 10<sup>4</sup>]</code>.",
          "<code>-100 &lt;= Node.val &lt;= 100</code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "binary-tree-tilt",
        "num": 16,
        "lc": 563,
        "slug": "binary-tree-tilt",
        "url": "https://leetcode.com/problems/binary-tree-tilt/",
        "premium": false,
        "name": "Binary Tree Tilt",
        "difficulty": "easy",
        "tags": [
          "Tree",
          "Depth-First Search",
          "Binary Tree",
          "DP on Trees"
        ],
        "statement": [
          "Given the <code>root</code> of a binary tree, return <em>the sum of every tree node&#39;s <strong>tilt</strong>.</em>",
          "The <strong>tilt</strong> of a tree node is the <strong>absolute difference</strong> between the sum of all left subtree node <strong>values</strong> and all right subtree node <strong>values</strong>. If a node does not have a left child, then the sum of the left subtree node <strong>values</strong> is treated as <code>0</code>. The rule is similar if the node does not have a right child."
        ],
        "examples": [
          {
            "input": "root = [1,2,3] Output: 1",
            "output": "1",
            "explanation": "Tilt of node 2 : |0-0| = 0 (no children) Tilt of node 3 : |0-0| = 0 (no children) Tilt of node 1 : |2-3| = 1 (left subtree is just left child, so sum is 2; right subtree is just right child, so sum is 3) Sum of every tilt : 0 + 0 + 1 = 1"
          },
          {
            "input": "root = [4,2,9,3,5,null,7] Output: 15",
            "output": "15",
            "explanation": "Tilt of node 3 : |0-0| = 0 (no children) Tilt of node 5 : |0-0| = 0 (no children) Tilt of node 7 : |0-0| = 0 (no children) Tilt of node 2 : |3-5| = 2 (left subtree is just left child, so sum is 3; right subtree is just right child, so sum is 5) Tilt of node 9 : |0-7| = 7 (no left child, so sum is 0; right subtree is just right child, so sum is 7) Tilt of node 4 : |(3+5+2)-(9+7)| = |10-16| = 6 (left subtree values are 3, 5, and 2, which sums to 10; right subtree values are 9 and 7, which sums to 16) Sum of every tilt : 0 + 0 + 0 + 2 + 7 + 6 = 15"
          },
          {
            "input": "root = [21,7,14,1,1,2,2,3,3] Output: 9",
            "output": "9"
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[0, 10<sup>4</sup>]</code>.",
          "<code>-1000 &lt;= Node.val &lt;= 1000</code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "count-complete-tree-nodes",
        "num": 17,
        "lc": 222,
        "slug": "count-complete-tree-nodes",
        "url": "https://leetcode.com/problems/count-complete-tree-nodes/",
        "premium": false,
        "name": "Count Complete Tree Nodes",
        "difficulty": "medium",
        "tags": [
          "Binary Search",
          "Bit Manipulation",
          "Tree",
          "Binary Tree"
        ],
        "statement": [
          "Given the <code>root</code> of a <strong>complete</strong> binary tree, return the number of the nodes in the tree.",
          "According to <strong><a href=\"http://en.wikipedia.org/wiki/Binary_tree#Types_of_binary_trees\" target=\"_blank\">Wikipedia</a></strong>, every level, except possibly the last, is completely filled in a complete binary tree, and all nodes in the last level are as far left as possible. It can have between <code>1</code> and <code>2<sup>h</sup></code> nodes inclusive at the last level <code>h</code>.",
          "Design an algorithm that runs in less than <code data-stringify-type=\"code\">O(n)</code> time complexity."
        ],
        "examples": [
          {
            "input": "root = [1,2,3,4,5,6] Output: 6",
            "output": "6"
          },
          {
            "input": "root = [] Output: 0",
            "output": "0"
          },
          {
            "input": "root = [1] Output: 1",
            "output": "1"
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[0, 5 * 10<sup>4</sup>]</code>.",
          "<code>0 &lt;= Node.val &lt;= 5 * 10<sup>4</sup></code>",
          "The tree is guaranteed to be <strong>complete</strong>."
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      },
      {
        "id": "check-completeness",
        "num": 18,
        "lc": 958,
        "slug": "check-completeness-of-a-binary-tree",
        "url": "https://leetcode.com/problems/check-completeness-of-a-binary-tree/",
        "premium": false,
        "name": "Check Completeness of a Binary Tree",
        "difficulty": "medium",
        "tags": [
          "Tree",
          "Breadth-First Search",
          "Binary Tree"
        ],
        "statement": [
          "Given the <code>root</code> of a binary tree, determine if it is a <em>complete binary tree</em>.",
          "In a <strong><a href=\"http://en.wikipedia.org/wiki/Binary_tree#Types_of_binary_trees\" target=\"_blank\">complete binary tree</a></strong>, every level, except possibly the last, is completely filled, and all nodes in the last level are as far left as possible. It can have between <code>1</code> and <code>2<sup>h</sup></code> nodes inclusive at the last level <code>h</code>."
        ],
        "examples": [
          {
            "input": "root = [1,2,3,4,5,6] Output: true Explanation: Every level before the last is full (ie. levels with node-values {1} and {2, 3}), and all nodes in the last level ({4, 5, 6}) are as far left as possible.",
            "output": "true Explanation: Every level before the last is full (ie. levels with node-values {1} and {2, 3}), and all nodes in the last level ({4, 5, 6}) are as far left as possible.",
            "explanation": "Every level before the last is full (ie. levels with node-values {1} and {2, 3}), and all nodes in the last level ({4, 5, 6}) are as far left as possible."
          },
          {
            "input": "root = [1,2,3,4,5,null,7] Output: false Explanation: The node with value 7 isn't as far left as possible.",
            "output": "false Explanation: The node with value 7 isn't as far left as possible.",
            "explanation": "The node with value 7 isn't as far left as possible."
          }
        ],
        "constraints": [
          "The number of nodes in the tree is in the range <code>[1, 100]</code>.",
          "<code>1 &lt;= Node.val &lt;= 1000</code>"
        ],
        "note": "",
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
        "topicTitle": "Binary Trees"
      }
    ],
    "count": 18
  },
  {
    "id": "heap",
    "title": "Heaps and Priority Queues",
    "status": "ready",
    "target": null,
    "sections": [
      {
        "id": "foundations",
        "title": "Foundations",
        "problems": [
          {
            "id": "heapify",
            "num": 19,
            "lc": null,
            "slug": "",
            "url": "",
            "premium": false,
            "name": "Heapify: Building a Heap in O(n)",
            "difficulty": "easy",
            "tags": [
              "Heap (Priority Queue)",
              "Array",
              "Fundamentals"
            ],
            "statement": [
              "Turn an arbitrary array into a binary heap in place, so that every parent is &le; both of its children.",
              "The interesting part is not the code &mdash; Python gives you <code>heapq.heapify</code> in one line &mdash; but the cost. Inserting n items one at a time costs O(n log n). Heapifying an existing array costs <strong>O(n)</strong>. Being able to explain why is a standard follow-up.",
              "A heap is stored as a flat array with the tree structure implied by indices: the children of <code>i</code> live at <code>2i+1</code> and <code>2i+2</code>, and the parent of <code>i</code> is at <code>(i-1)//2</code>. Nothing is allocated for pointers."
            ],
            "examples": [
              {
                "input": "nums = [5, 3, 8, 1, 9, 2]",
                "output": "[1, 3, 2, 5, 9, 8]",
                "explanation": "One valid heap array. Only the heap property matters, not a unique ordering."
              }
            ],
            "constraints": [
              "<code>0 &lt;= len(nums) &lt;= 10<sup>6</sup></code>",
              "In place: O(1) extra space"
            ],
            "note": "",
            "pitfall": "Starting the loop at index 0 and sifting down. You must go bottom-up; top-down sift-down does not produce a heap.",
            "approaches": [
              {
                "name": "Sift down from the last parent",
                "time": "O(n)",
                "space": "O(1)",
                "why": [
                  "Walk backwards from the last node that has a child, at index <code>n//2 - 1</code>, and sift each one down. Everything from <code>n//2</code> onwards is a leaf and is already a valid one-element heap, so half the array needs no work at all.",
                  "The O(n) bound is the part to be able to derive. A node at height <code>k</code> above the leaves costs O(k) to sift down, and there are at most <code>n/2<sup>k+1</sup></code> such nodes. Summing, the total is n &times; &Sigma; k/2<sup>k+1</sup>, and that series converges to 1 &mdash; so the whole build is O(n), not O(n log n).",
                  "The intuition behind the algebra: almost every node is near the bottom and moves almost nowhere. Only the root can travel the full log n.",
                  "Sifting <em>up</em> from the front instead gives O(n log n), because then the expensive nodes are the many leaves rather than the single root. The direction is the whole trick."
                ],
                "code": "def heapify(nums):\n    n = len(nums)\n    for i in range(n // 2 - 1, -1, -1):   # last parent down to the root\n        sift_down(nums, i, n)\n    return nums\n\n\ndef sift_down(nums, i, n):\n    while True:\n        smallest = i\n        left, right = 2 * i + 1, 2 * i + 2\n        if left < n and nums[left] < nums[smallest]:\n            smallest = left\n        if right < n and nums[right] < nums[smallest]:\n            smallest = right\n        if smallest == i:\n            return\n        nums[i], nums[smallest] = nums[smallest], nums[i]\n        i = smallest",
                "best": true,
                "tag": ""
              },
              {
                "name": "Push one at a time",
                "time": "O(n log n)",
                "space": "O(n)",
                "why": [
                  "Insert each element into a growing heap. Every insert sifts up through at most log n levels, so n inserts cost O(n log n).",
                  "This is what <code>heapq.heappush</code> in a loop does. It is the obvious approach and it is asymptotically worse than <code>heapify</code> on data you already have in an array &mdash; measurably so at a million elements.",
                  "It is still the right choice when items <em>arrive</em> one at a time, because then there is no array to heapify."
                ],
                "code": "def heapify(nums):\n    out = []\n    for value in nums:\n        heapq.heappush(out, value)\n    nums[:] = out\n    return nums",
                "best": false,
                "tag": "the slower way"
              }
            ],
            "tests": "import random\n\n\ndef valid(h):\n    return all(h[i] <= h[c]\n               for i in range(len(h))\n               for c in (2 * i + 1, 2 * i + 2) if c < len(h))\n\n\na = [5, 3, 8, 1, 9, 2]\nheapify(a)\nassert valid(a) and sorted(a) == [1, 2, 3, 5, 8, 9]\nassert heapify([]) == []\nassert heapify([1]) == [1]\nrandom.seed(0)\nfor _ in range(50):\n    data = [random.randint(-50, 50) for _ in range(random.randint(0, 30))]\n    original = sorted(data)\n    heapify(data)\n    assert valid(data), data\n    assert sorted(data) == original",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          }
        ]
      },
      {
        "id": "top-k",
        "title": "Top k with a bounded heap",
        "problems": [
          {
            "id": "kth-largest-element",
            "num": 20,
            "lc": 215,
            "slug": "kth-largest-element-in-an-array",
            "url": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
            "premium": false,
            "name": "Kth Largest Element in an Array",
            "difficulty": "medium",
            "tags": [
              "Array",
              "Divide and Conquer",
              "Sorting",
              "Heap (Priority Queue)",
              "Quickselect"
            ],
            "statement": [
              "Given an integer array <code>nums</code> and an integer <code>k</code>, return <em>the</em> <code>k<sup>th</sup></code> <em>largest element in the array</em>.",
              "Note that it is the <code>k<sup>th</sup></code> largest element in the sorted order, not the <code>k<sup>th</sup></code> distinct element.",
              "Can you solve it without sorting?"
            ],
            "examples": [
              {
                "input": "nums = [3,2,1,5,6,4], k = 2 Output: 5",
                "output": "5"
              },
              {
                "input": "nums = [3,2,3,1,2,4,5,5,6], k = 4 Output: 4",
                "output": "4"
              }
            ],
            "constraints": [
              "<code>1 &lt;= k &lt;= nums.length &lt;= 10<sup>5</sup></code>",
              "<code>-10<sup>4</sup> &lt;= nums[i] &lt;= 10<sup>4</sup></code>"
            ],
            "note": "",
            "pitfall": "Returning the k-th <em>distinct</em> value. Duplicates count: in [3,2,3,1,2,4,5,5,6] the 4th largest is 4, not 3.",
            "approaches": [
              {
                "name": "Min-heap of size k",
                "time": "O(n log k)",
                "space": "O(k)",
                "why": [
                  "Keep a min-heap holding the k largest values seen so far. Its root is the smallest of those k, which is exactly the k-th largest overall &mdash; so once every element has been offered, the root is the answer.",
                  "Push, then pop when the heap exceeds k. Each operation is O(log k) and there are n of them: <strong>O(n log k)</strong>, which beats sorting's O(n log n) whenever k is small, and uses only O(k) memory rather than holding the whole array.",
                  "The counter-intuitive part is using a <em>min</em>-heap to find a maximum. The reason is that you need cheap access to the weakest member of your current top-k, because that is the one to evict."
                ],
                "code": "def find_kth_largest(nums, k):\n    heap = []\n    for value in nums:\n        heapq.heappush(heap, value)\n        if len(heap) > k:\n            heapq.heappop(heap)      # drop the smallest of the k+1\n    return heap[0]",
                "best": true,
                "tag": ""
              },
              {
                "name": "nlargest / sorting",
                "time": "O(n log n)",
                "space": "O(n)",
                "why": [
                  "<code>sorted(nums)[-k]</code> is the shortest correct answer and is fine when n is small. <code>heapq.nlargest(k, nums)[-1]</code> is the same size-k heap idea behind a library call.",
                  "Sorting does strictly more work than the problem needs: it orders all n elements when you only care about a boundary."
                ],
                "code": "def find_kth_largest(nums, k):\n    return heapq.nlargest(k, nums)[-1]",
                "best": false,
                "tag": "one line"
              },
              {
                "name": "Quickselect",
                "time": "O(n) average, O(n&sup2;) worst",
                "space": "O(1)",
                "why": [
                  "Partition around a pivot as in quicksort, but recurse into only the side that contains the k-th position. Each pass discards a fraction of the array, so the expected work is n + n/2 + n/4 + &hellip; = <strong>O(n)</strong>.",
                  "The worst case is O(n&sup2;), when every pivot is the extreme value &mdash; already-sorted input with a fixed pivot choice does it. A <em>random</em> pivot makes that vanishingly unlikely, which is why the shuffle matters and is not decoration.",
                  "Mention this when asked to beat O(n log k). It is the theoretically best answer and the one most likely to be got subtly wrong under time pressure, so write the heap first."
                ],
                "code": "def find_kth_largest(nums, k):\n    import random\n    target = len(nums) - k          # k-th largest = this index when sorted\n    lo, hi = 0, len(nums) - 1\n    nums = list(nums)\n    while True:\n        pivot = random.randint(lo, hi)\n        nums[pivot], nums[hi] = nums[hi], nums[pivot]\n        store = lo\n        for i in range(lo, hi):\n            if nums[i] < nums[hi]:\n                nums[store], nums[i] = nums[i], nums[store]\n                store += 1\n        nums[store], nums[hi] = nums[hi], nums[store]\n        if store == target:\n            return nums[store]\n        if store < target:\n            lo = store + 1\n        else:\n            hi = store - 1",
                "best": false,
                "tag": "best average case"
              }
            ],
            "tests": "assert find_kth_largest([3, 2, 1, 5, 6, 4], 2) == 5\nassert find_kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) == 4\nassert find_kth_largest([1], 1) == 1\nassert find_kth_largest([2, 1], 2) == 1\nassert find_kth_largest([7, 7, 7], 2) == 7\nimport random\nrandom.seed(1)\nfor _ in range(50):\n    data = [random.randint(-20, 20) for _ in range(random.randint(1, 40))]\n    k = random.randint(1, len(data))\n    assert find_kth_largest(list(data), k) == sorted(data)[-k]",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "kth-largest-in-stream",
            "num": 21,
            "lc": 703,
            "slug": "kth-largest-element-in-a-stream",
            "url": "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
            "premium": false,
            "name": "Kth Largest Element in a Stream",
            "difficulty": "easy",
            "tags": [
              "Tree",
              "Design",
              "Binary Search Tree",
              "Heap (Priority Queue)",
              "Binary Tree",
              "Data Stream"
            ],
            "statement": [
              "You are part of a university admissions office and need to keep track of the <code>kth</code> highest test score from applicants in real-time. This helps to determine cut-off marks for interviews and admissions dynamically as new applicants submit their scores.",
              "You are tasked to implement a class which, for a given integer <code>k</code>, maintains a stream of test scores and continuously returns the <code>k</code>th highest test score <strong>after</strong> a new score has been submitted. More specifically, we are looking for the <code>k</code>th highest score in the sorted list of all scores.",
              "Implement the <code>KthLargest</code> class:",
              "<ul>\n <li><code>KthLargest(int k, int[] nums)</code> Initializes the object with the integer <code>k</code> and the stream of test scores <code>nums</code>.</li>\n <li><code>int add(int val)</code> Adds a new test score <code>val</code> to the stream and returns the element representing the <code>k<sup>th</sup></code> largest element in the pool of test scores so far.</li>\n</ul>"
            ],
            "examples": [
              {
                "input": "[\"KthLargest\", \"add\", \"add\", \"add\", \"add\", \"add\"] [[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]]",
                "output": "[null, 4, 5, 5, 8, 8]",
                "explanation": "KthLargest kthLargest = new KthLargest(3, [4, 5, 8, 2]); kthLargest.add(3); // return 4 kthLargest.add(5); // return 5 kthLargest.add(10); // return 5 kthLargest.add(9); // return 8 kthLargest.add(4); // return 8"
              },
              {
                "input": "[\"KthLargest\", \"add\", \"add\", \"add\", \"add\"] [[4, [7, 7, 7, 7, 8, 3]], [2], [10], [9], [9]]",
                "output": "[null, 7, 7, 7, 8]",
                "explanation": "KthLargest kthLargest = new KthLargest(4, [7, 7, 7, 7, 8, 3]); kthLargest.add(2); // return 7 kthLargest.add(10); // return 7 kthLargest.add(9); // return 7 kthLargest.add(9); // return 8"
              }
            ],
            "constraints": [
              "<code>0 &lt;= nums.length &lt;= 10<sup>4</sup></code>",
              "<code>1 &lt;= k &lt;= nums.length + 1</code>",
              "<code>-10<sup>4</sup> &lt;= nums[i] &lt;= 10<sup>4</sup></code>",
              "<code>-10<sup>4</sup> &lt;= val &lt;= 10<sup>4</sup></code>",
              "At most <code>10<sup>4</sup></code> calls will be made to <code>add</code>."
            ],
            "note": "",
            "pitfall": "",
            "approaches": [
              {
                "name": "Min-heap capped at k",
                "time": "O(log k) per add",
                "space": "O(k)",
                "why": [
                  "The same size-k min-heap as problem 215, kept alive between calls. This is the problem that shows <em>why</em> that structure is the right one: it is incremental. Nothing is recomputed when a value arrives.",
                  "<code>add</code> pushes and then pops if the heap is over k, both O(log k), and returns the root. Construction heapifies the initial array and trims it, which is O(n) plus O((n-k) log k).",
                  "Space stays O(k) no matter how long the stream runs &mdash; the whole point. Keeping every value and sorting on each query would be O(n) memory and O(n log n) per call."
                ],
                "code": "class KthLargest:\n    def __init__(self, k, nums):\n        self.k = k\n        self.heap = list(nums)\n        heapq.heapify(self.heap)\n        while len(self.heap) > k:\n            heapq.heappop(self.heap)\n\n    def add(self, val):\n        heapq.heappush(self.heap, val)\n        if len(self.heap) > self.k:\n            heapq.heappop(self.heap)\n        return self.heap[0]",
                "best": true,
                "tag": ""
              },
              {
                "name": "Sorted list with bisect",
                "time": "O(n) per add",
                "space": "O(n)",
                "why": [
                  "Keep every value in a sorted list and answer with <code>data[-k]</code>. <code>bisect.insort</code> finds the position in O(log n) but the insert itself shifts the tail, so each add is O(n).",
                  "Worth knowing as the contrast: the binary search is not the cost, the memory move is. For a stream this also grows without bound, where the heap does not."
                ],
                "code": "import bisect\n\n\nclass KthLargest:\n    def __init__(self, k, nums):\n        self.k = k\n        self.data = sorted(nums)\n\n    def add(self, val):\n        bisect.insort(self.data, val)\n        return self.data[-self.k]",
                "best": false,
                "tag": ""
              }
            ],
            "tests": "kth = KthLargest(3, [4, 5, 8, 2])\nassert [kth.add(v) for v in (3, 5, 10, 9, 4)] == [4, 5, 5, 8, 8]\nsolo = KthLargest(1, [])\nassert [solo.add(v) for v in (-3, -2, -4, 0, 4)] == [-3, -2, -2, 0, 4]\nstart = KthLargest(2, [0])\nassert start.add(-1) == -1        # 2nd largest of [0, -1]\nassert start.add(7) == 0          # 2nd largest of [0, -1, 7]",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "top-k-frequent",
            "num": 22,
            "lc": 347,
            "slug": "top-k-frequent-elements",
            "url": "https://leetcode.com/problems/top-k-frequent-elements/",
            "premium": false,
            "name": "Top K Frequent Elements",
            "difficulty": "medium",
            "tags": [
              "Array",
              "Hash Table",
              "Divide and Conquer",
              "Sorting",
              "Heap (Priority Queue)",
              "Bucket Sort",
              "Counting",
              "Quickselect"
            ],
            "statement": [
              "Given an integer array <code>nums</code> and an integer <code>k</code>, return <em>the</em> <code>k</code> <em>most frequent elements</em>. You may return the answer in <strong>any order</strong>."
            ],
            "examples": [
              {
                "input": "nums = [1,1,1,2,2,3], k = 2",
                "output": "[1,2]"
              },
              {
                "input": "nums = [1], k = 1",
                "output": "[1]"
              },
              {
                "input": "nums = [1,2,1,2,1,2,3,1,3,2], k = 2",
                "output": "[1,2]"
              }
            ],
            "constraints": [
              "<code>1 &lt;= nums.length &lt;= 10<sup>5</sup></code>",
              "<code>-10<sup>4</sup> &lt;= nums[i] &lt;= 10<sup>4</sup></code>",
              "<code>k</code> is in the range <code>[1, the number of unique elements in the array]</code>.",
              "It is <strong>guaranteed</strong> that the answer is <strong>unique</strong>."
            ],
            "note": "",
            "pitfall": "",
            "approaches": [
              {
                "name": "Count, then a size-k heap",
                "time": "O(n log k)",
                "space": "O(n)",
                "why": [
                  "Count with a <code>Counter</code> in O(n), then run the size-k min-heap over the <em>distinct</em> values, keyed on frequency. If there are d distinct values the heap phase is O(d log k), and d &le; n.",
                  "Space is O(n) for the counter regardless of approach &mdash; you cannot know frequencies without counting everything. The heap adds only O(k).",
                  "<code>Counter.most_common(k)</code> is this same algorithm in the standard library; it uses <code>heapq.nlargest</code> internally when k is given."
                ],
                "code": "def top_k_frequent(nums, k):\n    counts = Counter(nums)\n    heap = []\n    for value, freq in counts.items():\n        heapq.heappush(heap, (freq, value))\n        if len(heap) > k:\n            heapq.heappop(heap)\n    return [value for freq, value in heap]",
                "best": false,
                "tag": ""
              },
              {
                "name": "Bucket by frequency",
                "time": "O(n)",
                "space": "O(n)",
                "why": [
                  "A frequency cannot exceed n, so make <code>n + 1</code> buckets and put each value in the bucket matching its count. Walk the buckets from the back and take the first k values.",
                  "That is a counting sort on a bounded key, so it is <strong>O(n)</strong> with no log factor at all &mdash; strictly better than the heap here, and the answer the problem's \"better than O(n log n)\" hint is pointing at.",
                  "It works only because the sort key is an integer bounded by n. The heap does not need that and generalises to unbounded or non-integer keys, which is why both are worth knowing."
                ],
                "code": "def top_k_frequent(nums, k):\n    counts = Counter(nums)\n    buckets = [[] for _ in range(len(nums) + 1)]\n    for value, freq in counts.items():\n        buckets[freq].append(value)\n\n    out = []\n    for freq in range(len(buckets) - 1, 0, -1):\n        for value in buckets[freq]:\n            out.append(value)\n            if len(out) == k:\n                return out\n    return out",
                "best": true,
                "tag": "linear"
              }
            ],
            "tests": "assert sorted(top_k_frequent([1, 1, 1, 2, 2, 3], 2)) == [1, 2]\nassert top_k_frequent([1], 1) == [1]\nassert sorted(top_k_frequent([4, 4, 4, 5, 5, 6], 3)) == [4, 5, 6]\nassert sorted(top_k_frequent([-1, -1, 2, 2, 3], 2)) == [-1, 2]\ngot = top_k_frequent([1, 2, 3, 1, 2, 1], 2)\nassert sorted(got) == [1, 2] and len(got) == 2",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "sort-by-frequency",
            "num": 23,
            "lc": 451,
            "slug": "sort-characters-by-frequency",
            "url": "https://leetcode.com/problems/sort-characters-by-frequency/",
            "premium": false,
            "name": "Sort Characters By Frequency",
            "difficulty": "medium",
            "tags": [
              "Hash Table",
              "String",
              "Sorting",
              "Heap (Priority Queue)",
              "Bucket Sort",
              "Counting"
            ],
            "statement": [
              "Given a string <code>s</code>, sort it in <strong>decreasing order</strong> based on the <strong>frequency</strong> of the characters. The <strong>frequency</strong> of a character is the number of times it appears in the string.",
              "Return <em>the sorted string</em>. If there are multiple answers, return <em>any of them</em>."
            ],
            "examples": [
              {
                "input": "s = \"tree\" Output: \"eert\" Explanation: 'e' appears twice while 'r' and 't' both appear once. So 'e' must appear before both 'r' and 't'. Therefore \"eetr\" is also a valid answer.",
                "output": "\"eert\" Explanation: 'e' appears twice while 'r' and 't' both appear once. So 'e' must appear before both 'r' and 't'. Therefore \"eetr\" is also a valid answer.",
                "explanation": "'e' appears twice while 'r' and 't' both appear once. So 'e' must appear before both 'r' and 't'. Therefore \"eetr\" is also a valid answer."
              },
              {
                "input": "s = \"cccaaa\" Output: \"aaaccc\" Explanation: Both 'c' and 'a' appear three times, so both \"cccaaa\" and \"aaaccc\" are valid answers. Note that \"cacaca\" is incorrect, as the same characters must be together.",
                "output": "\"aaaccc\" Explanation: Both 'c' and 'a' appear three times, so both \"cccaaa\" and \"aaaccc\" are valid answers. Note that \"cacaca\" is incorrect, as the same characters must be together.",
                "explanation": "Both 'c' and 'a' appear three times, so both \"cccaaa\" and \"aaaccc\" are valid answers. Note that \"cacaca\" is incorrect, as the same characters must be together."
              },
              {
                "input": "s = \"Aabb\" Output: \"bbAa\" Explanation: \"bbaA\" is also a valid answer, but \"Aabb\" is incorrect. Note that 'A' and 'a' are treated as two different characters.",
                "output": "\"bbAa\" Explanation: \"bbaA\" is also a valid answer, but \"Aabb\" is incorrect. Note that 'A' and 'a' are treated as two different characters.",
                "explanation": "\"bbaA\" is also a valid answer, but \"Aabb\" is incorrect. Note that 'A' and 'a' are treated as two different characters."
              }
            ],
            "constraints": [
              "<code>1 &lt;= s.length &lt;= 5 * 10<sup>5</sup></code>",
              "<code>s</code> consists of uppercase and lowercase English letters and digits."
            ],
            "note": "",
            "pitfall": "Sorting characters rather than grouping them. All copies of a character must be adjacent; only the groups are ordered by frequency.",
            "approaches": [
              {
                "name": "Count, then max-heap",
                "time": "O(n + d log d)",
                "space": "O(n)",
                "why": [
                  "Count the characters, push <code>(-freq, char)</code> so Python's min-heap behaves as a max-heap, then pop repeatedly and emit each character <code>freq</code> times.",
                  "With d distinct characters the heap work is O(d log d); building the output is O(n). For ASCII input d &le; 128, so the heap term is effectively constant and the whole thing is O(n).",
                  "The negation trick is the thing to remember: <code>heapq</code> has no max-heap, and negating the key is the standard workaround. It only works on numeric keys &mdash; you cannot negate a string."
                ],
                "code": "def frequency_sort(s):\n    counts = Counter(s)\n    heap = [(-freq, ch) for ch, freq in counts.items()]\n    heapq.heapify(heap)\n\n    out = []\n    while heap:\n        freq, ch = heapq.heappop(heap)\n        out.append(ch * -freq)\n    return \"\".join(out)",
                "best": false,
                "tag": ""
              },
              {
                "name": "most_common",
                "time": "O(n + d log d)",
                "space": "O(n)",
                "why": [
                  "<code>Counter.most_common()</code> with no argument sorts the items by count, which is the same O(d log d) with none of the negation bookkeeping.",
                  "Identical complexity, three lines shorter, and no chance of getting the sign wrong. Reach for the heap only when you need the top few rather than all of them, or when items keep arriving."
                ],
                "code": "def frequency_sort(s):\n    return \"\".join(ch * freq for ch, freq in Counter(s).most_common())",
                "best": true,
                "tag": "what to write"
              }
            ],
            "tests": "def same_shape(got, s):\n    return Counter(got) == Counter(s) and \"\".join(\n        sorted(got, key=lambda c: -Counter(s)[c])) is not None\n\n\nout = frequency_sort(\"tree\")\nassert out in (\"eert\", \"eetr\") and Counter(out) == Counter(\"tree\")\nout = frequency_sort(\"cccaaa\")\nassert out in (\"cccaaa\", \"aaaccc\")\nassert frequency_sort(\"Aabb\") in (\"bbAa\", \"bbaA\")\nassert frequency_sort(\"\") == \"\"\nassert frequency_sort(\"a\") == \"a\"\ncounts = Counter(frequency_sort(\"mississippi\"))\nassert counts == Counter(\"mississippi\")\nrun = frequency_sort(\"mississippi\")\nfreqs = [Counter(\"mississippi\")[c] for c in run]\nassert freqs == sorted(freqs, reverse=True)",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          }
        ]
      },
      {
        "id": "k-way-merge",
        "title": "k-way merge",
        "problems": [
          {
            "id": "sort-nearly-sorted",
            "num": 24,
            "lc": null,
            "slug": "",
            "url": "",
            "premium": false,
            "name": "Sort a Nearly Sorted (K-Sorted) Array",
            "difficulty": "medium",
            "tags": [
              "Heap (Priority Queue)",
              "Array",
              "Sorting"
            ],
            "statement": [
              "You are given an array where every element is at most <code>k</code> positions away from where it would be in sorted order. Sort it.",
              "This is a classic that is not on LeetCode but shows up in interviews and on GeeksforGeeks. It is the cleanest illustration of a <em>sliding</em> heap: the heap is never bigger than the disorder in the data."
            ],
            "examples": [
              {
                "input": "nums = [6, 5, 3, 2, 8, 10, 9], k = 3",
                "output": "[2, 3, 5, 6, 8, 9, 10]"
              },
              {
                "input": "nums = [10, 9, 8, 7, 4, 70, 60, 50], k = 4",
                "output": "[4, 7, 8, 9, 10, 50, 60, 70]"
              }
            ],
            "constraints": [
              "<code>0 &lt;= k &lt; len(nums)</code>",
              "Every element is at most <code>k</code> positions from its sorted position"
            ],
            "note": "",
            "pitfall": "Sizing the heap at k instead of k+1. An element k positions out of place needs k+1 candidates in view.",
            "approaches": [
              {
                "name": "Sliding min-heap of size k+1",
                "time": "O(n log k)",
                "space": "O(k)",
                "why": [
                  "Hold the next <code>k + 1</code> elements in a min-heap. The smallest remaining value must be among them &mdash; it cannot be further than k positions away &mdash; so popping the root gives the next value in sorted order.",
                  "Each element is pushed once and popped once from a heap of size k+1, so <strong>O(n log k)</strong>. When k is small relative to n this beats a full O(n log n) sort, and it uses O(k) space instead of O(n).",
                  "The invariant is the whole proof: <em>after processing index i, the heap contains every candidate for output position i.</em> The k-sorted guarantee is what makes that true; without it the algorithm is simply wrong."
                ],
                "code": "def sort_k_sorted(nums, k):\n    heap = nums[:k + 1]\n    heapq.heapify(heap)\n\n    out = []\n    for i in range(k + 1, len(nums)):\n        out.append(heapq.heappushpop(heap, nums[i]))\n    while heap:\n        out.append(heapq.heappop(heap))\n    return out",
                "best": true,
                "tag": ""
              },
              {
                "name": "Just sort it",
                "time": "O(n log n)",
                "space": "O(n)",
                "why": [
                  "<code>sorted(nums)</code> ignores the k-sorted guarantee entirely and is correct. Timsort even exploits existing runs, so on nearly-sorted data it often runs close to linear in practice.",
                  "The heap version still wins on <em>space</em> &mdash; O(k) versus O(n) &mdash; which is the real argument when the array is a stream you cannot hold in memory."
                ],
                "code": "def sort_k_sorted(nums, k):\n    return sorted(nums)",
                "best": false,
                "tag": "baseline"
              }
            ],
            "tests": "assert sort_k_sorted([6, 5, 3, 2, 8, 10, 9], 3) == [2, 3, 5, 6, 8, 9, 10]\nassert sort_k_sorted([10, 9, 8, 7, 4, 70, 60, 50], 4) == [4, 7, 8, 9, 10, 50, 60, 70]\nassert sort_k_sorted([1], 0) == [1]\nassert sort_k_sorted([2, 1], 1) == [1, 2]\nimport random\nrandom.seed(3)\nfor _ in range(40):\n    k = random.randint(0, 4)\n    base = sorted(random.randint(0, 50) for _ in range(random.randint(1, 25)))\n    # Shuffling disjoint blocks of k+1 keeps every element within k of its\n    # sorted position, which is exactly the precondition the algorithm needs.\n    data = []\n    for start in range(0, len(base), k + 1):\n        block = base[start:start + k + 1]\n        random.shuffle(block)\n        data.extend(block)\n    assert sort_k_sorted(data, k) == base",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "merge-k-sorted-arrays",
            "num": 25,
            "lc": null,
            "slug": "",
            "url": "",
            "premium": false,
            "name": "Merge k Sorted Arrays",
            "difficulty": "medium",
            "tags": [
              "Heap (Priority Queue)",
              "Array",
              "Merge Sort"
            ],
            "statement": [
              "Given <code>k</code> sorted arrays, merge them into one sorted array.",
              "The array form of the next problem. Worth doing first because the pointer bookkeeping is visible &mdash; you push <code>(value, which array, which index)</code> and advance one cursor at a time."
            ],
            "examples": [
              {
                "input": "arrays = [[1, 4, 5], [1, 3, 4], [2, 6]]",
                "output": "[1, 1, 2, 3, 4, 4, 5, 6]"
              }
            ],
            "constraints": [
              "<code>0 &lt;= k</code>, each array sorted ascending",
              "Let <code>N</code> be the total number of elements across all arrays"
            ],
            "note": "",
            "pitfall": "",
            "approaches": [
              {
                "name": "Min-heap of one cursor per array",
                "time": "O(N log k)",
                "space": "O(k)",
                "why": [
                  "Seed the heap with the first element of each array. Pop the global minimum, emit it, and push the next element from whichever array it came from. The heap holds at most one entry per array, so its size is k.",
                  "Every one of the N elements is pushed and popped exactly once at O(log k), giving <strong>O(N log k)</strong>. Concatenating and sorting is O(N log N), and since k &le; N this is never worse and is much better when k is small.",
                  "The tuple carries the array index so you know which cursor to advance; the element index says where. Tie-breaking on those integers is harmless because they are unique.",
                  "<code>heapq.merge</code> does exactly this and returns a lazy iterator, which is the version to use in real code."
                ],
                "code": "def merge_k_arrays(arrays):\n    heap = [(a[0], i, 0) for i, a in enumerate(arrays) if a]\n    heapq.heapify(heap)\n\n    out = []\n    while heap:\n        value, which, idx = heapq.heappop(heap)\n        out.append(value)\n        if idx + 1 < len(arrays[which]):\n            heapq.heappush(heap, (arrays[which][idx + 1], which, idx + 1))\n    return out",
                "best": true,
                "tag": ""
              },
              {
                "name": "Concatenate and sort",
                "time": "O(N log N)",
                "space": "O(N)",
                "why": [
                  "Throws away the fact that the inputs are already sorted. Fine for small k, and Timsort's run detection recovers some of the loss, but it is asymptotically worse and needs all N elements in memory at once."
                ],
                "code": "def merge_k_arrays(arrays):\n    out = []\n    for a in arrays:\n        out.extend(a)\n    return sorted(out)",
                "best": false,
                "tag": "baseline"
              }
            ],
            "tests": "assert merge_k_arrays([[1, 4, 5], [1, 3, 4], [2, 6]]) == [1, 1, 2, 3, 4, 4, 5, 6]\nassert merge_k_arrays([]) == []\nassert merge_k_arrays([[]]) == []\nassert merge_k_arrays([[], [1], []]) == [1]\nassert merge_k_arrays([[1, 2, 3]]) == [1, 2, 3]\nimport random\nrandom.seed(5)\nfor _ in range(40):\n    arrays = [sorted(random.randint(0, 30) for _ in range(random.randint(0, 6)))\n              for _ in range(random.randint(0, 5))]\n    expected = sorted(v for a in arrays for v in a)\n    assert merge_k_arrays(arrays) == expected",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "merge-k-sorted-lists",
            "num": 26,
            "lc": 23,
            "slug": "merge-k-sorted-lists",
            "url": "https://leetcode.com/problems/merge-k-sorted-lists/",
            "premium": false,
            "name": "Merge k Sorted Lists",
            "difficulty": "hard",
            "tags": [
              "Linked List",
              "Divide and Conquer",
              "Heap (Priority Queue)",
              "Merge Sort",
              "Tournament Sort"
            ],
            "statement": [
              "You are given an array of <code>k</code> linked-lists <code>lists</code>, each linked-list is sorted in ascending order.",
              "<em>Merge all the linked-lists into one sorted linked-list and return it.</em>"
            ],
            "examples": [
              {
                "input": "lists = [[1,4,5],[1,3,4],[2,6]] Output: [1,1,2,3,4,4,5,6] Explanation: The linked-lists are: [ 1->4->5, 1->3->4, 2->6 ] merging them into one sorted linked list: 1->1->2->3->4->4->5->6",
                "output": "[1,1,2,3,4,4,5,6] Explanation: The linked-lists are: [ 1->4->5, 1->3->4, 2->6 ] merging them into one sorted linked list: 1->1->2->3->4->4->5->6",
                "explanation": "The linked-lists are: [ 1->4->5, 1->3->4, 2->6 ] merging them into one sorted linked list: 1->1->2->3->4->4->5->6"
              },
              {
                "input": "lists = [] Output: []",
                "output": "[]"
              },
              {
                "input": "lists = [[]] Output: []",
                "output": "[]"
              }
            ],
            "constraints": [
              "<code>k == lists.length</code>",
              "<code>0 &lt;= k &lt;= 10<sup>4</sup></code>",
              "<code>0 &lt;= lists[i].length &lt;= 500</code>",
              "<code>-10<sup>4</sup> &lt;= lists[i][j] &lt;= 10<sup>4</sup></code>",
              "<code>lists[i]</code> is sorted in <strong>ascending order</strong>.",
              "The sum of <code>lists[i].length</code> will not exceed <code>10<sup>4</sup></code>."
            ],
            "note": "",
            "pitfall": "Pushing the node itself into the heap. Equal values then force a comparison of two <code>ListNode</code> objects and raise <code>TypeError</code> &mdash; and only on inputs with duplicates, so it passes the sample tests.",
            "approaches": [
              {
                "name": "Min-heap of list heads",
                "time": "O(N log k)",
                "space": "O(k)",
                "why": [
                  "The previous problem with pointers instead of indices. Seed the heap with every list's head, pop the smallest, append it to the result, and push that node's successor.",
                  "N nodes, each pushed and popped once from a heap of size &le; k: <strong>O(N log k)</strong>. Space is O(k) for the heap; the output reuses the existing nodes, so no new list is allocated.",
                  "The detail that breaks this in Python: <code>ListNode</code> is not orderable, so when two nodes hold equal values the heap tries to compare the nodes themselves and raises <code>TypeError</code>. Push <code>(value, tiebreak, node)</code> with a unique integer in the middle &mdash; the index of the list &mdash; so the comparison never reaches the node.",
                  "A dummy head removes the special case for the first node appended."
                ],
                "code": "def merge_k_lists(lists):\n    heap = [(node.val, i, node) for i, node in enumerate(lists) if node]\n    heapq.heapify(heap)\n\n    dummy = tail = ListNode()\n    while heap:\n        value, i, node = heapq.heappop(heap)\n        tail.next = node\n        tail = node\n        if node.next is not None:\n            heapq.heappush(heap, (node.next.val, i, node.next))\n    tail.next = None\n    return dummy.next",
                "best": true,
                "tag": ""
              },
              {
                "name": "Merge pairwise, halving each round",
                "time": "O(N log k)",
                "space": "O(1)",
                "why": [
                  "Merge lists 1&amp;2, 3&amp;4, and so on, halving the number of lists each round until one remains. Same bound as the heap, reached differently.",
                  "Each round touches all N nodes and there are log k rounds, so O(N log k). Space is <strong>O(1)</strong> &mdash; better than the heap's O(k) &mdash; because iterative two-way merging needs no auxiliary structure.",
                  "Merging them one at a time instead (list 1 with 2, then with 3, &hellip;) is the trap: the accumulated list is re-walked every round, giving O(N k)."
                ],
                "code": "def merge_k_lists(lists):\n    lists = [node for node in lists if node]\n    if not lists:\n        return None\n    while len(lists) > 1:\n        merged = []\n        for i in range(0, len(lists), 2):\n            if i + 1 < len(lists):\n                merged.append(merge_two(lists[i], lists[i + 1]))\n            else:\n                merged.append(lists[i])\n        lists = merged\n    return lists[0]\n\n\ndef merge_two(a, b):\n    dummy = tail = ListNode()\n    while a and b:\n        if a.val <= b.val:\n            tail.next, a = a, a.next\n        else:\n            tail.next, b = b, b.next\n        tail = tail.next\n    tail.next = a or b\n    return dummy.next",
                "best": false,
                "tag": "no heap"
              }
            ],
            "tests": "got = merge_k_lists([build_list([1, 4, 5]), build_list([1, 3, 4]), build_list([2, 6])])\nassert list_vals(got) == [1, 1, 2, 3, 4, 4, 5, 6]\nassert merge_k_lists([]) is None\nassert merge_k_lists([None]) is None\nassert list_vals(merge_k_lists([build_list([1])])) == [1]\n# equal values must not make the heap compare ListNodes\nassert list_vals(merge_k_lists([build_list([2, 2]), build_list([2, 2])])) == [2, 2, 2, 2]\nimport random\nrandom.seed(7)\nfor _ in range(30):\n    arrays = [sorted(random.randint(0, 10) for _ in range(random.randint(0, 5)))\n              for _ in range(random.randint(0, 4))]\n    nodes = [build_list(a) for a in arrays]\n    expected = sorted(v for a in arrays for v in a)\n    assert list_vals(merge_k_lists(nodes)) == expected",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "smallest-range-k-lists",
            "num": 27,
            "lc": 632,
            "slug": "smallest-range-covering-elements-from-k-lists",
            "url": "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/",
            "premium": false,
            "name": "Smallest Range Covering Elements from K Lists",
            "difficulty": "hard",
            "tags": [
              "Array",
              "Hash Table",
              "Greedy",
              "Sliding Window",
              "Sorting",
              "Heap (Priority Queue)"
            ],
            "statement": [
              "You have <code>k</code> lists of sorted integers in <strong>non-decreasing order</strong>. Find the <b>smallest</b> range that includes at least one number from each of the <code>k</code> lists.",
              "We define the range <code>[a, b]</code> is smaller than range <code>[c, d]</code> if <code>b - a &lt; d - c</code> <strong>or</strong> <code>a &lt; c</code> if <code>b - a == d - c</code>."
            ],
            "examples": [
              {
                "input": "nums = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]] Output: [20,24]",
                "output": "[20,24]",
                "explanation": "List 1: [4, 10, 15, 24,26], 24 is in range [20,24]. List 2: [0, 9, 12, 20], 20 is in range [20,24]. List 3: [5, 18, 22, 30], 22 is in range [20,24]."
              },
              {
                "input": "nums = [[1,2,3],[1,2,3],[1,2,3]] Output: [1,1]",
                "output": "[1,1]"
              }
            ],
            "constraints": [
              "<code>nums.length == k</code>",
              "<code>1 &lt;= k &lt;= 3500</code>",
              "<code>1 &lt;= nums[i].length &lt;= 50</code>",
              "<code>-10<sup>5</sup> &lt;= nums[i][j] &lt;= 10<sup>5</sup></code>",
              "<code>nums[i]</code> is sorted in <strong>non-decreasing</strong> order."
            ],
            "note": "",
            "pitfall": "Continuing after a list is exhausted. Once one list has no values left, no range can cover all k lists, so you must stop rather than keep improving.",
            "approaches": [
              {
                "name": "k-way merge tracking the window",
                "time": "O(N log k)",
                "space": "O(k)",
                "why": [
                  "Run the k-way merge, but keep one cursor per list <em>alive at all times</em>. The heap's root is the smallest current value and you track the largest separately, so <code>[root, largest]</code> is always a range containing at least one element from every list.",
                  "Each pop advances exactly one cursor, which is the only way to shrink the window from the left. Record the range whenever it improves, and stop the moment any list runs out &mdash; from then on no valid range exists.",
                  "N total elements, each pushed and popped once from a size-k heap: <strong>O(N log k)</strong>, O(k) space.",
                  "Why tracking the maximum is cheap: values only ever get replaced by a <em>larger</em> one from the same list, since each list is sorted. So the running maximum only increases and needs no second heap."
                ],
                "code": "def smallest_range(nums):\n    heap = [(row[0], i, 0) for i, row in enumerate(nums)]\n    heapq.heapify(heap)\n    largest = max(row[0] for row in nums)\n\n    best = (heap[0][0], largest)\n    while True:\n        value, which, idx = heapq.heappop(heap)\n        if largest - value < best[1] - best[0]:\n            best = (value, largest)\n        if idx + 1 == len(nums[which]):\n            return list(best)              # this list is exhausted\n        nxt = nums[which][idx + 1]\n        largest = max(largest, nxt)\n        heapq.heappush(heap, (nxt, which, idx + 1))",
                "best": true,
                "tag": ""
              }
            ],
            "tests": "assert smallest_range([[4, 10, 15, 24, 26], [0, 9, 12, 20], [5, 18, 22, 30]]) == [20, 24]\nassert smallest_range([[1, 2, 3], [1, 2, 3], [1, 2, 3]]) == [1, 1]\nassert smallest_range([[1], [2], [3]]) == [1, 3]\nassert smallest_range([[10], [11]]) == [10, 11]\nassert smallest_range([[1, 2, 3]]) == [1, 1]",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "kth-smallest-in-sorted-matrix",
            "num": 28,
            "lc": 378,
            "slug": "kth-smallest-element-in-a-sorted-matrix",
            "url": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
            "premium": false,
            "name": "Kth Smallest Element in a Sorted Matrix",
            "difficulty": "medium",
            "tags": [
              "Array",
              "Binary Search",
              "Sorting",
              "Heap (Priority Queue)",
              "Matrix"
            ],
            "statement": [
              "Given an <code>n x n</code> <code>matrix</code> where each of the rows and columns is sorted in ascending order, return <em>the</em> <code>k<sup>th</sup></code> <em>smallest element in the matrix</em>.",
              "Note that it is the <code>k<sup>th</sup></code> smallest element <strong>in the sorted order</strong>, not the <code>k<sup>th</sup></code> <strong>distinct</strong> element.",
              "You must find a solution with a memory complexity better than <code>O(n<sup>2</sup>)</code>."
            ],
            "examples": [
              {
                "input": "matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8 Output: 13 Explanation: The elements in the matrix are [1,5,9,10,11,12,13,13,15], and the 8th smallest number is 13",
                "output": "13 Explanation: The elements in the matrix are [1,5,9,10,11,12,13,13,15], and the 8th smallest number is 13",
                "explanation": "The elements in the matrix are [1,5,9,10,11,12,13,13,15], and the 8th smallest number is 13"
              },
              {
                "input": "matrix = [[-5]], k = 1 Output: -5",
                "output": "-5"
              }
            ],
            "constraints": [
              "<code>n == matrix.length == matrix[i].length</code>",
              "<code>1 &lt;= n &lt;= 300</code>",
              "<code>-10<sup>9</sup> &lt;= matrix[i][j] &lt;= 10<sup>9</sup></code>",
              "All the rows and columns of <code>matrix</code> are <strong>guaranteed</strong> to be sorted in <strong>non-decreasing order</strong>.",
              "<code>1 &lt;= k &lt;= n<sup>2</sup></code>"
            ],
            "note": "",
            "pitfall": "Assuming the k-th smallest is on the diagonal, or that the matrix is sorted when read row by row. Rows and columns are each sorted; the flattened order is not.",
            "approaches": [
              {
                "name": "k-way merge over the rows",
                "time": "O(k log n)",
                "space": "O(n)",
                "why": [
                  "Each row is sorted, so this is a k-way merge over n rows. Seed the heap with the first element of each row and pop k times.",
                  "The heap never exceeds n entries and you pop k times, so <strong>O(k log n)</strong> after an O(n) build. Since k can be as large as n&sup2;, the worst case is O(n&sup2; log n).",
                  "Seeding only <code>min(k, n)</code> rows is a free improvement: the answer cannot come from a row whose first element is already beyond position k."
                ],
                "code": "def kth_smallest(matrix, k):\n    n = len(matrix)\n    heap = [(matrix[r][0], r, 0) for r in range(min(k, n))]\n    heapq.heapify(heap)\n\n    for _ in range(k - 1):\n        value, r, c = heapq.heappop(heap)\n        if c + 1 < n:\n            heapq.heappush(heap, (matrix[r][c + 1], r, c + 1))\n    return heap[0][0]",
                "best": false,
                "tag": ""
              },
              {
                "name": "Binary search on the value",
                "time": "O(n log(hi - lo))",
                "space": "O(1)",
                "why": [
                  "Do not search the matrix &mdash; search the <em>answer range</em>. For a candidate value <code>mid</code>, count how many entries are &le; mid; if that count is &lt; k the answer is larger, otherwise it is mid or smaller.",
                  "Counting is O(n) with a staircase walk: start at the bottom-left, move up when the cell is too big and right when it is not, so each of the n rows and n columns is passed at most once. No sorting, no heap.",
                  "The binary search runs over the numeric range, so it takes log(max - min) iterations &mdash; about 31 for 32-bit values. Total <strong>O(n log(hi - lo))</strong> and <strong>O(1)</strong> space, beating the heap on both when k is large.",
                  "The loop converges on a value that is actually present: the count is a step function that only jumps at real matrix values, so the smallest value with count &ge; k is in the matrix."
                ],
                "code": "def kth_smallest(matrix, k):\n    n = len(matrix)\n    lo, hi = matrix[0][0], matrix[n - 1][n - 1]\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if count_le(matrix, mid) < k:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo\n\n\ndef count_le(matrix, target):\n    \"\"\"How many entries are <= target, walking the staircase.\"\"\"\n    n = len(matrix)\n    count, r, c = 0, n - 1, 0\n    while r >= 0 and c < n:\n        if matrix[r][c] <= target:\n            count += r + 1        # whole column above is <= target too\n            c += 1\n        else:\n            r -= 1\n    return count",
                "best": true,
                "tag": "beats the heap"
              }
            ],
            "tests": "m = [[1, 5, 9], [10, 11, 13], [12, 13, 15]]\nassert kth_smallest(m, 8) == 13\nassert kth_smallest(m, 1) == 1\nassert kth_smallest(m, 9) == 15\nassert kth_smallest([[-5]], 1) == -5\nassert kth_smallest([[1, 2], [1, 3]], 2) == 1\nassert kth_smallest([[1, 2], [1, 3]], 4) == 3\nimport random\nrandom.seed(11)\nfor _ in range(25):\n    n = random.randint(1, 6)\n    rows = [sorted(random.randint(-10, 10) for _ in range(n)) for _ in range(n)]\n    for c in range(n):                       # make columns sorted too\n        col = sorted(rows[r][c] for r in range(n))\n        for r in range(n):\n            rows[r][c] = col[r]\n    flat = sorted(v for row in rows for v in row)\n    k = random.randint(1, n * n)\n    assert kth_smallest(rows, k) == flat[k - 1]",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          }
        ]
      },
      {
        "id": "greedy-heaps",
        "title": "Greedy choices driven by a heap",
        "problems": [
          {
            "id": "kth-smallest-matrix-row-sums",
            "num": 29,
            "lc": 1439,
            "slug": "find-the-kth-smallest-sum-of-a-matrix-with-sorted-rows",
            "url": "https://leetcode.com/problems/find-the-kth-smallest-sum-of-a-matrix-with-sorted-rows/",
            "premium": false,
            "name": "Find the Kth Smallest Sum of a Matrix With Sorted Rows",
            "difficulty": "hard",
            "tags": [
              "Array",
              "Binary Search",
              "Heap (Priority Queue)",
              "Matrix"
            ],
            "statement": [
              "You are given an <code>m x n</code> matrix <code>mat</code> that has its rows sorted in non-decreasing order and an integer <code>k</code>.",
              "You are allowed to choose <strong>exactly one element</strong> from each row to form an array.",
              "Return <em>the </em><code>k<sup>th</sup></code><em> smallest array sum among all possible arrays</em>."
            ],
            "examples": [
              {
                "input": "mat = [[1,3,11],[2,4,6]], k = 5 Output: 7 Explanation: Choosing one element from each row, the first k smallest sum are: [1,2], [1,4], [3,2], [3,4], [1,6]. Where the 5th sum is 7.",
                "output": "7 Explanation: Choosing one element from each row, the first k smallest sum are: [1,2], [1,4], [3,2], [3,4], [1,6]. Where the 5th sum is 7.",
                "explanation": "Choosing one element from each row, the first k smallest sum are: [1,2], [1,4], [3,2], [3,4], [1,6]. Where the 5th sum is 7."
              },
              {
                "input": "mat = [[1,3,11],[2,4,6]], k = 9 Output: 17",
                "output": "17"
              },
              {
                "input": "mat = [[1,10,10],[1,4,5],[2,3,6]], k = 7 Output: 9 Explanation: Choosing one element from each row, the first k smallest sum are: [1,1,2], [1,1,3], [1,4,2], [1,4,3], [1,1,6], [1,5,2], [1,5,3]. Where the 7th sum is 9.",
                "output": "9 Explanation: Choosing one element from each row, the first k smallest sum are: [1,1,2], [1,1,3], [1,4,2], [1,4,3], [1,1,6], [1,5,2], [1,5,3]. Where the 7th sum is 9.",
                "explanation": "Choosing one element from each row, the first k smallest sum are: [1,1,2], [1,1,3], [1,4,2], [1,4,3], [1,1,6], [1,5,2], [1,5,3]. Where the 7th sum is 9."
              }
            ],
            "constraints": [
              "<code>m == mat.length</code>",
              "<code>n == mat.length[i]</code>",
              "<code>1 &lt;= m, n &lt;= 40</code>",
              "<code>1 &lt;= mat[i][j] &lt;= 5000</code>",
              "<code>1 &lt;= k &lt;= min(200, n<sup>m</sup>)</code>",
              "<code>mat[i]</code> is a non-decreasing array."
            ],
            "note": "",
            "pitfall": "Trying to enumerate all n<sup>m</sup> arrays. The pruning to k survivors per row is the entire problem.",
            "approaches": [
              {
                "name": "Merge one row at a time, keeping k",
                "time": "O(m &middot; k &middot; n log k)",
                "space": "O(k)",
                "why": [
                  "There are n<sup>m</sup> possible arrays, so enumerating them is hopeless. The insight is that you never need more than the <strong>k smallest sums so far</strong> &mdash; any partial sum outside that set can only grow, so it can never become the k-th smallest overall.",
                  "Fold the rows in one at a time. After processing row i you hold at most k running sums; combine each with each of the n values in the next row and keep the k smallest of those k&middot;n candidates.",
                  "<code>heapq.nsmallest(k, ...)</code> over k&middot;n candidates costs O(kn log k), repeated for m rows: <strong>O(m &middot; k &middot; n log k)</strong>, and only O(k) is held at any time. The pruning is what makes it tractable.",
                  "Because each row is sorted, you could also stop generating candidates for a row once the sum exceeds the current k-th best &mdash; a constant-factor win on top."
                ],
                "code": "def kth_smallest(mat, k):\n    sums = [0]\n    for row in mat:\n        sums = heapq.nsmallest(k, (s + v for s in sums for v in row))\n    return sums[-1]",
                "best": true,
                "tag": ""
              },
              {
                "name": "Best-first search over index tuples",
                "time": "O(k &middot; m log k)",
                "space": "O(k &middot; m)",
                "why": [
                  "Treat each candidate as a tuple of column indices, one per row. Start from all-zeros (the minimum possible sum) and repeatedly pop the smallest, pushing the m neighbours that advance exactly one row's index by one.",
                  "Popping k times, each pop pushing m successors into a heap that stays O(k&middot;m): <strong>O(k &middot; m log k)</strong>. A <code>visited</code> set is essential &mdash; the same tuple is reachable by different orders of increments, and without deduplication you both waste work and miscount the k-th pop.",
                  "This generalises to k-smallest over any monotone combination, which the row-folding version does not."
                ],
                "code": "def kth_smallest(mat, k):\n    m, n = len(mat), len(mat[0])\n    start = tuple([0] * m)\n    first = sum(row[0] for row in mat)\n    heap = [(first, start)]\n    seen = {start}\n\n    for _ in range(k - 1):\n        total, idx = heapq.heappop(heap)\n        for r in range(m):\n            if idx[r] + 1 < n:\n                nxt = idx[:r] + (idx[r] + 1,) + idx[r + 1:]\n                if nxt not in seen:\n                    seen.add(nxt)\n                    heapq.heappush(\n                        heap, (total - mat[r][idx[r]] + mat[r][idx[r] + 1], nxt))\n    return heap[0][0]",
                "best": false,
                "tag": "explicit heap"
              }
            ],
            "tests": "import itertools, random\n\nassert kth_smallest([[1, 3, 11], [2, 4, 6]], 5) == 7\nassert kth_smallest([[1, 3, 11], [2, 4, 6]], 9) == 17\nassert kth_smallest([[1, 10, 10], [1, 4, 5], [2, 3, 6]], 7) == 9\nassert kth_smallest([[1, 1, 10], [2, 2, 9]], 7) == 12\nassert kth_smallest([[5]], 1) == 5\n\nrandom.seed(13)\nfor _ in range(25):\n    m = random.randint(1, 3)\n    n = random.randint(1, 4)\n    mat = [sorted(random.randint(1, 9) for _ in range(n)) for _ in range(m)]\n    every = sorted(sum(c) for c in itertools.product(*mat))\n    k = random.randint(1, min(len(every), 8))\n    assert kth_smallest(mat, k) == every[k - 1], (mat, k)",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "connect-sticks",
            "num": 30,
            "lc": 1167,
            "slug": "minimum-cost-to-connect-sticks",
            "url": "https://leetcode.com/problems/minimum-cost-to-connect-sticks/",
            "premium": true,
            "name": "Minimum Cost to Connect Sticks",
            "difficulty": "medium",
            "tags": [
              "Array",
              "Greedy",
              "Heap (Priority Queue)"
            ],
            "statement": [
              "You have sticks with positive integer lengths. You can connect any two sticks of lengths <code>x</code> and <code>y</code> into one stick of length <code>x + y</code>, at a cost of <code>x + y</code>.",
              "Connect all the sticks into one and return the minimum total cost.",
              "This is Huffman coding wearing a different hat: the cost of a stick is its length multiplied by the number of merges it takes part in, so the cheapest plan merges short sticks most often."
            ],
            "examples": [
              {
                "input": "sticks = [2, 4, 3]",
                "output": "14",
                "explanation": "Join 2 and 3 for 5, then 5 and 4 for 9. Total 5 + 9 = 14."
              },
              {
                "input": "sticks = [1, 8, 3, 5]",
                "output": "30",
                "explanation": "1+3=4, 4+5=9, 9+8=17. Total 4 + 9 + 17 = 30."
              },
              {
                "input": "sticks = [5]",
                "output": "0",
                "explanation": "Already a single stick, so nothing to connect."
              }
            ],
            "constraints": [
              "<code>1 &lt;= sticks.length &lt;= 10<sup>4</sup></code>",
              "<code>1 &lt;= sticks[i] &lt;= 10<sup>4</sup></code>"
            ],
            "note": "LeetCode 1167 is a <strong>premium</strong> problem, so the statement above is written here rather than fetched.",
            "pitfall": "Sorting once and summing left to right. Each merged stick must be re-inserted into the ordering, which only a heap (or a second queue) gives you.",
            "approaches": [
              {
                "name": "Always merge the two shortest",
                "time": "O(n log n)",
                "space": "O(n)",
                "why": [
                  "Heapify the lengths, then repeatedly pop the two smallest, push their sum, and add that sum to the running cost. Stop when one stick remains.",
                  "O(n) to heapify, then n-1 merges each doing two pops and a push at O(log n): <strong>O(n log n)</strong>.",
                  "Why greedy is optimal here is the part worth being able to argue. Every stick's length is paid once per merge it participates in, so the total cost is &Sigma; length &times; depth in the merge tree. Minimising that is exactly Huffman's problem, and the exchange argument applies: if a longer stick were merged deeper than a shorter one, swapping them lowers the total.",
                  "Sorting once is <em>not</em> enough. The sums you create re-enter the pool and must be re-ordered against the originals, which is precisely what the heap does cheaply."
                ],
                "code": "def connect_sticks(sticks):\n    heap = list(sticks)\n    heapq.heapify(heap)\n\n    total = 0\n    while len(heap) > 1:\n        a = heapq.heappop(heap)\n        b = heapq.heappop(heap)\n        total += a + b\n        heapq.heappush(heap, a + b)\n    return total",
                "best": true,
                "tag": ""
              }
            ],
            "tests": "assert connect_sticks([2, 4, 3]) == 14\nassert connect_sticks([1, 8, 3, 5]) == 30\nassert connect_sticks([5]) == 0\nassert connect_sticks([1, 1]) == 2\nassert connect_sticks([1, 2, 3, 4, 5]) == 33\n\nimport itertools, random\n\n\ndef brute(sticks):\n    if len(sticks) <= 1:\n        return 0\n    best = None\n    for i, j in itertools.combinations(range(len(sticks)), 2):\n        rest = [s for n, s in enumerate(sticks) if n not in (i, j)]\n        cost = sticks[i] + sticks[j] + brute(rest + [sticks[i] + sticks[j]])\n        best = cost if best is None else min(best, cost)\n    return best\n\n\nrandom.seed(17)\nfor _ in range(20):\n    data = [random.randint(1, 12) for _ in range(random.randint(1, 6))]\n    assert connect_sticks(list(data)) == brute(list(data)), data",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "task-scheduler",
            "num": 31,
            "lc": 621,
            "slug": "task-scheduler",
            "url": "https://leetcode.com/problems/task-scheduler/",
            "premium": false,
            "name": "Task Scheduler",
            "difficulty": "medium",
            "tags": [
              "Array",
              "Hash Table",
              "Greedy",
              "Sorting",
              "Heap (Priority Queue)",
              "Counting"
            ],
            "statement": [
              "You are given an array of CPU <code>tasks</code>, each labeled with a letter from A to Z, and a number <code>n</code>. Each CPU interval can be idle or allow the completion of one task. Tasks can be completed in any order, but there&#39;s a constraint: there has to be a gap of <strong>at least</strong> <code>n</code> intervals between two tasks with the same label.",
              "Return the <strong>minimum</strong> number of CPU intervals required to complete all tasks."
            ],
            "examples": [
              {
                "input": "tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 2",
                "output": "8",
                "explanation": "A possible sequence is: A -> B -> idle -> A -> B -> idle -> A -> B. After completing task A, you must wait two intervals before doing A again. The same applies to task B. In the 3rd interval, neither A nor B can be done, so you idle. By the 4th interval, you can do A again as 2 intervals have passed."
              },
              {
                "input": "tasks = [\"A\",\"C\",\"A\",\"B\",\"D\",\"B\"], n = 1",
                "output": "6",
                "explanation": "A possible sequence is: A -> B -> C -> D -> A -> B. With a cooling interval of 1, you can repeat a task after just one other task."
              },
              {
                "input": "tasks = [\"A\",\"A\",\"A\", \"B\",\"B\",\"B\"], n = 3",
                "output": "10",
                "explanation": "A possible sequence is: A -> B -> idle -> idle -> A -> B -> idle -> idle -> A -> B. There are only two types of tasks, A and B, which need to be separated by 3 intervals. This leads to idling twice between repetitions of these tasks."
              }
            ],
            "constraints": [
              "<code>1 &lt;= tasks.length &lt;= 10<sup>4</sup></code>",
              "<code>tasks[i]</code> is an uppercase English letter.",
              "<code>0 &lt;= n &lt;= 100</code>"
            ],
            "note": "",
            "pitfall": "Forgetting the <code>max(len(tasks), ...)</code>. With many distinct tasks the gaps fill up and the formula alone under-counts.",
            "approaches": [
              {
                "name": "Counting formula",
                "time": "O(n)",
                "space": "O(1)",
                "why": [
                  "Only the most frequent task matters. If it occurs <code>f</code> times it creates <code>f - 1</code> gaps, each of width <code>n + 1</code> counting the task itself, plus one final run of every task tied at that frequency.",
                  "So the answer is <code>(f - 1) &times; (n + 1) + (number of tasks with frequency f)</code> &mdash; unless there are so many distinct tasks that the gaps fill themselves, in which case no idling happens at all and the answer is simply <code>len(tasks)</code>. Taking the <code>max</code> of the two covers both.",
                  "<strong>O(n)</strong> time and O(1) space, since the counter holds at most 26 keys. This is the answer to reach for; the heap version below is the one people write first and is strictly worse."
                ],
                "code": "def least_interval(tasks, n):\n    counts = Counter(tasks)\n    most = max(counts.values())\n    tied = sum(1 for c in counts.values() if c == most)\n    return max(len(tasks), (most - 1) * (n + 1) + tied)",
                "best": true,
                "tag": "no heap needed"
              },
              {
                "name": "Max-heap with a cooldown queue",
                "time": "O(N log 26) = O(N)",
                "space": "O(1)",
                "why": [
                  "Simulate it. Keep a max-heap of remaining counts and a queue of tasks cooling down with the time they become available. Each tick, run the most frequent available task; if none is available, idle.",
                  "The heap holds at most 26 entries, so each operation is O(log 26), a constant. The loop runs once per time unit and the answer can be about n times the number of tasks, so this is O(answer) rather than O(len(tasks)) &mdash; noticeably worse when <code>n</code> is large and there are few distinct tasks.",
                  "Worth writing because it generalises: the moment tasks have different durations or priorities the closed-form breaks and the simulation still works."
                ],
                "code": "def least_interval(tasks, n):\n    heap = [-c for c in Counter(tasks).values()]\n    heapq.heapify(heap)\n\n    time = 0\n    cooling = deque()          # (ready_at, remaining_count)\n    while heap or cooling:\n        time += 1\n        if heap:\n            remaining = heapq.heappop(heap) + 1     # negative counts\n            if remaining:\n                cooling.append((time + n, remaining))\n        if cooling and cooling[0][0] == time:\n            heapq.heappush(heap, cooling.popleft()[1])\n    return time",
                "best": false,
                "tag": ""
              }
            ],
            "tests": "assert least_interval([\"A\", \"A\", \"A\", \"B\", \"B\", \"B\"], 2) == 8\nassert least_interval([\"A\", \"C\", \"A\", \"B\", \"D\", \"B\"], 1) == 6\nassert least_interval([\"A\", \"A\", \"A\", \"B\", \"B\", \"B\"], 0) == 6\nassert least_interval([\"A\"], 5) == 1\nassert least_interval([\"A\", \"A\", \"A\", \"A\", \"B\", \"C\", \"D\", \"E\"], 2) == 10\nassert least_interval(list(\"AAABBBCCC\"), 2) == 9",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "reorganize-string",
            "num": 32,
            "lc": 767,
            "slug": "reorganize-string",
            "url": "https://leetcode.com/problems/reorganize-string/",
            "premium": false,
            "name": "Reorganize String",
            "difficulty": "medium",
            "tags": [
              "Hash Table",
              "String",
              "Greedy",
              "Sorting",
              "Heap (Priority Queue)",
              "Counting"
            ],
            "statement": [
              "Given a string <code>s</code>, rearrange the characters of <code>s</code> so that any two adjacent characters are not the same.",
              "Return <em>any possible rearrangement of</em> <code>s</code> <em>or return</em> <code>&quot;&quot;</code> <em>if not possible</em>."
            ],
            "examples": [
              {
                "input": "s = \"aab\" Output: \"aba\"",
                "output": "\"aba\""
              },
              {
                "input": "s = \"aaab\" Output: \"\"",
                "output": "\"\""
              }
            ],
            "constraints": [
              "<code>1 &lt;= s.length &lt;= 500</code>",
              "<code>s</code> consists of lowercase English letters."
            ],
            "note": "",
            "pitfall": "Popping one character at a time and pushing it straight back. It is immediately the most frequent again, so you emit it twice in a row.",
            "approaches": [
              {
                "name": "Max-heap, always take two",
                "time": "O(n log 26) = O(n)",
                "space": "O(n)",
                "why": [
                  "Pop the two most frequent remaining characters, append both, decrement each, and push back whatever is left. Taking <em>two</em> at a time guarantees you never place the same character twice in a row.",
                  "The heap holds at most 26 entries so each operation is constant; the loop runs O(n) times. Space is the output.",
                  "It is impossible exactly when one character occurs more than <code>(n + 1) // 2</code> times &mdash; there are not enough slots to separate them. Checking that up front is cheaper than discovering it mid-loop."
                ],
                "code": "def reorganize_string(s):\n    counts = Counter(s)\n    if max(counts.values()) > (len(s) + 1) // 2:\n        return \"\"\n\n    heap = [(-c, ch) for ch, c in counts.items()]\n    heapq.heapify(heap)\n\n    out = []\n    while len(heap) > 1:\n        c1, ch1 = heapq.heappop(heap)\n        c2, ch2 = heapq.heappop(heap)\n        out.append(ch1)\n        out.append(ch2)\n        if c1 + 1:\n            heapq.heappush(heap, (c1 + 1, ch1))\n        if c2 + 1:\n            heapq.heappush(heap, (c2 + 1, ch2))\n    if heap:\n        out.append(heap[0][1])\n    return \"\".join(out)",
                "best": false,
                "tag": ""
              },
              {
                "name": "Fill even slots, then odd",
                "time": "O(n log 26) = O(n)",
                "space": "O(n)",
                "why": [
                  "Place the most frequent character first into positions 0, 2, 4, &hellip;; when you run off the end, continue at 1, 3, 5, &hellip;. Then place every other character the same way, continuing from where the last one stopped.",
                  "Two characters end up adjacent only if one occupies both an even index and the odd index next to it, which requires more than <code>(n+1)//2</code> copies &mdash; the case already rejected. So the construction is correct by the same counting argument.",
                  "Same O(n) bound with a much smaller constant and no heap at all: one sort of at most 26 counts, then a single pass. This is the version to write."
                ],
                "code": "def reorganize_string(s):\n    counts = Counter(s)\n    if max(counts.values()) > (len(s) + 1) // 2:\n        return \"\"\n\n    out = [\"\"] * len(s)\n    i = 0\n    for ch, freq in counts.most_common():       # most frequent first\n        for _ in range(freq):\n            if i >= len(s):\n                i = 1                           # switch to the odd slots\n            out[i] = ch\n            i += 2\n    return \"\".join(out)",
                "best": true,
                "tag": "no heap"
              }
            ],
            "tests": "def ok(s, out):\n    if not out:\n        return True\n    return (Counter(out) == Counter(s)\n            and all(a != b for a, b in zip(out, out[1:])))\n\n\nfor case in (\"aab\", \"aaab\", \"vvvlo\", \"a\", \"ab\", \"aaabbb\", \"abbabbaab\"):\n    got = reorganize_string(case)\n    impossible = max(Counter(case).values()) > (len(case) + 1) // 2\n    assert (got == \"\") == impossible, (case, got)\n    assert ok(case, got), (case, got)\n\nassert reorganize_string(\"aaab\") == \"\"\nassert reorganize_string(\"aab\") in (\"aba\",)\n\nimport random\nrandom.seed(19)\nfor _ in range(60):\n    case = \"\".join(random.choice(\"abc\") for _ in range(random.randint(1, 12)))\n    got = reorganize_string(case)\n    impossible = max(Counter(case).values()) > (len(case) + 1) // 2\n    assert (got == \"\") == impossible, (case, got)\n    assert ok(case, got), (case, got)",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "ipo",
            "num": 33,
            "lc": 502,
            "slug": "ipo",
            "url": "https://leetcode.com/problems/ipo/",
            "premium": false,
            "name": "IPO",
            "difficulty": "hard",
            "tags": [
              "Array",
              "Greedy",
              "Sorting",
              "Heap (Priority Queue)"
            ],
            "statement": [
              "Suppose LeetCode will start its <strong>IPO</strong> soon. In order to sell a good price of its shares to Venture Capital, LeetCode would like to work on some projects to increase its capital before the <strong>IPO</strong>. Since it has limited resources, it can only finish at most <code>k</code> distinct projects before the <strong>IPO</strong>. Help LeetCode design the best way to maximize its total capital after finishing at most <code>k</code> distinct projects.",
              "You are given <code>n</code> projects where the <code>i<sup>th</sup></code> project has a pure profit <code>profits[i]</code> and a minimum capital of <code>capital[i]</code> is needed to start it.",
              "Initially, you have <code>w</code> capital. When you finish a project, you will obtain its pure profit and the profit will be added to your total capital.",
              "Pick a list of <strong>at most</strong> <code>k</code> distinct projects from given projects to <strong>maximize your final capital</strong>, and return <em>the final maximized capital</em>.",
              "The answer is guaranteed to fit in a 32-bit signed integer."
            ],
            "examples": [
              {
                "input": "k = 2, w = 0, profits = [1,2,3], capital = [0,1,1] Output: 4 Explanation: Since your initial capital is 0, you can only start the project indexed 0. After finishing it you will obtain profit 1 and your capital becomes 1. With capital 1, you can either start the project indexed 1 or the project indexed 2. Since you can choose at most 2 projects, you need to finish the project indexed 2 to get the maximum capital. Therefore, output the final maximized capital, which is 0 + 1 + 3 = 4.",
                "output": "4 Explanation: Since your initial capital is 0, you can only start the project indexed 0. After finishing it you will obtain profit 1 and your capital becomes 1. With capital 1, you can either start the project indexed 1 or the project indexed 2. Since you can choose at most 2 projects, you need to finish the project indexed 2 to get the maximum capital. Therefore, output the final maximized capital, which is 0 + 1 + 3 = 4.",
                "explanation": "Since your initial capital is 0, you can only start the project indexed 0. After finishing it you will obtain profit 1 and your capital becomes 1. With capital 1, you can either start the project indexed 1 or the project indexed 2. Since you can choose at most 2 projects, you need to finish the project indexed 2 to get the maximum capital. Therefore, output the final maximized capital, which is 0 + 1 + 3 = 4."
              },
              {
                "input": "k = 3, w = 0, profits = [1,2,3], capital = [0,1,2] Output: 6",
                "output": "6"
              }
            ],
            "constraints": [
              "<code>1 &lt;= k &lt;= 10<sup>5</sup></code>",
              "<code>0 &lt;= w &lt;= 10<sup>9</sup></code>",
              "<code>n == profits.length</code>",
              "<code>n == capital.length</code>",
              "<code>1 &lt;= n &lt;= 10<sup>5</sup></code>",
              "<code>0 &lt;= profits[i] &lt;= 10<sup>4</sup></code>",
              "<code>0 &lt;= capital[i] &lt;= 10<sup>9</sup></code>"
            ],
            "note": "",
            "pitfall": "Re-scanning all projects on every round. The capital pointer only moves forward, so each project is released into the heap once.",
            "approaches": [
              {
                "name": "Two heaps: affordable by capital, best by profit",
                "time": "O(n log n)",
                "space": "O(n)",
                "why": [
                  "Sort the projects by capital required. Keep a pointer that releases every project you can now afford into a <em>max</em>-heap keyed on profit, then take the best one. Repeat k times.",
                  "The greedy choice is safe because profits are non-negative: taking the most profitable affordable project can only increase your capital, which can only widen the set of affordable projects later. Nothing is foreclosed.",
                  "Sorting is O(n log n); each project enters the profit heap at most once across the whole run, so the heap work is also O(n log n) &mdash; not O(k n). The pointer never rewinds, which is what keeps it linear in pushes.",
                  "Break early when the profit heap is empty: no project is affordable and no further capital can arrive."
                ],
                "code": "def find_maximized_capital(k, w, profits, capital):\n    projects = sorted(zip(capital, profits))\n    affordable = []                 # max-heap of profits, negated\n    i = 0\n\n    for _ in range(k):\n        while i < len(projects) and projects[i][0] <= w:\n            heapq.heappush(affordable, -projects[i][1])\n            i += 1\n        if not affordable:\n            break                   # nothing reachable, capital cannot grow\n        w -= heapq.heappop(affordable)\n    return w",
                "best": true,
                "tag": ""
              }
            ],
            "tests": "assert find_maximized_capital(2, 0, [1, 2, 3], [0, 1, 1]) == 4\nassert find_maximized_capital(3, 0, [1, 2, 3], [0, 1, 2]) == 6\nassert find_maximized_capital(1, 0, [1, 2, 3], [1, 1, 2]) == 0\nassert find_maximized_capital(1, 2, [1, 2, 3], [1, 1, 2]) == 5\nassert find_maximized_capital(10, 0, [1], [0]) == 1\nassert find_maximized_capital(0, 5, [1, 2], [0, 0]) == 5",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          }
        ]
      },
      {
        "id": "intervals",
        "title": "Intervals and reachability",
        "problems": [
          {
            "id": "meeting-rooms",
            "num": 34,
            "lc": 252,
            "slug": "meeting-rooms",
            "url": "https://leetcode.com/problems/meeting-rooms/",
            "premium": true,
            "name": "Meeting Rooms",
            "difficulty": "easy",
            "tags": [
              "Array",
              "Sorting",
              "Quicksort"
            ],
            "statement": [
              "Given an array of meeting time intervals <code>[start, end]</code>, determine whether a person could attend all of them.",
              "The baseline for the next problem: no heap, just the observation that sorting by start time turns \"does any pair overlap?\" into \"does any <em>adjacent</em> pair overlap?\"."
            ],
            "examples": [
              {
                "input": "intervals = [[0,30],[5,10],[15,20]]",
                "output": "false",
                "explanation": "[0,30] overlaps [5,10]."
              },
              {
                "input": "intervals = [[7,10],[2,4]]",
                "output": "true",
                "explanation": "Sorted they are [2,4] and [7,10], which do not overlap."
              }
            ],
            "constraints": [
              "<code>0 &lt;= intervals.length &lt;= 10<sup>4</sup></code>",
              "<code>intervals[i].length == 2</code>",
              "<code>0 &lt;= start<sub>i</sub> &lt; end<sub>i</sub> &lt;= 10<sup>6</sup></code>"
            ],
            "note": "LeetCode 252 is a <strong>premium</strong> problem, so the statement above is written here rather than fetched.",
            "pitfall": "",
            "approaches": [
              {
                "name": "Sort by start, compare neighbours",
                "time": "O(n log n)",
                "space": "O(1)",
                "why": [
                  "After sorting by start time, if any two meetings overlap then some <em>adjacent</em> pair does. So one linear scan comparing each start against the previous end settles it.",
                  "The proof is short and worth being able to give: if meeting i overlaps meeting j with i &lt; j, then <code>start[j] &lt; end[i]</code>, and since starts are sorted every meeting between them also starts before <code>end[i]</code> &mdash; so the pair at i and i+1 already overlaps.",
                  "O(n log n) dominated by the sort; the scan is O(n) and O(1) extra space.",
                  "Touching endpoints do not conflict: a meeting ending at 10 and one starting at 10 are fine, so the comparison is strict."
                ],
                "code": "def can_attend_meetings(intervals):\n    intervals.sort()\n    for i in range(1, len(intervals)):\n        if intervals[i][0] < intervals[i - 1][1]:\n            return False\n    return True",
                "best": true,
                "tag": ""
              }
            ],
            "tests": "assert can_attend_meetings([[0, 30], [5, 10], [15, 20]]) is False\nassert can_attend_meetings([[7, 10], [2, 4]]) is True\nassert can_attend_meetings([]) is True\nassert can_attend_meetings([[1, 5]]) is True\nassert can_attend_meetings([[1, 5], [5, 9]]) is True     # touching is fine\nassert can_attend_meetings([[1, 5], [4, 9]]) is False",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "meeting-rooms-ii",
            "num": 35,
            "lc": 253,
            "slug": "meeting-rooms-ii",
            "url": "https://leetcode.com/problems/meeting-rooms-ii/",
            "premium": true,
            "name": "Meeting Rooms II",
            "difficulty": "medium",
            "tags": [
              "Array",
              "Two Pointers",
              "Greedy",
              "Sorting",
              "Heap (Priority Queue)",
              "Prefix Sum"
            ],
            "statement": [
              "Given an array of meeting time intervals <code>[start, end]</code>, return the minimum number of conference rooms required.",
              "The canonical min-heap interval problem. The answer is the maximum number of meetings in progress at any instant."
            ],
            "examples": [
              {
                "input": "intervals = [[0,30],[5,10],[15,20]]",
                "output": "2",
                "explanation": "[5,10] and [15,20] can share one room; [0,30] needs its own."
              },
              {
                "input": "intervals = [[7,10],[2,4]]",
                "output": "1",
                "explanation": "They do not overlap, so one room is enough."
              }
            ],
            "constraints": [
              "<code>1 &lt;= intervals.length &lt;= 10<sup>4</sup></code>",
              "<code>0 &lt;= start<sub>i</sub> &lt; end<sub>i</sub> &lt;= 10<sup>6</sup></code>"
            ],
            "note": "LeetCode 253 is a <strong>premium</strong> problem, so the statement above is written here rather than fetched.",
            "pitfall": "",
            "approaches": [
              {
                "name": "Min-heap of end times",
                "time": "O(n log n)",
                "space": "O(n)",
                "why": [
                  "Sort by start. Keep a min-heap of the end times of rooms currently in use. For each meeting, if the earliest-finishing room is already free (<code>heap[0] &lt;= start</code>) reuse it by popping; then push this meeting's end. The heap size is the number of rooms in use, and its maximum is the answer.",
                  "Only the <em>earliest</em> ending room ever needs checking: if that one is still busy, every other room is too. That is exactly what a min-heap gives in O(1), and it is why a heap beats scanning the rooms.",
                  "Sort O(n log n), then n pushes and at most n pops at O(log n): <strong>O(n log n)</strong> overall, O(n) space in the worst case where every meeting overlaps."
                ],
                "code": "def min_meeting_rooms(intervals):\n    if not intervals:\n        return 0\n    intervals.sort()\n    ends = []                       # min-heap of in-use room end times\n\n    for start, end in intervals:\n        if ends and ends[0] <= start:\n            heapq.heappop(ends)     # earliest room is free, reuse it\n        heapq.heappush(ends, end)\n    return len(ends)",
                "best": true,
                "tag": ""
              },
              {
                "name": "Sweep the endpoints",
                "time": "O(n log n)",
                "space": "O(n)",
                "why": [
                  "Separate the starts and ends into two sorted arrays and walk them together. A start before the next end means a new room; otherwise a room frees up. The running count's maximum is the answer.",
                  "Same O(n log n) from the two sorts, but with no heap and a smaller constant. It also generalises to \"maximum concurrent X\" problems where you never need to know <em>which</em> interval is which.",
                  "The heap version is preferable when you need the rooms themselves &mdash; assigning each meeting to a specific room, say &mdash; because the sweep discards that identity."
                ],
                "code": "def min_meeting_rooms(intervals):\n    starts = sorted(s for s, _ in intervals)\n    ends = sorted(e for _, e in intervals)\n\n    rooms = best = 0\n    j = 0\n    for start in starts:\n        while ends[j] <= start:\n            rooms -= 1\n            j += 1\n        rooms += 1\n        best = max(best, rooms)\n    return best",
                "best": false,
                "tag": "no heap"
              }
            ],
            "tests": "assert min_meeting_rooms([[0, 30], [5, 10], [15, 20]]) == 2\nassert min_meeting_rooms([[7, 10], [2, 4]]) == 1\nassert min_meeting_rooms([[1, 5]]) == 1\nassert min_meeting_rooms([[1, 5], [5, 9]]) == 1          # touching shares a room\nassert min_meeting_rooms([[1, 10], [2, 7], [3, 19], [8, 12], [10, 20], [11, 30]]) == 4\n\nimport random\nrandom.seed(23)\nfor _ in range(40):\n    data = []\n    for _ in range(random.randint(1, 10)):\n        s = random.randint(0, 20)\n        data.append([s, s + random.randint(1, 8)])\n    # brute force: busiest instant, checked on half-integer ticks\n    busiest = 0\n    for t in range(0, 40):\n        busiest = max(busiest, sum(1 for s, e in data if s <= t < e))\n    assert min_meeting_rooms([list(x) for x in data]) == busiest, data",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "refueling-stops",
            "num": 36,
            "lc": 871,
            "slug": "minimum-number-of-refueling-stops",
            "url": "https://leetcode.com/problems/minimum-number-of-refueling-stops/",
            "premium": false,
            "name": "Minimum Number of Refueling Stops",
            "difficulty": "hard",
            "tags": [
              "Array",
              "Dynamic Programming",
              "Greedy",
              "Heap (Priority Queue)"
            ],
            "statement": [
              "A car travels from a starting position to a destination which is <code>target</code> miles east of the starting position.",
              "There are gas stations along the way. The gas stations are represented as an array <code>stations</code> where <code>stations[i] = [position<sub>i</sub>, fuel<sub>i</sub>]</code> indicates that the <code>i<sup>th</sup></code> gas station is <code>position<sub>i</sub></code> miles east of the starting position and has <code>fuel<sub>i</sub></code> liters of gas.",
              "The car starts with an infinite tank of gas, which initially has <code>startFuel</code> liters of fuel in it. It uses one liter of gas per one mile that it drives. When the car reaches a gas station, it may stop and refuel, transferring all the gas from the station into the car.",
              "Return <em>the minimum number of refueling stops the car must make in order to reach its destination</em>. If it cannot reach the destination, return <code>-1</code>.",
              "Note that if the car reaches a gas station with <code>0</code> fuel left, the car can still refuel there. If the car reaches the destination with <code>0</code> fuel left, it is still considered to have arrived."
            ],
            "examples": [
              {
                "input": "target = 1, startFuel = 1, stations = [] Output: 0 Explanation: We can reach the target without refueling.",
                "output": "0 Explanation: We can reach the target without refueling.",
                "explanation": "We can reach the target without refueling."
              },
              {
                "input": "target = 100, startFuel = 1, stations = [[10,100]] Output: -1 Explanation: We can not reach the target (or even the first gas station).",
                "output": "-1 Explanation: We can not reach the target (or even the first gas station).",
                "explanation": "We can not reach the target (or even the first gas station)."
              },
              {
                "input": "target = 100, startFuel = 10, stations = [[10,60],[20,30],[30,30],[60,40]] Output: 2 Explanation: We start with 10 liters of fuel. We drive to position 10, expending 10 liters of fuel. We refuel from 0 liters to 60 liters of gas. Then, we drive from position 10 to position 60 (expending 50 liters of fuel), and refuel from 10 liters to 50 liters of gas. We then drive to and reach the target. We made 2 refueling stops along the way, so we return 2.",
                "output": "2 Explanation: We start with 10 liters of fuel. We drive to position 10, expending 10 liters of fuel. We refuel from 0 liters to 60 liters of gas. Then, we drive from position 10 to position 60 (expending 50 liters of fuel), and refuel from 10 liters to 50 liters of gas. We then drive to and reach the target. We made 2 refueling stops along the way, so we return 2.",
                "explanation": "We start with 10 liters of fuel. We drive to position 10, expending 10 liters of fuel. We refuel from 0 liters to 60 liters of gas. Then, we drive from position 10 to position 60 (expending 50 liters of fuel), and refuel from 10 liters to 50 liters of gas. We then drive to and reach the target. We made 2 refueling stops along the way, so we return 2."
              }
            ],
            "constraints": [
              "<code>1 &lt;= target, startFuel &lt;= 10<sup>9</sup></code>",
              "<code>0 &lt;= stations.length &lt;= 500</code>",
              "<code>1 &lt;= position<sub>i</sub> &lt; position<sub>i+1</sub> &lt; target</code>",
              "<code>1 &lt;= fuel<sub>i</sub> &lt; 10<sup>9</sup></code>"
            ],
            "note": "",
            "pitfall": "Greedily stopping at the first station that helps. You must defer the decision until you actually run out, then pick the best tank you have already driven past.",
            "approaches": [
              {
                "name": "Max-heap of fuel already driven past",
                "time": "O(n log n)",
                "space": "O(n)",
                "why": [
                  "The trick is to refuel <em>retroactively</em>. Drive as far as the fuel allows, collecting every station you pass into a max-heap without stopping. When you run short, take the largest tank you have passed and pretend you stopped there.",
                  "That is valid because the order of refuelling does not change the total fuel available at any point past those stations &mdash; only the count of stops matters, and taking the biggest tank each time minimises that count. This is a clean exchange argument: swapping any chosen station for a larger passed one never increases the stop count.",
                  "Each station is pushed once and popped at most once: <strong>O(n log n)</strong>, O(n) space. Return <code>-1</code> when the heap empties before the target is reachable."
                ],
                "code": "def min_refuel_stops(target, start_fuel, stations):\n    passed = []                    # max-heap of fuel amounts, negated\n    fuel, stops, i = start_fuel, 0, 0\n\n    while fuel < target:\n        while i < len(stations) and stations[i][0] <= fuel:\n            heapq.heappush(passed, -stations[i][1])\n            i += 1\n        if not passed:\n            return -1              # cannot reach any further station\n        fuel -= heapq.heappop(passed)\n        stops += 1\n    return stops",
                "best": true,
                "tag": ""
              }
            ],
            "tests": "assert min_refuel_stops(1, 1, []) == 0\nassert min_refuel_stops(100, 1, [[10, 100]]) == -1\nassert min_refuel_stops(100, 10, [[10, 60], [20, 30], [30, 30], [60, 40]]) == 2\nassert min_refuel_stops(1000, 299, [[13, 21], [26, 115], [100, 47], [225, 99], [299, 141], [444, 198], [608, 190], [636, 157], [647, 255], [841, 123]]) == 4\nassert min_refuel_stops(5, 5, [[1, 1]]) == 0",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          }
        ]
      },
      {
        "id": "two-heaps",
        "title": "Two heaps: keeping a running median",
        "problems": [
          {
            "id": "find-median-from-data-stream",
            "num": 37,
            "lc": 295,
            "slug": "find-median-from-data-stream",
            "url": "https://leetcode.com/problems/find-median-from-data-stream/",
            "premium": false,
            "name": "Find Median from Data Stream",
            "difficulty": "hard",
            "tags": [
              "Two Pointers",
              "Design",
              "Sorting",
              "Heap (Priority Queue)",
              "Data Stream"
            ],
            "statement": [
              "The <strong>median</strong> is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.",
              "<ul>\n <li>For example, for <code>arr = [2,3,4]</code>, the median is <code>3</code>.</li>\n <li>For example, for <code>arr = [2,3]</code>, the median is <code>(2 + 3) / 2 = 2.5</code>.</li>\n</ul>\n\nImplement the MedianFinder class:",
              "<ul>\n <li><code>MedianFinder()</code> initializes the <code>MedianFinder</code> object.</li>\n <li><code>void addNum(int num)</code> adds the integer <code>num</code> from the data stream to the data structure.</li>\n <li><code>double findMedian()</code> returns the median of all elements so far. Answers within <code>10<sup>-5</sup></code> of the actual answer will be accepted.</li>\n</ul>"
            ],
            "examples": [
              {
                "input": "[\"MedianFinder\", \"addNum\", \"addNum\", \"findMedian\", \"addNum\", \"findMedian\"] [[], [1], [2], [], [3], []]",
                "output": "[null, null, null, 1.5, null, 2.0]",
                "explanation": "MedianFinder medianFinder = new MedianFinder(); medianFinder.addNum(1); // arr = [1] medianFinder.addNum(2); // arr = [1, 2] medianFinder.findMedian(); // return 1.5 (i.e., (1 + 2) / 2) medianFinder.addNum(3); // arr[1, 2, 3] medianFinder.findMedian(); // return 2.0"
              }
            ],
            "constraints": [
              "<code>-10<sup>5</sup> &lt;= num &lt;= 10<sup>5</sup></code>",
              "There will be at least one element in the data structure before calling <code>findMedian</code>.",
              "At most <code>5 * 10<sup>4</sup></code> calls will be made to <code>addNum</code> and <code>findMedian</code>."
            ],
            "note": "",
            "pitfall": "",
            "approaches": [
              {
                "name": "Max-heap of the low half, min-heap of the high half",
                "time": "O(log n) add, O(1) find",
                "space": "O(n)",
                "why": [
                  "Split the values in two. <code>small</code> is a max-heap holding the lower half, <code>large</code> is a min-heap holding the upper half. The median is then either the top of <code>small</code> or the average of the two tops &mdash; both O(1) reads.",
                  "The invariant to state: every element of <code>small</code> is &le; every element of <code>large</code>, and their sizes differ by at most one. Maintaining it is the whole implementation.",
                  "The neat way to maintain it: always push onto <code>small</code>, immediately move its top to <code>large</code>, then move back if <code>large</code> has grown too big. Two pushes and two pops keeps you from having to reason about which side the new value belongs on.",
                  "<code>add</code> is <strong>O(log n)</strong>, <code>find</code> is <strong>O(1)</strong>. A sorted list would give O(1) find but O(n) insert; a plain list gives O(1) insert but O(n log n) find."
                ],
                "code": "class MedianFinder:\n    def __init__(self):\n        self.small = []      # max-heap (negated): the lower half\n        self.large = []      # min-heap: the upper half\n\n    def add_num(self, num):\n        heapq.heappush(self.small, -num)\n        # hand the largest of the low half up\n        heapq.heappush(self.large, -heapq.heappop(self.small))\n        # keep small the same size or one bigger\n        if len(self.large) > len(self.small):\n            heapq.heappush(self.small, -heapq.heappop(self.large))\n\n    def find_median(self):\n        if len(self.small) > len(self.large):\n            return float(-self.small[0])\n        return (-self.small[0] + self.large[0]) / 2.0",
                "best": true,
                "tag": ""
              },
              {
                "name": "Sorted list with bisect",
                "time": "O(n) add, O(1) find",
                "space": "O(n)",
                "why": [
                  "<code>bisect.insort</code> keeps one sorted list, so the median is a direct index. The binary search is O(log n) but the insertion shifts the tail, making each add O(n).",
                  "For a few thousand values this is faster in practice than the two heaps, because the memory move is a fast contiguous copy while heap operations chase pointers in Python objects. Worth saying out loud &mdash; asymptotics are not the only argument &mdash; but the heaps win as n grows."
                ],
                "code": "import bisect\n\n\nclass MedianFinder:\n    def __init__(self):\n        self.data = []\n\n    def add_num(self, num):\n        bisect.insort(self.data, num)\n\n    def find_median(self):\n        n = len(self.data)\n        mid = n // 2\n        if n % 2:\n            return float(self.data[mid])\n        return (self.data[mid - 1] + self.data[mid]) / 2.0",
                "best": false,
                "tag": ""
              }
            ],
            "tests": "mf = MedianFinder()\nmf.add_num(1)\nmf.add_num(2)\nassert mf.find_median() == 1.5\nmf.add_num(3)\nassert mf.find_median() == 2.0\n\nmf = MedianFinder()\nmf.add_num(-1)\nassert mf.find_median() == -1.0\nmf.add_num(-2)\nassert mf.find_median() == -1.5\nmf.add_num(-3)\nassert mf.find_median() == -2.0\n\nimport random, statistics\nrandom.seed(29)\nfor _ in range(30):\n    mf = MedianFinder()\n    seen = []\n    for _ in range(random.randint(1, 40)):\n        v = random.randint(-30, 30)\n        mf.add_num(v)\n        seen.append(v)\n        assert mf.find_median() == statistics.median(seen)",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          },
          {
            "id": "sliding-window-median",
            "num": 38,
            "lc": 480,
            "slug": "sliding-window-median",
            "url": "https://leetcode.com/problems/sliding-window-median/",
            "premium": false,
            "name": "Sliding Window Median",
            "difficulty": "hard",
            "tags": [
              "Array",
              "Hash Table",
              "Sliding Window",
              "Heap (Priority Queue)",
              "Treap"
            ],
            "statement": [
              "The <strong>median</strong> is the middle value in an ordered integer list. If the size of the list is even, there is no middle value. So the median is the mean of the two middle values.",
              "<ul>\n <li>For examples, if <code>arr = [2,<u>3</u>,4]</code>, the median is <code>3</code>.</li>\n <li>For examples, if <code>arr = [1,<u>2,3</u>,4]</code>, the median is <code>(2 + 3) / 2 = 2.5</code>.</li>\n</ul>\n\nYou are given an integer array <code>nums</code> and an integer <code>k</code>. There is a sliding window of size <code>k</code> which is moving from the very left of the array to the very right. You can only see the <code>k</code> numbers in the window. Each time the sliding window moves right by one position.",
              "Return <em>the median array for each window in the original array</em>. Answers within <code>10<sup>-5</sup></code> of the actual value will be accepted."
            ],
            "examples": [
              {
                "input": "nums = [1,3,-1,-3,5,3,6,7], k = 3 Output: [1.00000,-1.00000,-1.00000,3.00000,5.00000,6.00000]",
                "output": "[1.00000,-1.00000,-1.00000,3.00000,5.00000,6.00000]",
                "explanation": "Window position Median --------------- ----- [1 3 -1] -3 5 3 6 7 1 1 [3 -1 -3] 5 3 6 7 -1 1 3 [-1 -3 5] 3 6 7 -1 1 3 -1 [-3 5 3] 6 7 3 1 3 -1 -3 [5 3 6] 7 5 1 3 -1 -3 5 [3 6 7] 6"
              },
              {
                "input": "nums = [1,2,3,4,2,3,1,4,2], k = 3 Output: [2.00000,3.00000,3.00000,3.00000,2.00000,3.00000,2.00000]",
                "output": "[2.00000,3.00000,3.00000,3.00000,2.00000,3.00000,2.00000]"
              }
            ],
            "constraints": [
              "<code>1 &lt;= k &lt;= nums.length &lt;= 10<sup>5</sup></code>",
              "<code>-2<sup>31</sup> &lt;= nums[i] &lt;= 2<sup>31</sup> - 1</code>"
            ],
            "note": "",
            "pitfall": "Using <code>len(heap)</code> as the half size once lazy deletion is in play. The heaps contain values that have already logically left the window.",
            "approaches": [
              {
                "name": "Sorted window with bisect",
                "time": "O(n k)",
                "space": "O(k)",
                "why": [
                  "Keep the window as a sorted list. Each step, binary-search the outgoing value and delete it, then binary-search the incoming value and insert it. The median is two index reads.",
                  "Both <code>bisect</code> calls are O(log k), but the list operations shift elements, so each step is O(k) and the total is <strong>O(n k)</strong>.",
                  "For interview purposes this is the right first answer: it is eight lines, obviously correct, and at LeetCode's limits it passes. Offer the two-heap version as the improvement."
                ],
                "code": "import bisect\n\n\ndef median_sliding_window(nums, k):\n    window = sorted(nums[:k])\n    half, odd = k // 2, k % 2\n\n    def median():\n        if odd:\n            return float(window[half])\n        return (window[half - 1] + window[half]) / 2.0\n\n    out = [median()]\n    for i in range(k, len(nums)):\n        window.pop(bisect.bisect_left(window, nums[i - k]))\n        bisect.insort(window, nums[i])\n        out.append(median())\n    return out",
                "best": true,
                "tag": "what to write first"
              },
              {
                "name": "Two heaps with lazy deletion",
                "time": "O(n log k)",
                "space": "O(k)",
                "why": [
                  "The same two-heap split as the running median, plus the one thing heaps cannot do: remove an arbitrary element. <code>heapq</code> only pops the root, and the value leaving the window is usually somewhere in the middle.",
                  "The fix is <strong>lazy deletion</strong>. Record the departing value in a <code>delayed</code> counter and adjust the logical size, but leave it in the heap. Only when a stale value surfaces at a root is it actually popped. Every element is deleted at most once, so the amortised cost stays O(log k).",
                  "This is why the sizes must be tracked in separate counters: <code>len(heap)</code> now counts ghosts. Getting that wrong is the classic bug, and it only shows up on windows where a duplicate straddles the two halves.",
                  "<strong>O(n log k)</strong> time, O(k) space. Real, but a lot of machinery &mdash; in Python, <code>sortedcontainers.SortedList</code> gives O(log k) with none of it."
                ],
                "code": "def median_sliding_window(nums, k):\n    small, large = [], []          # max-heap (negated) | min-heap\n    delayed = Counter()\n    n_small = n_large = 0\n\n    def prune(heap):\n        \"\"\"Drop already-deleted values sitting at the root.\"\"\"\n        while heap:\n            value = -heap[0] if heap is small else heap[0]\n            if delayed[value]:\n                delayed[value] -= 1\n                heapq.heappop(heap)\n            else:\n                break\n\n    def rebalance():\n        nonlocal n_small, n_large\n        while n_small > n_large + 1:\n            heapq.heappush(large, -heapq.heappop(small))\n            n_small, n_large = n_small - 1, n_large + 1\n            prune(small)\n        while n_small < n_large:\n            heapq.heappush(small, -heapq.heappop(large))\n            n_small, n_large = n_small + 1, n_large - 1\n            prune(large)\n\n    def add(value):\n        nonlocal n_small, n_large\n        if not small or value <= -small[0]:\n            heapq.heappush(small, -value)\n            n_small += 1\n        else:\n            heapq.heappush(large, value)\n            n_large += 1\n        rebalance()\n\n    def remove(value):\n        nonlocal n_small, n_large\n        delayed[value] += 1\n        if small and value <= -small[0]:\n            n_small -= 1\n            if value == -small[0]:\n                prune(small)\n        else:\n            n_large -= 1\n            if large and value == large[0]:\n                prune(large)\n        rebalance()\n\n    out = []\n    for i, value in enumerate(nums):\n        add(value)\n        if i >= k:\n            remove(nums[i - k])\n        if i >= k - 1:\n            out.append(float(-small[0]) if k % 2\n                       else (-small[0] + large[0]) / 2.0)\n    return out",
                "best": false,
                "tag": "asymptotically better"
              }
            ],
            "tests": "import random, statistics\n\ngot = median_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3)\nassert got == [1.0, -1.0, -1.0, 3.0, 5.0, 6.0]\nassert median_sliding_window([1, 2, 3, 4, 2, 3, 1, 4, 2], 3) == [2.0, 3.0, 3.0, 3.0, 2.0, 3.0, 2.0]\nassert median_sliding_window([1], 1) == [1.0]\nassert median_sliding_window([1, 4, 2, 3], 4) == [2.5]\nassert median_sliding_window([2147483647, 2147483647], 2) == [2147483647.0]\n\nrandom.seed(31)\nfor _ in range(40):\n    n = random.randint(1, 25)\n    data = [random.randint(-8, 8) for _ in range(n)]     # duplicates on purpose\n    k = random.randint(1, n)\n    expected = [float(statistics.median(data[i:i + k]))\n                for i in range(n - k + 1)]\n    assert median_sliding_window(list(data), k) == expected, (data, k)",
            "topic": "heap",
            "topicTitle": "Heaps and Priority Queues"
          }
        ]
      }
    ],
    "problems": [
      {
        "id": "heapify",
        "num": 19,
        "lc": null,
        "slug": "",
        "url": "",
        "premium": false,
        "name": "Heapify: Building a Heap in O(n)",
        "difficulty": "easy",
        "tags": [
          "Heap (Priority Queue)",
          "Array",
          "Fundamentals"
        ],
        "statement": [
          "Turn an arbitrary array into a binary heap in place, so that every parent is &le; both of its children.",
          "The interesting part is not the code &mdash; Python gives you <code>heapq.heapify</code> in one line &mdash; but the cost. Inserting n items one at a time costs O(n log n). Heapifying an existing array costs <strong>O(n)</strong>. Being able to explain why is a standard follow-up.",
          "A heap is stored as a flat array with the tree structure implied by indices: the children of <code>i</code> live at <code>2i+1</code> and <code>2i+2</code>, and the parent of <code>i</code> is at <code>(i-1)//2</code>. Nothing is allocated for pointers."
        ],
        "examples": [
          {
            "input": "nums = [5, 3, 8, 1, 9, 2]",
            "output": "[1, 3, 2, 5, 9, 8]",
            "explanation": "One valid heap array. Only the heap property matters, not a unique ordering."
          }
        ],
        "constraints": [
          "<code>0 &lt;= len(nums) &lt;= 10<sup>6</sup></code>",
          "In place: O(1) extra space"
        ],
        "note": "",
        "pitfall": "Starting the loop at index 0 and sifting down. You must go bottom-up; top-down sift-down does not produce a heap.",
        "approaches": [
          {
            "name": "Sift down from the last parent",
            "time": "O(n)",
            "space": "O(1)",
            "why": [
              "Walk backwards from the last node that has a child, at index <code>n//2 - 1</code>, and sift each one down. Everything from <code>n//2</code> onwards is a leaf and is already a valid one-element heap, so half the array needs no work at all.",
              "The O(n) bound is the part to be able to derive. A node at height <code>k</code> above the leaves costs O(k) to sift down, and there are at most <code>n/2<sup>k+1</sup></code> such nodes. Summing, the total is n &times; &Sigma; k/2<sup>k+1</sup>, and that series converges to 1 &mdash; so the whole build is O(n), not O(n log n).",
              "The intuition behind the algebra: almost every node is near the bottom and moves almost nowhere. Only the root can travel the full log n.",
              "Sifting <em>up</em> from the front instead gives O(n log n), because then the expensive nodes are the many leaves rather than the single root. The direction is the whole trick."
            ],
            "code": "def heapify(nums):\n    n = len(nums)\n    for i in range(n // 2 - 1, -1, -1):   # last parent down to the root\n        sift_down(nums, i, n)\n    return nums\n\n\ndef sift_down(nums, i, n):\n    while True:\n        smallest = i\n        left, right = 2 * i + 1, 2 * i + 2\n        if left < n and nums[left] < nums[smallest]:\n            smallest = left\n        if right < n and nums[right] < nums[smallest]:\n            smallest = right\n        if smallest == i:\n            return\n        nums[i], nums[smallest] = nums[smallest], nums[i]\n        i = smallest",
            "best": true,
            "tag": ""
          },
          {
            "name": "Push one at a time",
            "time": "O(n log n)",
            "space": "O(n)",
            "why": [
              "Insert each element into a growing heap. Every insert sifts up through at most log n levels, so n inserts cost O(n log n).",
              "This is what <code>heapq.heappush</code> in a loop does. It is the obvious approach and it is asymptotically worse than <code>heapify</code> on data you already have in an array &mdash; measurably so at a million elements.",
              "It is still the right choice when items <em>arrive</em> one at a time, because then there is no array to heapify."
            ],
            "code": "def heapify(nums):\n    out = []\n    for value in nums:\n        heapq.heappush(out, value)\n    nums[:] = out\n    return nums",
            "best": false,
            "tag": "the slower way"
          }
        ],
        "tests": "import random\n\n\ndef valid(h):\n    return all(h[i] <= h[c]\n               for i in range(len(h))\n               for c in (2 * i + 1, 2 * i + 2) if c < len(h))\n\n\na = [5, 3, 8, 1, 9, 2]\nheapify(a)\nassert valid(a) and sorted(a) == [1, 2, 3, 5, 8, 9]\nassert heapify([]) == []\nassert heapify([1]) == [1]\nrandom.seed(0)\nfor _ in range(50):\n    data = [random.randint(-50, 50) for _ in range(random.randint(0, 30))]\n    original = sorted(data)\n    heapify(data)\n    assert valid(data), data\n    assert sorted(data) == original",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "kth-largest-element",
        "num": 20,
        "lc": 215,
        "slug": "kth-largest-element-in-an-array",
        "url": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
        "premium": false,
        "name": "Kth Largest Element in an Array",
        "difficulty": "medium",
        "tags": [
          "Array",
          "Divide and Conquer",
          "Sorting",
          "Heap (Priority Queue)",
          "Quickselect"
        ],
        "statement": [
          "Given an integer array <code>nums</code> and an integer <code>k</code>, return <em>the</em> <code>k<sup>th</sup></code> <em>largest element in the array</em>.",
          "Note that it is the <code>k<sup>th</sup></code> largest element in the sorted order, not the <code>k<sup>th</sup></code> distinct element.",
          "Can you solve it without sorting?"
        ],
        "examples": [
          {
            "input": "nums = [3,2,1,5,6,4], k = 2 Output: 5",
            "output": "5"
          },
          {
            "input": "nums = [3,2,3,1,2,4,5,5,6], k = 4 Output: 4",
            "output": "4"
          }
        ],
        "constraints": [
          "<code>1 &lt;= k &lt;= nums.length &lt;= 10<sup>5</sup></code>",
          "<code>-10<sup>4</sup> &lt;= nums[i] &lt;= 10<sup>4</sup></code>"
        ],
        "note": "",
        "pitfall": "Returning the k-th <em>distinct</em> value. Duplicates count: in [3,2,3,1,2,4,5,5,6] the 4th largest is 4, not 3.",
        "approaches": [
          {
            "name": "Min-heap of size k",
            "time": "O(n log k)",
            "space": "O(k)",
            "why": [
              "Keep a min-heap holding the k largest values seen so far. Its root is the smallest of those k, which is exactly the k-th largest overall &mdash; so once every element has been offered, the root is the answer.",
              "Push, then pop when the heap exceeds k. Each operation is O(log k) and there are n of them: <strong>O(n log k)</strong>, which beats sorting's O(n log n) whenever k is small, and uses only O(k) memory rather than holding the whole array.",
              "The counter-intuitive part is using a <em>min</em>-heap to find a maximum. The reason is that you need cheap access to the weakest member of your current top-k, because that is the one to evict."
            ],
            "code": "def find_kth_largest(nums, k):\n    heap = []\n    for value in nums:\n        heapq.heappush(heap, value)\n        if len(heap) > k:\n            heapq.heappop(heap)      # drop the smallest of the k+1\n    return heap[0]",
            "best": true,
            "tag": ""
          },
          {
            "name": "nlargest / sorting",
            "time": "O(n log n)",
            "space": "O(n)",
            "why": [
              "<code>sorted(nums)[-k]</code> is the shortest correct answer and is fine when n is small. <code>heapq.nlargest(k, nums)[-1]</code> is the same size-k heap idea behind a library call.",
              "Sorting does strictly more work than the problem needs: it orders all n elements when you only care about a boundary."
            ],
            "code": "def find_kth_largest(nums, k):\n    return heapq.nlargest(k, nums)[-1]",
            "best": false,
            "tag": "one line"
          },
          {
            "name": "Quickselect",
            "time": "O(n) average, O(n&sup2;) worst",
            "space": "O(1)",
            "why": [
              "Partition around a pivot as in quicksort, but recurse into only the side that contains the k-th position. Each pass discards a fraction of the array, so the expected work is n + n/2 + n/4 + &hellip; = <strong>O(n)</strong>.",
              "The worst case is O(n&sup2;), when every pivot is the extreme value &mdash; already-sorted input with a fixed pivot choice does it. A <em>random</em> pivot makes that vanishingly unlikely, which is why the shuffle matters and is not decoration.",
              "Mention this when asked to beat O(n log k). It is the theoretically best answer and the one most likely to be got subtly wrong under time pressure, so write the heap first."
            ],
            "code": "def find_kth_largest(nums, k):\n    import random\n    target = len(nums) - k          # k-th largest = this index when sorted\n    lo, hi = 0, len(nums) - 1\n    nums = list(nums)\n    while True:\n        pivot = random.randint(lo, hi)\n        nums[pivot], nums[hi] = nums[hi], nums[pivot]\n        store = lo\n        for i in range(lo, hi):\n            if nums[i] < nums[hi]:\n                nums[store], nums[i] = nums[i], nums[store]\n                store += 1\n        nums[store], nums[hi] = nums[hi], nums[store]\n        if store == target:\n            return nums[store]\n        if store < target:\n            lo = store + 1\n        else:\n            hi = store - 1",
            "best": false,
            "tag": "best average case"
          }
        ],
        "tests": "assert find_kth_largest([3, 2, 1, 5, 6, 4], 2) == 5\nassert find_kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) == 4\nassert find_kth_largest([1], 1) == 1\nassert find_kth_largest([2, 1], 2) == 1\nassert find_kth_largest([7, 7, 7], 2) == 7\nimport random\nrandom.seed(1)\nfor _ in range(50):\n    data = [random.randint(-20, 20) for _ in range(random.randint(1, 40))]\n    k = random.randint(1, len(data))\n    assert find_kth_largest(list(data), k) == sorted(data)[-k]",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "kth-largest-in-stream",
        "num": 21,
        "lc": 703,
        "slug": "kth-largest-element-in-a-stream",
        "url": "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
        "premium": false,
        "name": "Kth Largest Element in a Stream",
        "difficulty": "easy",
        "tags": [
          "Tree",
          "Design",
          "Binary Search Tree",
          "Heap (Priority Queue)",
          "Binary Tree",
          "Data Stream"
        ],
        "statement": [
          "You are part of a university admissions office and need to keep track of the <code>kth</code> highest test score from applicants in real-time. This helps to determine cut-off marks for interviews and admissions dynamically as new applicants submit their scores.",
          "You are tasked to implement a class which, for a given integer <code>k</code>, maintains a stream of test scores and continuously returns the <code>k</code>th highest test score <strong>after</strong> a new score has been submitted. More specifically, we are looking for the <code>k</code>th highest score in the sorted list of all scores.",
          "Implement the <code>KthLargest</code> class:",
          "<ul>\n <li><code>KthLargest(int k, int[] nums)</code> Initializes the object with the integer <code>k</code> and the stream of test scores <code>nums</code>.</li>\n <li><code>int add(int val)</code> Adds a new test score <code>val</code> to the stream and returns the element representing the <code>k<sup>th</sup></code> largest element in the pool of test scores so far.</li>\n</ul>"
        ],
        "examples": [
          {
            "input": "[\"KthLargest\", \"add\", \"add\", \"add\", \"add\", \"add\"] [[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]]",
            "output": "[null, 4, 5, 5, 8, 8]",
            "explanation": "KthLargest kthLargest = new KthLargest(3, [4, 5, 8, 2]); kthLargest.add(3); // return 4 kthLargest.add(5); // return 5 kthLargest.add(10); // return 5 kthLargest.add(9); // return 8 kthLargest.add(4); // return 8"
          },
          {
            "input": "[\"KthLargest\", \"add\", \"add\", \"add\", \"add\"] [[4, [7, 7, 7, 7, 8, 3]], [2], [10], [9], [9]]",
            "output": "[null, 7, 7, 7, 8]",
            "explanation": "KthLargest kthLargest = new KthLargest(4, [7, 7, 7, 7, 8, 3]); kthLargest.add(2); // return 7 kthLargest.add(10); // return 7 kthLargest.add(9); // return 7 kthLargest.add(9); // return 8"
          }
        ],
        "constraints": [
          "<code>0 &lt;= nums.length &lt;= 10<sup>4</sup></code>",
          "<code>1 &lt;= k &lt;= nums.length + 1</code>",
          "<code>-10<sup>4</sup> &lt;= nums[i] &lt;= 10<sup>4</sup></code>",
          "<code>-10<sup>4</sup> &lt;= val &lt;= 10<sup>4</sup></code>",
          "At most <code>10<sup>4</sup></code> calls will be made to <code>add</code>."
        ],
        "note": "",
        "pitfall": "",
        "approaches": [
          {
            "name": "Min-heap capped at k",
            "time": "O(log k) per add",
            "space": "O(k)",
            "why": [
              "The same size-k min-heap as problem 215, kept alive between calls. This is the problem that shows <em>why</em> that structure is the right one: it is incremental. Nothing is recomputed when a value arrives.",
              "<code>add</code> pushes and then pops if the heap is over k, both O(log k), and returns the root. Construction heapifies the initial array and trims it, which is O(n) plus O((n-k) log k).",
              "Space stays O(k) no matter how long the stream runs &mdash; the whole point. Keeping every value and sorting on each query would be O(n) memory and O(n log n) per call."
            ],
            "code": "class KthLargest:\n    def __init__(self, k, nums):\n        self.k = k\n        self.heap = list(nums)\n        heapq.heapify(self.heap)\n        while len(self.heap) > k:\n            heapq.heappop(self.heap)\n\n    def add(self, val):\n        heapq.heappush(self.heap, val)\n        if len(self.heap) > self.k:\n            heapq.heappop(self.heap)\n        return self.heap[0]",
            "best": true,
            "tag": ""
          },
          {
            "name": "Sorted list with bisect",
            "time": "O(n) per add",
            "space": "O(n)",
            "why": [
              "Keep every value in a sorted list and answer with <code>data[-k]</code>. <code>bisect.insort</code> finds the position in O(log n) but the insert itself shifts the tail, so each add is O(n).",
              "Worth knowing as the contrast: the binary search is not the cost, the memory move is. For a stream this also grows without bound, where the heap does not."
            ],
            "code": "import bisect\n\n\nclass KthLargest:\n    def __init__(self, k, nums):\n        self.k = k\n        self.data = sorted(nums)\n\n    def add(self, val):\n        bisect.insort(self.data, val)\n        return self.data[-self.k]",
            "best": false,
            "tag": ""
          }
        ],
        "tests": "kth = KthLargest(3, [4, 5, 8, 2])\nassert [kth.add(v) for v in (3, 5, 10, 9, 4)] == [4, 5, 5, 8, 8]\nsolo = KthLargest(1, [])\nassert [solo.add(v) for v in (-3, -2, -4, 0, 4)] == [-3, -2, -2, 0, 4]\nstart = KthLargest(2, [0])\nassert start.add(-1) == -1        # 2nd largest of [0, -1]\nassert start.add(7) == 0          # 2nd largest of [0, -1, 7]",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "top-k-frequent",
        "num": 22,
        "lc": 347,
        "slug": "top-k-frequent-elements",
        "url": "https://leetcode.com/problems/top-k-frequent-elements/",
        "premium": false,
        "name": "Top K Frequent Elements",
        "difficulty": "medium",
        "tags": [
          "Array",
          "Hash Table",
          "Divide and Conquer",
          "Sorting",
          "Heap (Priority Queue)",
          "Bucket Sort",
          "Counting",
          "Quickselect"
        ],
        "statement": [
          "Given an integer array <code>nums</code> and an integer <code>k</code>, return <em>the</em> <code>k</code> <em>most frequent elements</em>. You may return the answer in <strong>any order</strong>."
        ],
        "examples": [
          {
            "input": "nums = [1,1,1,2,2,3], k = 2",
            "output": "[1,2]"
          },
          {
            "input": "nums = [1], k = 1",
            "output": "[1]"
          },
          {
            "input": "nums = [1,2,1,2,1,2,3,1,3,2], k = 2",
            "output": "[1,2]"
          }
        ],
        "constraints": [
          "<code>1 &lt;= nums.length &lt;= 10<sup>5</sup></code>",
          "<code>-10<sup>4</sup> &lt;= nums[i] &lt;= 10<sup>4</sup></code>",
          "<code>k</code> is in the range <code>[1, the number of unique elements in the array]</code>.",
          "It is <strong>guaranteed</strong> that the answer is <strong>unique</strong>."
        ],
        "note": "",
        "pitfall": "",
        "approaches": [
          {
            "name": "Count, then a size-k heap",
            "time": "O(n log k)",
            "space": "O(n)",
            "why": [
              "Count with a <code>Counter</code> in O(n), then run the size-k min-heap over the <em>distinct</em> values, keyed on frequency. If there are d distinct values the heap phase is O(d log k), and d &le; n.",
              "Space is O(n) for the counter regardless of approach &mdash; you cannot know frequencies without counting everything. The heap adds only O(k).",
              "<code>Counter.most_common(k)</code> is this same algorithm in the standard library; it uses <code>heapq.nlargest</code> internally when k is given."
            ],
            "code": "def top_k_frequent(nums, k):\n    counts = Counter(nums)\n    heap = []\n    for value, freq in counts.items():\n        heapq.heappush(heap, (freq, value))\n        if len(heap) > k:\n            heapq.heappop(heap)\n    return [value for freq, value in heap]",
            "best": false,
            "tag": ""
          },
          {
            "name": "Bucket by frequency",
            "time": "O(n)",
            "space": "O(n)",
            "why": [
              "A frequency cannot exceed n, so make <code>n + 1</code> buckets and put each value in the bucket matching its count. Walk the buckets from the back and take the first k values.",
              "That is a counting sort on a bounded key, so it is <strong>O(n)</strong> with no log factor at all &mdash; strictly better than the heap here, and the answer the problem's \"better than O(n log n)\" hint is pointing at.",
              "It works only because the sort key is an integer bounded by n. The heap does not need that and generalises to unbounded or non-integer keys, which is why both are worth knowing."
            ],
            "code": "def top_k_frequent(nums, k):\n    counts = Counter(nums)\n    buckets = [[] for _ in range(len(nums) + 1)]\n    for value, freq in counts.items():\n        buckets[freq].append(value)\n\n    out = []\n    for freq in range(len(buckets) - 1, 0, -1):\n        for value in buckets[freq]:\n            out.append(value)\n            if len(out) == k:\n                return out\n    return out",
            "best": true,
            "tag": "linear"
          }
        ],
        "tests": "assert sorted(top_k_frequent([1, 1, 1, 2, 2, 3], 2)) == [1, 2]\nassert top_k_frequent([1], 1) == [1]\nassert sorted(top_k_frequent([4, 4, 4, 5, 5, 6], 3)) == [4, 5, 6]\nassert sorted(top_k_frequent([-1, -1, 2, 2, 3], 2)) == [-1, 2]\ngot = top_k_frequent([1, 2, 3, 1, 2, 1], 2)\nassert sorted(got) == [1, 2] and len(got) == 2",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "sort-by-frequency",
        "num": 23,
        "lc": 451,
        "slug": "sort-characters-by-frequency",
        "url": "https://leetcode.com/problems/sort-characters-by-frequency/",
        "premium": false,
        "name": "Sort Characters By Frequency",
        "difficulty": "medium",
        "tags": [
          "Hash Table",
          "String",
          "Sorting",
          "Heap (Priority Queue)",
          "Bucket Sort",
          "Counting"
        ],
        "statement": [
          "Given a string <code>s</code>, sort it in <strong>decreasing order</strong> based on the <strong>frequency</strong> of the characters. The <strong>frequency</strong> of a character is the number of times it appears in the string.",
          "Return <em>the sorted string</em>. If there are multiple answers, return <em>any of them</em>."
        ],
        "examples": [
          {
            "input": "s = \"tree\" Output: \"eert\" Explanation: 'e' appears twice while 'r' and 't' both appear once. So 'e' must appear before both 'r' and 't'. Therefore \"eetr\" is also a valid answer.",
            "output": "\"eert\" Explanation: 'e' appears twice while 'r' and 't' both appear once. So 'e' must appear before both 'r' and 't'. Therefore \"eetr\" is also a valid answer.",
            "explanation": "'e' appears twice while 'r' and 't' both appear once. So 'e' must appear before both 'r' and 't'. Therefore \"eetr\" is also a valid answer."
          },
          {
            "input": "s = \"cccaaa\" Output: \"aaaccc\" Explanation: Both 'c' and 'a' appear three times, so both \"cccaaa\" and \"aaaccc\" are valid answers. Note that \"cacaca\" is incorrect, as the same characters must be together.",
            "output": "\"aaaccc\" Explanation: Both 'c' and 'a' appear three times, so both \"cccaaa\" and \"aaaccc\" are valid answers. Note that \"cacaca\" is incorrect, as the same characters must be together.",
            "explanation": "Both 'c' and 'a' appear three times, so both \"cccaaa\" and \"aaaccc\" are valid answers. Note that \"cacaca\" is incorrect, as the same characters must be together."
          },
          {
            "input": "s = \"Aabb\" Output: \"bbAa\" Explanation: \"bbaA\" is also a valid answer, but \"Aabb\" is incorrect. Note that 'A' and 'a' are treated as two different characters.",
            "output": "\"bbAa\" Explanation: \"bbaA\" is also a valid answer, but \"Aabb\" is incorrect. Note that 'A' and 'a' are treated as two different characters.",
            "explanation": "\"bbaA\" is also a valid answer, but \"Aabb\" is incorrect. Note that 'A' and 'a' are treated as two different characters."
          }
        ],
        "constraints": [
          "<code>1 &lt;= s.length &lt;= 5 * 10<sup>5</sup></code>",
          "<code>s</code> consists of uppercase and lowercase English letters and digits."
        ],
        "note": "",
        "pitfall": "Sorting characters rather than grouping them. All copies of a character must be adjacent; only the groups are ordered by frequency.",
        "approaches": [
          {
            "name": "Count, then max-heap",
            "time": "O(n + d log d)",
            "space": "O(n)",
            "why": [
              "Count the characters, push <code>(-freq, char)</code> so Python's min-heap behaves as a max-heap, then pop repeatedly and emit each character <code>freq</code> times.",
              "With d distinct characters the heap work is O(d log d); building the output is O(n). For ASCII input d &le; 128, so the heap term is effectively constant and the whole thing is O(n).",
              "The negation trick is the thing to remember: <code>heapq</code> has no max-heap, and negating the key is the standard workaround. It only works on numeric keys &mdash; you cannot negate a string."
            ],
            "code": "def frequency_sort(s):\n    counts = Counter(s)\n    heap = [(-freq, ch) for ch, freq in counts.items()]\n    heapq.heapify(heap)\n\n    out = []\n    while heap:\n        freq, ch = heapq.heappop(heap)\n        out.append(ch * -freq)\n    return \"\".join(out)",
            "best": false,
            "tag": ""
          },
          {
            "name": "most_common",
            "time": "O(n + d log d)",
            "space": "O(n)",
            "why": [
              "<code>Counter.most_common()</code> with no argument sorts the items by count, which is the same O(d log d) with none of the negation bookkeeping.",
              "Identical complexity, three lines shorter, and no chance of getting the sign wrong. Reach for the heap only when you need the top few rather than all of them, or when items keep arriving."
            ],
            "code": "def frequency_sort(s):\n    return \"\".join(ch * freq for ch, freq in Counter(s).most_common())",
            "best": true,
            "tag": "what to write"
          }
        ],
        "tests": "def same_shape(got, s):\n    return Counter(got) == Counter(s) and \"\".join(\n        sorted(got, key=lambda c: -Counter(s)[c])) is not None\n\n\nout = frequency_sort(\"tree\")\nassert out in (\"eert\", \"eetr\") and Counter(out) == Counter(\"tree\")\nout = frequency_sort(\"cccaaa\")\nassert out in (\"cccaaa\", \"aaaccc\")\nassert frequency_sort(\"Aabb\") in (\"bbAa\", \"bbaA\")\nassert frequency_sort(\"\") == \"\"\nassert frequency_sort(\"a\") == \"a\"\ncounts = Counter(frequency_sort(\"mississippi\"))\nassert counts == Counter(\"mississippi\")\nrun = frequency_sort(\"mississippi\")\nfreqs = [Counter(\"mississippi\")[c] for c in run]\nassert freqs == sorted(freqs, reverse=True)",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "sort-nearly-sorted",
        "num": 24,
        "lc": null,
        "slug": "",
        "url": "",
        "premium": false,
        "name": "Sort a Nearly Sorted (K-Sorted) Array",
        "difficulty": "medium",
        "tags": [
          "Heap (Priority Queue)",
          "Array",
          "Sorting"
        ],
        "statement": [
          "You are given an array where every element is at most <code>k</code> positions away from where it would be in sorted order. Sort it.",
          "This is a classic that is not on LeetCode but shows up in interviews and on GeeksforGeeks. It is the cleanest illustration of a <em>sliding</em> heap: the heap is never bigger than the disorder in the data."
        ],
        "examples": [
          {
            "input": "nums = [6, 5, 3, 2, 8, 10, 9], k = 3",
            "output": "[2, 3, 5, 6, 8, 9, 10]"
          },
          {
            "input": "nums = [10, 9, 8, 7, 4, 70, 60, 50], k = 4",
            "output": "[4, 7, 8, 9, 10, 50, 60, 70]"
          }
        ],
        "constraints": [
          "<code>0 &lt;= k &lt; len(nums)</code>",
          "Every element is at most <code>k</code> positions from its sorted position"
        ],
        "note": "",
        "pitfall": "Sizing the heap at k instead of k+1. An element k positions out of place needs k+1 candidates in view.",
        "approaches": [
          {
            "name": "Sliding min-heap of size k+1",
            "time": "O(n log k)",
            "space": "O(k)",
            "why": [
              "Hold the next <code>k + 1</code> elements in a min-heap. The smallest remaining value must be among them &mdash; it cannot be further than k positions away &mdash; so popping the root gives the next value in sorted order.",
              "Each element is pushed once and popped once from a heap of size k+1, so <strong>O(n log k)</strong>. When k is small relative to n this beats a full O(n log n) sort, and it uses O(k) space instead of O(n).",
              "The invariant is the whole proof: <em>after processing index i, the heap contains every candidate for output position i.</em> The k-sorted guarantee is what makes that true; without it the algorithm is simply wrong."
            ],
            "code": "def sort_k_sorted(nums, k):\n    heap = nums[:k + 1]\n    heapq.heapify(heap)\n\n    out = []\n    for i in range(k + 1, len(nums)):\n        out.append(heapq.heappushpop(heap, nums[i]))\n    while heap:\n        out.append(heapq.heappop(heap))\n    return out",
            "best": true,
            "tag": ""
          },
          {
            "name": "Just sort it",
            "time": "O(n log n)",
            "space": "O(n)",
            "why": [
              "<code>sorted(nums)</code> ignores the k-sorted guarantee entirely and is correct. Timsort even exploits existing runs, so on nearly-sorted data it often runs close to linear in practice.",
              "The heap version still wins on <em>space</em> &mdash; O(k) versus O(n) &mdash; which is the real argument when the array is a stream you cannot hold in memory."
            ],
            "code": "def sort_k_sorted(nums, k):\n    return sorted(nums)",
            "best": false,
            "tag": "baseline"
          }
        ],
        "tests": "assert sort_k_sorted([6, 5, 3, 2, 8, 10, 9], 3) == [2, 3, 5, 6, 8, 9, 10]\nassert sort_k_sorted([10, 9, 8, 7, 4, 70, 60, 50], 4) == [4, 7, 8, 9, 10, 50, 60, 70]\nassert sort_k_sorted([1], 0) == [1]\nassert sort_k_sorted([2, 1], 1) == [1, 2]\nimport random\nrandom.seed(3)\nfor _ in range(40):\n    k = random.randint(0, 4)\n    base = sorted(random.randint(0, 50) for _ in range(random.randint(1, 25)))\n    # Shuffling disjoint blocks of k+1 keeps every element within k of its\n    # sorted position, which is exactly the precondition the algorithm needs.\n    data = []\n    for start in range(0, len(base), k + 1):\n        block = base[start:start + k + 1]\n        random.shuffle(block)\n        data.extend(block)\n    assert sort_k_sorted(data, k) == base",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "merge-k-sorted-arrays",
        "num": 25,
        "lc": null,
        "slug": "",
        "url": "",
        "premium": false,
        "name": "Merge k Sorted Arrays",
        "difficulty": "medium",
        "tags": [
          "Heap (Priority Queue)",
          "Array",
          "Merge Sort"
        ],
        "statement": [
          "Given <code>k</code> sorted arrays, merge them into one sorted array.",
          "The array form of the next problem. Worth doing first because the pointer bookkeeping is visible &mdash; you push <code>(value, which array, which index)</code> and advance one cursor at a time."
        ],
        "examples": [
          {
            "input": "arrays = [[1, 4, 5], [1, 3, 4], [2, 6]]",
            "output": "[1, 1, 2, 3, 4, 4, 5, 6]"
          }
        ],
        "constraints": [
          "<code>0 &lt;= k</code>, each array sorted ascending",
          "Let <code>N</code> be the total number of elements across all arrays"
        ],
        "note": "",
        "pitfall": "",
        "approaches": [
          {
            "name": "Min-heap of one cursor per array",
            "time": "O(N log k)",
            "space": "O(k)",
            "why": [
              "Seed the heap with the first element of each array. Pop the global minimum, emit it, and push the next element from whichever array it came from. The heap holds at most one entry per array, so its size is k.",
              "Every one of the N elements is pushed and popped exactly once at O(log k), giving <strong>O(N log k)</strong>. Concatenating and sorting is O(N log N), and since k &le; N this is never worse and is much better when k is small.",
              "The tuple carries the array index so you know which cursor to advance; the element index says where. Tie-breaking on those integers is harmless because they are unique.",
              "<code>heapq.merge</code> does exactly this and returns a lazy iterator, which is the version to use in real code."
            ],
            "code": "def merge_k_arrays(arrays):\n    heap = [(a[0], i, 0) for i, a in enumerate(arrays) if a]\n    heapq.heapify(heap)\n\n    out = []\n    while heap:\n        value, which, idx = heapq.heappop(heap)\n        out.append(value)\n        if idx + 1 < len(arrays[which]):\n            heapq.heappush(heap, (arrays[which][idx + 1], which, idx + 1))\n    return out",
            "best": true,
            "tag": ""
          },
          {
            "name": "Concatenate and sort",
            "time": "O(N log N)",
            "space": "O(N)",
            "why": [
              "Throws away the fact that the inputs are already sorted. Fine for small k, and Timsort's run detection recovers some of the loss, but it is asymptotically worse and needs all N elements in memory at once."
            ],
            "code": "def merge_k_arrays(arrays):\n    out = []\n    for a in arrays:\n        out.extend(a)\n    return sorted(out)",
            "best": false,
            "tag": "baseline"
          }
        ],
        "tests": "assert merge_k_arrays([[1, 4, 5], [1, 3, 4], [2, 6]]) == [1, 1, 2, 3, 4, 4, 5, 6]\nassert merge_k_arrays([]) == []\nassert merge_k_arrays([[]]) == []\nassert merge_k_arrays([[], [1], []]) == [1]\nassert merge_k_arrays([[1, 2, 3]]) == [1, 2, 3]\nimport random\nrandom.seed(5)\nfor _ in range(40):\n    arrays = [sorted(random.randint(0, 30) for _ in range(random.randint(0, 6)))\n              for _ in range(random.randint(0, 5))]\n    expected = sorted(v for a in arrays for v in a)\n    assert merge_k_arrays(arrays) == expected",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "merge-k-sorted-lists",
        "num": 26,
        "lc": 23,
        "slug": "merge-k-sorted-lists",
        "url": "https://leetcode.com/problems/merge-k-sorted-lists/",
        "premium": false,
        "name": "Merge k Sorted Lists",
        "difficulty": "hard",
        "tags": [
          "Linked List",
          "Divide and Conquer",
          "Heap (Priority Queue)",
          "Merge Sort",
          "Tournament Sort"
        ],
        "statement": [
          "You are given an array of <code>k</code> linked-lists <code>lists</code>, each linked-list is sorted in ascending order.",
          "<em>Merge all the linked-lists into one sorted linked-list and return it.</em>"
        ],
        "examples": [
          {
            "input": "lists = [[1,4,5],[1,3,4],[2,6]] Output: [1,1,2,3,4,4,5,6] Explanation: The linked-lists are: [ 1->4->5, 1->3->4, 2->6 ] merging them into one sorted linked list: 1->1->2->3->4->4->5->6",
            "output": "[1,1,2,3,4,4,5,6] Explanation: The linked-lists are: [ 1->4->5, 1->3->4, 2->6 ] merging them into one sorted linked list: 1->1->2->3->4->4->5->6",
            "explanation": "The linked-lists are: [ 1->4->5, 1->3->4, 2->6 ] merging them into one sorted linked list: 1->1->2->3->4->4->5->6"
          },
          {
            "input": "lists = [] Output: []",
            "output": "[]"
          },
          {
            "input": "lists = [[]] Output: []",
            "output": "[]"
          }
        ],
        "constraints": [
          "<code>k == lists.length</code>",
          "<code>0 &lt;= k &lt;= 10<sup>4</sup></code>",
          "<code>0 &lt;= lists[i].length &lt;= 500</code>",
          "<code>-10<sup>4</sup> &lt;= lists[i][j] &lt;= 10<sup>4</sup></code>",
          "<code>lists[i]</code> is sorted in <strong>ascending order</strong>.",
          "The sum of <code>lists[i].length</code> will not exceed <code>10<sup>4</sup></code>."
        ],
        "note": "",
        "pitfall": "Pushing the node itself into the heap. Equal values then force a comparison of two <code>ListNode</code> objects and raise <code>TypeError</code> &mdash; and only on inputs with duplicates, so it passes the sample tests.",
        "approaches": [
          {
            "name": "Min-heap of list heads",
            "time": "O(N log k)",
            "space": "O(k)",
            "why": [
              "The previous problem with pointers instead of indices. Seed the heap with every list's head, pop the smallest, append it to the result, and push that node's successor.",
              "N nodes, each pushed and popped once from a heap of size &le; k: <strong>O(N log k)</strong>. Space is O(k) for the heap; the output reuses the existing nodes, so no new list is allocated.",
              "The detail that breaks this in Python: <code>ListNode</code> is not orderable, so when two nodes hold equal values the heap tries to compare the nodes themselves and raises <code>TypeError</code>. Push <code>(value, tiebreak, node)</code> with a unique integer in the middle &mdash; the index of the list &mdash; so the comparison never reaches the node.",
              "A dummy head removes the special case for the first node appended."
            ],
            "code": "def merge_k_lists(lists):\n    heap = [(node.val, i, node) for i, node in enumerate(lists) if node]\n    heapq.heapify(heap)\n\n    dummy = tail = ListNode()\n    while heap:\n        value, i, node = heapq.heappop(heap)\n        tail.next = node\n        tail = node\n        if node.next is not None:\n            heapq.heappush(heap, (node.next.val, i, node.next))\n    tail.next = None\n    return dummy.next",
            "best": true,
            "tag": ""
          },
          {
            "name": "Merge pairwise, halving each round",
            "time": "O(N log k)",
            "space": "O(1)",
            "why": [
              "Merge lists 1&amp;2, 3&amp;4, and so on, halving the number of lists each round until one remains. Same bound as the heap, reached differently.",
              "Each round touches all N nodes and there are log k rounds, so O(N log k). Space is <strong>O(1)</strong> &mdash; better than the heap's O(k) &mdash; because iterative two-way merging needs no auxiliary structure.",
              "Merging them one at a time instead (list 1 with 2, then with 3, &hellip;) is the trap: the accumulated list is re-walked every round, giving O(N k)."
            ],
            "code": "def merge_k_lists(lists):\n    lists = [node for node in lists if node]\n    if not lists:\n        return None\n    while len(lists) > 1:\n        merged = []\n        for i in range(0, len(lists), 2):\n            if i + 1 < len(lists):\n                merged.append(merge_two(lists[i], lists[i + 1]))\n            else:\n                merged.append(lists[i])\n        lists = merged\n    return lists[0]\n\n\ndef merge_two(a, b):\n    dummy = tail = ListNode()\n    while a and b:\n        if a.val <= b.val:\n            tail.next, a = a, a.next\n        else:\n            tail.next, b = b, b.next\n        tail = tail.next\n    tail.next = a or b\n    return dummy.next",
            "best": false,
            "tag": "no heap"
          }
        ],
        "tests": "got = merge_k_lists([build_list([1, 4, 5]), build_list([1, 3, 4]), build_list([2, 6])])\nassert list_vals(got) == [1, 1, 2, 3, 4, 4, 5, 6]\nassert merge_k_lists([]) is None\nassert merge_k_lists([None]) is None\nassert list_vals(merge_k_lists([build_list([1])])) == [1]\n# equal values must not make the heap compare ListNodes\nassert list_vals(merge_k_lists([build_list([2, 2]), build_list([2, 2])])) == [2, 2, 2, 2]\nimport random\nrandom.seed(7)\nfor _ in range(30):\n    arrays = [sorted(random.randint(0, 10) for _ in range(random.randint(0, 5)))\n              for _ in range(random.randint(0, 4))]\n    nodes = [build_list(a) for a in arrays]\n    expected = sorted(v for a in arrays for v in a)\n    assert list_vals(merge_k_lists(nodes)) == expected",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "smallest-range-k-lists",
        "num": 27,
        "lc": 632,
        "slug": "smallest-range-covering-elements-from-k-lists",
        "url": "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/",
        "premium": false,
        "name": "Smallest Range Covering Elements from K Lists",
        "difficulty": "hard",
        "tags": [
          "Array",
          "Hash Table",
          "Greedy",
          "Sliding Window",
          "Sorting",
          "Heap (Priority Queue)"
        ],
        "statement": [
          "You have <code>k</code> lists of sorted integers in <strong>non-decreasing order</strong>. Find the <b>smallest</b> range that includes at least one number from each of the <code>k</code> lists.",
          "We define the range <code>[a, b]</code> is smaller than range <code>[c, d]</code> if <code>b - a &lt; d - c</code> <strong>or</strong> <code>a &lt; c</code> if <code>b - a == d - c</code>."
        ],
        "examples": [
          {
            "input": "nums = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]] Output: [20,24]",
            "output": "[20,24]",
            "explanation": "List 1: [4, 10, 15, 24,26], 24 is in range [20,24]. List 2: [0, 9, 12, 20], 20 is in range [20,24]. List 3: [5, 18, 22, 30], 22 is in range [20,24]."
          },
          {
            "input": "nums = [[1,2,3],[1,2,3],[1,2,3]] Output: [1,1]",
            "output": "[1,1]"
          }
        ],
        "constraints": [
          "<code>nums.length == k</code>",
          "<code>1 &lt;= k &lt;= 3500</code>",
          "<code>1 &lt;= nums[i].length &lt;= 50</code>",
          "<code>-10<sup>5</sup> &lt;= nums[i][j] &lt;= 10<sup>5</sup></code>",
          "<code>nums[i]</code> is sorted in <strong>non-decreasing</strong> order."
        ],
        "note": "",
        "pitfall": "Continuing after a list is exhausted. Once one list has no values left, no range can cover all k lists, so you must stop rather than keep improving.",
        "approaches": [
          {
            "name": "k-way merge tracking the window",
            "time": "O(N log k)",
            "space": "O(k)",
            "why": [
              "Run the k-way merge, but keep one cursor per list <em>alive at all times</em>. The heap's root is the smallest current value and you track the largest separately, so <code>[root, largest]</code> is always a range containing at least one element from every list.",
              "Each pop advances exactly one cursor, which is the only way to shrink the window from the left. Record the range whenever it improves, and stop the moment any list runs out &mdash; from then on no valid range exists.",
              "N total elements, each pushed and popped once from a size-k heap: <strong>O(N log k)</strong>, O(k) space.",
              "Why tracking the maximum is cheap: values only ever get replaced by a <em>larger</em> one from the same list, since each list is sorted. So the running maximum only increases and needs no second heap."
            ],
            "code": "def smallest_range(nums):\n    heap = [(row[0], i, 0) for i, row in enumerate(nums)]\n    heapq.heapify(heap)\n    largest = max(row[0] for row in nums)\n\n    best = (heap[0][0], largest)\n    while True:\n        value, which, idx = heapq.heappop(heap)\n        if largest - value < best[1] - best[0]:\n            best = (value, largest)\n        if idx + 1 == len(nums[which]):\n            return list(best)              # this list is exhausted\n        nxt = nums[which][idx + 1]\n        largest = max(largest, nxt)\n        heapq.heappush(heap, (nxt, which, idx + 1))",
            "best": true,
            "tag": ""
          }
        ],
        "tests": "assert smallest_range([[4, 10, 15, 24, 26], [0, 9, 12, 20], [5, 18, 22, 30]]) == [20, 24]\nassert smallest_range([[1, 2, 3], [1, 2, 3], [1, 2, 3]]) == [1, 1]\nassert smallest_range([[1], [2], [3]]) == [1, 3]\nassert smallest_range([[10], [11]]) == [10, 11]\nassert smallest_range([[1, 2, 3]]) == [1, 1]",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "kth-smallest-in-sorted-matrix",
        "num": 28,
        "lc": 378,
        "slug": "kth-smallest-element-in-a-sorted-matrix",
        "url": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
        "premium": false,
        "name": "Kth Smallest Element in a Sorted Matrix",
        "difficulty": "medium",
        "tags": [
          "Array",
          "Binary Search",
          "Sorting",
          "Heap (Priority Queue)",
          "Matrix"
        ],
        "statement": [
          "Given an <code>n x n</code> <code>matrix</code> where each of the rows and columns is sorted in ascending order, return <em>the</em> <code>k<sup>th</sup></code> <em>smallest element in the matrix</em>.",
          "Note that it is the <code>k<sup>th</sup></code> smallest element <strong>in the sorted order</strong>, not the <code>k<sup>th</sup></code> <strong>distinct</strong> element.",
          "You must find a solution with a memory complexity better than <code>O(n<sup>2</sup>)</code>."
        ],
        "examples": [
          {
            "input": "matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8 Output: 13 Explanation: The elements in the matrix are [1,5,9,10,11,12,13,13,15], and the 8th smallest number is 13",
            "output": "13 Explanation: The elements in the matrix are [1,5,9,10,11,12,13,13,15], and the 8th smallest number is 13",
            "explanation": "The elements in the matrix are [1,5,9,10,11,12,13,13,15], and the 8th smallest number is 13"
          },
          {
            "input": "matrix = [[-5]], k = 1 Output: -5",
            "output": "-5"
          }
        ],
        "constraints": [
          "<code>n == matrix.length == matrix[i].length</code>",
          "<code>1 &lt;= n &lt;= 300</code>",
          "<code>-10<sup>9</sup> &lt;= matrix[i][j] &lt;= 10<sup>9</sup></code>",
          "All the rows and columns of <code>matrix</code> are <strong>guaranteed</strong> to be sorted in <strong>non-decreasing order</strong>.",
          "<code>1 &lt;= k &lt;= n<sup>2</sup></code>"
        ],
        "note": "",
        "pitfall": "Assuming the k-th smallest is on the diagonal, or that the matrix is sorted when read row by row. Rows and columns are each sorted; the flattened order is not.",
        "approaches": [
          {
            "name": "k-way merge over the rows",
            "time": "O(k log n)",
            "space": "O(n)",
            "why": [
              "Each row is sorted, so this is a k-way merge over n rows. Seed the heap with the first element of each row and pop k times.",
              "The heap never exceeds n entries and you pop k times, so <strong>O(k log n)</strong> after an O(n) build. Since k can be as large as n&sup2;, the worst case is O(n&sup2; log n).",
              "Seeding only <code>min(k, n)</code> rows is a free improvement: the answer cannot come from a row whose first element is already beyond position k."
            ],
            "code": "def kth_smallest(matrix, k):\n    n = len(matrix)\n    heap = [(matrix[r][0], r, 0) for r in range(min(k, n))]\n    heapq.heapify(heap)\n\n    for _ in range(k - 1):\n        value, r, c = heapq.heappop(heap)\n        if c + 1 < n:\n            heapq.heappush(heap, (matrix[r][c + 1], r, c + 1))\n    return heap[0][0]",
            "best": false,
            "tag": ""
          },
          {
            "name": "Binary search on the value",
            "time": "O(n log(hi - lo))",
            "space": "O(1)",
            "why": [
              "Do not search the matrix &mdash; search the <em>answer range</em>. For a candidate value <code>mid</code>, count how many entries are &le; mid; if that count is &lt; k the answer is larger, otherwise it is mid or smaller.",
              "Counting is O(n) with a staircase walk: start at the bottom-left, move up when the cell is too big and right when it is not, so each of the n rows and n columns is passed at most once. No sorting, no heap.",
              "The binary search runs over the numeric range, so it takes log(max - min) iterations &mdash; about 31 for 32-bit values. Total <strong>O(n log(hi - lo))</strong> and <strong>O(1)</strong> space, beating the heap on both when k is large.",
              "The loop converges on a value that is actually present: the count is a step function that only jumps at real matrix values, so the smallest value with count &ge; k is in the matrix."
            ],
            "code": "def kth_smallest(matrix, k):\n    n = len(matrix)\n    lo, hi = matrix[0][0], matrix[n - 1][n - 1]\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if count_le(matrix, mid) < k:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo\n\n\ndef count_le(matrix, target):\n    \"\"\"How many entries are <= target, walking the staircase.\"\"\"\n    n = len(matrix)\n    count, r, c = 0, n - 1, 0\n    while r >= 0 and c < n:\n        if matrix[r][c] <= target:\n            count += r + 1        # whole column above is <= target too\n            c += 1\n        else:\n            r -= 1\n    return count",
            "best": true,
            "tag": "beats the heap"
          }
        ],
        "tests": "m = [[1, 5, 9], [10, 11, 13], [12, 13, 15]]\nassert kth_smallest(m, 8) == 13\nassert kth_smallest(m, 1) == 1\nassert kth_smallest(m, 9) == 15\nassert kth_smallest([[-5]], 1) == -5\nassert kth_smallest([[1, 2], [1, 3]], 2) == 1\nassert kth_smallest([[1, 2], [1, 3]], 4) == 3\nimport random\nrandom.seed(11)\nfor _ in range(25):\n    n = random.randint(1, 6)\n    rows = [sorted(random.randint(-10, 10) for _ in range(n)) for _ in range(n)]\n    for c in range(n):                       # make columns sorted too\n        col = sorted(rows[r][c] for r in range(n))\n        for r in range(n):\n            rows[r][c] = col[r]\n    flat = sorted(v for row in rows for v in row)\n    k = random.randint(1, n * n)\n    assert kth_smallest(rows, k) == flat[k - 1]",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "kth-smallest-matrix-row-sums",
        "num": 29,
        "lc": 1439,
        "slug": "find-the-kth-smallest-sum-of-a-matrix-with-sorted-rows",
        "url": "https://leetcode.com/problems/find-the-kth-smallest-sum-of-a-matrix-with-sorted-rows/",
        "premium": false,
        "name": "Find the Kth Smallest Sum of a Matrix With Sorted Rows",
        "difficulty": "hard",
        "tags": [
          "Array",
          "Binary Search",
          "Heap (Priority Queue)",
          "Matrix"
        ],
        "statement": [
          "You are given an <code>m x n</code> matrix <code>mat</code> that has its rows sorted in non-decreasing order and an integer <code>k</code>.",
          "You are allowed to choose <strong>exactly one element</strong> from each row to form an array.",
          "Return <em>the </em><code>k<sup>th</sup></code><em> smallest array sum among all possible arrays</em>."
        ],
        "examples": [
          {
            "input": "mat = [[1,3,11],[2,4,6]], k = 5 Output: 7 Explanation: Choosing one element from each row, the first k smallest sum are: [1,2], [1,4], [3,2], [3,4], [1,6]. Where the 5th sum is 7.",
            "output": "7 Explanation: Choosing one element from each row, the first k smallest sum are: [1,2], [1,4], [3,2], [3,4], [1,6]. Where the 5th sum is 7.",
            "explanation": "Choosing one element from each row, the first k smallest sum are: [1,2], [1,4], [3,2], [3,4], [1,6]. Where the 5th sum is 7."
          },
          {
            "input": "mat = [[1,3,11],[2,4,6]], k = 9 Output: 17",
            "output": "17"
          },
          {
            "input": "mat = [[1,10,10],[1,4,5],[2,3,6]], k = 7 Output: 9 Explanation: Choosing one element from each row, the first k smallest sum are: [1,1,2], [1,1,3], [1,4,2], [1,4,3], [1,1,6], [1,5,2], [1,5,3]. Where the 7th sum is 9.",
            "output": "9 Explanation: Choosing one element from each row, the first k smallest sum are: [1,1,2], [1,1,3], [1,4,2], [1,4,3], [1,1,6], [1,5,2], [1,5,3]. Where the 7th sum is 9.",
            "explanation": "Choosing one element from each row, the first k smallest sum are: [1,1,2], [1,1,3], [1,4,2], [1,4,3], [1,1,6], [1,5,2], [1,5,3]. Where the 7th sum is 9."
          }
        ],
        "constraints": [
          "<code>m == mat.length</code>",
          "<code>n == mat.length[i]</code>",
          "<code>1 &lt;= m, n &lt;= 40</code>",
          "<code>1 &lt;= mat[i][j] &lt;= 5000</code>",
          "<code>1 &lt;= k &lt;= min(200, n<sup>m</sup>)</code>",
          "<code>mat[i]</code> is a non-decreasing array."
        ],
        "note": "",
        "pitfall": "Trying to enumerate all n<sup>m</sup> arrays. The pruning to k survivors per row is the entire problem.",
        "approaches": [
          {
            "name": "Merge one row at a time, keeping k",
            "time": "O(m &middot; k &middot; n log k)",
            "space": "O(k)",
            "why": [
              "There are n<sup>m</sup> possible arrays, so enumerating them is hopeless. The insight is that you never need more than the <strong>k smallest sums so far</strong> &mdash; any partial sum outside that set can only grow, so it can never become the k-th smallest overall.",
              "Fold the rows in one at a time. After processing row i you hold at most k running sums; combine each with each of the n values in the next row and keep the k smallest of those k&middot;n candidates.",
              "<code>heapq.nsmallest(k, ...)</code> over k&middot;n candidates costs O(kn log k), repeated for m rows: <strong>O(m &middot; k &middot; n log k)</strong>, and only O(k) is held at any time. The pruning is what makes it tractable.",
              "Because each row is sorted, you could also stop generating candidates for a row once the sum exceeds the current k-th best &mdash; a constant-factor win on top."
            ],
            "code": "def kth_smallest(mat, k):\n    sums = [0]\n    for row in mat:\n        sums = heapq.nsmallest(k, (s + v for s in sums for v in row))\n    return sums[-1]",
            "best": true,
            "tag": ""
          },
          {
            "name": "Best-first search over index tuples",
            "time": "O(k &middot; m log k)",
            "space": "O(k &middot; m)",
            "why": [
              "Treat each candidate as a tuple of column indices, one per row. Start from all-zeros (the minimum possible sum) and repeatedly pop the smallest, pushing the m neighbours that advance exactly one row's index by one.",
              "Popping k times, each pop pushing m successors into a heap that stays O(k&middot;m): <strong>O(k &middot; m log k)</strong>. A <code>visited</code> set is essential &mdash; the same tuple is reachable by different orders of increments, and without deduplication you both waste work and miscount the k-th pop.",
              "This generalises to k-smallest over any monotone combination, which the row-folding version does not."
            ],
            "code": "def kth_smallest(mat, k):\n    m, n = len(mat), len(mat[0])\n    start = tuple([0] * m)\n    first = sum(row[0] for row in mat)\n    heap = [(first, start)]\n    seen = {start}\n\n    for _ in range(k - 1):\n        total, idx = heapq.heappop(heap)\n        for r in range(m):\n            if idx[r] + 1 < n:\n                nxt = idx[:r] + (idx[r] + 1,) + idx[r + 1:]\n                if nxt not in seen:\n                    seen.add(nxt)\n                    heapq.heappush(\n                        heap, (total - mat[r][idx[r]] + mat[r][idx[r] + 1], nxt))\n    return heap[0][0]",
            "best": false,
            "tag": "explicit heap"
          }
        ],
        "tests": "import itertools, random\n\nassert kth_smallest([[1, 3, 11], [2, 4, 6]], 5) == 7\nassert kth_smallest([[1, 3, 11], [2, 4, 6]], 9) == 17\nassert kth_smallest([[1, 10, 10], [1, 4, 5], [2, 3, 6]], 7) == 9\nassert kth_smallest([[1, 1, 10], [2, 2, 9]], 7) == 12\nassert kth_smallest([[5]], 1) == 5\n\nrandom.seed(13)\nfor _ in range(25):\n    m = random.randint(1, 3)\n    n = random.randint(1, 4)\n    mat = [sorted(random.randint(1, 9) for _ in range(n)) for _ in range(m)]\n    every = sorted(sum(c) for c in itertools.product(*mat))\n    k = random.randint(1, min(len(every), 8))\n    assert kth_smallest(mat, k) == every[k - 1], (mat, k)",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "connect-sticks",
        "num": 30,
        "lc": 1167,
        "slug": "minimum-cost-to-connect-sticks",
        "url": "https://leetcode.com/problems/minimum-cost-to-connect-sticks/",
        "premium": true,
        "name": "Minimum Cost to Connect Sticks",
        "difficulty": "medium",
        "tags": [
          "Array",
          "Greedy",
          "Heap (Priority Queue)"
        ],
        "statement": [
          "You have sticks with positive integer lengths. You can connect any two sticks of lengths <code>x</code> and <code>y</code> into one stick of length <code>x + y</code>, at a cost of <code>x + y</code>.",
          "Connect all the sticks into one and return the minimum total cost.",
          "This is Huffman coding wearing a different hat: the cost of a stick is its length multiplied by the number of merges it takes part in, so the cheapest plan merges short sticks most often."
        ],
        "examples": [
          {
            "input": "sticks = [2, 4, 3]",
            "output": "14",
            "explanation": "Join 2 and 3 for 5, then 5 and 4 for 9. Total 5 + 9 = 14."
          },
          {
            "input": "sticks = [1, 8, 3, 5]",
            "output": "30",
            "explanation": "1+3=4, 4+5=9, 9+8=17. Total 4 + 9 + 17 = 30."
          },
          {
            "input": "sticks = [5]",
            "output": "0",
            "explanation": "Already a single stick, so nothing to connect."
          }
        ],
        "constraints": [
          "<code>1 &lt;= sticks.length &lt;= 10<sup>4</sup></code>",
          "<code>1 &lt;= sticks[i] &lt;= 10<sup>4</sup></code>"
        ],
        "note": "LeetCode 1167 is a <strong>premium</strong> problem, so the statement above is written here rather than fetched.",
        "pitfall": "Sorting once and summing left to right. Each merged stick must be re-inserted into the ordering, which only a heap (or a second queue) gives you.",
        "approaches": [
          {
            "name": "Always merge the two shortest",
            "time": "O(n log n)",
            "space": "O(n)",
            "why": [
              "Heapify the lengths, then repeatedly pop the two smallest, push their sum, and add that sum to the running cost. Stop when one stick remains.",
              "O(n) to heapify, then n-1 merges each doing two pops and a push at O(log n): <strong>O(n log n)</strong>.",
              "Why greedy is optimal here is the part worth being able to argue. Every stick's length is paid once per merge it participates in, so the total cost is &Sigma; length &times; depth in the merge tree. Minimising that is exactly Huffman's problem, and the exchange argument applies: if a longer stick were merged deeper than a shorter one, swapping them lowers the total.",
              "Sorting once is <em>not</em> enough. The sums you create re-enter the pool and must be re-ordered against the originals, which is precisely what the heap does cheaply."
            ],
            "code": "def connect_sticks(sticks):\n    heap = list(sticks)\n    heapq.heapify(heap)\n\n    total = 0\n    while len(heap) > 1:\n        a = heapq.heappop(heap)\n        b = heapq.heappop(heap)\n        total += a + b\n        heapq.heappush(heap, a + b)\n    return total",
            "best": true,
            "tag": ""
          }
        ],
        "tests": "assert connect_sticks([2, 4, 3]) == 14\nassert connect_sticks([1, 8, 3, 5]) == 30\nassert connect_sticks([5]) == 0\nassert connect_sticks([1, 1]) == 2\nassert connect_sticks([1, 2, 3, 4, 5]) == 33\n\nimport itertools, random\n\n\ndef brute(sticks):\n    if len(sticks) <= 1:\n        return 0\n    best = None\n    for i, j in itertools.combinations(range(len(sticks)), 2):\n        rest = [s for n, s in enumerate(sticks) if n not in (i, j)]\n        cost = sticks[i] + sticks[j] + brute(rest + [sticks[i] + sticks[j]])\n        best = cost if best is None else min(best, cost)\n    return best\n\n\nrandom.seed(17)\nfor _ in range(20):\n    data = [random.randint(1, 12) for _ in range(random.randint(1, 6))]\n    assert connect_sticks(list(data)) == brute(list(data)), data",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "task-scheduler",
        "num": 31,
        "lc": 621,
        "slug": "task-scheduler",
        "url": "https://leetcode.com/problems/task-scheduler/",
        "premium": false,
        "name": "Task Scheduler",
        "difficulty": "medium",
        "tags": [
          "Array",
          "Hash Table",
          "Greedy",
          "Sorting",
          "Heap (Priority Queue)",
          "Counting"
        ],
        "statement": [
          "You are given an array of CPU <code>tasks</code>, each labeled with a letter from A to Z, and a number <code>n</code>. Each CPU interval can be idle or allow the completion of one task. Tasks can be completed in any order, but there&#39;s a constraint: there has to be a gap of <strong>at least</strong> <code>n</code> intervals between two tasks with the same label.",
          "Return the <strong>minimum</strong> number of CPU intervals required to complete all tasks."
        ],
        "examples": [
          {
            "input": "tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 2",
            "output": "8",
            "explanation": "A possible sequence is: A -> B -> idle -> A -> B -> idle -> A -> B. After completing task A, you must wait two intervals before doing A again. The same applies to task B. In the 3rd interval, neither A nor B can be done, so you idle. By the 4th interval, you can do A again as 2 intervals have passed."
          },
          {
            "input": "tasks = [\"A\",\"C\",\"A\",\"B\",\"D\",\"B\"], n = 1",
            "output": "6",
            "explanation": "A possible sequence is: A -> B -> C -> D -> A -> B. With a cooling interval of 1, you can repeat a task after just one other task."
          },
          {
            "input": "tasks = [\"A\",\"A\",\"A\", \"B\",\"B\",\"B\"], n = 3",
            "output": "10",
            "explanation": "A possible sequence is: A -> B -> idle -> idle -> A -> B -> idle -> idle -> A -> B. There are only two types of tasks, A and B, which need to be separated by 3 intervals. This leads to idling twice between repetitions of these tasks."
          }
        ],
        "constraints": [
          "<code>1 &lt;= tasks.length &lt;= 10<sup>4</sup></code>",
          "<code>tasks[i]</code> is an uppercase English letter.",
          "<code>0 &lt;= n &lt;= 100</code>"
        ],
        "note": "",
        "pitfall": "Forgetting the <code>max(len(tasks), ...)</code>. With many distinct tasks the gaps fill up and the formula alone under-counts.",
        "approaches": [
          {
            "name": "Counting formula",
            "time": "O(n)",
            "space": "O(1)",
            "why": [
              "Only the most frequent task matters. If it occurs <code>f</code> times it creates <code>f - 1</code> gaps, each of width <code>n + 1</code> counting the task itself, plus one final run of every task tied at that frequency.",
              "So the answer is <code>(f - 1) &times; (n + 1) + (number of tasks with frequency f)</code> &mdash; unless there are so many distinct tasks that the gaps fill themselves, in which case no idling happens at all and the answer is simply <code>len(tasks)</code>. Taking the <code>max</code> of the two covers both.",
              "<strong>O(n)</strong> time and O(1) space, since the counter holds at most 26 keys. This is the answer to reach for; the heap version below is the one people write first and is strictly worse."
            ],
            "code": "def least_interval(tasks, n):\n    counts = Counter(tasks)\n    most = max(counts.values())\n    tied = sum(1 for c in counts.values() if c == most)\n    return max(len(tasks), (most - 1) * (n + 1) + tied)",
            "best": true,
            "tag": "no heap needed"
          },
          {
            "name": "Max-heap with a cooldown queue",
            "time": "O(N log 26) = O(N)",
            "space": "O(1)",
            "why": [
              "Simulate it. Keep a max-heap of remaining counts and a queue of tasks cooling down with the time they become available. Each tick, run the most frequent available task; if none is available, idle.",
              "The heap holds at most 26 entries, so each operation is O(log 26), a constant. The loop runs once per time unit and the answer can be about n times the number of tasks, so this is O(answer) rather than O(len(tasks)) &mdash; noticeably worse when <code>n</code> is large and there are few distinct tasks.",
              "Worth writing because it generalises: the moment tasks have different durations or priorities the closed-form breaks and the simulation still works."
            ],
            "code": "def least_interval(tasks, n):\n    heap = [-c for c in Counter(tasks).values()]\n    heapq.heapify(heap)\n\n    time = 0\n    cooling = deque()          # (ready_at, remaining_count)\n    while heap or cooling:\n        time += 1\n        if heap:\n            remaining = heapq.heappop(heap) + 1     # negative counts\n            if remaining:\n                cooling.append((time + n, remaining))\n        if cooling and cooling[0][0] == time:\n            heapq.heappush(heap, cooling.popleft()[1])\n    return time",
            "best": false,
            "tag": ""
          }
        ],
        "tests": "assert least_interval([\"A\", \"A\", \"A\", \"B\", \"B\", \"B\"], 2) == 8\nassert least_interval([\"A\", \"C\", \"A\", \"B\", \"D\", \"B\"], 1) == 6\nassert least_interval([\"A\", \"A\", \"A\", \"B\", \"B\", \"B\"], 0) == 6\nassert least_interval([\"A\"], 5) == 1\nassert least_interval([\"A\", \"A\", \"A\", \"A\", \"B\", \"C\", \"D\", \"E\"], 2) == 10\nassert least_interval(list(\"AAABBBCCC\"), 2) == 9",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "reorganize-string",
        "num": 32,
        "lc": 767,
        "slug": "reorganize-string",
        "url": "https://leetcode.com/problems/reorganize-string/",
        "premium": false,
        "name": "Reorganize String",
        "difficulty": "medium",
        "tags": [
          "Hash Table",
          "String",
          "Greedy",
          "Sorting",
          "Heap (Priority Queue)",
          "Counting"
        ],
        "statement": [
          "Given a string <code>s</code>, rearrange the characters of <code>s</code> so that any two adjacent characters are not the same.",
          "Return <em>any possible rearrangement of</em> <code>s</code> <em>or return</em> <code>&quot;&quot;</code> <em>if not possible</em>."
        ],
        "examples": [
          {
            "input": "s = \"aab\" Output: \"aba\"",
            "output": "\"aba\""
          },
          {
            "input": "s = \"aaab\" Output: \"\"",
            "output": "\"\""
          }
        ],
        "constraints": [
          "<code>1 &lt;= s.length &lt;= 500</code>",
          "<code>s</code> consists of lowercase English letters."
        ],
        "note": "",
        "pitfall": "Popping one character at a time and pushing it straight back. It is immediately the most frequent again, so you emit it twice in a row.",
        "approaches": [
          {
            "name": "Max-heap, always take two",
            "time": "O(n log 26) = O(n)",
            "space": "O(n)",
            "why": [
              "Pop the two most frequent remaining characters, append both, decrement each, and push back whatever is left. Taking <em>two</em> at a time guarantees you never place the same character twice in a row.",
              "The heap holds at most 26 entries so each operation is constant; the loop runs O(n) times. Space is the output.",
              "It is impossible exactly when one character occurs more than <code>(n + 1) // 2</code> times &mdash; there are not enough slots to separate them. Checking that up front is cheaper than discovering it mid-loop."
            ],
            "code": "def reorganize_string(s):\n    counts = Counter(s)\n    if max(counts.values()) > (len(s) + 1) // 2:\n        return \"\"\n\n    heap = [(-c, ch) for ch, c in counts.items()]\n    heapq.heapify(heap)\n\n    out = []\n    while len(heap) > 1:\n        c1, ch1 = heapq.heappop(heap)\n        c2, ch2 = heapq.heappop(heap)\n        out.append(ch1)\n        out.append(ch2)\n        if c1 + 1:\n            heapq.heappush(heap, (c1 + 1, ch1))\n        if c2 + 1:\n            heapq.heappush(heap, (c2 + 1, ch2))\n    if heap:\n        out.append(heap[0][1])\n    return \"\".join(out)",
            "best": false,
            "tag": ""
          },
          {
            "name": "Fill even slots, then odd",
            "time": "O(n log 26) = O(n)",
            "space": "O(n)",
            "why": [
              "Place the most frequent character first into positions 0, 2, 4, &hellip;; when you run off the end, continue at 1, 3, 5, &hellip;. Then place every other character the same way, continuing from where the last one stopped.",
              "Two characters end up adjacent only if one occupies both an even index and the odd index next to it, which requires more than <code>(n+1)//2</code> copies &mdash; the case already rejected. So the construction is correct by the same counting argument.",
              "Same O(n) bound with a much smaller constant and no heap at all: one sort of at most 26 counts, then a single pass. This is the version to write."
            ],
            "code": "def reorganize_string(s):\n    counts = Counter(s)\n    if max(counts.values()) > (len(s) + 1) // 2:\n        return \"\"\n\n    out = [\"\"] * len(s)\n    i = 0\n    for ch, freq in counts.most_common():       # most frequent first\n        for _ in range(freq):\n            if i >= len(s):\n                i = 1                           # switch to the odd slots\n            out[i] = ch\n            i += 2\n    return \"\".join(out)",
            "best": true,
            "tag": "no heap"
          }
        ],
        "tests": "def ok(s, out):\n    if not out:\n        return True\n    return (Counter(out) == Counter(s)\n            and all(a != b for a, b in zip(out, out[1:])))\n\n\nfor case in (\"aab\", \"aaab\", \"vvvlo\", \"a\", \"ab\", \"aaabbb\", \"abbabbaab\"):\n    got = reorganize_string(case)\n    impossible = max(Counter(case).values()) > (len(case) + 1) // 2\n    assert (got == \"\") == impossible, (case, got)\n    assert ok(case, got), (case, got)\n\nassert reorganize_string(\"aaab\") == \"\"\nassert reorganize_string(\"aab\") in (\"aba\",)\n\nimport random\nrandom.seed(19)\nfor _ in range(60):\n    case = \"\".join(random.choice(\"abc\") for _ in range(random.randint(1, 12)))\n    got = reorganize_string(case)\n    impossible = max(Counter(case).values()) > (len(case) + 1) // 2\n    assert (got == \"\") == impossible, (case, got)\n    assert ok(case, got), (case, got)",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "ipo",
        "num": 33,
        "lc": 502,
        "slug": "ipo",
        "url": "https://leetcode.com/problems/ipo/",
        "premium": false,
        "name": "IPO",
        "difficulty": "hard",
        "tags": [
          "Array",
          "Greedy",
          "Sorting",
          "Heap (Priority Queue)"
        ],
        "statement": [
          "Suppose LeetCode will start its <strong>IPO</strong> soon. In order to sell a good price of its shares to Venture Capital, LeetCode would like to work on some projects to increase its capital before the <strong>IPO</strong>. Since it has limited resources, it can only finish at most <code>k</code> distinct projects before the <strong>IPO</strong>. Help LeetCode design the best way to maximize its total capital after finishing at most <code>k</code> distinct projects.",
          "You are given <code>n</code> projects where the <code>i<sup>th</sup></code> project has a pure profit <code>profits[i]</code> and a minimum capital of <code>capital[i]</code> is needed to start it.",
          "Initially, you have <code>w</code> capital. When you finish a project, you will obtain its pure profit and the profit will be added to your total capital.",
          "Pick a list of <strong>at most</strong> <code>k</code> distinct projects from given projects to <strong>maximize your final capital</strong>, and return <em>the final maximized capital</em>.",
          "The answer is guaranteed to fit in a 32-bit signed integer."
        ],
        "examples": [
          {
            "input": "k = 2, w = 0, profits = [1,2,3], capital = [0,1,1] Output: 4 Explanation: Since your initial capital is 0, you can only start the project indexed 0. After finishing it you will obtain profit 1 and your capital becomes 1. With capital 1, you can either start the project indexed 1 or the project indexed 2. Since you can choose at most 2 projects, you need to finish the project indexed 2 to get the maximum capital. Therefore, output the final maximized capital, which is 0 + 1 + 3 = 4.",
            "output": "4 Explanation: Since your initial capital is 0, you can only start the project indexed 0. After finishing it you will obtain profit 1 and your capital becomes 1. With capital 1, you can either start the project indexed 1 or the project indexed 2. Since you can choose at most 2 projects, you need to finish the project indexed 2 to get the maximum capital. Therefore, output the final maximized capital, which is 0 + 1 + 3 = 4.",
            "explanation": "Since your initial capital is 0, you can only start the project indexed 0. After finishing it you will obtain profit 1 and your capital becomes 1. With capital 1, you can either start the project indexed 1 or the project indexed 2. Since you can choose at most 2 projects, you need to finish the project indexed 2 to get the maximum capital. Therefore, output the final maximized capital, which is 0 + 1 + 3 = 4."
          },
          {
            "input": "k = 3, w = 0, profits = [1,2,3], capital = [0,1,2] Output: 6",
            "output": "6"
          }
        ],
        "constraints": [
          "<code>1 &lt;= k &lt;= 10<sup>5</sup></code>",
          "<code>0 &lt;= w &lt;= 10<sup>9</sup></code>",
          "<code>n == profits.length</code>",
          "<code>n == capital.length</code>",
          "<code>1 &lt;= n &lt;= 10<sup>5</sup></code>",
          "<code>0 &lt;= profits[i] &lt;= 10<sup>4</sup></code>",
          "<code>0 &lt;= capital[i] &lt;= 10<sup>9</sup></code>"
        ],
        "note": "",
        "pitfall": "Re-scanning all projects on every round. The capital pointer only moves forward, so each project is released into the heap once.",
        "approaches": [
          {
            "name": "Two heaps: affordable by capital, best by profit",
            "time": "O(n log n)",
            "space": "O(n)",
            "why": [
              "Sort the projects by capital required. Keep a pointer that releases every project you can now afford into a <em>max</em>-heap keyed on profit, then take the best one. Repeat k times.",
              "The greedy choice is safe because profits are non-negative: taking the most profitable affordable project can only increase your capital, which can only widen the set of affordable projects later. Nothing is foreclosed.",
              "Sorting is O(n log n); each project enters the profit heap at most once across the whole run, so the heap work is also O(n log n) &mdash; not O(k n). The pointer never rewinds, which is what keeps it linear in pushes.",
              "Break early when the profit heap is empty: no project is affordable and no further capital can arrive."
            ],
            "code": "def find_maximized_capital(k, w, profits, capital):\n    projects = sorted(zip(capital, profits))\n    affordable = []                 # max-heap of profits, negated\n    i = 0\n\n    for _ in range(k):\n        while i < len(projects) and projects[i][0] <= w:\n            heapq.heappush(affordable, -projects[i][1])\n            i += 1\n        if not affordable:\n            break                   # nothing reachable, capital cannot grow\n        w -= heapq.heappop(affordable)\n    return w",
            "best": true,
            "tag": ""
          }
        ],
        "tests": "assert find_maximized_capital(2, 0, [1, 2, 3], [0, 1, 1]) == 4\nassert find_maximized_capital(3, 0, [1, 2, 3], [0, 1, 2]) == 6\nassert find_maximized_capital(1, 0, [1, 2, 3], [1, 1, 2]) == 0\nassert find_maximized_capital(1, 2, [1, 2, 3], [1, 1, 2]) == 5\nassert find_maximized_capital(10, 0, [1], [0]) == 1\nassert find_maximized_capital(0, 5, [1, 2], [0, 0]) == 5",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "meeting-rooms",
        "num": 34,
        "lc": 252,
        "slug": "meeting-rooms",
        "url": "https://leetcode.com/problems/meeting-rooms/",
        "premium": true,
        "name": "Meeting Rooms",
        "difficulty": "easy",
        "tags": [
          "Array",
          "Sorting",
          "Quicksort"
        ],
        "statement": [
          "Given an array of meeting time intervals <code>[start, end]</code>, determine whether a person could attend all of them.",
          "The baseline for the next problem: no heap, just the observation that sorting by start time turns \"does any pair overlap?\" into \"does any <em>adjacent</em> pair overlap?\"."
        ],
        "examples": [
          {
            "input": "intervals = [[0,30],[5,10],[15,20]]",
            "output": "false",
            "explanation": "[0,30] overlaps [5,10]."
          },
          {
            "input": "intervals = [[7,10],[2,4]]",
            "output": "true",
            "explanation": "Sorted they are [2,4] and [7,10], which do not overlap."
          }
        ],
        "constraints": [
          "<code>0 &lt;= intervals.length &lt;= 10<sup>4</sup></code>",
          "<code>intervals[i].length == 2</code>",
          "<code>0 &lt;= start<sub>i</sub> &lt; end<sub>i</sub> &lt;= 10<sup>6</sup></code>"
        ],
        "note": "LeetCode 252 is a <strong>premium</strong> problem, so the statement above is written here rather than fetched.",
        "pitfall": "",
        "approaches": [
          {
            "name": "Sort by start, compare neighbours",
            "time": "O(n log n)",
            "space": "O(1)",
            "why": [
              "After sorting by start time, if any two meetings overlap then some <em>adjacent</em> pair does. So one linear scan comparing each start against the previous end settles it.",
              "The proof is short and worth being able to give: if meeting i overlaps meeting j with i &lt; j, then <code>start[j] &lt; end[i]</code>, and since starts are sorted every meeting between them also starts before <code>end[i]</code> &mdash; so the pair at i and i+1 already overlaps.",
              "O(n log n) dominated by the sort; the scan is O(n) and O(1) extra space.",
              "Touching endpoints do not conflict: a meeting ending at 10 and one starting at 10 are fine, so the comparison is strict."
            ],
            "code": "def can_attend_meetings(intervals):\n    intervals.sort()\n    for i in range(1, len(intervals)):\n        if intervals[i][0] < intervals[i - 1][1]:\n            return False\n    return True",
            "best": true,
            "tag": ""
          }
        ],
        "tests": "assert can_attend_meetings([[0, 30], [5, 10], [15, 20]]) is False\nassert can_attend_meetings([[7, 10], [2, 4]]) is True\nassert can_attend_meetings([]) is True\nassert can_attend_meetings([[1, 5]]) is True\nassert can_attend_meetings([[1, 5], [5, 9]]) is True     # touching is fine\nassert can_attend_meetings([[1, 5], [4, 9]]) is False",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "meeting-rooms-ii",
        "num": 35,
        "lc": 253,
        "slug": "meeting-rooms-ii",
        "url": "https://leetcode.com/problems/meeting-rooms-ii/",
        "premium": true,
        "name": "Meeting Rooms II",
        "difficulty": "medium",
        "tags": [
          "Array",
          "Two Pointers",
          "Greedy",
          "Sorting",
          "Heap (Priority Queue)",
          "Prefix Sum"
        ],
        "statement": [
          "Given an array of meeting time intervals <code>[start, end]</code>, return the minimum number of conference rooms required.",
          "The canonical min-heap interval problem. The answer is the maximum number of meetings in progress at any instant."
        ],
        "examples": [
          {
            "input": "intervals = [[0,30],[5,10],[15,20]]",
            "output": "2",
            "explanation": "[5,10] and [15,20] can share one room; [0,30] needs its own."
          },
          {
            "input": "intervals = [[7,10],[2,4]]",
            "output": "1",
            "explanation": "They do not overlap, so one room is enough."
          }
        ],
        "constraints": [
          "<code>1 &lt;= intervals.length &lt;= 10<sup>4</sup></code>",
          "<code>0 &lt;= start<sub>i</sub> &lt; end<sub>i</sub> &lt;= 10<sup>6</sup></code>"
        ],
        "note": "LeetCode 253 is a <strong>premium</strong> problem, so the statement above is written here rather than fetched.",
        "pitfall": "",
        "approaches": [
          {
            "name": "Min-heap of end times",
            "time": "O(n log n)",
            "space": "O(n)",
            "why": [
              "Sort by start. Keep a min-heap of the end times of rooms currently in use. For each meeting, if the earliest-finishing room is already free (<code>heap[0] &lt;= start</code>) reuse it by popping; then push this meeting's end. The heap size is the number of rooms in use, and its maximum is the answer.",
              "Only the <em>earliest</em> ending room ever needs checking: if that one is still busy, every other room is too. That is exactly what a min-heap gives in O(1), and it is why a heap beats scanning the rooms.",
              "Sort O(n log n), then n pushes and at most n pops at O(log n): <strong>O(n log n)</strong> overall, O(n) space in the worst case where every meeting overlaps."
            ],
            "code": "def min_meeting_rooms(intervals):\n    if not intervals:\n        return 0\n    intervals.sort()\n    ends = []                       # min-heap of in-use room end times\n\n    for start, end in intervals:\n        if ends and ends[0] <= start:\n            heapq.heappop(ends)     # earliest room is free, reuse it\n        heapq.heappush(ends, end)\n    return len(ends)",
            "best": true,
            "tag": ""
          },
          {
            "name": "Sweep the endpoints",
            "time": "O(n log n)",
            "space": "O(n)",
            "why": [
              "Separate the starts and ends into two sorted arrays and walk them together. A start before the next end means a new room; otherwise a room frees up. The running count's maximum is the answer.",
              "Same O(n log n) from the two sorts, but with no heap and a smaller constant. It also generalises to \"maximum concurrent X\" problems where you never need to know <em>which</em> interval is which.",
              "The heap version is preferable when you need the rooms themselves &mdash; assigning each meeting to a specific room, say &mdash; because the sweep discards that identity."
            ],
            "code": "def min_meeting_rooms(intervals):\n    starts = sorted(s for s, _ in intervals)\n    ends = sorted(e for _, e in intervals)\n\n    rooms = best = 0\n    j = 0\n    for start in starts:\n        while ends[j] <= start:\n            rooms -= 1\n            j += 1\n        rooms += 1\n        best = max(best, rooms)\n    return best",
            "best": false,
            "tag": "no heap"
          }
        ],
        "tests": "assert min_meeting_rooms([[0, 30], [5, 10], [15, 20]]) == 2\nassert min_meeting_rooms([[7, 10], [2, 4]]) == 1\nassert min_meeting_rooms([[1, 5]]) == 1\nassert min_meeting_rooms([[1, 5], [5, 9]]) == 1          # touching shares a room\nassert min_meeting_rooms([[1, 10], [2, 7], [3, 19], [8, 12], [10, 20], [11, 30]]) == 4\n\nimport random\nrandom.seed(23)\nfor _ in range(40):\n    data = []\n    for _ in range(random.randint(1, 10)):\n        s = random.randint(0, 20)\n        data.append([s, s + random.randint(1, 8)])\n    # brute force: busiest instant, checked on half-integer ticks\n    busiest = 0\n    for t in range(0, 40):\n        busiest = max(busiest, sum(1 for s, e in data if s <= t < e))\n    assert min_meeting_rooms([list(x) for x in data]) == busiest, data",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "refueling-stops",
        "num": 36,
        "lc": 871,
        "slug": "minimum-number-of-refueling-stops",
        "url": "https://leetcode.com/problems/minimum-number-of-refueling-stops/",
        "premium": false,
        "name": "Minimum Number of Refueling Stops",
        "difficulty": "hard",
        "tags": [
          "Array",
          "Dynamic Programming",
          "Greedy",
          "Heap (Priority Queue)"
        ],
        "statement": [
          "A car travels from a starting position to a destination which is <code>target</code> miles east of the starting position.",
          "There are gas stations along the way. The gas stations are represented as an array <code>stations</code> where <code>stations[i] = [position<sub>i</sub>, fuel<sub>i</sub>]</code> indicates that the <code>i<sup>th</sup></code> gas station is <code>position<sub>i</sub></code> miles east of the starting position and has <code>fuel<sub>i</sub></code> liters of gas.",
          "The car starts with an infinite tank of gas, which initially has <code>startFuel</code> liters of fuel in it. It uses one liter of gas per one mile that it drives. When the car reaches a gas station, it may stop and refuel, transferring all the gas from the station into the car.",
          "Return <em>the minimum number of refueling stops the car must make in order to reach its destination</em>. If it cannot reach the destination, return <code>-1</code>.",
          "Note that if the car reaches a gas station with <code>0</code> fuel left, the car can still refuel there. If the car reaches the destination with <code>0</code> fuel left, it is still considered to have arrived."
        ],
        "examples": [
          {
            "input": "target = 1, startFuel = 1, stations = [] Output: 0 Explanation: We can reach the target without refueling.",
            "output": "0 Explanation: We can reach the target without refueling.",
            "explanation": "We can reach the target without refueling."
          },
          {
            "input": "target = 100, startFuel = 1, stations = [[10,100]] Output: -1 Explanation: We can not reach the target (or even the first gas station).",
            "output": "-1 Explanation: We can not reach the target (or even the first gas station).",
            "explanation": "We can not reach the target (or even the first gas station)."
          },
          {
            "input": "target = 100, startFuel = 10, stations = [[10,60],[20,30],[30,30],[60,40]] Output: 2 Explanation: We start with 10 liters of fuel. We drive to position 10, expending 10 liters of fuel. We refuel from 0 liters to 60 liters of gas. Then, we drive from position 10 to position 60 (expending 50 liters of fuel), and refuel from 10 liters to 50 liters of gas. We then drive to and reach the target. We made 2 refueling stops along the way, so we return 2.",
            "output": "2 Explanation: We start with 10 liters of fuel. We drive to position 10, expending 10 liters of fuel. We refuel from 0 liters to 60 liters of gas. Then, we drive from position 10 to position 60 (expending 50 liters of fuel), and refuel from 10 liters to 50 liters of gas. We then drive to and reach the target. We made 2 refueling stops along the way, so we return 2.",
            "explanation": "We start with 10 liters of fuel. We drive to position 10, expending 10 liters of fuel. We refuel from 0 liters to 60 liters of gas. Then, we drive from position 10 to position 60 (expending 50 liters of fuel), and refuel from 10 liters to 50 liters of gas. We then drive to and reach the target. We made 2 refueling stops along the way, so we return 2."
          }
        ],
        "constraints": [
          "<code>1 &lt;= target, startFuel &lt;= 10<sup>9</sup></code>",
          "<code>0 &lt;= stations.length &lt;= 500</code>",
          "<code>1 &lt;= position<sub>i</sub> &lt; position<sub>i+1</sub> &lt; target</code>",
          "<code>1 &lt;= fuel<sub>i</sub> &lt; 10<sup>9</sup></code>"
        ],
        "note": "",
        "pitfall": "Greedily stopping at the first station that helps. You must defer the decision until you actually run out, then pick the best tank you have already driven past.",
        "approaches": [
          {
            "name": "Max-heap of fuel already driven past",
            "time": "O(n log n)",
            "space": "O(n)",
            "why": [
              "The trick is to refuel <em>retroactively</em>. Drive as far as the fuel allows, collecting every station you pass into a max-heap without stopping. When you run short, take the largest tank you have passed and pretend you stopped there.",
              "That is valid because the order of refuelling does not change the total fuel available at any point past those stations &mdash; only the count of stops matters, and taking the biggest tank each time minimises that count. This is a clean exchange argument: swapping any chosen station for a larger passed one never increases the stop count.",
              "Each station is pushed once and popped at most once: <strong>O(n log n)</strong>, O(n) space. Return <code>-1</code> when the heap empties before the target is reachable."
            ],
            "code": "def min_refuel_stops(target, start_fuel, stations):\n    passed = []                    # max-heap of fuel amounts, negated\n    fuel, stops, i = start_fuel, 0, 0\n\n    while fuel < target:\n        while i < len(stations) and stations[i][0] <= fuel:\n            heapq.heappush(passed, -stations[i][1])\n            i += 1\n        if not passed:\n            return -1              # cannot reach any further station\n        fuel -= heapq.heappop(passed)\n        stops += 1\n    return stops",
            "best": true,
            "tag": ""
          }
        ],
        "tests": "assert min_refuel_stops(1, 1, []) == 0\nassert min_refuel_stops(100, 1, [[10, 100]]) == -1\nassert min_refuel_stops(100, 10, [[10, 60], [20, 30], [30, 30], [60, 40]]) == 2\nassert min_refuel_stops(1000, 299, [[13, 21], [26, 115], [100, 47], [225, 99], [299, 141], [444, 198], [608, 190], [636, 157], [647, 255], [841, 123]]) == 4\nassert min_refuel_stops(5, 5, [[1, 1]]) == 0",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "find-median-from-data-stream",
        "num": 37,
        "lc": 295,
        "slug": "find-median-from-data-stream",
        "url": "https://leetcode.com/problems/find-median-from-data-stream/",
        "premium": false,
        "name": "Find Median from Data Stream",
        "difficulty": "hard",
        "tags": [
          "Two Pointers",
          "Design",
          "Sorting",
          "Heap (Priority Queue)",
          "Data Stream"
        ],
        "statement": [
          "The <strong>median</strong> is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.",
          "<ul>\n <li>For example, for <code>arr = [2,3,4]</code>, the median is <code>3</code>.</li>\n <li>For example, for <code>arr = [2,3]</code>, the median is <code>(2 + 3) / 2 = 2.5</code>.</li>\n</ul>\n\nImplement the MedianFinder class:",
          "<ul>\n <li><code>MedianFinder()</code> initializes the <code>MedianFinder</code> object.</li>\n <li><code>void addNum(int num)</code> adds the integer <code>num</code> from the data stream to the data structure.</li>\n <li><code>double findMedian()</code> returns the median of all elements so far. Answers within <code>10<sup>-5</sup></code> of the actual answer will be accepted.</li>\n</ul>"
        ],
        "examples": [
          {
            "input": "[\"MedianFinder\", \"addNum\", \"addNum\", \"findMedian\", \"addNum\", \"findMedian\"] [[], [1], [2], [], [3], []]",
            "output": "[null, null, null, 1.5, null, 2.0]",
            "explanation": "MedianFinder medianFinder = new MedianFinder(); medianFinder.addNum(1); // arr = [1] medianFinder.addNum(2); // arr = [1, 2] medianFinder.findMedian(); // return 1.5 (i.e., (1 + 2) / 2) medianFinder.addNum(3); // arr[1, 2, 3] medianFinder.findMedian(); // return 2.0"
          }
        ],
        "constraints": [
          "<code>-10<sup>5</sup> &lt;= num &lt;= 10<sup>5</sup></code>",
          "There will be at least one element in the data structure before calling <code>findMedian</code>.",
          "At most <code>5 * 10<sup>4</sup></code> calls will be made to <code>addNum</code> and <code>findMedian</code>."
        ],
        "note": "",
        "pitfall": "",
        "approaches": [
          {
            "name": "Max-heap of the low half, min-heap of the high half",
            "time": "O(log n) add, O(1) find",
            "space": "O(n)",
            "why": [
              "Split the values in two. <code>small</code> is a max-heap holding the lower half, <code>large</code> is a min-heap holding the upper half. The median is then either the top of <code>small</code> or the average of the two tops &mdash; both O(1) reads.",
              "The invariant to state: every element of <code>small</code> is &le; every element of <code>large</code>, and their sizes differ by at most one. Maintaining it is the whole implementation.",
              "The neat way to maintain it: always push onto <code>small</code>, immediately move its top to <code>large</code>, then move back if <code>large</code> has grown too big. Two pushes and two pops keeps you from having to reason about which side the new value belongs on.",
              "<code>add</code> is <strong>O(log n)</strong>, <code>find</code> is <strong>O(1)</strong>. A sorted list would give O(1) find but O(n) insert; a plain list gives O(1) insert but O(n log n) find."
            ],
            "code": "class MedianFinder:\n    def __init__(self):\n        self.small = []      # max-heap (negated): the lower half\n        self.large = []      # min-heap: the upper half\n\n    def add_num(self, num):\n        heapq.heappush(self.small, -num)\n        # hand the largest of the low half up\n        heapq.heappush(self.large, -heapq.heappop(self.small))\n        # keep small the same size or one bigger\n        if len(self.large) > len(self.small):\n            heapq.heappush(self.small, -heapq.heappop(self.large))\n\n    def find_median(self):\n        if len(self.small) > len(self.large):\n            return float(-self.small[0])\n        return (-self.small[0] + self.large[0]) / 2.0",
            "best": true,
            "tag": ""
          },
          {
            "name": "Sorted list with bisect",
            "time": "O(n) add, O(1) find",
            "space": "O(n)",
            "why": [
              "<code>bisect.insort</code> keeps one sorted list, so the median is a direct index. The binary search is O(log n) but the insertion shifts the tail, making each add O(n).",
              "For a few thousand values this is faster in practice than the two heaps, because the memory move is a fast contiguous copy while heap operations chase pointers in Python objects. Worth saying out loud &mdash; asymptotics are not the only argument &mdash; but the heaps win as n grows."
            ],
            "code": "import bisect\n\n\nclass MedianFinder:\n    def __init__(self):\n        self.data = []\n\n    def add_num(self, num):\n        bisect.insort(self.data, num)\n\n    def find_median(self):\n        n = len(self.data)\n        mid = n // 2\n        if n % 2:\n            return float(self.data[mid])\n        return (self.data[mid - 1] + self.data[mid]) / 2.0",
            "best": false,
            "tag": ""
          }
        ],
        "tests": "mf = MedianFinder()\nmf.add_num(1)\nmf.add_num(2)\nassert mf.find_median() == 1.5\nmf.add_num(3)\nassert mf.find_median() == 2.0\n\nmf = MedianFinder()\nmf.add_num(-1)\nassert mf.find_median() == -1.0\nmf.add_num(-2)\nassert mf.find_median() == -1.5\nmf.add_num(-3)\nassert mf.find_median() == -2.0\n\nimport random, statistics\nrandom.seed(29)\nfor _ in range(30):\n    mf = MedianFinder()\n    seen = []\n    for _ in range(random.randint(1, 40)):\n        v = random.randint(-30, 30)\n        mf.add_num(v)\n        seen.append(v)\n        assert mf.find_median() == statistics.median(seen)",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      },
      {
        "id": "sliding-window-median",
        "num": 38,
        "lc": 480,
        "slug": "sliding-window-median",
        "url": "https://leetcode.com/problems/sliding-window-median/",
        "premium": false,
        "name": "Sliding Window Median",
        "difficulty": "hard",
        "tags": [
          "Array",
          "Hash Table",
          "Sliding Window",
          "Heap (Priority Queue)",
          "Treap"
        ],
        "statement": [
          "The <strong>median</strong> is the middle value in an ordered integer list. If the size of the list is even, there is no middle value. So the median is the mean of the two middle values.",
          "<ul>\n <li>For examples, if <code>arr = [2,<u>3</u>,4]</code>, the median is <code>3</code>.</li>\n <li>For examples, if <code>arr = [1,<u>2,3</u>,4]</code>, the median is <code>(2 + 3) / 2 = 2.5</code>.</li>\n</ul>\n\nYou are given an integer array <code>nums</code> and an integer <code>k</code>. There is a sliding window of size <code>k</code> which is moving from the very left of the array to the very right. You can only see the <code>k</code> numbers in the window. Each time the sliding window moves right by one position.",
          "Return <em>the median array for each window in the original array</em>. Answers within <code>10<sup>-5</sup></code> of the actual value will be accepted."
        ],
        "examples": [
          {
            "input": "nums = [1,3,-1,-3,5,3,6,7], k = 3 Output: [1.00000,-1.00000,-1.00000,3.00000,5.00000,6.00000]",
            "output": "[1.00000,-1.00000,-1.00000,3.00000,5.00000,6.00000]",
            "explanation": "Window position Median --------------- ----- [1 3 -1] -3 5 3 6 7 1 1 [3 -1 -3] 5 3 6 7 -1 1 3 [-1 -3 5] 3 6 7 -1 1 3 -1 [-3 5 3] 6 7 3 1 3 -1 -3 [5 3 6] 7 5 1 3 -1 -3 5 [3 6 7] 6"
          },
          {
            "input": "nums = [1,2,3,4,2,3,1,4,2], k = 3 Output: [2.00000,3.00000,3.00000,3.00000,2.00000,3.00000,2.00000]",
            "output": "[2.00000,3.00000,3.00000,3.00000,2.00000,3.00000,2.00000]"
          }
        ],
        "constraints": [
          "<code>1 &lt;= k &lt;= nums.length &lt;= 10<sup>5</sup></code>",
          "<code>-2<sup>31</sup> &lt;= nums[i] &lt;= 2<sup>31</sup> - 1</code>"
        ],
        "note": "",
        "pitfall": "Using <code>len(heap)</code> as the half size once lazy deletion is in play. The heaps contain values that have already logically left the window.",
        "approaches": [
          {
            "name": "Sorted window with bisect",
            "time": "O(n k)",
            "space": "O(k)",
            "why": [
              "Keep the window as a sorted list. Each step, binary-search the outgoing value and delete it, then binary-search the incoming value and insert it. The median is two index reads.",
              "Both <code>bisect</code> calls are O(log k), but the list operations shift elements, so each step is O(k) and the total is <strong>O(n k)</strong>.",
              "For interview purposes this is the right first answer: it is eight lines, obviously correct, and at LeetCode's limits it passes. Offer the two-heap version as the improvement."
            ],
            "code": "import bisect\n\n\ndef median_sliding_window(nums, k):\n    window = sorted(nums[:k])\n    half, odd = k // 2, k % 2\n\n    def median():\n        if odd:\n            return float(window[half])\n        return (window[half - 1] + window[half]) / 2.0\n\n    out = [median()]\n    for i in range(k, len(nums)):\n        window.pop(bisect.bisect_left(window, nums[i - k]))\n        bisect.insort(window, nums[i])\n        out.append(median())\n    return out",
            "best": true,
            "tag": "what to write first"
          },
          {
            "name": "Two heaps with lazy deletion",
            "time": "O(n log k)",
            "space": "O(k)",
            "why": [
              "The same two-heap split as the running median, plus the one thing heaps cannot do: remove an arbitrary element. <code>heapq</code> only pops the root, and the value leaving the window is usually somewhere in the middle.",
              "The fix is <strong>lazy deletion</strong>. Record the departing value in a <code>delayed</code> counter and adjust the logical size, but leave it in the heap. Only when a stale value surfaces at a root is it actually popped. Every element is deleted at most once, so the amortised cost stays O(log k).",
              "This is why the sizes must be tracked in separate counters: <code>len(heap)</code> now counts ghosts. Getting that wrong is the classic bug, and it only shows up on windows where a duplicate straddles the two halves.",
              "<strong>O(n log k)</strong> time, O(k) space. Real, but a lot of machinery &mdash; in Python, <code>sortedcontainers.SortedList</code> gives O(log k) with none of it."
            ],
            "code": "def median_sliding_window(nums, k):\n    small, large = [], []          # max-heap (negated) | min-heap\n    delayed = Counter()\n    n_small = n_large = 0\n\n    def prune(heap):\n        \"\"\"Drop already-deleted values sitting at the root.\"\"\"\n        while heap:\n            value = -heap[0] if heap is small else heap[0]\n            if delayed[value]:\n                delayed[value] -= 1\n                heapq.heappop(heap)\n            else:\n                break\n\n    def rebalance():\n        nonlocal n_small, n_large\n        while n_small > n_large + 1:\n            heapq.heappush(large, -heapq.heappop(small))\n            n_small, n_large = n_small - 1, n_large + 1\n            prune(small)\n        while n_small < n_large:\n            heapq.heappush(small, -heapq.heappop(large))\n            n_small, n_large = n_small + 1, n_large - 1\n            prune(large)\n\n    def add(value):\n        nonlocal n_small, n_large\n        if not small or value <= -small[0]:\n            heapq.heappush(small, -value)\n            n_small += 1\n        else:\n            heapq.heappush(large, value)\n            n_large += 1\n        rebalance()\n\n    def remove(value):\n        nonlocal n_small, n_large\n        delayed[value] += 1\n        if small and value <= -small[0]:\n            n_small -= 1\n            if value == -small[0]:\n                prune(small)\n        else:\n            n_large -= 1\n            if large and value == large[0]:\n                prune(large)\n        rebalance()\n\n    out = []\n    for i, value in enumerate(nums):\n        add(value)\n        if i >= k:\n            remove(nums[i - k])\n        if i >= k - 1:\n            out.append(float(-small[0]) if k % 2\n                       else (-small[0] + large[0]) / 2.0)\n    return out",
            "best": false,
            "tag": "asymptotically better"
          }
        ],
        "tests": "import random, statistics\n\ngot = median_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3)\nassert got == [1.0, -1.0, -1.0, 3.0, 5.0, 6.0]\nassert median_sliding_window([1, 2, 3, 4, 2, 3, 1, 4, 2], 3) == [2.0, 3.0, 3.0, 3.0, 2.0, 3.0, 2.0]\nassert median_sliding_window([1], 1) == [1.0]\nassert median_sliding_window([1, 4, 2, 3], 4) == [2.5]\nassert median_sliding_window([2147483647, 2147483647], 2) == [2147483647.0]\n\nrandom.seed(31)\nfor _ in range(40):\n    n = random.randint(1, 25)\n    data = [random.randint(-8, 8) for _ in range(n)]     # duplicates on purpose\n    k = random.randint(1, n)\n    expected = [float(statistics.median(data[i:i + k]))\n                for i in range(n - k + 1)]\n    assert median_sliding_window(list(data), k) == expected, (data, k)",
        "topic": "heap",
        "topicTitle": "Heaps and Priority Queues"
      }
    ],
    "count": 20
  },
  {
    "id": "dp",
    "title": "Dynamic Programming",
    "status": "stub",
    "target": null,
    "sections": [],
    "problems": [],
    "count": 0
  },
  {
    "id": "backtracking",
    "title": "Backtracking",
    "status": "stub",
    "target": null,
    "sections": [],
    "problems": [],
    "count": 0
  },
  {
    "id": "graphs",
    "title": "Graphs",
    "status": "stub",
    "target": 20,
    "sections": [],
    "problems": [],
    "count": 0
  },
  {
    "id": "greedy",
    "title": "Greedy",
    "status": "stub",
    "target": 3,
    "sections": [],
    "problems": [],
    "count": 0
  },
  {
    "id": "linked-lists",
    "title": "Linked Lists",
    "status": "stub",
    "target": 3,
    "sections": [],
    "problems": [],
    "count": 0
  },
  {
    "id": "bits",
    "title": "Bit Manipulation",
    "status": "stub",
    "target": 3,
    "sections": [],
    "problems": [],
    "count": 0
  },
  {
    "id": "sliding-window",
    "title": "Sliding Window",
    "status": "stub",
    "target": 2,
    "sections": [],
    "problems": [],
    "count": 0
  },
  {
    "id": "hashing",
    "title": "Grouping and Lookup",
    "status": "stub",
    "target": 2,
    "sections": [],
    "problems": [],
    "count": 0
  },
  {
    "id": "binary-search",
    "title": "Binary Search",
    "status": "stub",
    "target": 4,
    "sections": [],
    "problems": [],
    "count": 0
  },
  {
    "id": "monotonic-stack",
    "title": "Monotonic Stack",
    "status": "stub",
    "target": 2,
    "sections": [],
    "problems": [],
    "count": 0
  },
  {
    "id": "union-find",
    "title": "Union Find (DSU)",
    "status": "stub",
    "target": 2,
    "sections": [],
    "problems": [],
    "count": 0
  },
  {
    "id": "trie",
    "title": "Tries",
    "status": "stub",
    "target": 3,
    "sections": [],
    "problems": [],
    "count": 0
  },
  {
    "id": "sorting",
    "title": "Sorting with Greedy and Two Pointers",
    "status": "stub",
    "target": 1,
    "sections": [],
    "problems": [],
    "count": 0
  },
  {
    "id": "math",
    "title": "Math and Number Theory",
    "status": "stub",
    "target": 2,
    "sections": [],
    "problems": [],
    "count": 0
  }
];
