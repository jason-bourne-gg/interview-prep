'use strict'
/**
 * SEARCH IN ROTATED SORTED ARRAY
 *
 * A sorted array of unique values has been rotated. Find the index of target,
 * or -1, in O(log n).
 *
 *   [4, 5, 6, 7, 0, 1, 2], target 0  ->  4
 *
 * Pattern: binary search, one half is always sorted
 */

/** Approach 1 — linear scan. O(n). Say it, then improve it. */
function searchLinear(nums, target) {
  return nums.indexOf(target)
}

/**
 * Approach 2 — find the pivot, then binary search the right half. O(log n).
 *
 * Two clean passes: locate the rotation point (see 07), then binary search
 * whichever side can contain the target. Easier to reason about than the
 * one-pass version, and a perfectly good answer.
 */
function searchTwoPass(nums, target) {
  const n = nums.length
  let lo = 0, hi = n - 1
  while (lo < hi) {                                // pivot = index of minimum
    const mid = lo + Math.floor((hi - lo) / 2)
    if (nums[mid] > nums[hi]) lo = mid + 1
    else hi = mid
  }
  const pivot = lo

  const bsearch = (lo, hi) => {
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2)
      if (nums[mid] === target) return mid
      if (nums[mid] < target) lo = mid + 1
      else hi = mid - 1
    }
    return -1
  }

  const left = bsearch(0, pivot - 1)
  return left !== -1 ? left : bsearch(pivot, n - 1)
}

/**
 * Approach 3 — one-pass binary search.  O(log n) time, O(1) space.  ** optimal **
 *
 * At any mid, one half is guaranteed sorted. Work out which, then ask whether
 * the target lies inside that sorted half: if it does, search there; if not,
 * search the other.
 *
 * nums[lo] <= nums[mid] needs the "=", for a two-element window where lo and
 * mid are the same index.
 */
function search(nums, target) {
  let lo = 0, hi = nums.length - 1
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (nums[mid] === target) return mid

    if (nums[lo] <= nums[mid]) {                             // left half sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1
      else lo = mid + 1
    } else {                                                 // right half sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1
      else hi = mid - 1
    }
  }
  return -1
}

module.exports = { search, searchLinear, searchTwoPass }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [search, searchLinear, searchTwoPass]) {
    eq(fn([4, 5, 6, 7, 0, 1, 2], 0), 4, `${fn.name} in right half`)
    eq(fn([4, 5, 6, 7, 0, 1, 2], 6), 2, `${fn.name} in left half`)
    eq(fn([4, 5, 6, 7, 0, 1, 2], 3), -1, `${fn.name} missing`)
    eq(fn([1], 1), 0, `${fn.name} single hit`)
    eq(fn([1], 0), -1, `${fn.name} single miss`)
    eq(fn([3, 1], 1), 1, `${fn.name} two elements`)
  }
  report('search-in-rotated-sorted-array')
}
