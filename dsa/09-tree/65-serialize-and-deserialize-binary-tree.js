'use strict'
/**
 * SERIALIZE AND DESERIALIZE BINARY TREE
 *
 * Turn a binary tree into a string, and that string back into an identical
 * tree. Any tree, not a BST: values can repeat and can be negative.
 *
 *   [1, 2, 3, null, null, 4, 5]  ->  "1,2,#,#,3,4,#,#,5,#,#"  ->  same tree
 *
 * The one thing to get right before writing code: a traversal ALONE is not
 * enough. "1,2" could be a root with a left child or a root with a right
 * child. Preorder plus inorder pins the shape down, but only when all values
 * are distinct, so it is the wrong tool here. Recording the null children is
 * what makes the encoding unambiguous.
 *
 * Pattern: DFS on a tree (preorder with null markers)
 */

const { TreeNode, toTree } = require('../_lib/structures')

/**
 * Approach 1 — positional array: node i has children 2i+1 and 2i+2.
 * O(2^h) time and space.
 *
 * The heap layout. Correct and easy to reason about, and unusable: the string
 * is sized by the tree's HEIGHT, not its node count. A 50-node tree shaped like
 * a straight line needs 2^50 slots. Worth naming so you can reject it in one
 * sentence, and worth remembering as the reason heaps insist on being complete.
 */
function serializeIndexed(root) {
  const slots = []
  const place = (node, i) => {
    if (!node) return
    slots[i] = node.val
    place(node.left, 2 * i + 1)
    place(node.right, 2 * i + 2)
  }
  place(root, 0)
  return Array.from(slots, v => (v === undefined ? '#' : v)).join(',')
}

function deserializeIndexed(data) {
  const slots = data ? data.split(',') : []
  const build = i => {
    if (i >= slots.length || slots[i] === '#') return null
    return new TreeNode(Number(slots[i]), build(2 * i + 1), build(2 * i + 2))
  }
  return build(0)
}

/**
 * Approach 2 — BFS with null markers.  O(n) time, O(n) space.
 *
 * Level order, writing '#' wherever a child is missing. Rebuilding runs the
 * same queue: pop a node, and the next two tokens are its children.
 *
 * The output is human-readable and matches the bracket notation problem
 * statements use, which is genuinely useful for debugging. It costs two
 * cursors (one into the queue, one into the token list) and the reader has to
 * believe they stay in step. The preorder version needs neither.
 */
function serializeBfs(root) {
  const out = []
  const queue = [root]
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i]
    if (!node) { out.push('#'); continue }
    out.push(node.val)
    queue.push(node.left, node.right)
  }
  return out.join(',')
}

function deserializeBfs(data) {
  const tokens = data.split(',')
  if (tokens[0] === '#' || tokens[0] === '') return null
  const root = new TreeNode(Number(tokens[0]))
  const queue = [root]
  let i = 1
  for (let h = 0; h < queue.length; h++) {
    const node = queue[h]
    if (tokens[i] !== undefined && tokens[i] !== '#') {
      node.left = new TreeNode(Number(tokens[i]))
      queue.push(node.left)
    }
    i++
    if (tokens[i] !== undefined && tokens[i] !== '#') {
      node.right = new TreeNode(Number(tokens[i]))
      queue.push(node.right)
    }
    i++
  }
  return root
}

/**
 * Approach 3 — preorder with null markers.  O(n) time, O(n) space.  ** optimal **
 *
 * Preorder is root, then left subtree, then right subtree — and with '#' for
 * every missing child, the left subtree's tokens form a complete, self-closing
 * run. So the rebuild needs no indices and no lengths at all: read one token,
 * and if it is a value, recursively read the left subtree, then the right. The
 * cursor lands exactly where the right subtree starts because the left one
 * consumed precisely its own tokens.
 *
 * That self-delimiting property is why this beats BFS: the recursion IS the
 * parser, and serialise and deserialise are mirror images of each other.
 *
 * `i` lives outside build() on purpose. Passing it as an argument would copy
 * the number, and the left call's progress would be invisible to the right one.
 */
function serialize(root) {
  const out = []
  const walk = node => {
    if (!node) { out.push('#'); return }
    out.push(node.val)
    walk(node.left)
    walk(node.right)
  }
  walk(root)
  return out.join(',')
}

function deserialize(data) {
  const tokens = data.split(',')
  let i = 0
  const build = () => {
    const token = tokens[i++]
    if (token === '#' || token === undefined || token === '') return null
    return new TreeNode(Number(token), build(), build())
  }
  return build()
}

module.exports = {
  serialize, deserialize,
  serializeBfs, deserializeBfs,
  serializeIndexed, deserializeIndexed,
}

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  const codecs = [
    ['preorder', serialize, deserialize],
    ['bfs', serializeBfs, deserializeBfs],
    ['indexed', serializeIndexed, deserializeIndexed],
  ]

  const cases = [
    ['worked example', [1, 2, 3, null, null, 4, 5]],
    ['empty tree', []],
    ['single node', [7]],
    ['left spine', [1, 2, null, 3]],
    ['right spine', [1, null, 2, null, 3]],
    ['duplicate values', [1, 1, 1, 1, 1]],
    // Negatives and a zero: the parser must not treat '-' or 0 as falsy/empty.
    ['negatives and zero', [0, -1, -2, null, null, -3]],
    // Same values, mirrored shape — the pair that a marker-free encoding merges.
    ['left child only', [1, 2]],
    ['right child only', [1, null, 2]],
  ]

  for (const [name, ser, des] of codecs) {
    for (const [label, arr] of cases) {
      const tree = toTree(arr)
      eq(des(ser(tree)), tree, `${name} round-trips ${label}`)
    }
  }

  // The two mirrored shapes must not collide for any codec.
  for (const [name, ser] of codecs) {
    eq(ser(toTree([1, 2])) === ser(toTree([1, null, 2])), false, `${name} distinguishes left from right child`)
  }

  // Pin the preorder format, so a change to it is a deliberate change.
  eq(serialize(toTree([1, 2, 3, null, null, 4, 5])), '1,2,#,#,3,4,#,#,5,#,#', 'preorder wire format')
  eq(serialize(null), '#', 'preorder encodes the empty tree')

  report('serialize-and-deserialize-binary-tree')
}
