'use strict'
/**
 * INVERT / FLIP BINARY TREE
 *
 * Mirror the tree: every node's left and right subtrees swap places, all the
 * way down. Return the root.
 *
 *   [4, 2, 7, 1, 3, 6, 9]  ->  [4, 7, 2, 9, 6, 3, 1]
 *
 * Pattern: DFS / BFS on a tree
 */

const { TreeNode, toTree } = require('../_lib/structures')

/**
 * Approach 1 — rebuild a new tree.  O(n) time, O(n) space.
 *
 * Allocate a fresh node per position, wiring the new left from the old right.
 * The only reason to reach for this is if the caller must keep the original
 * tree intact — otherwise it is the same walk with n extra allocations.
 * Say out loud which one the interviewer wants: "should I mutate in place?"
 */
function invertTreeCopy(root) {
  if (!root) return null
  return new TreeNode(root.val, invertTreeCopy(root.right), invertTreeCopy(root.left))
}

/**
 * Approach 2 — recursion, in place.  O(n) time, O(h) stack.  ** optimal **
 *
 * The swap is purely local: exchange this node's two child pointers, then fix
 * the subtrees. Order does not matter — swap first then recurse, or recurse
 * first then swap — because swapping a node's children never changes what is
 * inside either subtree, only which side it hangs on.
 *
 * That independence is the whole insight. It is why there is no bookkeeping
 * here and no partial state to get wrong.
 */
function invertTree(root) {
  if (!root) return null
  ;[root.left, root.right] = [root.right, root.left]
  invertTree(root.left)
  invertTree(root.right)
  return root
}

/**
 * Approach 3 — BFS with a queue.  O(n) time, O(w) space.
 *
 * Because the swap is local, visit order is irrelevant — any traversal that
 * reaches every node works. So BFS is a drop-in, and it is the answer to
 * "what if the tree is a million nodes deep and you cannot recurse?".
 *
 * Index cursor rather than shift(): shift() on a big array is O(n) in V8.
 */
function invertTreeBfs(root) {
  const queue = root ? [root] : []
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i]
    ;[node.left, node.right] = [node.right, node.left]
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }
  return root
}

module.exports = { invertTree, invertTreeCopy, invertTreeBfs }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const fn of [invertTree, invertTreeCopy, invertTreeBfs]) {
    eq(fn(toTree([4, 2, 7, 1, 3, 6, 9])), toTree([4, 7, 2, 9, 6, 3, 1]), `${fn.name} worked example`)
    eq(fn(null), null, `${fn.name} empty tree`)
    eq(fn(toTree([1])), toTree([1]), `${fn.name} single node`)
    // Lopsided: the classic bug is only swapping when BOTH children exist.
    eq(fn(toTree([1, 2])), toTree([1, null, 2]), `${fn.name} left child only`)
    eq(fn(toTree([1, null, 2])), toTree([1, 2]), `${fn.name} right child only`)
    eq(fn(toTree([2, 1, 3, null, null, 4])), toTree([2, 3, 1, null, 4]), `${fn.name} uneven depths`)
    eq(fn(toTree([1, 1, 1, 2])), toTree([1, 1, 1, null, null, null, 2]), `${fn.name} duplicate values`)
    // Inverting twice is the identity.
    eq(fn(fn(toTree([4, 2, 7, 1, 3, 6, 9]))), toTree([4, 2, 7, 1, 3, 6, 9]), `${fn.name} double invert is identity`)
  }

  // The in-place versions must return the node they were handed, not a copy.
  const root = toTree([1, 2, 3])
  eq(invertTree(root) === root, true, 'invertTree mutates in place')
  const root2 = toTree([1, 2, 3])
  eq(invertTreeCopy(root2) === root2, false, 'invertTreeCopy leaves the original alone')
  eq(root2, toTree([1, 2, 3]), 'invertTreeCopy did not touch the input')

  report('invert-binary-tree')
}
