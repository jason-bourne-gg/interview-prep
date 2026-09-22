'use strict'
/**
 * SUBTREE OF ANOTHER TREE
 *
 * Is subRoot equal to some node of root together with ALL of that node's
 * descendants? A partial match does not count — the subtree has to end where
 * subRoot ends.
 *
 *   root [3, 4, 5, 1, 2], subRoot [4, 1, 2]                    ->  true
 *   root [3, 4, 5, 1, 2, null, null, null, null, 0], same sub  ->  false
 *
 * Pattern: DFS on a tree (and string search, for the linear version)
 */

const { toTree } = require('../_lib/structures')

/** Structural equality, exactly as in Same Tree. Both the brute force and the anchored version lean on it. */
function isSame(a, b) {
  if (!a && !b) return true
  if (!a || !b) return false
  return a.val === b.val && isSame(a.left, b.left) && isSame(a.right, b.right)
}

/**
 * Approach 1 — brute force: try every node as the match point.
 * O(m * n) time, O(h) space.
 *
 * m nodes in root, n in subRoot. This is the answer most interviews accept,
 * and in practice it is fast, because isSame almost always bails on the first
 * value comparison. The quadratic case needs a pathological input — a tree of
 * 5,000 identical values against a subRoot of 5,000 identical values.
 */
function isSubtreeBrute(root, subRoot) {
  if (!subRoot) return true
  if (!root) return false
  if (isSame(root, subRoot)) return true
  return isSubtreeBrute(root.left, subRoot) || isSubtreeBrute(root.right, subRoot)
}

/**
 * Approach 2 — anchor on the root value first.  O(m * n) worst, O(m + k * n) typical.
 *
 * Only start a comparison at nodes whose value equals subRoot.val. k is how
 * many such nodes exist, usually tiny. The worst case is unchanged, which is
 * the point worth making: this is a constant-factor win, not a complexity win.
 * Recognising the difference is what pushes you to approach 3.
 */
function isSubtreeAnchored(root, subRoot) {
  if (!subRoot) return true
  let found = false
  const walk = node => {
    if (!node || found) return
    if (node.val === subRoot.val && isSame(node, subRoot)) { found = true; return }
    walk(node.left)
    walk(node.right)
  }
  walk(root)
  return found
}

/**
 * Approach 3 — serialise both, then substring search.  O(m + n) time and space.  ** optimal **
 *
 * A subtree is a contiguous run of a preorder walk — as long as the walk
 * records null children, so that each subtree's run is self-closing. Once both
 * trees are strings, "is this a subtree" is "is this a substring".
 *
 * The delimiters are the entire difficulty. Serialise values bare and separated
 * by commas and root [12] becomes "12" while subRoot [2] becomes "2", so
 * indexOf says true for two trees that share nothing. Wrapping every node as
 * (val left right) makes each encoding self-delimiting: [12] is "(12##)" and
 * [2] is "(2##)", and one is not a substring of the other.
 *
 * indexOf is not worst-case linear in the spec, but V8 uses a two-way search
 * that is linear in practice. For a guaranteed bound, say KMP — you will
 * almost never be asked to write it.
 */
function isSubtree(root, subRoot) {
  const enc = node => (node ? `(${node.val}${enc(node.left)}${enc(node.right)})` : '#')
  if (!subRoot) return true
  if (!root) return false
  return enc(root).includes(enc(subRoot))
}

module.exports = { isSubtree, isSubtreeBrute, isSubtreeAnchored }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const fn of [isSubtree, isSubtreeBrute, isSubtreeAnchored]) {
    eq(fn(toTree([3, 4, 5, 1, 2]), toTree([4, 1, 2])), true, `${fn.name} worked example`)
    // One extra descendant below the match point makes it not a subtree.
    eq(fn(toTree([3, 4, 5, 1, 2, null, null, null, null, 0]), toTree([4, 1, 2])), false, `${fn.name} match must include all descendants`)
    eq(fn(null, null), true, `${fn.name} both empty`)
    eq(fn(null, toTree([1])), false, `${fn.name} empty root cannot contain anything`)
    eq(fn(toTree([1]), toTree([1])), true, `${fn.name} single node, equal`)
    eq(fn(toTree([1]), toTree([2])), false, `${fn.name} single node, different`)
    // The delimiter trap: "2" is a substring of "12" but [2] is not a subtree of [12].
    eq(fn(toTree([12]), toTree([2])), false, `${fn.name} 2 is not a subtree of 12`)
    eq(fn(toTree([1, 1]), toTree([1])), true, `${fn.name} duplicate values, leaf matches`)
    // A tree is a subtree of itself.
    eq(fn(toTree([3, 4, 5, 1, 2]), toTree([3, 4, 5, 1, 2])), true, `${fn.name} whole tree`)
    // Mirrored shape, same values.
    eq(fn(toTree([1, 2]), toTree([1, null, 2])), false, `${fn.name} left child is not a right child`)
    // The match sits deep on a spine of identical values.
    eq(fn(toTree([1, null, 1, null, 1]), toTree([1, null, 1])), true, `${fn.name} deepest match on a spine`)
  }

  report('subtree-of-another-tree')
}
