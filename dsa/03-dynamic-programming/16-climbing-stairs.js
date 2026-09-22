'use strict'
/**
 * CLIMBING STAIRS
 *
 * A staircase has n steps. Each move climbs either 1 step or 2. Count the
 * distinct orders that reach the top. Order matters: 1 then 2 is a different
 * climb from 2 then 1.
 *
 *   n = 3  ->  3        (1+1+1, 1+2, 2+1)
 *
 * Recurrence: ways(n) = ways(n - 1) + ways(n - 2), with ways(0) = ways(1) = 1.
 * The reasoning: the LAST move was either a 1-step or a 2-step. Those two sets
 * of climbs are disjoint and together they are all of them, so you add. That is
 * Fibonacci with the indices shifted, which is why the answer grows so fast.
 *
 * Pattern: dynamic programming (linear)
 */

/**
 * Approach 1 — naive recursion.  O(2^n) time, O(n) stack.
 *
 * A direct transcription of the recurrence. It is exponential because the call
 * tree recomputes the same subproblem over and over: ways(n-2) is reached both
 * from ways(n-1) and directly from ways(n). Spotting that overlap is the whole
 * reason this is a DP problem and not a combinatorics one.
 */
function climbStairsNaive(n) {
  if (n <= 1) return 1
  return climbStairsNaive(n - 1) + climbStairsNaive(n - 2)
}

/**
 * Approach 2 — memoised recursion (top-down).  O(n) time, O(n) space.
 *
 * Same recursion, with every answer cached the first time it is computed. The
 * shape of the code does not change at all — only the number of distinct calls,
 * which drops from exponential to n. This is the cheapest possible upgrade and
 * the one to reach for first in an interview.
 */
function climbStairsMemo(n, memo = new Map()) {
  if (n <= 1) return 1
  if (memo.has(n)) return memo.get(n)
  const ways = climbStairsMemo(n - 1, memo) + climbStairsMemo(n - 2, memo)
  memo.set(n, ways)
  return ways
}

/**
 * Approach 3 — tabulation (bottom-up).  O(n) time, O(n) space.
 *
 * The memoised version always resolves subproblems in increasing order of n, so
 * you can drop the recursion and fill an array left to right instead. Same work,
 * no call stack, no risk of blowing it on a large n.
 */
function climbStairsTable(n) {
  const dp = Array(Math.max(n, 1) + 1).fill(0)
  dp[0] = 1
  dp[1] = 1
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2]
  return dp[Math.max(n, 0)]
}

/**
 * Approach 4 — rolling variables.  O(n) time, O(1) space.  ** optimal **
 *
 * dp[i] reads exactly two cells behind it and nothing else, so the whole array
 * is dead weight — two variables carry everything the loop needs. Recognising
 * "this row only depends on the previous k rows" is the space optimisation that
 * transfers to almost every linear DP in the list.
 */
function climbStairs(n) {
  let prev = 1, curr = 1
  for (let i = 2; i <= n; i++) {
    const next = prev + curr
    prev = curr
    curr = next
  }
  return curr
}

module.exports = { climbStairs, climbStairsNaive, climbStairsMemo, climbStairsTable }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [climbStairs, climbStairsNaive, climbStairsMemo, climbStairsTable]) {
    eq(fn(0), 1, `${fn.name} zero steps, the empty climb`)
    eq(fn(1), 1, `${fn.name} single step`)
    eq(fn(2), 2, `${fn.name} two steps`)
    eq(fn(3), 3, `${fn.name} worked example`)
    eq(fn(4), 5, `${fn.name} four steps`)
    eq(fn(5), 8, `${fn.name} fibonacci offset holds`)
    eq(fn(20), 10946, `${fn.name} larger n`)
  }
  report('climbing-stairs')
}
