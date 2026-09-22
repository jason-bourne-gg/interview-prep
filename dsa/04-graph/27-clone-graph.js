'use strict'
/**
 * CLONE GRAPH
 *
 * Given a reference to one node of a connected undirected graph, return a deep
 * copy: every node duplicated, every edge rewired between the duplicates, and
 * no object shared with the original. Nodes hold a val and a list of neighbours.
 *
 *   square 1—2—3—4—1  ->  a new square of four new nodes with the same shape
 *
 * Pattern: BFS / DFS on graphs and grids
 */

const { GraphNode } = require('../_lib/structures')

/**
 * Approach 1 — two passes.  O(V + E) time, O(V) space.
 *
 * Pass one walks the graph and makes a bare copy of every node. Pass two walks
 * it again and fills in the neighbour lists from the old -> new map. It works,
 * and it is the easiest version to explain, but it traverses twice and needs
 * its own visited set on top of the map.
 *
 * The map is the real content of this problem in any version: without it, a
 * cycle makes the copy recurse forever, and a diamond gets copied twice.
 */
function cloneGraphTwoPass(node) {
  if (!node) return null

  const copies = new Map()                     // original node -> its copy
  const stack = [node]
  copies.set(node, new GraphNode(node.val))
  while (stack.length) {
    const cur = stack.pop()
    for (const nxt of cur.neighbors) {
      if (copies.has(nxt)) continue
      copies.set(nxt, new GraphNode(nxt.val))
      stack.push(nxt)
    }
  }

  for (const [original, copy] of copies) {
    copy.neighbors = original.neighbors.map(n => copies.get(n))
  }
  return copies.get(node)
}

/**
 * Approach 2 — recursive DFS, one pass.  O(V + E) time, O(V) space.
 *
 * The insight that collapses the two passes into one: put the copy into the map
 * BEFORE recursing into its neighbours. Then when the recursion comes back
 * around a cycle to this node, the map already answers, and the edge gets wired
 * to the half-built copy — which is fine, because it is the same object that
 * will be finished when the outer call returns.
 *
 * Order matters exactly as it does in Two Sum: insert first here, check first
 * there. Recursing before inserting is an infinite loop on any cycle.
 *
 * Depth is the length of the longest path, so a graph shaped like a chain of
 * 100k nodes blows the JS call stack (roughly 10k frames). That is the reason
 * to reach for the iterative version below on large inputs.
 */
function cloneGraphDfs(node) {
  const copies = new Map()

  function dfs(cur) {
    if (!cur) return null
    if (copies.has(cur)) return copies.get(cur)
    const copy = new GraphNode(cur.val)
    copies.set(cur, copy)                      // before recursing, not after
    for (const nxt of cur.neighbors) copy.neighbors.push(dfs(nxt))
    return copy
  }
  return dfs(node)
}

/**
 * Approach 3 — iterative BFS, one pass.  O(V + E) time, O(V) space.  ** optimal **
 *
 * Same single-pass idea with an explicit queue, so depth is bounded by heap
 * memory instead of the call stack. Complexity is identical to the recursive
 * version — this wins on robustness, not on paper.
 *
 * The map doubles as the visited set. A node is enqueued only when it is first
 * put in the map, so every node is processed exactly once no matter how many
 * edges point at it.
 */
function cloneGraph(node) {
  if (!node) return null

  const copies = new Map([[node, new GraphNode(node.val)]])
  const queue = [node]
  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i]
    for (const nxt of cur.neighbors) {
      if (!copies.has(nxt)) {
        copies.set(nxt, new GraphNode(nxt.val))
        queue.push(nxt)                        // enqueue at discovery, not at visit
      }
      copies.get(cur).neighbors.push(copies.get(nxt))
    }
  }
  return copies.get(node)
}

module.exports = { cloneGraph, cloneGraphTwoPass, cloneGraphDfs }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  const { toGraph, fromGraph } = require('../_lib/structures')

  /** True when the clone has the same shape but shares no object with the original. */
  const isDeepCopy = (original, clone) => {
    if (!original) return clone === null
    const seen = new Set([original])
    const queue = [original]
    for (let i = 0; i < queue.length; i++) {
      for (const n of queue[i].neighbors) if (!seen.has(n)) { seen.add(n); queue.push(n) }
    }
    const cloned = new Set([clone])
    const q2 = [clone]
    for (let i = 0; i < q2.length; i++) {
      for (const n of q2[i].neighbors) if (!cloned.has(n)) { cloned.add(n); q2.push(n) }
    }
    for (const c of cloned) if (seen.has(c)) return false     // any shared object fails
    return true
  }

  for (const fn of [cloneGraph, cloneGraphTwoPass, cloneGraphDfs]) {
    const square = [[2, 4], [1, 3], [2, 4], [1, 3]]
    eq(fromGraph(fn(toGraph(square))), square, `${fn.name} square with cycles`)
    eq(isDeepCopy(toGraph(square), fn(toGraph(square))), true, `${fn.name} shares no nodes`)

    eq(fn(toGraph([])), null, `${fn.name} empty graph`)
    eq(fromGraph(fn(toGraph([[]]))), [[]], `${fn.name} single node, no edges`)
    eq(fromGraph(fn(toGraph([[2], [1]]))), [[2], [1]], `${fn.name} two nodes`)

    // A diamond: node 4 is reachable by two routes, and must still be copied once.
    const diamond = [[2, 3], [1, 4], [1, 4], [2, 3]]
    const clone = fn(toGraph(diamond))
    eq(fromGraph(clone), diamond, `${fn.name} diamond shape`)
    eq(clone.neighbors[0].neighbors[1] === clone.neighbors[1].neighbors[1], true,
      `${fn.name} diamond converges on one copy`)

    // Self-loop: the classic off-by-one here is wiring a node to the ORIGINAL self.
    const selfLoop = fn(toGraph([[1]]))
    eq(selfLoop.neighbors[0] === selfLoop, true, `${fn.name} self-loop points at the copy`)
  }
  report('clone-graph')
}
