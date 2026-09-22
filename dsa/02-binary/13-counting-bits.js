'use strict'
/**
 * COUNTING BITS
 *
 * Return an array where out[i] is the number of set bits in i, for i in 0..n.
 *
 *   n = 5  ->  [0, 1, 1, 2, 1, 2]
 *
 * Pattern: DP, reusing a smaller answer
 */

/** Approach 1 — count each number independently. O(n log n) time. */
function countBitsNaive(n) {
  const popcount = x => { let c = 0; while (x) { x &= x - 1; c++ } return c }
  return Array.from({ length: n + 1 }, (_, i) => popcount(i))
}

/**
 * Approach 2 — DP on the last bit.  O(n) time, O(n) space.  ** optimal **
 *
 * i >> 1 is i with its last bit dropped. So i has the same set bits as i >> 1,
 * plus possibly one more: its own last bit.
 *
 *   dp[i] = dp[i >> 1] + (i & 1)
 */
function countBits(n) {
  const dp = Array(n + 1).fill(0)
  for (let i = 1; i <= n; i++) dp[i] = dp[i >> 1] + (i & 1)
  return dp
}

/**
 * Approach 3 — DP on the lowest set bit. O(n) time, O(n) space.
 *
 * Same complexity, using the trick from problem 12: i & (i - 1) is i with one
 * set bit removed, so it has exactly one fewer.
 */
function countBitsLowestSet(n) {
  const dp = Array(n + 1).fill(0)
  for (let i = 1; i <= n; i++) dp[i] = dp[i & (i - 1)] + 1
  return dp
}

module.exports = { countBits, countBitsNaive, countBitsLowestSet }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [countBits, countBitsNaive, countBitsLowestSet]) {
    eq(fn(2), [0, 1, 1], `${fn.name} n=2`)
    eq(fn(5), [0, 1, 1, 2, 1, 2], `${fn.name} n=5`)
    eq(fn(0), [0], `${fn.name} n=0`)
  }
  report('counting-bits')
}
