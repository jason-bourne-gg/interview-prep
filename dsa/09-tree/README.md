# Tree — 14 problems

The biggest category in the list, and the one where the same three lines of
recursion keep reappearing under different names.

| # | Problem | Difficulty | Brute | Optimal | Pattern |
|---|---|---|---|---|---|
| 60 | [Maximum Depth of Binary Tree](60-maximum-depth-of-binary-tree.js) | Easy | O(n·h) | **O(n)** | DFS |
| 61 | [Same Tree](61-same-tree.js) | Easy | O(n), O(n) space | **O(n), O(h)** | Parallel DFS |
| 62 | [Invert / Flip Binary Tree](62-invert-binary-tree.js) | Easy | O(n), O(n) space | **O(n), O(h)** | DFS |
| 63 | [Binary Tree Maximum Path Sum](63-binary-tree-maximum-path-sum.js) | Hard | O(n²) | **O(n)** | Postorder, two quantities |
| 64 | [Binary Tree Level Order Traversal](64-binary-tree-level-order-traversal.js) | Medium | O(n·h) | **O(n)** | BFS |
| 65 | [Serialize and Deserialize Binary Tree](65-serialize-and-deserialize-binary-tree.js) | Hard | O(2^h) | **O(n)** | Preorder + null markers |
| 66 | [Subtree of Another Tree](66-subtree-of-another-tree.js) | Easy | O(m·n) | **O(m+n)** | DFS / substring search |
| 67 | [Construct Binary Tree from Preorder and Inorder](67-construct-binary-tree-from-preorder-and-inorder-traversal.js) | Medium | O(n²) | **O(n)** | Divide and conquer |
| 68 | [Validate Binary Search Tree](68-validate-binary-search-tree.js) | Medium | O(n), O(n) space | **O(n), O(h)** | Bounds propagation |
| 69 | [Kth Smallest Element in a BST](69-kth-smallest-element-in-a-bst.js) | Medium | O(n) | **O(h + k)** | Inorder with early exit |
| 70 | [Lowest Common Ancestor of a BST](70-lowest-common-ancestor-of-a-bst.js) | Easy | O(n) | **O(h), O(1) space** | BST descent |
| 71 | [Implement Trie (Prefix Tree)](71-implement-trie.js) | Medium | O(n·L) per query | **O(L)** | Trie |
| 72 | [Add and Search Word](72-add-and-search-word.js) | Medium | O(n·L) | **O(L)**, O(26^d·L) with d dots | Trie + DFS |
| 73 | [Word Search II](73-word-search-ii.js) | Hard | O(W·R·C·4^L) | **O(R·C·4^L)** | Trie + backtracking |

Run any file directly to check it: `node dsa/09-tree/68-validate-binary-search-tree.js`

---

## What this category is really teaching

**Four of them are one recursion where the base case does the work.** Maximum
Depth, Same Tree, Invert, and the honest answer to Subtree all reduce to "handle
null, then combine the two children". If you find yourself special-casing "this
node has no left child", the base case is wrong.

**Two are about returning one thing while recording another.** In Maximum Path
Sum the value handed to the parent is the best path down ONE arm, because a path
cannot fork, while the value recorded in the running best may use both arms.
Conflating them is the single most common wrong answer in the category, and the
same split shows up in diameter, longest univalue path, and house-robber-on-a-tree.

**Four are really about traversal order.** Level Order is BFS with the level size
snapshotted before the inner loop. Serialize works because preorder plus null
markers is self-delimiting, so the rebuild needs no lengths or indices. Construct
from Preorder and Inorder works because preorder names the root and inorder says
how big the left subtree is. Validate BST and Kth Smallest both lean on inorder
emitting a BST in sorted order.

**Three are BST problems, and in all three the ordering replaces a search.** In a
general binary tree you must look in both subtrees to find where something is. In
a BST the value tells you which way to go, so Validate, Kth Smallest and LCA are
all single descents — which is why their optimal bound is O(h), not O(n).

The BST problem with the most to teach is Validate. The answer people give first
is "compare each node to its two children", and it is wrong: the tree
`[5, 4, 6, null, null, 3, 7]` passes every parent-child check while 3 sits in 5's
right subtree. The BST property is not local, so the check has to carry an
interval down from the ancestors.

**The last three are one problem, built up.** Implement Trie establishes the
structure: a node per character position, an `isWord` flag rather than a sentinel
character. Add and Search Word changes one thing — a '.' means you cannot take a
single edge, so the walk becomes a DFS over all children at that position. Word
Search II inverts the naive loop: instead of running a board search once per word
— O(W · R·C·4^L) — you carry a trie node alongside the grid position and traverse
the board ONCE, O(R·C·4^L). W leaves the complexity entirely. Words sharing a
prefix are explored together, a path no word continues is abandoned on the spot,
and pruning exhausted nodes shrinks the trie as the search runs.

## The JS-specific traps in this category

- **`queue.shift()` is O(n)** on a large V8 array, so the textbook BFS quietly
  becomes O(n²). Every BFS here uses an index cursor into the array instead.
- **Recursion depth.** V8 gives roughly ten thousand frames. A balanced tree is
  fine; a degenerate one-sided tree of 100,000 nodes is not. That is the only
  reason the iterative versions in 60, 61, 64, 67, 68, 69 and 70 exist — the
  recursion is not worse, it just cannot run.
- **`-Infinity` as a sentinel is a real value.** Validate BST uses `null` bounds
  and Kth Smallest keeps a previous *node* rather than a previous number, so a
  tree containing `0`, `-Infinity` or a negative value still works. For the same
  reason, test `node.val === undefined`, never `!node.val`.
- **`Math.max(...arr)` throws on a large array** — spread hits the argument
  limit around 65k. Fine for the brute force in 60, not for real input.
- **A recursion cursor must be a closure variable, not a parameter.** In
  Serialize and Construct, `i` lives outside the helper: pass it as an argument
  and the number is copied, so the left subtree's progress is invisible to the
  right one.
- **Restore what you mutate.** Word Search II marks a visited cell by
  overwriting it and must put it back on the way out; Invert mutates in place,
  so tests build a fresh tree per assertion.
- **A plain object is a bad trie node** — inherited keys and `__proto__` are
  live. These files use a `Map`, which also drops the assumption that the
  alphabet is 26 lowercase letters.
- **`JSON.stringify` compares trees** only because `TreeNode` holds nothing but
  `val`, `left` and `right`. The augmented Kth Smallest adds a `count` field to
  every node, so a tree is no longer stringify-comparable after it has run.

See [javascript/pitfalls.md](../../javascript/pitfalls.md) for the full list.
