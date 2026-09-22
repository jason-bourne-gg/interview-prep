'use strict'
/**
 * NUMBER OF CONNECTED COMPONENTS IN AN UNDIRECTED GRAPH
 *
 * You are given n nodes labelled 0..n-1 and a list of undirected edges, each a
 * pair [a, b]. Return how many connected components the graph has — how many
 * separate groups the nodes fall into, where two nodes are in the same group if
 * any path of edges joins them. A node with no edges is its own component.
 *
 *   5, [[0,1], [1,2], [3,4]]          ->  2
 *   5, [[0,1], [1,2], [2,3], [3,4]]   ->  1
 *
 * Pattern: BFS / DFS on graphs and grids (union-find variant)
 *
 * This is Number of Islands with an explicit edge list instead of a grid. Same
 * counting logic: the outer loop increments, the inner traversal consumes.
 */

const { DSU } = require('../_lib/structures')

/** Adjacency list — both directions, because the edges are undirected. */
function buildAdjacency(n, edges) {
  const graph = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a) }
  return graph
}

/**
 * Approach 1 — recursive DFS.  O(n + e) time, O(n + e) space.
 *
 * Start a search from every node that has not been visited yet. Each such start
 * is a component nobody had reached, so count it; the search then marks
 * everything in that component so later nodes in it start nothing.
 *
 * No parent guard is needed here, unlike Graph Valid Tree — revisiting a node is
 * not an error, it just means the search already covered it. Cycles are allowed
 * inside a component.
 *
 * Recursion depth is the size of the largest component, so a 100k-node chain
 * exceeds the JS stack at roughly 10k frames.
 */
function countComponentsDfs(n, edges) {
  const graph = buildAdjacency(n, edges)
  const seen = Array(n).fill(false)
  let components = 0

  function walk(node) {
    seen[node] = true
    for (const next of graph[node]) if (!seen[next]) walk(next)
  }

  for (let i = 0; i < n; i++) {
    if (seen[i]) continue
    components++
    walk(i)
  }
  return components
}

/**
 * Approach 2 — iterative BFS.  O(n + e) time, O(n + e) space.
 *
 * Same counting, explicit queue, no stack ceiling. Mark a node when you push it
 * rather than when you pop it — with the mark on pop, a node with k neighbours
 * already in the queue gets queued k times, and the queue stops being bounded
 * by n.
 */
function countComponentsBfs(n, edges) {
  const graph = buildAdjacency(n, edges)
  const seen = Array(n).fill(false)
  let components = 0

  for (let i = 0; i < n; i++) {
    if (seen[i]) continue
    components++
    seen[i] = true
    const queue = [i]
    for (let q = 0; q < queue.length; q++) {
      for (const next of graph[queue[q]]) {
        if (seen[next]) continue
        seen[next] = true                      // mark on enqueue
        queue.push(next)
      }
    }
  }
  return components
}

/**
 * Approach 3 — union-find.  O(e * a(n)) time, O(n) space.  ** optimal **
 *
 * Start with n components, one per node, and merge on every edge. A merge that
 * actually joins two different groups drops the count by one; an edge inside a
 * group changes nothing. Whatever is left is the answer.
 *
 * Practically a(n) is below 5 for any n you will ever see, so this is linear in
 * the edges with a smaller constant than either traversal — and it never builds
 * the adjacency list, which is where the traversals spend their memory.
 *
 * The real reason to prefer it: it answers the problem as a stream. Edges can
 * arrive one at a time and the count is correct after each one, with no
 * re-traversal. Neither DFS nor BFS gives you that.
 */
function countComponents(n, edges) {
  const dsu = new DSU(n)
  for (const [a, b] of edges) dsu.union(a, b)  // union() already ignores same-group edges
  return dsu.count
}

module.exports = { countComponents, countComponentsDfs, countComponentsBfs }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [countComponents, countComponentsDfs, countComponentsBfs]) {
    eq(fn(5, [[0, 1], [1, 2], [3, 4]]), 2, `${fn.name} worked example`)
    eq(fn(5, [[0, 1], [1, 2], [2, 3], [3, 4]]), 1, `${fn.name} one long chain`)
    eq(fn(0, []), 0, `${fn.name} no nodes`)
    eq(fn(1, []), 1, `${fn.name} single isolated node`)
    eq(fn(4, []), 4, `${fn.name} no edges at all`)

    // Isolated nodes still count. Anyone who counts components by walking the
    // EDGE list instead of the node range returns 1 here.
    eq(fn(4, [[0, 1]]), 3, `${fn.name} one edge leaves two singletons`)

    // A cycle is one component, not zero and not two. This is where a cycle
    // guard copied over from Graph Valid Tree breaks things.
    eq(fn(3, [[0, 1], [1, 2], [2, 0]]), 1, `${fn.name} a cycle is one component`)

    // Repeated and self edges must not change the count.
    eq(fn(3, [[0, 1], [0, 1], [1, 0]]), 2, `${fn.name} duplicate edges`)
    eq(fn(3, [[0, 0], [1, 1]]), 3, `${fn.name} self-loops join nothing`)
    eq(fn(6, [[0, 1], [2, 3], [4, 5]]), 3, `${fn.name} three pairs`)
  }
  report('number-of-connected-components')
}
