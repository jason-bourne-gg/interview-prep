'use strict'
/**
 * KTH SMALLEST ELEMENT IN A BST
 *
 * Return the kth smallest value in a binary search tree, 1-indexed.
 *
 *   [5, 3, 6, 2, 4, null, null, 1], k = 3  ->  3
 *   (sorted, the tree holds 1, 2, 3, 4, 5, 6)
 *
 * One observation carries the whole problem: an inorder walk of a BST visits
 * values in increasing order, so "kth smallest" is "kth node visited". The rest
 * is about not doing more work than that.
 *
 * Pattern: inorder traversal with early exit
 */

const { toTree } = require('../_lib/structures')

/**
 * Approach 1 — full inorder into an array.  O(n) time, O(n) space.
 *
 * Flatten the tree, index in. Fine as a first answer, and wasteful in an
 * obvious way: for k = 1 it still visits all n nodes and allocates all n slots.
 */
function kthSmallestArray(root, k) {
  const vals = []
  const walk = node => { if (!node) return; walk(node.left); vals.push(node.val); walk(node.right) }
  walk(root)
  return vals[k - 1]
}

/**
 * Approach 2 — recursive inorder with a counter.  O(h + k) time, O(h) space.
 *
 * Count nodes as they are visited and stop at the kth. The array disappears,
 * and the walk stops as soon as the answer is known.
 *
 * The `if (answer !== undefined) return` guard is the part that matters. Without
 * it the recursion keeps unwinding through the rest of the tree, the counter
 * keeps incrementing, and you are back to O(n). Recursion cannot simply break —
 * you have to make every pending frame return early.
 */
function kthSmallestCounter(root, k) {
  let count = 0, answer
  const walk = node => {
    if (!node || answer !== undefined) return
    walk(node.left)
    if (answer !== undefined) return
    if (++count === k) { answer = node.val; return }
    walk(node.right)
  }
  walk(root)
  return answer
}

/**
 * Approach 3 — iterative inorder, explicit stack.  O(h + k) time, O(h) space.  ** optimal **
 *
 * Same traversal, but the loop can just `return`, so the early exit is free
 * rather than something you have to thread through every frame.
 *
 * The shape to memorise: push the entire left spine, pop one node (that is the
 * next value in order), then start again from its right child. The stack holds
 * exactly the ancestors whose own value has not been emitted yet, so it never
 * grows past the height.
 *
 * For k = 1 this touches h nodes and stops. That is the best possible without
 * changing the data structure — which is what the follow-up asks about.
 */
function kthSmallest(root, k) {
  const stack = []
  let node = root
  while (node || stack.length) {
    while (node) { stack.push(node); node = node.left }
    node = stack.pop()
    if (--k === 0) return node.val
    node = node.right
  }
  return undefined
}

/**
 * Follow-up — the tree is modified often and kth is queried often.
 * O(n) to annotate here, then O(h) per query.
 *
 * Every approach above is O(h + k) per query, so a stream of queries with large
 * k costs O(n) each time. The fix is not a better traversal, it is a better
 * node: store on each node the SIZE of its subtree. Then the query becomes a
 * descent, because at any node you know how many values lie to its left:
 *
 *   k === leftCount + 1  ->  this node is the answer
 *   k <= leftCount       ->  go left, k unchanged
 *   otherwise            ->  go right, after discarding leftCount + 1 values
 *
 * This function pays O(n) once to annotate, which is only there to make the
 * idea runnable. In the real design the counts are maintained by insert and
 * delete — each one already walks a single root-to-leaf path, so it bumps the
 * count on the O(h) nodes it passes and the annotation cost never appears.
 * Combined with a self-balancing tree, every operation is O(log n).
 */
function kthSmallestAugmented(root, k) {
  const annotate = node => {
    if (!node) return 0
    node.count = 1 + annotate(node.left) + annotate(node.right)
    return node.count
  }
  annotate(root)

  let node = root
  while (node) {
    const leftCount = node.left ? node.left.count : 0
    if (k === leftCount + 1) return node.val
    if (k <= leftCount) node = node.left
    else { k -= leftCount + 1; node = node.right }
  }
  return undefined
}

module.exports = { kthSmallest, kthSmallestArray, kthSmallestCounter, kthSmallestAugmented }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const fn of [kthSmallest, kthSmallestArray, kthSmallestCounter, kthSmallestAugmented]) {
    eq(fn(toTree([5, 3, 6, 2, 4, null, null, 1]), 3), 3, `${fn.name} worked example`)
    eq(fn(toTree([3, 1, 4, null, 2]), 1), 1, `${fn.name} smallest`)
    eq(fn(toTree([3, 1, 4, null, 2]), 4), 4, `${fn.name} largest`)
    eq(fn(toTree([1]), 1), 1, `${fn.name} single node`)
    // 1-indexed, not 0-indexed. k = 2 on [1, 2, 3] is 2, not 3.
    eq(fn(toTree([2, 1, 3]), 2), 2, `${fn.name} k is 1-indexed`)
    // Degenerate shapes: the answer is not where the level-order index suggests.
    eq(fn(toTree([3, 2, null, 1]), 1), 1, `${fn.name} left spine, smallest is deepest`)
    eq(fn(toTree([1, null, 2, null, 3]), 2), 2, `${fn.name} right spine`)
    eq(fn(toTree([0, -2, 2, null, -1]), 2), -1, `${fn.name} negatives and zero`)
    eq(fn(toTree([5, 3, 6, 2, 4, null, null, 1]), 6), 6, `${fn.name} k equals node count`)
  }

  report('kth-smallest-element-in-a-bst')
}
