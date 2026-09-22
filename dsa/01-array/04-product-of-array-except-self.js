'use strict'
/**
 * PRODUCT OF ARRAY EXCEPT SELF
 *
 * Return an array where out[i] is the product of every element except nums[i].
 * Solve it WITHOUT division, in O(n).
 *
 *   [1, 2, 3, 4]  ->  [24, 12, 8, 6]
 *
 * Pattern: prefix and suffix products
 */

/** Approach 1 — brute force. O(n^2) time, O(1) extra. */
function productExceptSelfBrute(nums) {
  return nums.map((_, i) => nums.reduce((acc, v, j) => (j === i ? acc : acc * v), 1))
}

/**
 * Approach 2 — total product divided by each element. O(n), but DISALLOWED.
 *
 * Kept to show the trap, not as a solution. Division fails on zeros: one zero
 * makes every other entry 0 and its own entry a division by zero; two zeros
 * make everything 0. Handling that needs a zero count and special cases, at
 * which point approach 4 is simpler as well as legal.
 */
function productExceptSelfDivision(nums) {
  const zeros = nums.filter(n => n === 0).length
  if (zeros > 1) return nums.map(() => 0)
  const product = nums.reduce((acc, n) => (n === 0 ? acc : acc * n), 1)
  return nums.map(n => (zeros ? (n === 0 ? product : 0) : product / n))
}

/**
 * Approach 3 — explicit prefix and suffix arrays. O(n) time, O(n) space.
 *
 * everything-except-i = (product of all left of i) * (product of all right).
 * Easiest version to explain; approach 4 is the same idea with less memory.
 */
function productExceptSelfArrays(nums) {
  const n = nums.length
  const left = Array(n).fill(1), right = Array(n).fill(1)
  for (let i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1]
  for (let i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1]
  return nums.map((_, i) => left[i] * right[i])
}

/**
 * Approach 4 — two passes, O(1) extra.  ** optimal **
 *
 * Accumulate into the output array instead of keeping both sides. The output
 * does not count against space, and saying that out loud is part of the answer.
 */
function productExceptSelf(nums) {
  const n = nums.length
  const out = Array(n).fill(1)

  let left = 1
  for (let i = 0; i < n; i++) { out[i] = left; left *= nums[i] }

  let right = 1
  for (let i = n - 1; i >= 0; i--) { out[i] *= right; right *= nums[i] }

  return out
}

module.exports = {
  productExceptSelf, productExceptSelfBrute,
  productExceptSelfArrays, productExceptSelfDivision,
}

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  const fns = [productExceptSelf, productExceptSelfBrute, productExceptSelfArrays, productExceptSelfDivision]
  for (const fn of fns) {
    eq(fn([1, 2, 3, 4]), [24, 12, 8, 6], `${fn.name} basic`)
    eq(fn([-1, 1, 0, -3, 3]), [0, 0, 9, 0, 0], `${fn.name} one zero`)
    eq(fn([0, 0]), [0, 0], `${fn.name} two zeros`)
    eq(fn([2, 3]), [3, 2], `${fn.name} pair`)
  }
  report('product-of-array-except-self')
}
