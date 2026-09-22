'use strict'
/**
 * BINARY TREE LEVEL ORDER TRAVERSAL
 *
 * Return the values level by level, left to right, as one array per level.
 *
 *   [3, 9, 20, null, null, 15, 7]  ->  [[3], [9, 20], [15, 7]]
 *
 * Pattern: BFS on a tree
 */

const { toTree } = require('../_lib/structures')

/**
 * Approach 1 — brute force: one pass per level.  O(n * h) time, O(h) space.
 *
 * Find the height, then for each depth d walk the whole tree collecting the
 * nodes that sit at depth d. Every pass re-descends from the root, so a
 * degenerate tree of height n costs O(n^2).
 *
 * The give-away is that pass d and pass d+1 walk the same prefix of the tree.
 * Doing all levels in one descent is the fix.
 */
function levelOrderRepeated(root) {
  const height = node => (node ? 1 + Math.max(height(node.left), height(node.right)) : 0)
  const collect = (node, d, out) => {
    if (!node) return
    if (d === 0) { out.push(node.val); return }
    collect(node.left, d - 1, out)
    collect(node.right, d - 1, out)
  }
  const res = []
  for (let d = 0; d < height(root); d++) {
    const row = []
    collect(root, d, row)
    res.push(row)
  }
  return res
}

/**
 * Approach 2 — DFS, indexing rows by depth.  O(n) time, O(h) stack.
 *
 * Level order does not require BFS. A preorder walk that carries its depth
 * appends into res[depth], and because preorder visits left before right the
 * values land in the right order within each row anyway.
 *
 * Useful when the follow-up asks for right-side view or "sum per level" and
 * you are already recursing, and it is the shorter answer to bottom-up level
 * order (build the same rows, then reverse).
 */
function levelOrderDfs(root) {
  const res = []
  const walk = (node, depth) => {
    if (!node) return
    if (res.length === depth) res.push([])
    res[depth].push(node.val)
    walk(node.left, depth + 1)
    walk(node.right, depth + 1)
  }
  walk(root, 0)
  return res
}

/**
 * Approach 3 — BFS, one level per iteration.  O(n) time, O(w) space.  ** optimal **
 *
 * The queue naturally holds a mix of two adjacent levels, so the trick is to
 * snapshot the level size BEFORE the inner loop. Those first `size` entries are
 * exactly the current level; everything pushed during the loop belongs to the
 * next one. Read the size inside the loop condition instead and you consume
 * nodes you just enqueued, and every row after the first comes out wrong.
 *
 * A cursor `head` replaces queue.shift(): shift() re-indexes the whole array,
 * which is O(n) per call in V8 and turns this into O(n^2) on a wide tree.
 */
function levelOrder(root) {
  if (!root) return []
  const res = []
  const queue = [root]
  let head = 0
  while (head < queue.length) {
    const size = queue.length - head        // snapshot: this level, and only this level
    const row = []
    for (let i = 0; i < size; i++) {
      const node = queue[head++]
      row.push(node.val)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
    res.push(row)
  }
  return res
}

module.exports = { levelOrder, levelOrderRepeated, levelOrderDfs }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const fn of [levelOrder, levelOrderRepeated, levelOrderDfs]) {
    eq(fn(toTree([3, 9, 20, null, null, 15, 7])), [[3], [9, 20], [15, 7]], `${fn.name} worked example`)
    eq(fn(null), [], `${fn.name} empty tree`)
    eq(fn(toTree([1])), [[1]], `${fn.name} single node`)
    // Gaps inside a level: row 3 must be [4, 5] with no holes for the missing children.
    eq(fn(toTree([1, 2, 3, null, 4, null, 5])), [[1], [2, 3], [4, 5]], `${fn.name} sparse level`)
    // A right spine — every level holds exactly one node.
    eq(fn(toTree([1, null, 2, null, 3])), [[1], [2], [3]], `${fn.name} degenerate right spine`)
    eq(fn(toTree([1, 1, 1, 1])), [[1], [1, 1], [1]], `${fn.name} duplicate values`)
    // The level-size bug: reading queue.length inside the loop merges levels
    // 2 and 3 into one row on a tree this shape.
    eq(fn(toTree([1, 2, 3, 4, 5, 6, 7])), [[1], [2, 3], [4, 5, 6, 7]], `${fn.name} full tree, levels stay split`)
  }

  report('binary-tree-level-order-traversal')
}
