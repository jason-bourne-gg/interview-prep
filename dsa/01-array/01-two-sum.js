'use strict'
/**
 * TWO SUM
 *
 * Given an array of integers and a target, return the indices of the two
 * numbers that add up to the target. Exactly one solution exists, and you may
 * not use the same element twice.
 *
 *   [2, 7, 11, 15], target 9  ->  [0, 1]
 *
 * Pattern: hash map (complement lookup)
 */

/**
 * Approach 1 — brute force.  O(n^2) time, O(1) space.
 *
 * Try every pair. The inner loop is a *search* for a specific value, which is
 * the clue that a hash map removes it.
 */
function twoSumBrute(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j]
    }
  }
  return []
}

/**
 * Approach 2 — sort, then two pointers.  O(n log n) time, O(n) space.
 *
 * Worse than the hash map here, because we pay to sort AND have to carry the
 * original indices. Worth knowing because it is the expected answer to the
 * "input is already sorted, use O(1) space" variant.
 */
function twoSumSorted(nums, target) {
  const pairs = nums.map((value, index) => [value, index]).sort((a, b) => a[0] - b[0])
  let lo = 0, hi = pairs.length - 1
  while (lo < hi) {
    const sum = pairs[lo][0] + pairs[hi][0]
    if (sum === target) return [pairs[lo][1], pairs[hi][1]].sort((a, b) => a - b)
    if (sum < target) lo++
    else hi--
  }
  return []
}

/**
 * Approach 3 — hash map.  O(n) time, O(n) space.  ** optimal **
 *
 * Walking the array, you already know what you need: target - nums[i]. So the
 * question becomes "have I seen that number?", which is one lookup.
 *
 * The ordering matters: check BEFORE inserting. With [3, 3] and target 6,
 * inserting first would let 3 match itself at the same index.
 */
function twoSum(nums, target) {
  const seen = new Map()                       // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    if (seen.has(need)) return [seen.get(need), i]
    seen.set(nums[i], i)
  }
  return []
}

module.exports = { twoSum, twoSumBrute, twoSumSorted }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [twoSum, twoSumBrute, twoSumSorted]) {
    eq(fn([2, 7, 11, 15], 9), [0, 1], `${fn.name} basic`)
    eq(fn([3, 2, 4], 6), [1, 2], `${fn.name} not-first`)
    eq(fn([3, 3], 6), [0, 1], `${fn.name} duplicate values`)
    eq(fn([-1, -2, -3, -4], -7), [2, 3], `${fn.name} negatives`)
  }
  report('two-sum')
}
