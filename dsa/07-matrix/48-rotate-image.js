'use strict'
/**
 * ROTATE IMAGE
 *
 * Rotate an n x n matrix 90 degrees clockwise, in place. The first row becomes
 * the last column, the second row the second-to-last column, and so on.
 *
 *   [[1, 2, 3],        [[7, 4, 1],
 *    [4, 5, 6],   ->    [8, 5, 2],
 *    [7, 8, 9]]         [9, 6, 3]]
 *
 * Pattern: in-place transform (transpose + reverse)
 */

/**
 * Approach 1 — build a rotated copy.  O(n^2) time, O(n^2) space.
 *
 * Read the destination formula off the example: the element at (r, c) lands at
 * (c, n-1-r). Row index becomes column index, and the new column counts from
 * the right because the top row has to end up on the right-hand side.
 *
 * Writing that into a fresh grid and copying back is correct and takes ten
 * seconds. The whole question is how to delete the fresh grid.
 */
function rotateCopy(matrix) {
  const n = matrix.length
  // Array(n).fill(Array(n).fill(0)) stores ONE row array n times — every row is
  // the same object, and out[0][0] = x writes into all n rows. Build per row.
  const out = Array.from({ length: n }, () => Array(n).fill(0))
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) out[c][n - 1 - r] = matrix[r][c]
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) matrix[r][c] = out[r][c]
  return matrix
}

/**
 * Approach 2 — rotate each ring, four cells at a time.  O(n^2) time, O(1) extra.
 *
 * A rotation maps every cell onto another cell in the same concentric ring, and
 * those maps form 4-cycles: top goes to right, right to bottom, bottom to left,
 * left back to top. So one temporary variable is enough — save the top, shift
 * the other three in, drop the saved value into the gap.
 *
 * It works, but the index arithmetic is four expressions that are easy to get
 * subtly wrong under pressure, and a single sign error is invisible on a 2 x 2.
 * That is the reason approach 3 wins despite being the same complexity.
 */
function rotateRings(matrix) {
  const n = matrix.length
  for (let layer = 0; layer < Math.floor(n / 2); layer++) {
    const first = layer, last = n - 1 - layer
    for (let i = first; i < last; i++) {
      const offset = i - first
      const top = matrix[first][i]
      matrix[first][i] = matrix[last - offset][first]        // left  -> top
      matrix[last - offset][first] = matrix[last][last - offset] // bottom -> left
      matrix[last][last - offset] = matrix[i][last]          // right -> bottom
      matrix[i][last] = top                                  // top   -> right
    }
  }
  return matrix
}

/**
 * Approach 3 — transpose, then reverse each row.  O(n^2) time, O(1) extra.
 *                                                 ** optimal **
 *
 * Why these two equal a 90-degree clockwise rotation: each is a reflection.
 * Transposing reflects across the main diagonal, sending (r, c) to (c, r).
 * Reversing each row reflects across the vertical centre line, sending (r, c)
 * to (r, n-1-c). Compose them and (r, c) goes to (c, r) and then to (c, n-1-r)
 * — exactly the destination formula from approach 1. Geometrically it is the
 * standard fact that two reflections about axes 45 degrees apart compose into a
 * rotation of twice that angle.
 *
 * Same cost as the ring version, but there is nothing to get wrong: two
 * operations you already know, neither with a special case.
 *
 * The one off-by-one: the transpose loop must start at c = r + 1. Starting at 0
 * swaps every pair twice, which is the identity, and the matrix comes back
 * merely flipped left-to-right.
 *
 * Counter-clockwise is the same move with the order swapped: reverse the rows
 * of the matrix (not within each row), then transpose.
 */
function rotate(matrix) {
  const n = matrix.length
  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) {              // strictly above the diagonal
      ;[matrix[r][c], matrix[c][r]] = [matrix[c][r], matrix[r][c]]
    }
  }
  for (const row of matrix) row.reverse()
  return matrix
}

module.exports = { rotate, rotateCopy, rotateRings }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  const grid = g => g.map(row => [...row])         // fresh input per call; these all mutate

  for (const fn of [rotate, rotateCopy, rotateRings]) {
    eq(fn(grid([[1, 2, 3], [4, 5, 6], [7, 8, 9]])),
       [[7, 4, 1], [8, 5, 2], [9, 6, 3]], `${fn.name} worked example`)
    eq(fn(grid([[1, 2], [3, 4]])), [[3, 1], [4, 2]], `${fn.name} 2x2`)
    eq(fn(grid([[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]])),
       [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]], `${fn.name} 4x4`)
    eq(fn(grid([])), [], `${fn.name} empty`)
    eq(fn(grid([[1]])), [[1]], `${fn.name} single cell`)
    eq(fn(grid([[1, 1], [1, 2]])), [[1, 1], [2, 1]], `${fn.name} duplicates`)
    // four rotations are the identity — catches a transform that is a flip, not a turn
    const four = grid([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    fn(fn(fn(fn(four))))
    eq(four, [[1, 2, 3], [4, 5, 6], [7, 8, 9]], `${fn.name} four rotations restore`)
    // one rotation must NOT equal a left-right flip
    const once = fn(grid([[1, 2], [3, 4]]))
    eq(once[0][0] === 2 && once[0][1] === 1, false, `${fn.name} not a mirror`)
  }
  report('rotate-image')
}
