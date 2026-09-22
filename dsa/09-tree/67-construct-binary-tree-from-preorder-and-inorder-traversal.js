'use strict'
/**
 * CONSTRUCT BINARY TREE FROM PREORDER AND INORDER TRAVERSAL
 *
 * Given the preorder and inorder traversals of a tree with distinct values,
 * rebuild the tree.
 *
 *   preorder [3, 9, 20, 15, 7], inorder [9, 3, 15, 20, 7]
 *     ->  3 with left 9, right 20, and 20 having children 15 and 7
 *
 * Two facts do all the work. Preorder starts with the root. Inorder puts the
 * whole left subtree before the root and the whole right subtree after it, so
 * finding the root inside inorder splits the problem in two and — this is the
 * part people miss — tells you the SIZE of the left subtree, which is what lets
 * you cut preorder at the right place.
 *
 * Distinct values are load-bearing. With duplicates the root's position in
 * inorder is ambiguous and so is the tree.
 *
 * Pattern: divide and conquer (recursive tree construction)
 */

const { TreeNode, toTree } = require('../_lib/structures')

/**
 * Approach 1 — brute force: slice the arrays at every step.
 * O(n^2) time, O(n^2) space.
 *
 * Direct transcription of the idea: take the head of preorder as the root,
 * indexOf it in inorder, slice both arrays into left and right halves, recurse.
 *
 * Both costs are hidden in that sentence. indexOf is a linear scan per node,
 * and slice copies, so a one-sided tree copies nearly the whole array n times.
 * The two fixes are independent: a hash map kills the scan, index bounds kill
 * the copying.
 */
function buildTreeSlices(preorder, inorder) {
  if (!preorder.length) return null
  const rootVal = preorder[0]
  const mid = inorder.indexOf(rootVal)
  return new TreeNode(
    rootVal,
    buildTreeSlices(preorder.slice(1, mid + 1), inorder.slice(0, mid)),
    buildTreeSlices(preorder.slice(mid + 1), inorder.slice(mid + 1)),
  )
}

/**
 * Approach 2 — index map plus bounds.  O(n) time, O(n) space.  ** optimal **
 *
 * Precompute value -> index in inorder, so the split point is one lookup. Then
 * pass index ranges instead of slices, so nothing is copied.
 *
 * The preorder cursor `p` is shared, not passed. Preorder visits root, then the
 * entire left subtree, then the entire right subtree — exactly the order this
 * recursion runs in — so a single advancing cursor always points at the next
 * node to create. That is why only the inorder bounds need to be tracked.
 *
 * Getting `p` right is the whole exercise: build the left subtree BEFORE
 * reading the root for the right one, or the cursor is in the wrong place.
 */
function buildTree(preorder, inorder) {
  const indexOfVal = new Map(inorder.map((v, i) => [v, i]))
  let p = 0

  const build = (lo, hi) => {                 // inclusive bounds into inorder
    if (lo > hi) return null
    const node = new TreeNode(preorder[p++])
    const mid = indexOfVal.get(node.val)
    node.left = build(lo, mid - 1)            // must run first — it consumes the cursor
    node.right = build(mid + 1, hi)
    return node
  }

  return build(0, inorder.length - 1)
}

/**
 * Approach 3 — iterative, with a stack.  O(n) time, O(h) space.
 *
 * No map and no recursion. Walk preorder, keeping a stack of nodes whose right
 * child is still unfilled. Two cases at each step:
 *
 *   - the top of the stack is NOT the current inorder value: we are still
 *     descending left, so the next preorder value is its left child.
 *   - the top of the stack IS the current inorder value: that node has no left
 *     child left to fill, so pop while the stack keeps matching inorder. The
 *     last node popped is the one whose right child comes next.
 *
 * The inner pop loop is the clever part: it climbs back up exactly as far as
 * inorder says the left spine went, and no further.
 */
function buildTreeIterative(preorder, inorder) {
  if (!preorder.length) return null
  const root = new TreeNode(preorder[0])
  const stack = [root]
  let i = 0                                    // cursor into inorder

  for (let p = 1; p < preorder.length; p++) {
    let node = stack[stack.length - 1]
    if (node.val !== inorder[i]) {
      node.left = new TreeNode(preorder[p])
      stack.push(node.left)
    } else {
      while (stack.length && stack[stack.length - 1].val === inorder[i]) {
        node = stack.pop()
        i++
      }
      node.right = new TreeNode(preorder[p])
      stack.push(node.right)
    }
  }
  return root
}

module.exports = { buildTree, buildTreeSlices, buildTreeIterative }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const fn of [buildTree, buildTreeSlices, buildTreeIterative]) {
    eq(fn([3, 9, 20, 15, 7], [9, 3, 15, 20, 7]), toTree([3, 9, 20, null, null, 15, 7]), `${fn.name} worked example`)
    eq(fn([], []), null, `${fn.name} empty`)
    eq(fn([1], [1]), toTree([1]), `${fn.name} single node`)
    // Left spine: inorder is the exact reverse of preorder.
    eq(fn([1, 2, 3], [3, 2, 1]), toTree([1, 2, null, 3]), `${fn.name} degenerate left spine`)
    // Right spine: inorder equals preorder. Off-by-one in the split shows here first.
    eq(fn([1, 2, 3], [1, 2, 3]), toTree([1, null, 2, null, 3]), `${fn.name} degenerate right spine`)
    eq(fn([1, 2, 3], [2, 1, 3]), toTree([1, 2, 3]), `${fn.name} one node each side`)
    eq(fn([-1, -2], [-2, -1]), toTree([-1, -2]), `${fn.name} negative values`)
    eq(fn([1, 2, 4, 5, 3, 6], [4, 2, 5, 1, 6, 3]), toTree([1, 2, 3, 4, 5, 6]), `${fn.name} both sides, uneven`)
  }

  // Round trip: reading the built tree back out must reproduce both inputs.
  const pre = [1, 2, 4, 5, 3, 6], ino = [4, 2, 5, 1, 6, 3]
  const built = buildTree(pre, ino)
  const preOut = [], inoOut = []
  ;(function walk(n) { if (!n) return; preOut.push(n.val); walk(n.left); inoOut.push(n.val); walk(n.right) })(built)
  eq(preOut, pre, 'buildTree round-trips preorder')
  eq(inoOut, ino, 'buildTree round-trips inorder')

  report('construct-binary-tree-from-preorder-and-inorder-traversal')
}
