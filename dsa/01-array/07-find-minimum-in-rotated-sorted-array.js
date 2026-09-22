'use strict'
/**
 * FIND MINIMUM IN ROTATED SORTED ARRAY
 *
 * A sorted array of unique values has been rotated some number of times.
 * Find the minimum in O(log n).
 *
 *   [3, 4, 5, 1, 2]  ->  1
 *   [11, 13, 15, 17] ->  11   (not actually rotated)
 *
 * Pattern: binary search on a broken invariant
 */

/** Approach 1 — linear scan. O(n). Correct, but wastes the sortedness. */
function findMinLinear(nums) {
  let min = nums[0]
  for (const n of nums) min = Math.min(min, n)
  return min
}

/**
 * Approach 2 — binary search.  O(log n) time, O(1) space.  ** optimal **
 *
 * The array is two sorted runs. Compare mid against HI, not lo:
 *   nums[mid] > nums[hi]  ->  the wrap point is to the right, so lo = mid + 1
 *   otherwise             ->  mid might itself be the minimum, so hi = mid
 *
 * Comparing against lo instead fails on a non-rotated array, where nums[mid] is
 * always >= nums[lo] and you would search the wrong half forever.
 */
function findMin(nums) {
  let lo = 0, hi = nums.length - 1
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (nums[mid] > nums[hi]) lo = mid + 1
    else hi = mid                                  // NOT mid - 1: mid is a candidate
  }
  return nums[lo]
}

module.exports = { findMin, findMinLinear }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [findMin, findMinLinear]) {
    eq(fn([3, 4, 5, 1, 2]), 1, `${fn.name} rotated`)
    eq(fn([4, 5, 6, 7, 0, 1, 2]), 0, `${fn.name} rotated more`)
    eq(fn([11, 13, 15, 17]), 11, `${fn.name} not rotated`)
    eq(fn([2, 1]), 1, `${fn.name} two elements`)
    eq(fn([1]), 1, `${fn.name} single`)
  }
  report('find-minimum-in-rotated-sorted-array')
}
