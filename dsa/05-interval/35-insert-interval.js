'use strict'
/**
 * INSERT INTERVAL
 *
 * Given a list of non-overlapping intervals already sorted by start, insert a
 * new interval and merge whatever it now overlaps. Return the new list, still
 * sorted and still non-overlapping.
 *
 *   [[1, 3], [6, 9]], insert [2, 5]  ->  [[1, 5], [6, 9]]
 *
 * Pattern: intervals (sort by start, then sweep) — here the sort is free
 *
 * Intervals touching at a point count as overlapping: [1, 3] and [3, 4] become
 * [1, 4].
 */

/**
 * Approach 1 — append, sort, merge.  O(n log n) time, O(n) space.
 *
 * Throw the new interval on the end, re-sort, and run the full Merge Intervals
 * sweep. Correct, and it is the answer if you have already written merge. It is
 * slow because it re-sorts input that was handed to you sorted — the n log n is
 * paid for information you already had.
 */
function insertBrute(intervals, newInterval) {
  const all = [...intervals, newInterval].map(iv => [...iv]).sort((a, b) => a[0] - b[0])
  const out = []
  for (const iv of all) {
    const last = out[out.length - 1]
    if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1])
    else out.push(iv)
  }
  return out
}

/**
 * Approach 2 — binary search the two boundaries.  O(n) time, O(n) space.
 *
 * Only the intervals that touch the new one change; everything left of them and
 * everything right of them is copied through untouched. So find those two
 * boundaries directly.
 *
 * The search on END is legal because the input is non-overlapping AND sorted by
 * start, which forces the ends to be sorted too. That is the observation the
 * whole approach rests on — drop "non-overlapping" and it collapses.
 *
 * It is still O(n) overall: building the output array copies n intervals, and
 * no method can beat that. Binary search only cuts the comparisons, from n to
 * log n. Worth saying out loud, then not bothering with.
 */
function insertBinary(intervals, newInterval) {
  const [ns, ne] = newInterval
  const n = intervals.length

  let lo = 0, hi = n                        // first interval whose end >= ns
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (intervals[mid][1] < ns) lo = mid + 1
    else hi = mid
  }
  const first = lo

  hi = n                                    // one past the last interval whose start <= ne
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (intervals[mid][0] <= ne) lo = mid + 1
    else hi = mid
  }
  const last = lo

  const merged = first === last
    ? [ns, ne]                              // nothing touched, it drops straight in
    : [Math.min(ns, intervals[first][0]), Math.max(ne, intervals[last - 1][1])]

  return [...intervals.slice(0, first).map(iv => [...iv]), merged, ...intervals.slice(last).map(iv => [...iv])]
}

/**
 * Approach 3 — three-phase linear sweep.  O(n) time, O(n) space.  ** optimal **
 *
 * The sorted input splits into exactly three runs, in order: intervals entirely
 * before the new one, intervals that overlap it, intervals entirely after. So
 * walk once and do one thing per run — copy, absorb, copy.
 *
 * The middle run is where the new interval grows. Each absorbed interval widens
 * it, and a widened interval can reach the next one, which is why the absorb
 * loop re-reads `end` on every step instead of testing against the original.
 *
 * Same O(n) as approach 2 with none of the boundary arithmetic, and O(n) is the
 * floor because the output itself is that big.
 */
function insert(intervals, newInterval) {
  const res = []
  let [start, end] = newInterval
  let i = 0
  const n = intervals.length

  while (i < n && intervals[i][1] < start) res.push([...intervals[i++]])   // strictly before

  while (i < n && intervals[i][0] <= end) {                                // touching counts
    start = Math.min(start, intervals[i][0])
    end = Math.max(end, intervals[i][1])
    i++
  }
  res.push([start, end])

  while (i < n) res.push([...intervals[i++]])                              // strictly after
  return res
}

module.exports = { insert, insertBrute, insertBinary }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [insert, insertBrute, insertBinary]) {
    eq(fn([[1, 3], [6, 9]], [2, 5]), [[1, 5], [6, 9]], `${fn.name} worked example`)
    eq(fn([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]), [[1, 2], [3, 10], [12, 16]], `${fn.name} swallows a run`)
    eq(fn([], [5, 7]), [[5, 7]], `${fn.name} empty input`)
    eq(fn([[1, 5]], [2, 3]), [[1, 5]], `${fn.name} contained, no growth`)
    eq(fn([[1, 5]], [6, 8]), [[1, 5], [6, 8]], `${fn.name} disjoint after`)
    eq(fn([[3, 5], [8, 10]], [1, 2]), [[1, 2], [3, 5], [8, 10]], `${fn.name} disjoint before`)
    eq(fn([[1, 3], [4, 6]], [3, 4]), [[1, 6]], `${fn.name} touches both neighbours`)
    eq(fn([[1, 5]], [0, 9]), [[0, 9]], `${fn.name} new one swallows everything`)
  }
  report('insert-interval')
}
