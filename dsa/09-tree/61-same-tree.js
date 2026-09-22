'use strict'
/**
 * SAME TREE
 *
 * Two binary trees are the same when they have identical structure and
 * identical values at every position. Not "the same set of values" — the same
 * shape.
 *
 *   [1, 2, 3] vs [1, 2, 3]     ->  true
 *   [1, 2]    vs [1, null, 2]  ->  false    (same values, mirrored shape)
 *
 * Pattern: DFS on a tree (parallel traversal)
 */

const { toTree } = require('../_lib/structures')

/**
 * Approach 1 — serialise both, compare the strings.  O(n) time, O(n) space.
 *
 * Works, and it is worth writing because of the trap it exposes: the null
 * markers are not decoration. Drop them and [1, 2] and [1, null, 2] both
 * serialise to "1,2" and the function says true. The same trap sinks the naive
 * Subtree of Another Tree.
 *
 * Still worse than approach 2: it builds two whole strings even when the roots
 * already differ.
 */
function isSameTreeSerialise(p, q) {
  const enc = node => (node ? `(${node.val}${enc(node.left)}${enc(node.right)})` : '#')
  return enc(p) === enc(q)
}

/**
 * Approach 2 — recursion.  O(n) time, O(h) stack.  ** optimal **
 *
 * Walk both trees in lockstep. Three cases and nothing else: both null (agree),
 * exactly one null (disagree), both present (values must match and both
 * subtrees must match).
 *
 * The && short-circuits, so a mismatch near the root costs almost nothing —
 * this is O(n) worst case but usually returns far earlier.
 */
function isSameTree(p, q) {
  if (!p && !q) return true
  if (!p || !q) return false
  return p.val === q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right)
}

/**
 * Approach 3 — explicit stack.  O(n) time, O(h) space.
 *
 * Same logic, no recursion. Push the two nodes as a pair and keep the
 * invariant that everything on the stack is a pair of positions that must
 * agree. Pushing (left, left) and (right, right) is what keeps the two walks
 * aligned — pushing children individually loses the pairing and the whole
 * thing degenerates into comparing multisets.
 */
function isSameTreeIterative(p, q) {
  const stack = [[p, q]]
  while (stack.length) {
    const [a, b] = stack.pop()
    if (!a && !b) continue
    if (!a || !b || a.val !== b.val) return false
    stack.push([a.left, b.left], [a.right, b.right])
  }
  return true
}

module.exports = { isSameTree, isSameTreeSerialise, isSameTreeIterative }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const fn of [isSameTree, isSameTreeSerialise, isSameTreeIterative]) {
    eq(fn(toTree([1, 2, 3]), toTree([1, 2, 3])), true, `${fn.name} identical`)
    eq(fn(null, null), true, `${fn.name} both empty`)
    eq(fn(toTree([1]), null), false, `${fn.name} one empty`)
    eq(fn(toTree([1]), toTree([1])), true, `${fn.name} single node`)
    eq(fn(toTree([1, 2]), toTree([1, 2])), true, `${fn.name} single child both sides`)
    // Same values, mirrored shape. This is the case null markers exist for.
    eq(fn(toTree([1, 2]), toTree([1, null, 2])), false, `${fn.name} left child vs right child`)
    eq(fn(toTree([1, 2, 1]), toTree([1, 1, 2])), false, `${fn.name} values swapped`)
    // Deep mismatch: everything agrees until the last leaf.
    eq(fn(toTree([1, 2, 3, 4, 5]), toTree([1, 2, 3, 4, 6])), false, `${fn.name} deep mismatch`)
    eq(fn(toTree([1, 1, 1]), toTree([1, 1, 1])), true, `${fn.name} duplicate values`)
  }

  report('same-tree')
}
