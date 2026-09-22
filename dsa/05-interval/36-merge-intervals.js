'use strict'
/**
 * MERGE INTERVALS
 *
 * Given a list of intervals in no particular order, merge every group that
 * overlaps and return the remaining intervals. Intervals that only touch at a
 * point still merge: [1, 4] and [4, 5] become [1, 5].
 *
 *   [[1, 3], [2, 6], [8, 10], [15, 18]]  ->  [[1, 6], [8, 10], [15, 18]]
 *
 * Pattern: intervals (sort by start, then sweep)
 */

/**
 * Approach 1 — merge any overlapping pair, repeat until nothing changes.
 * O(n^3) time worst case, O(n) space.
 *
 * Each pass scans all pairs (O(n^2)) and can only merge one, so up to n passes.
 * The reason it is this bad: with unsorted input, an interval can overlap
 * something far away in the list, so there is no way to stop looking.
 *
 * Sorting is what makes "far away" impossible.
 */
function mergeBrute(intervals) {
  const out = intervals.map(iv => [...iv])
  for (let changed = true; changed;) {
    changed = false
    search:
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        if (out[i][0] <= out[j][1] && out[j][0] <= out[i][1]) {
          out[i] = [Math.min(out[i][0], out[j][0]), Math.max(out[i][1], out[j][1])]
          out.splice(j, 1)
          changed = true
          break search
        }
      }
    }
  }
  return out.sort((a, b) => a[0] - b[0])
}

/**
 * Approach 2 — sweep line over separated starts and ends.  O(n log n) time,
 * O(n) space.
 *
 * Forget which start belongs to which end. Sort all starts and all ends into
 * two independent lists, walk time forward, and count how many intervals are
 * live. A merged block begins when the count rises from 0 and ends when it
 * falls back to 0.
 *
 * At equal timestamps the start must be processed first, or [1, 4] and [4, 5]
 * would close and reopen instead of merging. That single `<=` is the whole
 * tie-break.
 *
 * Same complexity as the optimal, and it is the mental model that Meeting
 * Rooms II needs, so it earns its place. For plain merging it does more work:
 * two sorts instead of one, and the pairing information is thrown away.
 */
function mergeSweep(intervals) {
  const starts = intervals.map(iv => iv[0]).sort((a, b) => a - b)
  const ends = intervals.map(iv => iv[1]).sort((a, b) => a - b)
  const res = []
  let live = 0, begin = 0, i = 0, j = 0

  while (i < starts.length) {
    if (starts[i] <= ends[j]) {              // a start at the same instant keeps the block open
      if (live === 0) begin = starts[i]
      live++
      i++
    } else {
      live--
      j++
      if (live === 0) res.push([begin, ends[j - 1]])
    }
  }
  if (live > 0) res.push([begin, ends[ends.length - 1]])   // last block closes at the largest end
  return res
}

/**
 * Approach 3 — sort by start, then one sweep.  O(n log n) time, O(n) space.
 * ** optimal **
 *
 * Sorting by start means the only interval a new one can possibly overlap is
 * the block currently being built. Anything earlier already ended before this
 * start, because every previous start was smaller and the block's end is the
 * largest end seen so far.
 *
 * That is why one comparison against `out[out.length - 1]` is enough, and why
 * the sort is by START: it makes overlap a local property.
 *
 * The Math.max is not decoration. With [[1, 10], [2, 3]], writing `last[1] = e`
 * would shrink the block to [1, 3] and wrongly split off everything after 3.
 * A fully contained interval is the case that catches this.
 *
 * O(n log n) is the floor here — merging solves distinctness, which needs a
 * sort in a comparison model.
 */
function merge(intervals) {
  const sorted = intervals.map(iv => [...iv]).sort((a, b) => a[0] - b[0])
  const out = []
  for (const [s, e] of sorted) {
    const last = out[out.length - 1]
    if (last && s <= last[1]) last[1] = Math.max(last[1], e)
    else out.push([s, e])
  }
  return out
}

module.exports = { merge, mergeBrute, mergeSweep }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [merge, mergeBrute, mergeSweep]) {
    eq(fn([[1, 3], [2, 6], [8, 10], [15, 18]]), [[1, 6], [8, 10], [15, 18]], `${fn.name} worked example`)
    eq(fn([[1, 4], [4, 5]]), [[1, 5]], `${fn.name} touching merges`)
    eq(fn([[1, 2], [3, 4]]), [[1, 2], [3, 4]], `${fn.name} adjacent but disjoint`)
    eq(fn([]), [], `${fn.name} empty`)
    eq(fn([[1, 4]]), [[1, 4]], `${fn.name} single`)
    eq(fn([[1, 4], [1, 4]]), [[1, 4]], `${fn.name} duplicates`)
    eq(fn([[1, 10], [2, 3], [4, 5]]), [[1, 10]], `${fn.name} contained, needs Math.max`)
    eq(fn([[8, 10], [1, 3], [2, 6]]), [[1, 6], [8, 10]], `${fn.name} unsorted input`)
    eq(fn([[1, 4], [0, 4]]), [[0, 4]], `${fn.name} equal ends, smaller start second`)
  }
  report('merge-intervals')
}
