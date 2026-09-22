'use strict'
/**
 * GRAPH VALID TREE
 *
 * You are given n nodes labelled 0..n-1 and a list of undirected edges, each a
 * pair [a, b]. Decide whether these edges make the nodes a valid tree. A tree is
 * connected — every node reachable from every other — and acyclic.
 *
 *   5, [[0,1], [0,2], [0,3], [1,4]]  ->  true
 *   5, [[0,1], [1,2], [2,3], [1,3]]  ->  false  (1-2-3-1 is a cycle, and 4 is cut off)
 *
 * Pattern: BFS / DFS on graphs and grids (union-find variant)
 *
 * The edge count is the shortcut worth stating before writing any code. A tree
 * on n nodes has exactly n-1 edges. So if the count is wrong the answer is
 * false immediately, and if the count is right you only have to check ONE of
 * the two properties: n-1 edges plus connected forces acyclic, and n-1 edges
 * plus acyclic forces connected. Every approach below leans on that.
 */

const { DSU } = require('../_lib/structures')

/**
 * Approach 1 — DFS with a parent guard.  O(n + e) time, O(n + e) space.
 *
 * Walk from node 0. Count what you reach; if it is fewer than n the graph is
 * disconnected. Meeting an already-visited node that is not the one you just
 * came from is a cycle.
 *
 * That parent guard is the whole difficulty of cycle detection in an UNDIRECTED
 * graph. Every edge is stored twice, so a-b and b-a are the same edge and
 * walking back along it is not a cycle. Forget the guard and every single edge
 * reports one.
 *
 * The guard must compare the node, not just any visited neighbour, and it
 * breaks on parallel edges — two separate a-b edges are a real cycle, but both
 * look like "the parent" to this check. The edge-count test above is what saves
 * it: two copies of a-b push the count over n-1 only if the graph is otherwise
 * a tree, which is exactly the case where it matters. Union-find needs no such
 * argument, which is why it is the version to reach for.
 *
 * Depth is the longest path, so a 100k-node chain overflows the JS stack at
 * roughly 10k frames.
 */
function validTreeDfs(n, edges) {
  if (n === 0) return false
  if (edges.length !== n - 1) return false

  const graph = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a) }

  const seen = Array(n).fill(false)
  let visited = 0

  function walk(node, parent) {
    seen[node] = true
    visited++
    for (const next of graph[node]) {
      if (next === parent) { parent = -1; continue }   // consume the back-edge once
      if (seen[next]) return false                     // anything else is a cycle
      if (!walk(next, node)) return false
    }
    return true
  }

  return walk(0, -1) && visited === n
}

/**
 * Approach 2 — BFS with a parent guard.  O(n + e) time, O(n + e) space.
 *
 * Identical reasoning with a queue, so no recursion ceiling. Track each node's
 * parent alongside it in the queue rather than in a separate array, and the
 * check reads the same as the DFS one.
 *
 * With the n-1 edge count already confirmed, this really only needs to answer
 * "is it connected", so the cycle test here is belt and braces. Saying that out
 * loud is the point: knowing which check is redundant means you know why the
 * edge count works.
 */
function validTreeBfs(n, edges) {
  if (n === 0) return false
  if (edges.length !== n - 1) return false

  const graph = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a) }

  const seen = Array(n).fill(false)
  seen[0] = true
  const queue = [[0, -1]]
  let visited = 0
  for (let i = 0; i < queue.length; i++) {
    const [node, parent] = queue[i]
    visited++
    let skippedParent = false
    for (const next of graph[node]) {
      if (next === parent && !skippedParent) { skippedParent = true; continue }
      if (seen[next]) return false
      seen[next] = true
      queue.push([next, node])
    }
  }
  return visited === n
}

/**
 * Approach 3 — union-find.  O(e * a(n)) time, O(n) space.  ** optimal **
 *
 * Merge the two endpoints of each edge. union() returns false when they were
 * already in the same component, and that is precisely a cycle: the two ends
 * were already joined by some other path, and this edge closes the loop.
 *
 * No adjacency list, no parent bookkeeping, no recursion, and the parallel-edge
 * case that made the traversal versions argue is handled without comment — the
 * second copy of a-b finds them already merged and reports the cycle.
 *
 * After processing every edge, dsu.count is the number of components. One
 * component and no cycle is a tree. The edge-count check up front is still the
 * cheapest rejection, so keep it.
 */
function validTree(n, edges) {
  if (n === 0) return false
  if (edges.length !== n - 1) return false

  const dsu = new DSU(n)
  for (const [a, b] of edges) {
    if (!dsu.union(a, b)) return false         // already connected: this edge closes a cycle
  }
  return dsu.count === 1
}

module.exports = { validTree, validTreeDfs, validTreeBfs }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [validTree, validTreeDfs, validTreeBfs]) {
    eq(fn(5, [[0, 1], [0, 2], [0, 3], [1, 4]]), true, `${fn.name} worked example`)
    eq(fn(5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]), false, `${fn.name} cycle present`)
    eq(fn(1, []), true, `${fn.name} single node is a tree`)
    eq(fn(0, []), false, `${fn.name} no nodes is not a tree`)
    eq(fn(2, []), false, `${fn.name} disconnected, too few edges`)
    eq(fn(2, [[0, 1]]), true, `${fn.name} two nodes, one edge`)

    // Right edge count, wrong shape: a triangle plus an isolated node is 3 edges
    // for 4 nodes. Counting edges alone says yes; it is both cyclic and
    // disconnected.
    eq(fn(4, [[0, 1], [1, 2], [2, 0]]), false, `${fn.name} triangle plus an island`)

    // The same edge twice. This is the case the parent guard gets wrong on its
    // own, and it is why union-find is the version to write.
    eq(fn(3, [[0, 1], [0, 1]]), false, `${fn.name} parallel edges are a cycle`)

    eq(fn(4, [[0, 1], [1, 2], [2, 3]]), true, `${fn.name} a path is a tree`)
    eq(fn(4, [[0, 1], [0, 2], [0, 3]]), true, `${fn.name} a star is a tree`)
  }
  report('graph-valid-tree')
}
