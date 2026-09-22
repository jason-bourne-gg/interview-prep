'use strict'
/**
 * NUMBER OF ISLANDS
 *
 * A grid holds '1' for land and '0' for water. An island is a group of land
 * cells joined horizontally or vertically — diagonals do not connect. Count the
 * islands.
 *
 *   [['1','1','0'],
 *    ['1','0','0'],   ->  2
 *    ['0','0','1']]
 *
 * Pattern: BFS / DFS on graphs and grids
 */

const { DSU } = require('../_lib/structures')

const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]]

/**
 * Approach 1 — recursive DFS flood fill.  O(m*n) time, O(m*n) space.
 *
 * Scan the grid. Every time you step onto unvisited land, that is a new island,
 * so increment the counter and then erase the entire connected blob so the scan
 * never counts it again. The counter is incremented by the OUTER loop, never by
 * the flood fill, and that split is the whole algorithm.
 *
 * The space term is the recursion stack, and it is not a formality: a grid that
 * is all land is one blob of m*n cells, and the recursion goes that deep. At a
 * 200x200 grid that is 40,000 frames against a JS ceiling of roughly 10,000.
 *
 * The flood fill writes to the grid, so this copies first. Quietly destroying
 * the caller's input is the kind of thing that passes a judge and fails review.
 */
function numIslandsDfs(grid) {
  if (!grid.length || !grid[0].length) return 0
  const g = grid.map(row => [...row])
  const rows = g.length, cols = g[0].length
  let islands = 0

  function sink(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || g[r][c] !== '1') return
    g[r][c] = '0'
    for (const [dr, dc] of DIRS) sink(r + dr, c + dc)
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (g[r][c] !== '1') continue
      islands++
      sink(r, c)
    }
  }
  return islands
}

/**
 * Approach 2 — union-find.  O(m*n * a(m*n)) time, O(m*n) space.
 *
 * Give every cell an id, start with one component per land cell, and union each
 * land cell with its right and down neighbours when they are land too. Looking
 * only right and down is enough: the left and up pairs get unioned when that
 * neighbour takes its own turn, so checking all four just does each merge twice.
 *
 * Slower than a traversal by the inverse-Ackermann factor, and more code. It
 * earns its place when the grid CHANGES — "land keeps appearing, report the
 * island count after each addition" is answered incrementally by union-find and
 * forces a full re-scan with DFS.
 */
function numIslandsDsu(grid) {
  if (!grid.length || !grid[0].length) return 0
  const rows = grid.length, cols = grid[0].length
  const dsu = new DSU(rows * cols)
  let land = 0

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1') continue
      land++
      const id = r * cols + c
      if (r + 1 < rows && grid[r + 1][c] === '1') dsu.union(id, id + cols)
      if (c + 1 < cols && grid[r][c + 1] === '1') dsu.union(id, id + 1)
    }
  }

  // dsu.count starts at rows*cols, one per cell including water. Count distinct
  // roots among land cells instead of trusting that number.
  const roots = new Set()
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) if (grid[r][c] === '1') roots.add(dsu.find(r * cols + c))
  }
  return land === 0 ? 0 : roots.size
}

/**
 * Approach 3 — iterative BFS flood fill.  O(m*n) time, O(m*n) space.  ** optimal **
 *
 * Same counting logic as approach 1 with an explicit queue, so the all-land grid
 * that overflowed the recursion just makes a long queue instead. Complexity is
 * unchanged; this is the version that survives a large input.
 *
 * Sink a cell when you enqueue it, not when you dequeue it. Marking on dequeue
 * lets the same cell be pushed once per land neighbour, which is up to four
 * times, and the queue stops being bounded by the grid size.
 */
function numIslands(grid) {
  if (!grid.length || !grid[0].length) return 0
  const g = grid.map(row => [...row])
  const rows = g.length, cols = g[0].length
  let islands = 0

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (g[r][c] !== '1') continue
      islands++
      g[r][c] = '0'
      const queue = [[r, c]]
      for (let i = 0; i < queue.length; i++) {
        const [cr, cc] = queue[i]
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr, nc = cc + dc
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || g[nr][nc] !== '1') continue
          g[nr][nc] = '0'                      // sink on enqueue
          queue.push([nr, nc])
        }
      }
    }
  }
  return islands
}

module.exports = { numIslands, numIslandsDfs, numIslandsDsu }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  const g = rows => rows.map(r => r.split(''))

  for (const fn of [numIslands, numIslandsDfs, numIslandsDsu]) {
    eq(fn(g(['11110', '11010', '11000', '00000'])), 1, `${fn.name} one big island`)
    eq(fn(g(['11000', '11000', '00100', '00011'])), 3, `${fn.name} three islands`)
    eq(fn([]), 0, `${fn.name} empty grid`)
    eq(fn(g(['0'])), 0, `${fn.name} single water cell`)
    eq(fn(g(['1'])), 1, `${fn.name} single land cell`)
    eq(fn(g(['000', '000'])), 0, `${fn.name} all water`)
    eq(fn(g(['111', '111'])), 1, `${fn.name} all land`)

    // Diagonal touch does NOT join. Anyone who adds the four diagonal offsets to
    // DIRS gets 1 here instead of 2.
    eq(fn(g(['10', '01'])), 2, `${fn.name} diagonals do not connect`)

    // A ring of land around water: still one island, and the enclosed water is
    // not an island of its own.
    eq(fn(g(['111', '101', '111'])), 1, `${fn.name} ring around a lake`)

    // The caller's grid must come back untouched.
    const original = g(['11', '01'])
    fn(original)
    eq(original.map(r => r.join('')), ['11', '01'], `${fn.name} does not mutate the input`)
  }
  report('number-of-islands')
}
