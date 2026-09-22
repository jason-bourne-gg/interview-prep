'use strict'
/**
 * LONGEST COMMON SUBSEQUENCE
 *
 * Given two strings, return the length of the longest sequence of characters
 * that appears in both, in the same relative order, not necessarily adjacent.
 *
 *   "abcde", "ace"  ->  3        ("ace")
 *
 * Recurrence, on the first i characters of a and the first j of b:
 *   lcs(i, j) = 0                                   if i === 0 or j === 0
 *   lcs(i, j) = 1 + lcs(i - 1, j - 1)               if a[i - 1] === b[j - 1]
 *   lcs(i, j) = max(lcs(i - 1, j), lcs(i, j - 1))   otherwise
 *
 * The reasoning behind the middle line is the one to say out loud: when the two
 * end characters match, there is always an optimal answer that pairs them, so
 * you never need to consider dropping one of them. When they differ, at least
 * one of the two must be excluded, and you do not know which — so try both.
 *
 * Pattern: dynamic programming on strings (2-D grid)
 */

/**
 * Approach 1 — naive recursion.  O(2^(m + n)) time, O(m + n) stack.
 *
 * Each mismatch spawns two branches, and those branches overlap heavily: the
 * pair (i - 1, j - 1) is reached from both of them. That overlap is the signal
 * for memoisation, and the grid of (i, j) pairs tells you the cache is only
 * m * n entries.
 */
function lcsNaive(a, b) {
  const go = (i, j) => {
    if (i === 0 || j === 0) return 0
    if (a[i - 1] === b[j - 1]) return 1 + go(i - 1, j - 1)
    return Math.max(go(i - 1, j), go(i, j - 1))
  }
  return go(a.length, b.length)
}

/**
 * Approach 2 — memoised recursion (top-down).  O(m * n) time, O(m * n) space.
 *
 * Identical recursion with a cache keyed on the (i, j) pair. Worth writing first
 * in an interview because it is a mechanical translation of the recurrence — you
 * cannot get an index direction wrong the way you can when filling a table.
 */
function lcsMemo(a, b) {
  const memo = new Map()
  const go = (i, j) => {
    if (i === 0 || j === 0) return 0
    const key = i * (b.length + 1) + j
    if (memo.has(key)) return memo.get(key)
    const best = a[i - 1] === b[j - 1]
      ? 1 + go(i - 1, j - 1)
      : Math.max(go(i - 1, j), go(i, j - 1))
    memo.set(key, best)
    return best
  }
  return go(a.length, b.length)
}

/**
 * Approach 3 — tabulation (bottom-up).  O(m * n) time, O(m * n) space.
 *
 * Fill an (m + 1) x (n + 1) grid row by row. The extra leading row and column
 * hold the empty-string base case, which is why the string indices are i - 1 and
 * j - 1 rather than i and j — the single most common off-by-one in this problem.
 *
 * Keep this version when the interviewer asks you to RECONSTRUCT the actual
 * subsequence: walking back from dp[m][n] needs the full grid, so the space
 * optimisation below is not free in that variant.
 */
function lcsTable(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[m][n]
}

/**
 * Approach 4 — two rolling rows.  O(m * n) time, O(min(m, n)) space.
 * ** optimal **
 *
 * Row i only ever reads row i - 1 and cells to its own left, so all the earlier
 * rows are dead. Keep two rows and swap. Then iterate over the longer string in
 * the outer loop, so the row you allocate is the length of the SHORTER one —
 * that is where min(m, n) comes from, and it is free.
 */
function longestCommonSubsequence(a, b) {
  if (a.length < b.length) [a, b] = [b, a]      // b is now the shorter string
  let prev = Array(b.length + 1).fill(0)
  let curr = Array(b.length + 1).fill(0)
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1] + 1
        : Math.max(prev[j], curr[j - 1])
    }
    ;[prev, curr] = [curr, prev]                 // reuse the old row, do not allocate
  }
  return prev[b.length]                          // after the swap, prev holds the last row
}

module.exports = { longestCommonSubsequence, lcsNaive, lcsMemo, lcsTable }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [longestCommonSubsequence, lcsNaive, lcsMemo, lcsTable]) {
    eq(fn('abcde', 'ace'), 3, `${fn.name} worked example`)
    eq(fn('abc', 'abc'), 3, `${fn.name} identical`)
    eq(fn('abc', 'def'), 0, `${fn.name} nothing in common`)
    eq(fn('', 'abc'), 0, `${fn.name} one empty`)
    eq(fn('', ''), 0, `${fn.name} both empty`)
    eq(fn('a', 'a'), 1, `${fn.name} single matching char`)
    eq(fn('bl', 'yby'), 1, `${fn.name} match is not at the start`)
    eq(fn('abcba', 'abcbcba'), 5, `${fn.name} repeated characters`)
    eq(fn('ezupkr', 'ubmrapg'), 2, `${fn.name} interleaved, order must hold`)
  }
  report('longest-common-subsequence')
}
