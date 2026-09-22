'use strict'
/**
 * BINARY TREE MAXIMUM PATH SUM
 *
 * A path is any sequence of connected nodes; it does not have to pass through
 * the root and it cannot visit a node twice. Return the largest sum of values
 * along any such path. Values can be negative, and the path must hold at least
 * one node.
 *
 *   [-10, 9, 20, null, null, 15, 7]  ->  42      (15 -> 20 -> 7)
 *
 * Pattern: DFS on a tree (postorder, return one thing and record another)
 */

const { toTree } = require('../_lib/structures')

/**
 * Helper for the brute force: the best sum of a path that starts at `node` and
 * only ever walks downwards. Clamping at 0 means "a negative arm is worse than
 * no arm at all — just stop here".
 */
function bestDownward(node) {
  if (!node) return 0
  return Math.max(0, node.val + Math.max(bestDownward(node.left), bestDownward(node.right)))
}

/**
 * Approach 1 — brute force: try every node as the turning point.
 * O(n^2) time, O(h) space.
 *
 * Every path has exactly one highest node, where it stops going up and turns
 * down the other side. So enumerate that turning point: for each node, the best
 * path through it is node.val + best downward arm on the left + best downward
 * arm on the right.
 *
 * Correct, and quadratic, because bestDownward re-walks the entire subtree for
 * every node. Notice that the outer walk and the inner walk visit the same
 * nodes in the same order — that overlap is the thing to remove.
 */
function maxPathSumBrute(root) {
  if (!root) return -Infinity
  const here = root.val + bestDownward(root.left) + bestDownward(root.right)
  return Math.max(here, maxPathSumBrute(root.left), maxPathSumBrute(root.right))
}

/**
 * Approach 2 — one postorder pass.  O(n) time, O(h) stack.  ** optimal **
 *
 * The fix is to compute both quantities in the same recursion, and to be clear
 * that they are DIFFERENT quantities:
 *
 *   - what we RETURN to the parent: the best path that ends at this node and
 *     goes down ONE side, because the parent is going to extend it upward and
 *     a path cannot fork.
 *   - what we RECORD in `best`: the best path that TURNS here, which may use
 *     BOTH arms, because nothing extends it further.
 *
 * Returning the two-arm value is the classic bug in this problem. It reports
 * sums for shapes that are not paths at all — a Y with three branches.
 *
 * Math.max(0, ...) on each arm is the second half: a negative arm is dropped
 * rather than added, which is Kadane's "reset when the running total hurts",
 * applied to a tree.
 *
 * `best` starts at -Infinity, not 0, because the path must contain a node —
 * an all-negative tree answers with its largest (least negative) value.
 */
function maxPathSum(root) {
  let best = -Infinity

  const gain = node => {
    if (!node) return 0
    const left = Math.max(0, gain(node.left))
    const right = Math.max(0, gain(node.right))
    best = Math.max(best, node.val + left + right)   // path turning here
    return node.val + Math.max(left, right)          // path continuing upward
  }

  gain(root)
  return best
}

module.exports = { maxPathSum, maxPathSumBrute }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const fn of [maxPathSum, maxPathSumBrute]) {
    eq(fn(toTree([-10, 9, 20, null, null, 15, 7])), 42, `${fn.name} worked example`)
    eq(fn(toTree([1, 2, 3])), 6, `${fn.name} whole tree is the path`)
    eq(fn(toTree([5])), 5, `${fn.name} single node`)
    // All negative: the answer is a single node, not 0. Seeding best at 0 fails here.
    eq(fn(toTree([-3])), -3, `${fn.name} single negative node`)
    eq(fn(toTree([-2, -1])), -1, `${fn.name} all negative, best is the least negative`)
    // The turning point is not the root, and the root is worth skipping.
    eq(fn(toTree([2, -1, -2])), 2, `${fn.name} both arms are worth dropping`)
    // The fork trap. Node 2 has arms 4 and 5, so a version that returns
    // val + left + right hands 11 up to the root and reports 1 + 11 + 3 = 15
    // for a shape that is a Y, not a path. The real answer is 4 -> 2 -> 5.
    eq(fn(toTree([1, 2, 3, 4, 5])), 11, `${fn.name} best path does not reach the root`)
    // Same trap with identical values: 4 (leaf -> node -> root -> leaf), not 5.
    eq(fn(toTree([1, 1, 1, 1, 1])), 4, `${fn.name} duplicate values`)
    eq(fn(toTree([-1, 2, 3, 4])), 8, `${fn.name} path bends through the root`)
    eq(fn(toTree([0, 0, 0])), 0, `${fn.name} zeros`)
  }

  report('binary-tree-maximum-path-sum')
}
