'use strict'
/**
 * MAXIMUM DEPTH OF BINARY TREE
 *
 * Return the number of nodes on the longest root-to-leaf path. An empty tree
 * has depth 0, a lone root has depth 1.
 *
 *   [3, 9, 20, null, null, 15, 7]  ->  3      (3 -> 20 -> 15)
 *
 * Pattern: DFS / BFS on a tree
 */

const { toTree } = require('../_lib/structures')

/**
 * Approach 1 — brute force: build every root-to-leaf path, take the longest.
 * O(n * h) time, O(n * h) space.
 *
 * The literal reading of the question. It is worth writing once because it is
 * the template for the problems that genuinely need the paths — Path Sum II,
 * Binary Tree Paths — and because its cost shows what we are paying for: every
 * path is copied at every leaf, so h work per leaf and O(n) leaves.
 *
 * The observation that collapses it: we never look at the paths, only at their
 * lengths. A length can be computed bottom-up without ever holding a path.
 */
function maxDepthPaths(root) {
  const lengths = []
  const walk = (node, path) => {
    if (!node) return
    const next = [...path, node.val]
    if (!node.left && !node.right) { lengths.push(next.length); return }
    walk(node.left, next)
    walk(node.right, next)
  }
  walk(root, [])
  return lengths.length ? Math.max(...lengths) : 0
}

/**
 * Approach 2 — BFS, counting levels.  O(n) time, O(w) space.
 *
 * Process the queue one full level at a time and count how many levels you get
 * through. Space is the widest level rather than the height, so this is the
 * version that survives a 100,000-node linked-list-shaped tree where the
 * recursion blows the stack.
 */
function maxDepthBfs(root) {
  if (!root) return 0
  let level = [root], depth = 0
  while (level.length) {
    const next = []
    for (const node of level) {
      if (node.left) next.push(node.left)
      if (node.right) next.push(node.right)
    }
    level = next
    depth++
  }
  return depth
}

/**
 * Approach 3 — explicit stack, carrying the depth.  O(n) time, O(h) space.
 *
 * The mechanical translation of the recursion below: whatever the call stack
 * was holding for you — the node, and how deep it sits — you now push yourself.
 * No better asymptotically, but it cannot overflow, and it is the template for
 * every "now do it without recursion" follow-up.
 */
function maxDepthStack(root) {
  if (!root) return 0
  const stack = [[root, 1]]
  let best = 0
  while (stack.length) {
    const [node, depth] = stack.pop()
    best = Math.max(best, depth)
    if (node.left) stack.push([node.left, depth + 1])
    if (node.right) stack.push([node.right, depth + 1])
  }
  return best
}

/**
 * Approach 4 — recursion.  O(n) time, O(h) stack.  ** optimal **
 *
 * The whole problem in one sentence: my depth is one more than my deeper child.
 * Nothing is carried down and nothing is accumulated on the side — the answer
 * flows back up.
 *
 * The base case does the real work. A null child is depth 0, so a leaf comes
 * out as 1 without a special case for "has no children", and the empty tree
 * falls out of the same line.
 *
 * The one caveat: h is the height, so the stack is O(log n) on a balanced tree
 * but O(n) on a degenerate one. That, and only that, is when to reach for
 * approach 2 or 3 instead.
 */
function maxDepth(root) {
  if (!root) return 0
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
}

module.exports = { maxDepth, maxDepthPaths, maxDepthBfs, maxDepthStack }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  // One long left spine: depth equals node count, and h equals n.
  const spine = toTree([1, 2, null, 3, null, 4])

  for (const fn of [maxDepth, maxDepthPaths, maxDepthBfs, maxDepthStack]) {
    eq(fn(toTree([3, 9, 20, null, null, 15, 7])), 3, `${fn.name} worked example`)
    eq(fn(null), 0, `${fn.name} empty tree`)
    eq(fn(toTree([1])), 1, `${fn.name} single node`)
    eq(fn(toTree([1, 2])), 2, `${fn.name} left child only`)
    eq(fn(toTree([1, null, 2])), 2, `${fn.name} right child only`)
    eq(fn(spine), 4, `${fn.name} degenerate left spine`)
    eq(fn(toTree([1, 2, 2, 3, 3, 3, 3])), 3, `${fn.name} duplicate values do not matter`)
    // The deeper side is on the right, so a version that returns the LEFT
    // depth, or the first one it computes, fails here.
    eq(fn(toTree([1, 2, 3, null, null, 4, 5, null, null, 6])), 4, `${fn.name} deeper side is on the right`)
    // Off-by-one: depth counts NODES, not edges. Two nodes is 2, not 1.
    eq(fn(toTree([0, 0])), 2, `${fn.name} counts nodes not edges, zero values`)
  }

  report('maximum-depth-of-binary-tree')
}
