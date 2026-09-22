'use strict'
/**
 * MISSING NUMBER
 *
 * nums contains n distinct numbers taken from 0..n. Exactly one is missing.
 *
 *   [3, 0, 1]  ->  2
 *
 * Pattern: XOR cancellation
 */

/** Approach 1 — sort and scan. O(n log n) time, O(1) extra. */
function missingNumberSort(nums) {
  const sorted = [...nums].sort((a, b) => a - b)
  for (let i = 0; i < sorted.length; i++) if (sorted[i] !== i) return i
  return sorted.length
}

/** Approach 2 — set. O(n) time, O(n) space. */
function missingNumberSet(nums) {
  const seen = new Set(nums)
  for (let i = 0; i <= nums.length; i++) if (!seen.has(i)) return i
  return -1
}

/**
 * Approach 3 — Gauss sum. O(n) time, O(1) space.
 *
 * Clean, but the sum of 0..n can overflow a fixed-width integer in other
 * languages, and exceeds Number.MAX_SAFE_INTEGER in JS past n ≈ 1.3e8. Say
 * that limitation out loud — it is the reason the XOR version is preferred.
 */
function missingNumberSum(nums) {
  const n = nums.length
  const expected = (n * (n + 1)) / 2
  return expected - nums.reduce((a, b) => a + b, 0)
}

/**
 * Approach 4 — XOR.  O(n) time, O(1) space.  ** optimal **
 *
 * XOR every index and every value together. Each number that IS present appears
 * twice — once as an index, once as a value — and cancels, because x ^ x === 0.
 * The missing one appears only once and survives.
 *
 * Start at nums.length, because that is the one index the loop never visits.
 * No overflow, and it generalises: XOR is the tool for "everything appears
 * twice except one".
 */
function missingNumber(nums) {
  let x = nums.length
  for (let i = 0; i < nums.length; i++) x ^= i ^ nums[i]
  return x
}

module.exports = { missingNumber, missingNumberSort, missingNumberSet, missingNumberSum }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [missingNumber, missingNumberSort, missingNumberSet, missingNumberSum]) {
    eq(fn([3, 0, 1]), 2, `${fn.name} middle`)
    eq(fn([0, 1]), 2, `${fn.name} last`)
    eq(fn([9, 6, 4, 2, 3, 5, 7, 0, 1]), 8, `${fn.name} longer`)
    eq(fn([1]), 0, `${fn.name} first`)
    eq(fn([0]), 1, `${fn.name} single`)
  }
  report('missing-number')
}
