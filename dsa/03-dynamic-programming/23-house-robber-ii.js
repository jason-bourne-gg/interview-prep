'use strict'
/**
 * HOUSE ROBBER II
 *
 * The same houses, now arranged in a CIRCLE: the first and the last are
 * neighbours. You still cannot rob two adjacent houses. Return the most you can
 * take.
 *
 *   [2, 3, 2]  ->  3        (not 2 + 2 — those two are now adjacent)
 *
 * Recurrence: unchanged from House Robber. What changes is the framing.
 *
 * The insight, and the only thing this problem is testing: no valid plan can
 * include BOTH the first and the last house. So every plan lives in one of two
 * worlds — one where the last house is off the table, one where the first is —
 * and each of those is a plain straight-line House Robber on a sub-array.
 *   answer = max(rob(nums[0 .. n - 2]), rob(nums[1 .. n - 1]))
 *
 * Note this deliberately over-counts: plans that use neither end appear in both
 * worlds. That is harmless, because taking the max of two sets that both contain
 * the optimum still returns the optimum. Say that out loud — it is the step an
 * interviewer will push on.
 *
 * The edge case is n === 1. Both sub-arrays would be empty and the answer would
 * come out 0, silently losing the only house. Guard it explicitly.
 *
 * Pattern: dynamic programming (linear), applied twice
 */

/**
 * Approach 1 — naive recursion on both windows.  O(2^n) time, O(n) stack.
 *
 * Runs the exponential straight-line recursion once per window. Included to make
 * the reduction visible: the circular problem never needs new machinery, only
 * the right two calls into the linear one.
 */
function robCircularNaive(nums) {
  if (nums.length === 0) return 0
  if (nums.length === 1) return nums[0]
  const best = (arr, i) => {
    if (i < 0) return 0
    return Math.max(best(arr, i - 1), best(arr, i - 2) + arr[i])
  }
  const dropLast = nums.slice(0, -1)
  const dropFirst = nums.slice(1)
  return Math.max(best(dropLast, dropLast.length - 1), best(dropFirst, dropFirst.length - 1))
}

/**
 * Approach 2 — tabulation on both windows.  O(n) time, O(n) space.
 *
 * Same reduction with the linear DP filled as a table. Straightforward, but it
 * allocates two arrays and two slices for a problem whose state is two numbers,
 * which is what the next rung fixes.
 */
function robCircularTable(nums) {
  if (nums.length === 0) return 0
  if (nums.length === 1) return nums[0]
  const line = arr => {
    const dp = Array(arr.length + 1).fill(0)
    dp[1] = arr.length ? arr[0] : 0
    for (let i = 2; i <= arr.length; i++) dp[i] = Math.max(dp[i - 1], dp[i - 2] + arr[i - 1])
    return dp[arr.length]
  }
  return Math.max(line(nums.slice(0, -1)), line(nums.slice(1)))
}

/**
 * Approach 3 — rolling variables over index ranges.  O(n) time, O(1) space.
 * ** optimal **
 *
 * Two improvements over approach 2, both worth stating. The rolling pair
 * replaces the table, as in House Robber. And passing index bounds instead of
 * slicing removes the two O(n) copies — the helper reads the original array in
 * place, so the space really is constant rather than "constant plus two slices".
 */
function rob(nums) {
  const n = nums.length
  if (n === 0) return 0
  if (n === 1) return nums[0]
  const line = (from, to) => {                   // inclusive range, no copying
    let skip = 0, take = 0
    for (let i = from; i <= to; i++) {
      const next = Math.max(take, skip + nums[i])
      skip = take
      take = next
    }
    return take
  }
  return Math.max(line(0, n - 2), line(1, n - 1))
}

module.exports = { rob, robCircularNaive, robCircularTable }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [rob, robCircularNaive, robCircularTable]) {
    eq(fn([2, 3, 2]), 3, `${fn.name} worked example, ends are adjacent`)
    eq(fn([1, 2, 3, 1]), 4, `${fn.name} same as the straight-line answer here`)
    eq(fn([1, 2, 3]), 3, `${fn.name} take the single largest`)
    eq(fn([]), 0, `${fn.name} no houses`)
    eq(fn([7]), 7, `${fn.name} single house, the case the reduction loses`)
    eq(fn([1, 2]), 2, `${fn.name} two houses, both adjacent both ways`)
    eq(fn([5, 1, 1, 5]), 6, `${fn.name} the two 5s are adjacent around the circle`)
    eq(fn([200, 3, 140, 20, 10]), 340, `${fn.name} longer circle`)
    eq(fn([1, 1, 1, 1]), 2, `${fn.name} every house equal`)
  }
  report('house-robber-ii')
}
