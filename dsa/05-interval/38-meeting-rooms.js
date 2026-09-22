'use strict'
/**
 * MEETING ROOMS
 *
 * You are given an array of meeting time intervals [start, end]. Decide whether
 * one person could attend all of them — that is, whether any two of them
 * overlap. A meeting ending exactly when the next begins is fine, because the
 * interval is half-open: [start, end).
 *
 *   [[0, 30], [5, 10], [15, 20]]  ->  false     ([5, 10] is inside [0, 30])
 *   [[7, 10], [2, 4]]             ->  true
 *
 * Pattern: intervals (sort by start, then sweep)
 */

/**
 * Approach 1 — check every pair.  O(n^2) time, O(1) space.
 *
 * Two intervals overlap when each starts before the other ends. Writing that
 * test as `a.start < b.end && b.start < a.end` is worth doing once: the strict
 * `<` on both sides is what lets [1, 5] and [5, 10] pass.
 *
 * The inner loop is a search for "anything I collide with", and collisions are
 * a local property once time is ordered — which is the whole hint.
 */
function canAttendMeetingsBrute(intervals) {
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      if (intervals[i][0] < intervals[j][1] && intervals[j][0] < intervals[i][1]) return false
    }
  }
  return true
}

/**
 * Approach 2 — sweep line over +1/-1 events.  O(n log n) time, O(n) space.
 *
 * Turn each meeting into two events, +1 at its start and -1 at its end, sort
 * them by time, and track how many meetings are live. More than one live at
 * once means a clash.
 *
 * At equal times the -1 must come first, otherwise [1, 5] and [5, 10] would
 * momentarily read as 2 and report a false clash.
 *
 * It costs O(n) space for the event list and answers a strictly harder question
 * than asked — it computes the peak, not just "is the peak above 1". That extra
 * answer is exactly Meeting Rooms II, so this function is the bridge.
 */
function canAttendMeetingsSweep(intervals) {
  const events = []
  for (const [s, e] of intervals) { events.push([s, 1]); events.push([e, -1]) }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1])   // -1 sorts before +1 at the same instant
  let live = 0
  for (const [, delta] of events) {
    live += delta
    if (live > 1) return false
  }
  return true
}

/**
 * Approach 3 — sort by start, compare neighbours.  O(n log n) time, O(1) extra.
 * ** optimal **
 *
 * Once sorted by start, it is enough to compare each meeting with the one
 * immediately before it.
 *
 * Why adjacency is enough: suppose meetings i and j overlap with i < j in
 * sorted order, so start[j] < end[i]. Every k between them has
 * start[k] <= start[j] < end[i], so i overlaps k as well. Walk that inward and
 * some adjacent pair must overlap. No overlap between neighbours therefore
 * means no overlap at all.
 *
 * The comparison is `start < previous end`, strictly. Using `<=` would call
 * back-to-back meetings a conflict, which is the classic off-by-one here.
 *
 * O(n log n) is the floor: answering this for arbitrary numbers decides element
 * distinctness, which needs a sort in a comparison model.
 */
function canAttendMeetings(intervals) {
  const a = [...intervals].sort((x, y) => x[0] - y[0])
  for (let i = 1; i < a.length; i++) if (a[i][0] < a[i - 1][1]) return false
  return true
}

module.exports = { canAttendMeetings, canAttendMeetingsBrute, canAttendMeetingsSweep }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [canAttendMeetings, canAttendMeetingsBrute, canAttendMeetingsSweep]) {
    eq(fn([[0, 30], [5, 10], [15, 20]]), false, `${fn.name} worked example`)
    eq(fn([[7, 10], [2, 4]]), true, `${fn.name} unsorted, no clash`)
    eq(fn([]), true, `${fn.name} empty`)
    eq(fn([[1, 5]]), true, `${fn.name} single`)
    eq(fn([[1, 5], [5, 10]]), true, `${fn.name} back to back is allowed`)
    eq(fn([[1, 5], [1, 5]]), false, `${fn.name} duplicates clash`)
    eq(fn([[1, 10], [2, 3]]), false, `${fn.name} fully contained`)
    eq(fn([[1, 5], [4, 6]]), false, `${fn.name} one minute of overlap`)
  }
  report('meeting-rooms')
}
