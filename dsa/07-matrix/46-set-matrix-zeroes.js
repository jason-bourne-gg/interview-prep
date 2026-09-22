'use strict'
/**
 * SET MATRIX ZEROES
 *
 * If any cell of an m x n matrix is 0, set that cell's entire row and entire
 * column to 0. Do it in place.
 *
 *   [[1,1,1],        [[1,0,1],
 *    [1,0,1],   ->    [0,0,0],
 *    [1,1,1]]         [1,0,1]]
 *
 * Pattern: index as a hash / in-place marking
 */

/**
 * Approach 1 — write into a copy.  O(m*n*(m+n)) time, O(m*n) space.
 *
 * The reason a copy is needed at all is the whole problem. Zero a row directly
 * in the input and the zeros you just wrote are indistinguishable from the
 * zeros that were there to begin with, so the rest of the scan treats them as
 * sources and the single 0 floods the matrix. Reading from the original and
 * writing to a copy keeps "was 0" and "became 0" apart.
 */
function setZeroesBrute(matrix) {
  const rows = matrix.length
  if (!rows || !matrix[0].length) return matrix
  const cols = matrix[0].length
  const copy = matrix.map(row => [...row])

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] !== 0) continue
      for (let k = 0; k < cols; k++) copy[r][k] = 0
      for (let k = 0; k < rows; k++) copy[k][c] = 0
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) matrix[r][c] = copy[r][c]
  return matrix
}

/**
 * Approach 2 — two marker arrays.  O(m*n) time, O(m+n) space.
 *
 * The observation that drops the copy: you never need to know WHERE the zeros
 * are, only WHICH rows and WHICH columns are condemned. That is m+n bits of
 * information, not m*n. One pass to collect the verdicts, one pass to apply
 * them, and the second pass reads only the arrays, so writing zeros into the
 * matrix can no longer feed back into the scan.
 */
function setZeroesMarkers(matrix) {
  const rows = matrix.length
  if (!rows || !matrix[0].length) return matrix
  const cols = matrix[0].length
  const zeroRow = Array(rows).fill(false)
  const zeroCol = Array(cols).fill(false)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 0) { zeroRow[r] = true; zeroCol[c] = true }
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (zeroRow[r] || zeroCol[c]) matrix[r][c] = 0
    }
  }
  return matrix
}

/**
 * Approach 3 — store the markers in row 0 and column 0.  O(m*n) time, O(1) extra.
 *                                                        ** optimal **
 *
 * The m+n bits have to live somewhere, and the matrix already contains m+n
 * cells whose contents are disposable: if row 0 or column 0 contains a zero,
 * that whole row or column is getting zeroed anyway, so whatever is in it now
 * does not matter. So let matrix[r][0] mean "row r is condemned" and
 * matrix[0][c] mean "column c is condemned".
 *
 * The edge case everyone gets wrong: matrix[0][0] sits in both the row store
 * and the column store and would have to carry two different bits. Pull one of
 * them out into a single boolean — here firstColZero — and let matrix[0][0]
 * speak only for row 0.
 *
 * The other trap is write order. Zeros written into row 0 are byte-identical to
 * column markers. Going top-down, a condemned row 0 gets zeroed first and every
 * row below then reads those zeros as "column condemned", so the whole matrix
 * goes to zero. Applying bottom-up means row 0 is written last, after the last
 * read of it. Same argument for column 0, which is why each row's own marker
 * cell is only overwritten once its row is finished.
 */
function setZeroes(matrix) {
  const rows = matrix.length
  if (!rows || !matrix[0].length) return matrix
  const cols = matrix[0].length
  let firstColZero = false

  for (let r = 0; r < rows; r++) {
    if (matrix[r][0] === 0) firstColZero = true      // column 0's own bit, kept outside
    for (let c = 1; c < cols; c++) {
      if (matrix[r][c] === 0) { matrix[r][0] = 0; matrix[0][c] = 0 }
    }
  }

  for (let r = rows - 1; r >= 0; r--) {              // bottom-up: row 0 is read until last
    for (let c = cols - 1; c >= 1; c--) {
      if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0
    }
    if (firstColZero) matrix[r][0] = 0                // after this row's marker is spent
  }
  return matrix
}

module.exports = { setZeroes, setZeroesBrute, setZeroesMarkers }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  const grid = g => g.map(row => [...row])           // fresh input per call; these all mutate

  for (const fn of [setZeroes, setZeroesBrute, setZeroesMarkers]) {
    eq(fn(grid([[1, 1, 1], [1, 0, 1], [1, 1, 1]])),
       [[1, 0, 1], [0, 0, 0], [1, 0, 1]], `${fn.name} worked example`)
    eq(fn(grid([[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]])),
       [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]], `${fn.name} zeros in row 0`)
    eq(fn(grid([])), [], `${fn.name} empty`)
    eq(fn(grid([[1]])), [[1]], `${fn.name} single cell, no zero`)
    eq(fn(grid([[0]])), [[0]], `${fn.name} single cell, zero`)
    eq(fn(grid([[1, 2], [3, 4]])), [[1, 2], [3, 4]], `${fn.name} no zeros anywhere`)
    eq(fn(grid([[1, 2], [0, 4]])), [[0, 2], [0, 0]], `${fn.name} zero in column 0 only`)
    eq(fn(grid([[0, 1], [1, 1]])), [[0, 0], [0, 1]], `${fn.name} zero at [0][0]`)
    eq(fn(grid([[1, 0], [1, 1]])), [[0, 0], [1, 0]], `${fn.name} zero in row 0 only`)
    eq(fn(grid([[1, 2, 3]])), [[1, 2, 3]], `${fn.name} single row`)
    eq(fn(grid([[1], [0], [3]])), [[0], [0], [0]], `${fn.name} single column`)
    eq(fn(grid([[0, 0], [0, 0]])), [[0, 0], [0, 0]], `${fn.name} all zeros`)
  }
  report('set-matrix-zeroes')
}
