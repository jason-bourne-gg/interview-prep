'use strict'
/**
 * 3SUM
 *
 * Return all UNIQUE triplets [a, b, c] from nums such that a + b + c === 0.
 * The triplets must not repeat, and order within the output does not matter.
 *
 *   [-1, 0, 1, 2, -1, -4]  ->  [[-1, -1, 2], [-1, 0, 1]]
 *
 * Pattern: sort + two pointers
 */

/**
 * Approach 1 — brute force. O(n^3) time, O(n) space for the dedupe.
 *
 * Three nested loops, deduplicated through a Set of sorted, joined triplets.
 * The clumsiness of that dedupe is exactly what sorting fixes.
 */
function threeSumBrute(nums) {
  const seen = new Set()
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      for (let k = j + 1; k < nums.length; k++) {
        if (nums[i] + nums[j] + nums[k] === 0) {
          seen.add([nums[i], nums[j], nums[k]].sort((a, b) => a - b).join(','))
        }
      }
    }
  }
  return [...seen].map(s => s.split(',').map(Number))
}

/**
 * Approach 2 — fix one, hash the rest. O(n^2) time, O(n) space.
 *
 * For each i, run Two Sum over the remainder. Better than cubic, but the
 * deduping is still awkward, which is why the sorted version wins.
 */
function threeSumHash(nums) {
  const out = new Set()
  for (let i = 0; i < nums.length; i++) {
    const seen = new Set()
    for (let j = i + 1; j < nums.length; j++) {
      const need = -(nums[i] + nums[j])
      if (seen.has(need)) {
        out.add([nums[i], nums[j], need].sort((a, b) => a - b).join(','))
      }
      seen.add(nums[j])
    }
  }
  return [...out].map(s => s.split(',').map(Number))
}

/**
 * Approach 3 — sort + two pointers.  O(n^2) time, O(1) extra.  ** optimal **
 *
 * Sorting buys two things at once: the two-pointer scan, and cheap duplicate
 * skipping. The three "skip" lines are the actual question — finding the
 * triplets is easy, returning them uniquely without a Set is the test.
 */
function threeSum(nums) {
  const sorted = [...nums].sort((a, b) => a - b)     // comparator, always
  const res = []

  for (let i = 0; i < sorted.length - 2; i++) {
    if (sorted[i] > 0) break                          // sorted: can never reach 0
    if (i > 0 && sorted[i] === sorted[i - 1]) continue // skip duplicate anchors

    let lo = i + 1, hi = sorted.length - 1
    while (lo < hi) {
      const sum = sorted[i] + sorted[lo] + sorted[hi]
      if (sum < 0) lo++
      else if (sum > 0) hi--
      else {
        res.push([sorted[i], sorted[lo], sorted[hi]])
        while (lo < hi && sorted[lo] === sorted[lo + 1]) lo++   // skip duplicate pairs
        while (lo < hi && sorted[hi] === sorted[hi - 1]) hi--
        lo++
        hi--
      }
    }
  }
  return res
}

module.exports = { threeSum, threeSumBrute, threeSumHash }

if (require.main === module) {
  const { eqUnordered, report } = require('../_lib/test')
  for (const fn of [threeSum, threeSumBrute, threeSumHash]) {
    eqUnordered(fn([-1, 0, 1, 2, -1, -4]), [[-1, -1, 2], [-1, 0, 1]], `${fn.name} basic`)
    eqUnordered(fn([0, 1, 1]), [], `${fn.name} no triplet`)
    eqUnordered(fn([0, 0, 0]), [[0, 0, 0]], `${fn.name} all zeros`)
    eqUnordered(fn([0, 0, 0, 0]), [[0, 0, 0]], `${fn.name} four zeros, one triplet`)
  }
  report('3sum')
}
