'use strict'
/**
 * MAXIMUM SUBARRAY
 *
 * Find the contiguous subarray with the largest sum, and return that sum.
 *
 *   [-2, 1, -3, 4, -1, 2, 1, -5, 4]  ->  6   ([4, -1, 2, 1])
 *
 * Pattern: Kadane / running sum
 */

/** Approach 1 — brute force. O(n^3) time. Every (i, j), re-summing each time. */
function maxSubArrayBrute(nums) {
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      let sum = 0
      for (let k = i; k <= j; k++) sum += nums[k]
      best = Math.max(best, sum)
    }
  }
  return best
}

/** Approach 2 — carry the running sum. O(n^2) time. The inner sum was redundant. */
function maxSubArrayQuadratic(nums) {
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    let sum = 0
    for (let j = i; j < nums.length; j++) {
      sum += nums[j]
      best = Math.max(best, sum)
    }
  }
  return best
}

/**
 * Approach 3 — Kadane.  O(n) time, O(1) space.  ** optimal **
 *
 * One question per element: is the running sum helping me? If it has gone
 * negative it can only drag the next element down, so throw it away and start
 * fresh at nums[i].
 *
 * Initialise to nums[0], not 0. An all-negative array must return its largest
 * element, and starting at 0 would wrongly return 0.
 */
function maxSubArray(nums) {
  let best = nums[0], current = nums[0]
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i])
    best = Math.max(best, current)
  }
  return best
}

/**
 * Approach 4 — divide and conquer. O(n log n).
 *
 * The answer is entirely in the left half, entirely in the right, or it crosses
 * the midpoint. Slower than Kadane, but it is the expected answer if the
 * interviewer explicitly asks for a divide-and-conquer solution.
 */
function maxSubArrayDivide(nums, lo = 0, hi = nums.length - 1) {
  if (lo === hi) return nums[lo]
  const mid = (lo + hi) >> 1

  let leftBest = -Infinity, sum = 0
  for (let i = mid; i >= lo; i--) { sum += nums[i]; leftBest = Math.max(leftBest, sum) }

  let rightBest = -Infinity
  sum = 0
  for (let i = mid + 1; i <= hi; i++) { sum += nums[i]; rightBest = Math.max(rightBest, sum) }

  return Math.max(
    maxSubArrayDivide(nums, lo, mid),
    maxSubArrayDivide(nums, mid + 1, hi),
    leftBest + rightBest,
  )
}

module.exports = { maxSubArray, maxSubArrayBrute, maxSubArrayQuadratic, maxSubArrayDivide }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [maxSubArray, maxSubArrayBrute, maxSubArrayQuadratic, maxSubArrayDivide]) {
    eq(fn([-2, 1, -3, 4, -1, 2, 1, -5, 4]), 6, `${fn.name} basic`)
    eq(fn([1]), 1, `${fn.name} single`)
    eq(fn([5, 4, -1, 7, 8]), 23, `${fn.name} mostly positive`)
    eq(fn([-3, -1, -2]), -1, `${fn.name} all negative`)
  }
  report('maximum-subarray')
}
