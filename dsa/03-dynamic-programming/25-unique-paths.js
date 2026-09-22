'use strict'
/**
 * UNIQUE PATHS
 *
 * A robot starts at the top-left of an m x n grid and must reach the
 * bottom-right, moving only right or down. Count the distinct paths.
 *
 *   m = 3, n = 7  ->  28
 *
 * Recurrence: paths(i, j) = paths(i - 1, j) + paths(i, j - 1), with paths = 1
 * anywhere in the first row or first column. You arrive at a cell either from
 * above or from the left, and those two sets of paths are disjoint.
 *
 * This is the one problem in the category with a closed form. Every path is a
 * fixed sequence of m - 1 downs and n - 1 rights in some order, so the count is
 * just the number of ways to choose where the downs go: C(m + n - 2, m - 1).
 * The DP ladder is still worth walking, because the moment the grid has
 * obstacles the formula dies and the table is all you have.
 *
 * Pattern: dynamic programming (2-D grid) — with a combinatorial shortcut
 */

/**
 * Approach 1 — naive recursion.  O(2^(m + n)) time, O(m + n) stack.
 *
 * The recurrence, verbatim. Cell (i - 1, j - 1) is reached from both parents, so
 * the tree recomputes the same cells repeatedly — and the number of leaves is
 * the answer itself, which is exactly why it is unusable at grid sizes people
 * actually ask about.
 */
function uniquePathsNaive(m, n) {
  if (m === 1 || n === 1) return 1
  return uniquePathsNaive(m - 1, n) + uniquePathsNaive(m, n - 1)
}

/**
 * Approach 2 — memoised recursion (top-down).  O(m * n) time, O(m * n) space.
 *
 * The cell coordinates are the whole state — the route taken to get there does
 * not affect how many ways lead onward. So there are only m * n distinct
 * questions, however many paths there are.
 */
function uniquePathsMemo(m, n) {
  const memo = new Map()
  const go = (i, j) => {
    if (i === 1 || j === 1) return 1
    const key = i * (n + 1) + j
    if (memo.has(key)) return memo.get(key)
    const total = go(i - 1, j) + go(i, j - 1)
    memo.set(key, total)
    return total
  }
  return go(m, n)
}

/**
 * Approach 3 — tabulation (bottom-up).  O(m * n) time, O(m * n) space.
 *
 * Fill the grid row by row. Seeding the whole first row and column to 1 is the
 * base case made concrete: along an edge there is only one way to walk. This is
 * the version to keep in mind for the obstacle variant, where a blocked cell is
 * simply written as 0 and the rest of the loop is unchanged.
 */
function uniquePathsTable(m, n) {
  const dp = Array.from({ length: m }, () => Array(n).fill(1))
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
  }
  return dp[m - 1][n - 1]
}

/**
 * Approach 4 — one rolling row.  O(m * n) time, O(n) space.
 *
 * A cell needs the value above it and the value to its left. If you overwrite a
 * single row in place, then at the moment you write row[j], the cell still
 * holding the old value IS the one above, and row[j - 1] has already been
 * updated to the one on the left. One array, no copying, and the in-place
 * overwrite is the trick rather than a bug.
 */
function uniquePathsRow(m, n) {
  const row = Array(n).fill(1)
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) row[j] += row[j - 1]   // row[j] is "above", row[j-1] is "left"
  }
  return row[n - 1]
}

/**
 * Approach 5 — binomial coefficient.  O(min(m, n)) time, O(1) space.
 * ** optimal **
 *
 * Choose which m - 1 of the m + n - 2 moves are downs: C(m + n - 2, m - 1).
 *
 * Build the coefficient one factor at a time rather than computing factorials,
 * which would overflow long before the answer does. Multiplying then dividing in
 * this order keeps every intermediate an exact integer — after k steps the
 * running value is C(n - 1 + k, k) — so there is no floating-point drift to
 * round away at the end.
 */
function uniquePaths(m, n) {
  if (m > n) [m, n] = [n, m]                     // fewer loop iterations, same value
  let result = 1
  for (let i = 1; i <= m - 1; i++) {
    result = (result * (n - 1 + i)) / i
  }
  return result
}

module.exports = { uniquePaths, uniquePathsNaive, uniquePathsMemo, uniquePathsTable, uniquePathsRow }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [uniquePaths, uniquePathsNaive, uniquePathsMemo, uniquePathsTable, uniquePathsRow]) {
    eq(fn(3, 7), 28, `${fn.name} worked example`)
    eq(fn(7, 3), 28, `${fn.name} transposed, same answer`)
    eq(fn(1, 1), 1, `${fn.name} single cell, the do-nothing path`)
    eq(fn(1, 10), 1, `${fn.name} single row`)
    eq(fn(10, 1), 1, `${fn.name} single column`)
    eq(fn(2, 2), 2, `${fn.name} smallest real choice`)
    eq(fn(3, 3), 6, `${fn.name} square grid`)
  }
  // The three polynomial approaches on a grid the recursions could not finish.
  for (const fn of [uniquePaths, uniquePathsTable, uniquePathsRow]) {
    eq(fn(23, 12), 193536720, `${fn.name} large grid, exact integer`)
  }
  report('unique-paths')
}
