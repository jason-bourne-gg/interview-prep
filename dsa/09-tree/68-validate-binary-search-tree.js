'use strict'
/**
 * VALIDATE BINARY SEARCH TREE
 *
 * A BST requires that EVERY value in a node's left subtree is smaller than the
 * node, and every value in its right subtree is larger. Strictly — equal values
 * are not allowed.
 *
 *   [2, 1, 3]                    ->  true
 *   [5, 4, 6, null, null, 3, 7]  ->  false   (3 sits in 5's right subtree)
 *
 * Pattern: DFS on a tree (bounds propagation) / inorder traversal
 */

const { toTree } = require('../_lib/structures')

/**
 * Approach 0 — the wrong answer, written out so you never give it.
 * O(n) time, O(h) space, and incorrect.
 *
 * "Check that each node is bigger than its left child and smaller than its
 * right child, then recurse." It reads like the definition and it is not.
 *
 * The counterexample:
 *
 *        5
 *       / \
 *      4   6
 *         / \
 *        3   7
 *
 * Every parent-child pair is fine: 4 < 5 < 6, and 3 < 6 < 7. But 3 is in 5's
 * RIGHT subtree while being smaller than 5, so the tree is not a BST. This
 * function returns true.
 *
 * The lesson generalises: the BST property is not local. A node constrains
 * every descendant, not just its two children, so the check has to carry
 * information down the tree. That is the whole point of approach 3.
 */
function isValidBstLocal(root) {
  if (!root) return true
  if (root.left && root.left.val >= root.val) return false
  if (root.right && root.right.val <= root.val) return false
  return isValidBstLocal(root.left) && isValidBstLocal(root.right)
}

/**
 * Approach 1 — inorder into an array, then check it is sorted.
 * O(n) time, O(n) space.
 *
 * The defining property restated: an inorder walk of a BST emits values in
 * increasing order. Collect them all, then scan for a non-increase. Strict
 * `<=` is what rejects duplicates.
 *
 * Correct and easy to defend, but it materialises the whole tree and it cannot
 * stop early — a tree that fails at the second node still gets fully walked.
 */
function isValidBstInorderArray(root) {
  const vals = []
  const walk = node => { if (!node) return; walk(node.left); vals.push(node.val); walk(node.right) }
  walk(root)
  for (let i = 1; i < vals.length; i++) if (vals[i] <= vals[i - 1]) return false
  return true
}

/**
 * Approach 2 — iterative inorder, keeping only the previous value.
 * O(n) time, O(h) space.
 *
 * You never need the whole sorted list, only the last value emitted. Keeping
 * one variable drops the O(n) array, and returning false the instant order
 * breaks means a tree that is wrong near the left edge costs O(h), not O(n).
 *
 * `prev` is a node reference, not a number seeded at -Infinity, so a tree
 * containing -Infinity itself is still handled.
 *
 * This is also the loop to reach for when asked to do it without recursion, and
 * it is the same skeleton as Kth Smallest in a BST.
 */
function isValidBstIterative(root) {
  const stack = []
  let node = root, prev = null
  while (node || stack.length) {
    while (node) { stack.push(node); node = node.left }
    node = stack.pop()
    if (prev && node.val <= prev.val) return false
    prev = node
    node = node.right
  }
  return true
}

/**
 * Approach 3 — min/max bounds pushed down.  O(n) time, O(h) space.  ** optimal **
 *
 * Each node inherits an open interval it must fall inside. Descending left
 * tightens the upper bound to the current value; descending right tightens the
 * lower bound. So on the counterexample above, node 3 arrives with the interval
 * (5, 6) and is rejected — the constraint from the root travelled down with it.
 *
 * Bounds start as null, meaning unbounded, rather than ±Infinity, so the check
 * is correct even for a tree holding Infinity as a value.
 *
 * Same O(n) as the inorder versions, and preferred because it says what a BST
 * IS rather than what a BST implies, and because it short-circuits on the first
 * violation anywhere in the tree.
 */
function isValidBst(root, low = null, high = null) {
  if (!root) return true
  if (low !== null && root.val <= low) return false
  if (high !== null && root.val >= high) return false
  return isValidBst(root.left, low, root.val) && isValidBst(root.right, root.val, high)
}

module.exports = { isValidBst, isValidBstLocal, isValidBstInorderArray, isValidBstIterative }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  const trap = [5, 4, 6, null, null, 3, 7]

  for (const fn of [isValidBst, isValidBstInorderArray, isValidBstIterative]) {
    eq(fn(toTree([2, 1, 3])), true, `${fn.name} worked example`)
    eq(fn(toTree(trap)), false, `${fn.name} grandchild violates an ancestor`)
    eq(fn(null), true, `${fn.name} empty tree`)
    eq(fn(toTree([1])), true, `${fn.name} single node`)
    // Duplicates are not allowed anywhere, including against an ancestor.
    eq(fn(toTree([2, 2])), false, `${fn.name} equal left child`)
    eq(fn(toTree([1, 1, 1])), false, `${fn.name} all equal`)
    eq(fn(toTree([2, 1, 3, null, null, 2])), false, `${fn.name} value equal to an ancestor`)
    // Off-by-one at the boundary: 1 is a valid left child of 2, 2 is not.
    eq(fn(toTree([2, 1])), true, `${fn.name} strictly smaller left child is fine`)
    eq(fn(toTree([10, 5, 15, null, null, 6, 20])), false, `${fn.name} deep right-subtree violation`)
    eq(fn(toTree([0, -1, 1])), true, `${fn.name} negatives and zero`)
    eq(fn(toTree([3, null, 5, 4, 6])), true, `${fn.name} right spine with children`)
    eq(fn(toTree([1, null, 2, null, 3])), true, `${fn.name} degenerate but valid`)
  }

  // The wrong answer, pinned. It agrees on easy inputs and fails the trap.
  eq(isValidBstLocal(toTree([2, 1, 3])), true, 'isValidBstLocal is right on the easy case')
  eq(isValidBstLocal(toTree(trap)), true, 'isValidBstLocal says true — this is the bug')
  eq(isValidBst(toTree(trap)), false, 'isValidBst says false — this is the fix')

  report('validate-binary-search-tree')
}
