'use strict'
/**
 * CONTAINS DUPLICATE
 *
 * Return true if any value appears at least twice.
 *
 *   [1, 2, 3, 1]  ->  true
 *   [1, 2, 3, 4]  ->  false
 *
 * Pattern: set / seen-before
 */

/** Approach 1 — brute force. O(n^2) time, O(1) space. */
function containsDuplicateBrute(nums) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) if (nums[i] === nums[j]) return true
  }
  return false
}

/**
 * Approach 2 — sort, then compare neighbours. O(n log n) time, O(1) extra.
 *
 * This is the answer when the interviewer says "now without extra space".
 * Note it mutates, so copy first if the caller still needs the original order.
 */
function containsDuplicateSort(nums) {
  const sorted = [...nums].sort((a, b) => a - b)   // comparator: default sort is lexicographic
  for (let i = 1; i < sorted.length; i++) if (sorted[i] === sorted[i - 1]) return true
  return false
}

/**
 * Approach 3 — set, short-circuiting.  O(n) time, O(n) space.  ** optimal **
 *
 * `new Set(nums).size !== nums.length` is the one-liner, but it always builds
 * the whole set. This version returns as soon as it finds a repeat, which is a
 * real win on a long array whose duplicate is near the front.
 */
function containsDuplicate(nums) {
  const seen = new Set()
  for (const n of nums) {
    if (seen.has(n)) return true
    seen.add(n)
  }
  return false
}

module.exports = { containsDuplicate, containsDuplicateBrute, containsDuplicateSort }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [containsDuplicate, containsDuplicateBrute, containsDuplicateSort]) {
    eq(fn([1, 2, 3, 1]), true, `${fn.name} has duplicate`)
    eq(fn([1, 2, 3, 4]), false, `${fn.name} all unique`)
    eq(fn([]), false, `${fn.name} empty`)
    eq(fn([1, 1, 1, 3, 3, 4, 3, 2, 4, 2]), true, `${fn.name} many duplicates`)
  }
  report('contains-duplicate')
}
