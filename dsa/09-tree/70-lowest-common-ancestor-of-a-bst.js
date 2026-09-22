'use strict'
/**
 * LOWEST COMMON ANCESTOR OF A BINARY SEARCH TREE
 *
 * Given a BST and two nodes p and q, return the deepest node that has both of
 * them as descendants. A node counts as a descendant of itself.
 *
 *   [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p = 2, q = 8  ->  6
 *   same tree,                               p = 2, q = 4  ->  2
 *
 * The BST ordering is the whole shortcut. In a general binary tree you have to
 * search both subtrees to find out where p and q are. Here the values tell you,
 * so you never search — you descend.
 *
 * Pattern: BST descent (binary search on a tree)
 */

const { toTree } = require('../_lib/structures')

/**
 * Approach 1 — record both root-to-node paths, compare them.
 * O(n) time, O(n) space.
 *
 * Find the path to p, find the path to q, then walk the two lists together; the
 * last node they agree on is the answer.
 *
 * This is the version that works on ANY binary tree, so it is worth having in
 * your head — but it ignores the ordering completely, visits nodes that cannot
 * possibly be on either path, and stores two full paths.
 */
function lowestCommonAncestorPaths(root, p, q) {
  const pathTo = target => {
    const path = []
    const walk = node => {
      if (!node) return false
      path.push(node)
      if (node === target || walk(node.left) || walk(node.right)) return true
      path.pop()
      return false
    }
    return walk(root) ? path : []
  }

  const a = pathTo(p), b = pathTo(q)
  let best = null
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) break
    best = a[i]
  }
  return best
}

/**
 * Approach 2 — recursive descent using the ordering.  O(h) time, O(h) stack.
 *
 * At the current node there are three possibilities, and only three:
 *
 *   both values smaller  ->  both nodes live in the left subtree, go left
 *   both values larger   ->  both live in the right subtree, go right
 *   anything else        ->  they split here, or one of them IS this node
 *
 * That third case is the answer, and it needs no extra check. The first node
 * where the two stop agreeing on direction is by definition the deepest node
 * that still has both below it.
 *
 * Note the comparisons use both p and q rather than assuming p.val < q.val.
 * That assumption is the usual bug and it is silent — it returns a wrong
 * ancestor rather than crashing.
 */
function lowestCommonAncestorRecursive(root, p, q) {
  if (!root) return null
  if (p.val < root.val && q.val < root.val) return lowestCommonAncestorRecursive(root.left, p, q)
  if (p.val > root.val && q.val > root.val) return lowestCommonAncestorRecursive(root.right, p, q)
  return root
}

/**
 * Approach 3 — the same descent as a loop.  O(h) time, O(1) space.  ** optimal **
 *
 * The recursion in approach 2 is a tail call: nothing happens after it returns.
 * So there is no reason to keep a stack frame per level — reassign the cursor
 * instead and the space drops to constant.
 *
 * On a balanced BST that is O(log n) comparisons and one variable.
 */
function lowestCommonAncestor(root, p, q) {
  let node = root
  while (node) {
    if (p.val < node.val && q.val < node.val) node = node.left
    else if (p.val > node.val && q.val > node.val) node = node.right
    else return node
  }
  return null
}

module.exports = { lowestCommonAncestor, lowestCommonAncestorRecursive, lowestCommonAncestorPaths }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  const find = (node, val) => {
    if (!node) return null
    if (node.val === val) return node
    return val < node.val ? find(node.left, val) : find(node.right, val)
  }

  for (const fn of [lowestCommonAncestor, lowestCommonAncestorRecursive, lowestCommonAncestorPaths]) {
    const tree = toTree([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5])
    const lca = (a, b) => fn(tree, find(tree, a), find(tree, b)).val

    eq(lca(2, 8), 6, `${fn.name} split at the root`)
    // A node is its own ancestor — the case an "ancestor must be strictly above" reading gets wrong.
    eq(lca(2, 4), 2, `${fn.name} one node is the ancestor of the other`)
    // Argument order must not matter.
    eq(lca(4, 2), 2, `${fn.name} reversed arguments give the same answer`)
    eq(lca(3, 5), 4, `${fn.name} deep split`)
    eq(lca(0, 5), 2, `${fn.name} split below the root`)
    eq(lca(7, 9), 8, `${fn.name} both on the right`)
    eq(lca(3, 3), 3, `${fn.name} same node twice`)

    const single = toTree([1])
    eq(fn(single, single, single).val, 1, `${fn.name} single node tree`)

    // Degenerate right spine: the ancestor is the shallower of the two.
    const spine = toTree([1, null, 2, null, 3])
    eq(fn(spine, find(spine, 2), find(spine, 3)).val, 2, `${fn.name} right spine`)
    eq(fn(spine, find(spine, 1), find(spine, 3)).val, 1, `${fn.name} right spine, root`)

    // Negatives, and a split where one side is zero.
    const negs = toTree([0, -3, 3, -5, -1])
    eq(fn(negs, find(negs, -5), find(negs, -1)).val, -3, `${fn.name} negative values`)
    eq(fn(negs, find(negs, -5), find(negs, 3)).val, 0, `${fn.name} split at a zero root`)
  }

  report('lowest-common-ancestor-of-a-bst')
}
