'use strict'
/**
 * PACIFIC ATLANTIC WATER FLOW
 *
 * heights is an m x n grid of cell elevations. The Pacific laps the top and
 * left edges, the Atlantic the bottom and right edges. Water flows from a cell
 * to any of its four neighbours whose height is less than or equal to it.
 * Return every cell from which water can reach BOTH oceans.
 *
 *   [[1, 2, 3],
 *    [8, 9, 4],     ->  [[0,2], [1,0], [1,1], [1,2], [2,0]]
 *    [7, 6, 5]]
 *
 * Pattern: BFS / DFS on graphs and grids
 */

const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]]

/**
 * Approach 1 — flood downhill from every cell.  O((m*n)^2) time, O(m*n) space.
 *
 * For each of the m*n cells, run a search that only steps downhill, and record
 * which edges it touched. Correct and obvious, and it re-walks nearly the whole
 * grid m*n times: a 200x200 grid is 1.6 billion steps.
 *
 * The waste is that every one of those searches rediscovers the same downhill
 * structure. Nothing about it depends on where you started.
 */
function pacificAtlanticBrute(heights) {
  if (!heights.length || !heights[0].length) return []
  const rows = heights.length, cols = heights[0].length
  const res = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seen = Array.from({ length: rows }, () => Array(cols).fill(false))
      let pacific = false, atlantic = false
      const stack = [[r, c]]
      seen[r][c] = true
      while (stack.length) {
        const [cr, cc] = stack.pop()
        if (cr === 0 || cc === 0) pacific = true
        if (cr === rows - 1 || cc === cols - 1) atlantic = true
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr, nc = cc + dc
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
          if (seen[nr][nc] || heights[nr][nc] > heights[cr][cc]) continue   // downhill only
          seen[nr][nc] = true
          stack.push([nr, nc])
        }
      }
      if (pacific && atlantic) res.push([r, c])
    }
  }
  return res
}

/**
 * Approach 2 — reverse the flow, recursive DFS.  O(m*n) time, O(m*n) space.
 *
 * The insight: instead of asking "which ocean does this cell drain to", start
 * at the ocean and climb. If water can flow from X to the Pacific, then the
 * Pacific edge can climb back to X along that same path reversed.
 *
 * So run one search from all Pacific edge cells at once, moving only to
 * neighbours that are HIGHER OR EQUAL, and mark everything it reaches. Do the
 * same from the Atlantic edge. The answer is the intersection. Two traversals
 * instead of m*n of them, and each cell is visited at most once per ocean.
 *
 * Note the comparison flips with the direction: downhill used <=, so climbing
 * uses >=. Getting that backwards passes the square example and fails on plateaus.
 */
function pacificAtlanticDfs(heights) {
  if (!heights.length || !heights[0].length) return []
  const rows = heights.length, cols = heights[0].length
  const make = () => Array.from({ length: rows }, () => Array(cols).fill(false))
  const pacific = make(), atlantic = make()

  function climb(r, c, seen) {
    seen[r][c] = true
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
      if (seen[nr][nc] || heights[nr][nc] < heights[r][c]) continue        // climb only
      climb(nr, nc, seen)
    }
  }

  for (let r = 0; r < rows; r++) {
    climb(r, 0, pacific)
    climb(r, cols - 1, atlantic)
  }
  for (let c = 0; c < cols; c++) {
    climb(0, c, pacific)
    climb(rows - 1, c, atlantic)
  }

  const res = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) if (pacific[r][c] && atlantic[r][c]) res.push([r, c])
  }
  return res
}

/**
 * Approach 3 — reverse the flow, iterative BFS.  O(m*n) time, O(m*n) space.  ** optimal **
 *
 * Identical reasoning, explicit queue. Same complexity as the recursive version,
 * but a flat monotonic grid is one long path: a 200x200 grid can recurse 40,000
 * deep and JS gives up at roughly 10,000 frames. On grid problems this is not a
 * theoretical concern, it is the common crash.
 *
 * Seeding the queue with every edge cell up front is what makes one traversal
 * answer for the whole ocean — a multi-source search costs no more than a
 * single-source one.
 */
function pacificAtlantic(heights) {
  if (!heights.length || !heights[0].length) return []
  const rows = heights.length, cols = heights[0].length

  const reachable = starts => {
    const seen = Array.from({ length: rows }, () => Array(cols).fill(false))
    const queue = []
    for (const [r, c] of starts) {
      if (seen[r][c]) continue
      seen[r][c] = true
      queue.push([r, c])
    }
    for (let i = 0; i < queue.length; i++) {
      const [r, c] = queue[i]
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
        if (seen[nr][nc] || heights[nr][nc] < heights[r][c]) continue
        seen[nr][nc] = true                    // mark on enqueue, or cells queue twice
        queue.push([nr, nc])
      }
    }
    return seen
  }

  const pacificStarts = [], atlanticStarts = []
  for (let r = 0; r < rows; r++) {
    pacificStarts.push([r, 0])
    atlanticStarts.push([r, cols - 1])
  }
  for (let c = 0; c < cols; c++) {
    pacificStarts.push([0, c])
    atlanticStarts.push([rows - 1, c])
  }

  const pacific = reachable(pacificStarts), atlantic = reachable(atlanticStarts)
  const res = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) if (pacific[r][c] && atlantic[r][c]) res.push([r, c])
  }
  return res
}

module.exports = { pacificAtlantic, pacificAtlanticBrute, pacificAtlanticDfs }

if (require.main === module) {
  const { eq, eqUnordered, report } = require('../_lib/test')
  for (const fn of [pacificAtlantic, pacificAtlanticBrute, pacificAtlanticDfs]) {
    eqUnordered(fn([[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]),
      [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]], `${fn.name} worked example`)

    eq(fn([]), [], `${fn.name} empty grid`)
    eq(fn([[]]), [], `${fn.name} empty row`)
    eqUnordered(fn([[1]]), [[0, 0]], `${fn.name} single cell touches both oceans`)
    eqUnordered(fn([[1, 2, 3]]), [[0, 0], [0, 1], [0, 2]], `${fn.name} single row is both edges`)

    // Every height equal. Water moves across a plateau in both directions, so the
    // whole grid qualifies. This is the case that fails if the climb test is a
    // strict > instead of >=.
    eqUnordered(fn([[1, 1], [1, 1]]), [[0, 0], [0, 1], [1, 0], [1, 1]], `${fn.name} flat plateau`)

    // A peak in the middle drains everywhere; the valley next to it drains nowhere
    // but its own ocean.
    eqUnordered(fn([[3, 3, 3], [3, 1, 3], [3, 3, 3]]),
      [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]], `${fn.name} basin in the middle`)
  }
  report('pacific-atlantic-water-flow')
}
