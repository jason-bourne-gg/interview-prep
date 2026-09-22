'use strict'
/**
 * SPIRAL MATRIX
 *
 * Return every element of an m x n matrix in spiral order: left along the top,
 * down the right side, right-to-left along the bottom, up the left side, then
 * inward one layer and repeat.
 *
 *   [[1, 2, 3],
 *    [4, 5, 6],   ->  [1, 2, 3, 6, 9, 8, 7, 4, 5]
 *    [7, 8, 9]]
 *
 * Pattern: boundary simulation
 */

const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]]     // right, down, left, up — in spiral order

/**
 * Approach 1 — walk and turn, with a visited grid.  O(m*n) time, O(m*n) space.
 *
 * The honest first attempt: hold a direction, take one step at a time, and turn
 * right whenever the next step would leave the matrix or land on a cell already
 * emitted. It is correct and needs no reasoning about layers, which is exactly
 * why it is worth being able to write — but it carries a full second grid to
 * remember something the geometry already implies.
 */
function spiralOrderVisited(matrix) {
  if (!matrix.length || !matrix[0].length) return []
  const rows = matrix.length, cols = matrix[0].length
  // Array(rows).fill(Array(cols).fill(false)) would put ONE row array in every
  // slot, so seen[0][0] = true marks column 0 of every row. Build each row.
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false))
  const out = []
  let r = 0, c = 0, d = 0

  for (let i = 0; i < rows * cols; i++) {
    out.push(matrix[r][c])
    seen[r][c] = true
    const nr = r + DIRS[d][0], nc = c + DIRS[d][1]
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) d = (d + 1) % 4
    r += DIRS[d][0]
    c += DIRS[d][1]
  }
  return out
}

/**
 * Approach 2 — peel the top row, rotate the rest.  O(m*n*min(m,n)) time, O(m*n) space.
 *
 * The insight is that a spiral is just "take the top row" repeated, if you keep
 * turning the matrix. After the top row comes the right column read downward —
 * and the right column read downward IS the top row of the matrix rotated
 * counter-clockwise. So peel, rotate, repeat, and the four directions collapse
 * into one.
 *
 * Elegant, and a good thing to say out loud, but each rotation rebuilds what is
 * left, so the work adds up to more than O(m*n). Mention it, then write the
 * boundary version.
 */
function spiralOrderPeel(matrix) {
  if (!matrix.length || !matrix[0].length) return []
  const out = []
  let m = matrix.map(row => [...row])
  while (m.length && m[0].length) {
    out.push(...m.shift())
    const rows = m.length, cols = rows ? m[0].length : 0
    // rotate counter-clockwise: the last column becomes the first row
    m = Array.from({ length: cols }, (_, i) => Array.from({ length: rows }, (_, j) => m[j][cols - 1 - i]))
  }
  return out
}

/**
 * Approach 3 — four shrinking boundaries.  O(m*n) time, O(1) extra.  ** optimal **
 *
 * Nothing needs to be remembered per cell. The spiral is fully described by four
 * numbers — top, bottom, left, right — and each of the four sweeps consumes one
 * edge and then retires it by moving its boundary inward. Every cell is read
 * once, and no direction is ever ambiguous.
 *
 * The off-by-one that makes this problem interesting: after the top sweep and
 * the right sweep, what is left may be a single row or a single column. Without
 * the `top <= bottom` guard the bottom sweep re-emits the row the top sweep
 * already took, backwards; without `left <= right` the left sweep re-emits the
 * column. A square matrix never exposes this, so test a 2 x 3 and a 3 x 2.
 */
function spiralOrder(matrix) {
  if (!matrix.length || !matrix[0].length) return []
  const out = []
  let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1

  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(matrix[top][c])
    top++
    for (let r = top; r <= bottom; r++) out.push(matrix[r][right])
    right--
    if (top <= bottom) {                                   // still a distinct bottom row?
      for (let c = right; c >= left; c--) out.push(matrix[bottom][c])
      bottom--
    }
    if (left <= right) {                                   // still a distinct left column?
      for (let r = bottom; r >= top; r--) out.push(matrix[r][left])
      left++
    }
  }
  return out
}

module.exports = { spiralOrder, spiralOrderVisited, spiralOrderPeel }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [spiralOrder, spiralOrderVisited, spiralOrderPeel]) {
    eq(fn([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), [1, 2, 3, 6, 9, 8, 7, 4, 5], `${fn.name} worked example`)
    eq(fn([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]),
       [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7], `${fn.name} wide`)
    eq(fn([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]),
       [1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5, 8], `${fn.name} tall`)
    eq(fn([]), [], `${fn.name} empty`)
    eq(fn([[]]), [], `${fn.name} empty row`)
    eq(fn([[1]]), [1], `${fn.name} single cell`)
    eq(fn([[1, 2, 3]]), [1, 2, 3], `${fn.name} single row`)
    eq(fn([[1], [2], [3]]), [1, 2, 3], `${fn.name} single column`)
    eq(fn([[1, 2], [3, 4]]), [1, 2, 4, 3], `${fn.name} 2x2`)
    eq(fn([[1, 2, 3], [4, 5, 6]]), [1, 2, 3, 6, 5, 4], `${fn.name} leftover single row`)
    eq(fn([[1, 2], [3, 4], [5, 6]]), [1, 2, 4, 6, 5, 3], `${fn.name} leftover single column`)
    eq(fn([[7, 7], [7, 7]]), [7, 7, 7, 7], `${fn.name} duplicates, nothing dropped`)
  }
  report('spiral-matrix')
}
