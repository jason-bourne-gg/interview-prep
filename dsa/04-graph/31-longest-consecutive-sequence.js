'use strict'
/**
 * LONGEST CONSECUTIVE SEQUENCE
 *
 * Given an unsorted array of integers, return the length of the longest run of
 * consecutive integers present in it. The numbers do not have to be adjacent in
 * the array, and the required time is O(n).
 *
 *   [100, 4, 200, 1, 3, 2]  ->  4   (the run 1, 2, 3, 4)
 *
 * This problem is filed under Graph in the original list, and it is not one.
 * There is no graph here unless you invent one — it is a hash set problem, and
 * the thing being tested is whether you can get to O(n) when the obvious answer
 * is O(n log n). Keep it in the Graph folder to match the list, solve it as a
 * set problem.
 *
 * Pattern: Hash map for complement / seen-before
 */

/**
 * Approach 1 — brute force.  O(n^2) time, O(n) space.
 *
 * For every value, walk upwards asking "is x+1 present" until it is not. With a
 * Set the membership test is O(1), so this is n starts times up to n steps.
 *
 * The waste is visible: for [1,2,3,4] this walks the whole run from 1, then
 * again from 2, then from 3. Every run is rebuilt once per element in it.
 */
function longestConsecutiveBrute(nums) {
  const set = new Set(nums)
  let best = 0
  for (const n of set) {
    let length = 1
    while (set.has(n + length)) length++
    best = Math.max(best, length)
  }
  return best
}

/**
 * Approach 2 — sort and scan.  O(n log n) time, O(n) space.
 *
 * Sort, then walk once: each neighbour either continues the run, repeats the
 * previous value (skip it, a duplicate does not extend anything), or breaks the
 * run and starts a new one.
 *
 * This is the answer that gets rejected. The problem states O(n) precisely to
 * rule it out, so offering it as the final answer reads as not having noticed
 * the constraint. Say it out loud as the baseline, then beat it.
 */
function longestConsecutiveSort(nums) {
  if (!nums.length) return 0
  const sorted = [...nums].sort((a, b) => a - b)     // comparator, always
  let best = 1, run = 1
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]) continue        // duplicate, run is unchanged
    if (sorted[i] === sorted[i - 1] + 1) run++
    else run = 1
    best = Math.max(best, run)
  }
  return best
}

/**
 * Approach 3 — set, count only from the start of a run.  O(n) time, O(n) space.  ** optimal **
 *
 * One line fixes the brute force: only start counting from n when n - 1 is
 * absent, which means n is the smallest member of its run.
 *
 * That makes the total linear, not quadratic, and the argument is worth being
 * able to state: each run is walked exactly once, from its own smallest member,
 * so across all runs the inner while loop takes as many steps as there are
 * distinct values. The outer loop is O(n) and the inner work is O(n) in total —
 * nested loops, linear time.
 *
 * Iterating the Set rather than the array also handles duplicates for free:
 * [1,1,1] is one distinct value and one start.
 */
function longestConsecutive(nums) {
  const set = new Set(nums)
  let best = 0
  for (const n of set) {
    if (set.has(n - 1)) continue                     // not the start of a run, skip
    let length = 1
    while (set.has(n + length)) length++
    best = Math.max(best, length)
  }
  return best
}

module.exports = { longestConsecutive, longestConsecutiveBrute, longestConsecutiveSort }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [longestConsecutive, longestConsecutiveBrute, longestConsecutiveSort]) {
    eq(fn([100, 4, 200, 1, 3, 2]), 4, `${fn.name} worked example`)
    eq(fn([]), 0, `${fn.name} empty`)
    eq(fn([7]), 1, `${fn.name} single element`)
    eq(fn([1, 1, 1, 1]), 1, `${fn.name} all duplicates`)
    eq(fn([1, 2, 0, 1]), 3, `${fn.name} duplicate inside a run`)
    eq(fn([9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6]), 7, `${fn.name} run crossing zero`)

    // Negatives and a gap of exactly one. A run must be x, x+1 — not x, x+2 —
    // and the sorted scan is where an off-by-one here shows up.
    eq(fn([-3, -1, 1, 3]), 1, `${fn.name} gaps of two are not consecutive`)
    eq(fn([-2, -1, 0, 1]), 4, `${fn.name} negatives through zero`)
    eq(fn([10, 30, 20]), 1, `${fn.name} no run at all`)
  }
  report('longest-consecutive-sequence')
}
