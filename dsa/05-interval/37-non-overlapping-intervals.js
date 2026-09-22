'use strict'
/**
 * NON-OVERLAPPING INTERVALS
 *
 * Given a list of intervals, return the minimum number you must delete so that
 * none of the rest overlap. Intervals that only touch at a point are fine:
 * [1, 2] and [2, 3] may both stay.
 *
 *   [[1, 2], [2, 3], [3, 4], [1, 3]]  ->  1     (delete [1, 3])
 *
 * Pattern: intervals (sort by END — this is the one that does not sort by start)
 *
 * Deleting the fewest is the same problem as keeping the most, which is the
 * classic activity-selection question in disguise.
 */

/**
 * Approach 1 — try every subset.  O(2^n * n log n) time, O(n) space.
 *
 * Enumerate all subsets, keep the largest one that is internally
 * non-overlapping, and report n minus its size. This is the definition of the
 * problem typed out, and it is the baseline that proves the greedy is right
 * when you test them against each other.
 */
function eraseOverlapIntervalsBrute(intervals) {
  const n = intervals.length
  let bestKeep = 0
  for (let mask = 0; mask < (1 << n); mask++) {
    const pick = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) pick.push(intervals[i])
    pick.sort((a, b) => a[0] - b[0])
    let ok = true
    for (let i = 1; i < pick.length; i++) if (pick[i][0] < pick[i - 1][1]) { ok = false; break }
    if (ok) bestKeep = Math.max(bestKeep, pick.length)
  }
  return n - bestKeep
}

/**
 * Approach 2 — longest non-overlapping chain by DP.  O(n^2) time, O(n) space.
 *
 * Sort by start. Let keep[i] be the largest set that ends with interval i. Then
 * keep[i] = 1 + max(keep[j]) over every earlier j that finishes before i begins.
 * This is longest-increasing-subsequence with "finishes before" as the order.
 *
 * It removes the exponential by noticing that the best chain ending at i does
 * not care which chain reached j, only how long it was. What it still does is
 * look backwards at every j — and that inner loop is what the greedy kills.
 */
function eraseOverlapIntervalsDp(intervals) {
  const a = [...intervals].sort((x, y) => x[0] - y[0])
  const n = a.length
  if (n === 0) return 0
  const keep = Array(n).fill(1)
  let best = 1
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) if (a[j][1] <= a[i][0]) keep[i] = Math.max(keep[i], keep[j] + 1)
    best = Math.max(best, keep[i])
  }
  return n - best
}

/**
 * Approach 3 — sort by END, greedy.  O(n log n) time, O(1) extra.  ** optimal **
 *
 * Sort by finishing time and keep an interval whenever it starts at or after
 * the last kept one ended. Count the rest as deleted.
 *
 * Why sorting by END and not START: the only thing a kept interval costs the
 * future is how late it finishes. Among all intervals you could take next, the
 * one finishing earliest leaves the widest remaining timeline, and it does so
 * while blocking nothing extra — so it is never worse.
 *
 * The exchange argument, which is what an interviewer wants to hear: take any
 * optimal solution and let x be its first interval. The earliest-finishing
 * candidate e has end <= end of x, so swapping x for e keeps the set the same
 * size and still non-overlapping. Repeat down the list and the greedy choice
 * matches an optimal one at every step.
 *
 * Sorting by start breaks this. With [[1, 100], [2, 3], [4, 5]] the by-start
 * greedy takes [1, 100] first and deletes two; the correct answer is one.
 *
 * The comparison is `start >= end`, not `>`. Touching is allowed, and using `>`
 * reports a deletion on [[1, 2], [2, 3]] that nobody asked for.
 */
function eraseOverlapIntervals(intervals) {
  if (intervals.length === 0) return 0
  const a = [...intervals].sort((x, y) => x[1] - y[1])
  let removed = 0
  let end = a[0][1]
  for (let i = 1; i < a.length; i++) {
    if (a[i][0] >= end) end = a[i][1]       // fits after the last kept one
    else removed++                          // overlaps, and it finishes later, so drop it
  }
  return removed
}

module.exports = { eraseOverlapIntervals, eraseOverlapIntervalsBrute, eraseOverlapIntervalsDp }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [eraseOverlapIntervals, eraseOverlapIntervalsBrute, eraseOverlapIntervalsDp]) {
    eq(fn([[1, 2], [2, 3], [3, 4], [1, 3]]), 1, `${fn.name} worked example`)
    eq(fn([[1, 2], [1, 2], [1, 2]]), 2, `${fn.name} duplicates`)
    eq(fn([[1, 2], [2, 3]]), 0, `${fn.name} touching is not overlapping`)
    eq(fn([]), 0, `${fn.name} empty`)
    eq(fn([[1, 2]]), 0, `${fn.name} single`)
    eq(fn([[1, 2], [3, 4], [5, 6]]), 0, `${fn.name} already disjoint`)
    eq(fn([[1, 100], [11, 22], [1, 11], [2, 12]]), 2, `${fn.name} one long interval hides two`)
    eq(fn([[1, 100], [2, 3], [4, 5]]), 1, `${fn.name} sorting by start would answer 2`)
  }
  report('non-overlapping-intervals')
}
