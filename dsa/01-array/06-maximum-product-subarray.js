'use strict'
/**
 * MAXIMUM PRODUCT SUBARRAY
 *
 * Find the contiguous subarray with the largest PRODUCT, and return it.
 *
 *   [2, 3, -2, 4]  ->  6    ([2, 3])
 *   [-2, 0, -1]    ->  0
 *
 * Pattern: Kadane, but tracking the minimum too
 */

/** Approach 1 — brute force. O(n^2) time, O(1) space. */
function maxProductBrute(nums) {
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    let product = 1
    for (let j = i; j < nums.length; j++) {
      product *= nums[j]
      best = Math.max(best, product)
    }
  }
  return best
}

/**
 * Approach 2 — track running max AND min.  O(n) time, O(1) space.  ** optimal **
 *
 * Plain Kadane breaks here. A large NEGATIVE product becomes the largest
 * positive the moment it meets another negative, so the minimum is not junk —
 * it is a candidate in waiting. Carry both, and swap their roles when the
 * current number is negative.
 *
 * Zeros need no special case: Math.max(n, ...) prefers restarting at 0 over any
 * product dragged through it.
 */
function maxProduct(nums) {
  let best = nums[0], curMax = nums[0], curMin = nums[0]
  for (let i = 1; i < nums.length; i++) {
    const n = nums[i]
    if (n < 0) [curMax, curMin] = [curMin, curMax]   // a negative flips the roles
    curMax = Math.max(n, curMax * n)
    curMin = Math.min(n, curMin * n)
    best = Math.max(best, curMax)
  }
  return best
}

module.exports = { maxProduct, maxProductBrute }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [maxProduct, maxProductBrute]) {
    eq(fn([2, 3, -2, 4]), 6, `${fn.name} basic`)
    eq(fn([-2, 0, -1]), 0, `${fn.name} zero wins`)
    eq(fn([-2, 3, -4]), 24, `${fn.name} two negatives`)
    eq(fn([-2]), -2, `${fn.name} single negative`)
    eq(fn([0, 2]), 2, `${fn.name} leading zero`)
  }
  report('maximum-product-subarray')
}
