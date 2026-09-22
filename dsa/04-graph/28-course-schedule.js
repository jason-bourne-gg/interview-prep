'use strict'
/**
 * COURSE SCHEDULE
 *
 * numCourses courses are labelled 0..numCourses-1. Each pair [a, b] means "to
 * take a you must first take b". Return true when some order lets you finish
 * every course. That is true exactly when the prerequisite graph has no cycle.
 *
 *   2, [[1, 0]]          ->  true   (take 0, then 1)
 *   2, [[1, 0], [0, 1]]  ->  false  (each needs the other)
 *
 * Pattern: Topological sort
 */

/** Build b -> a adjacency, since b must come before a. */
function buildGraph(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => [])
  for (const [a, b] of prerequisites) graph[b].push(a)
  return graph
}

/**
 * Approach 1 — repeatedly strip the courses with nothing left to satisfy.
 * O(V * E) time, O(V + E) space.
 *
 * Scan every remaining course, take any whose prerequisites are all already
 * done, mark it done, and start the scan again. If a full scan takes nothing,
 * everything left is in a cycle.
 *
 * This is the right idea executed slowly: each pass re-examines every edge to
 * answer a question that barely changed. The fix is to cache the answer, which
 * is what an indegree counter is, and that turns this into Kahn's algorithm.
 */
function canFinishNaive(numCourses, prerequisites) {
  const needs = Array.from({ length: numCourses }, () => [])
  for (const [a, b] of prerequisites) needs[a].push(b)

  const done = Array(numCourses).fill(false)
  let remaining = numCourses
  for (;;) {
    let tookOne = false
    for (let c = 0; c < numCourses; c++) {
      if (done[c] || !needs[c].every(p => done[p])) continue
      done[c] = true
      remaining--
      tookOne = true
    }
    if (remaining === 0) return true
    if (!tookOne) return false                 // a full pass with no progress means a cycle
  }
}

/**
 * Approach 2 — DFS with three colours.  O(V + E) time, O(V) space.
 *
 * A two-state visited flag is not enough. "Visited" answers "have I been here
 * before", but a cycle is specifically "am I here again on the path I am
 * currently walking". A diamond revisits a node without any cycle existing, so
 * a two-state flag reports false cycles.
 *
 * Hence three colours: 0 untouched, 1 on the current path, 2 fully explored and
 * proven clean. Meeting a 1 is a cycle. Meeting a 2 is a shortcut — that
 * subtree was already cleared, so returning early is what keeps this linear
 * instead of exponential.
 *
 * Recursion depth is the longest prerequisite chain, so a 100k-course chain
 * overflows the JS stack at roughly 10k frames. Kahn's has no such ceiling.
 */
function canFinishDfs(numCourses, prerequisites) {
  const graph = buildGraph(numCourses, prerequisites)
  const colour = Array(numCourses).fill(0)

  function hasCycle(c) {
    if (colour[c] === 1) return true           // back edge into the current path
    if (colour[c] === 2) return false          // already cleared
    colour[c] = 1
    for (const next of graph[c]) if (hasCycle(next)) return true
    colour[c] = 2                              // off the path, permanently clean
    return false
  }

  for (let c = 0; c < numCourses; c++) if (hasCycle(c)) return false
  return true
}

/**
 * Approach 3 — Kahn's algorithm.  O(V + E) time, O(V + E) space.  ** optimal **
 *
 * Count, for each course, how many prerequisites it still has. Courses at zero
 * can be taken now. Taking one decrements its dependents, and any that hit zero
 * join the queue. The decrement is the cached answer the naive version kept
 * recomputing.
 *
 * Count what comes out. A course inside a cycle never reaches indegree zero,
 * because something in the cycle always still owes it, so the count falls short
 * of numCourses exactly when a cycle exists.
 *
 * Iterative, so no stack ceiling, and the queue order is a real course order if
 * the problem asks for one instead of a yes/no.
 */
function canFinish(numCourses, prerequisites) {
  const graph = buildGraph(numCourses, prerequisites)
  const indegree = Array(numCourses).fill(0)
  for (const [a] of prerequisites) indegree[a]++

  const queue = []
  for (let c = 0; c < numCourses; c++) if (indegree[c] === 0) queue.push(c)

  let taken = 0
  for (let i = 0; i < queue.length; i++) {     // index walk, so no O(n) shift()
    taken++
    for (const next of graph[queue[i]]) if (--indegree[next] === 0) queue.push(next)
  }
  return taken === numCourses
}

module.exports = { canFinish, canFinishNaive, canFinishDfs }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [canFinish, canFinishNaive, canFinishDfs]) {
    eq(fn(2, [[1, 0]]), true, `${fn.name} simple chain`)
    eq(fn(2, [[1, 0], [0, 1]]), false, `${fn.name} two-cycle`)
    eq(fn(1, []), true, `${fn.name} single course, no prerequisites`)
    eq(fn(0, []), true, `${fn.name} no courses at all`)
    eq(fn(3, []), true, `${fn.name} all independent`)
    eq(fn(1, [[0, 0]]), false, `${fn.name} course is its own prerequisite`)

    // Diamond: 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3. Node 3 is reached twice and there
    // is no cycle — this is the case a two-state visited flag gets wrong.
    eq(fn(4, [[1, 0], [2, 0], [3, 1], [3, 2]]), true, `${fn.name} diamond is not a cycle`)

    // A clean chain plus a disconnected cycle: the answer lives in the component
    // the naive scan reaches last.
    eq(fn(5, [[1, 0], [2, 1], [4, 3], [3, 4]]), false, `${fn.name} cycle in a second component`)
    eq(fn(4, [[1, 0], [2, 1], [3, 2]]), true, `${fn.name} long chain`)
  }
  report('course-schedule')
}
