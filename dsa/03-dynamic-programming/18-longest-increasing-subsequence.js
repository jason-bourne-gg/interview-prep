'use strict'
/**
 * LONGEST INCREASING SUBSEQUENCE
 *
 * Return the length of the longest strictly increasing subsequence. A
 * subsequence keeps the original order but may skip any elements, so it does
 * not have to be contiguous.
 *
 *   [10, 9, 2, 5, 3, 7, 101, 18]  ->  4        (2, 3, 7, 101)
 *
 * Recurrence: len(i) = 1 + max over j < i with nums[j] < nums[i] of len(j),
 * where len(i) is the length of the best subsequence ENDING at index i. The
 * answer is the max over all i. Anchoring the state to "ending at i" is what
 * makes the comparison nums[j] < nums[i] legal — without it you would not know
 * what the last element was.
 *
 * Pattern: dynamic programming (linear) then binary search on a patience pile
 */

/**
 * Approach 1 — brute force recursion.  O(2^n) time, O(n) stack.
 *
 * At each index, either extend the current subsequence or skip. Carrying the
 * previous value as a parameter makes the state two-dimensional and unbounded,
 * which is exactly why this version cannot be memoised as written — and the hint
 * that the state needs rephrasing.
 */
function lengthOfLISBrute(nums) {
  const walk = (i, prev) => {
    if (i === nums.length) return 0
    const skip = walk(i + 1, prev)
    const take = nums[i] > prev ? 1 + walk(i + 1, nums[i]) : 0
    return Math.max(skip, take)
  }
  return walk(0, -Infinity)
}

/**
 * Approach 2 — tabulation on "ends at i".  O(n^2) time, O(n) space.
 *
 * Re-state the problem as "longest subsequence ending exactly at i" and the
 * previous value is no longer a parameter — it is nums[i]. Now there are only n
 * states. For each one, scan everything to its left that is smaller and take the
 * best. The answer is the maximum over the table, NOT dp[n - 1], because the
 * best subsequence need not use the last element.
 */
function lengthOfLISTable(nums) {
  if (!nums.length) return 0
  const dp = Array(nums.length).fill(1)         // every element alone is length 1
  let best = 1
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1
    }
    if (dp[i] > best) best = dp[i]
  }
  return best
}

/**
 * Approach 3 — patience piles with binary search.  O(n log n) time, O(n) space.
 * ** optimal **
 *
 * Keep `tails`, where tails[k] is the smallest value that any increasing
 * subsequence of length k + 1 can end with. That array is sorted, by
 * construction: a longer subsequence cannot end lower than a shorter one.
 *
 * For each value, replace the first tail that is greater than or equal to it.
 * Replacing keeps the same length available but makes it easier to extend later,
 * and appending past the end is the only thing that grows the answer. The length
 * of `tails` is the answer; its contents are NOT a valid subsequence, so do not
 * claim they are.
 *
 * The trap: the search must find the first tail >= x (a lower bound). Using
 * "first tail > x" would let an equal value append and turn [7, 7, 7] into 3
 * instead of 1, because the sequence must be STRICTLY increasing.
 */
function lengthOfLIS(nums) {
  const tails = []
  for (const x of nums) {
    let lo = 0, hi = tails.length
    while (lo < hi) {                            // lower bound: first index with tails[i] >= x
      const mid = lo + Math.floor((hi - lo) / 2)
      if (tails[mid] < x) lo = mid + 1
      else hi = mid
    }
    tails[lo] = x                                // overwrites, or appends when lo === tails.length
  }
  return tails.length
}

module.exports = { lengthOfLIS, lengthOfLISBrute, lengthOfLISTable }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [lengthOfLIS, lengthOfLISBrute, lengthOfLISTable]) {
    eq(fn([10, 9, 2, 5, 3, 7, 101, 18]), 4, `${fn.name} worked example`)
    eq(fn([]), 0, `${fn.name} empty`)
    eq(fn([5]), 1, `${fn.name} single element`)
    eq(fn([7, 7, 7, 7, 7]), 1, `${fn.name} duplicates, strictly increasing`)
    eq(fn([0, 1, 0, 3, 2, 3]), 4, `${fn.name} restart in the middle`)
    eq(fn([5, 4, 3, 2, 1]), 1, `${fn.name} strictly decreasing`)
    eq(fn([1, 2, 3, 4, 5]), 5, `${fn.name} already sorted`)
    eq(fn([4, 10, 4, 3, 8, 9]), 3, `${fn.name} best run is not a prefix`)
    eq(fn([-2, -1, 0, -3]), 3, `${fn.name} negatives`)
  }
  report('longest-increasing-subsequence')
}
