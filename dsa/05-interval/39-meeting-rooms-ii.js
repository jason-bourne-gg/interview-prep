'use strict'
/**
 * MEETING ROOMS II
 *
 * You are given an array of meeting time intervals [start, end]. Return the
 * minimum number of rooms needed to hold all of them. A room is free the moment
 * a meeting ends, so [1, 5] and [5, 10] share one room.
 *
 *   [[0, 30], [5, 10], [15, 20]]  ->  2     ([5, 10] and [15, 20] reuse one room)
 *
 * Pattern: intervals (sort by start, then sweep)
 *
 * The reframing that makes this easy: the answer is not about assigning rooms
 * at all. It is the largest number of meetings live at the same instant. Any
 * schedule needs at least that many rooms, and that many always suffice,
 * because a room only has to be free — it does not matter which one.
 */
const { MinHeap } = require('../_lib/structures')

/**
 * Approach 1 — count how many meetings cover each start time.  O(n^2) time,
 * O(1) space.
 *
 * The peak of the "live meetings" curve can only rise at a start, so it is
 * enough to test the n start times rather than all of time. For each one, count
 * the meetings covering it.
 *
 * Correct and easy to defend, and the quadratic comes from re-counting the same
 * overlaps over and over. Both better approaches remove that by walking time
 * forward once and keeping a running count.
 */
function minMeetingRoomsBrute(intervals) {
  let best = 0
  for (const [s] of intervals) {
    let live = 0
    for (const [s2, e2] of intervals) if (s2 <= s && s < e2) live++     // half-open: e2 does not cover s
    best = Math.max(best, live)
  }
  return best
}

/**
 * Approach 2 — min-heap of end times.  O(n log n) time, O(n) space.
 *
 * Process meetings in start order, holding the end times of the rooms in use in
 * a min-heap. Before opening a room for the next meeting, release every room
 * whose end is at or before this start. The heap size after pushing is the
 * number of rooms in use, and the largest size ever reached is the answer.
 *
 * The heap is there for one question only: "what is the earliest any room frees
 * up?" That is the minimum, and a min-heap answers it in O(log n).
 *
 * `peek() <= start` releases the room, with `<=` rather than `<`, or
 * back-to-back meetings would each take their own room.
 *
 * This is the version to reach for when you also need to say WHICH room each
 * meeting goes in — store room ids alongside the ends and the assignment falls
 * out. The sweep below cannot do that.
 */
function minMeetingRoomsHeap(intervals) {
  const a = [...intervals].sort((x, y) => x[0] - y[0])
  const ends = new MinHeap()
  let best = 0
  for (const [s, e] of a) {
    while (ends.size && ends.peek() <= s) ends.pop()   // every room that has freed up
    ends.push(e)
    best = Math.max(best, ends.size)
  }
  return best
}

/**
 * Approach 3 — chronological sweep over separated starts and ends.
 * O(n log n) time, O(n) space.  ** optimal **
 *
 * Nobody cares which end belongs to which start. Only the count matters, so
 * split the intervals into a sorted list of starts and a sorted list of ends
 * and merge-walk them: every start raises the count, every end lowers it, and
 * the peak is the answer.
 *
 * That separation is the insight. It replaces the heap with two pointers, since
 * the sorted `ends` array already hands you the earliest free room at its front
 * — the same thing the heap was maintaining, but for free after one sort.
 *
 * `ends[j] <= starts[i]` is the release test, `<=` again, and it is why the
 * pointer j can only ever move forward: an end that has been consumed is never
 * relevant again.
 *
 * Same O(n log n) as the heap, and it wins on constants — two sorts and a
 * linear pass, no per-element heap operations, no structure to write from
 * memory. It is also the version that survives the follow-up "now do it for
 * a million intervals".
 */
function minMeetingRooms(intervals) {
  const starts = intervals.map(iv => iv[0]).sort((a, b) => a - b)
  const ends = intervals.map(iv => iv[1]).sort((a, b) => a - b)
  let rooms = 0, best = 0, j = 0
  for (let i = 0; i < starts.length; i++) {
    while (j < ends.length && ends[j] <= starts[i]) { rooms--; j++ }
    rooms++
    best = Math.max(best, rooms)
  }
  return best
}

module.exports = { minMeetingRooms, minMeetingRoomsBrute, minMeetingRoomsHeap }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [minMeetingRooms, minMeetingRoomsBrute, minMeetingRoomsHeap]) {
    eq(fn([[0, 30], [5, 10], [15, 20]]), 2, `${fn.name} worked example`)
    eq(fn([[7, 10], [2, 4]]), 1, `${fn.name} disjoint, unsorted`)
    eq(fn([]), 0, `${fn.name} empty`)
    eq(fn([[1, 5]]), 1, `${fn.name} single`)
    eq(fn([[1, 5], [5, 10]]), 1, `${fn.name} back to back reuses the room`)
    eq(fn([[1, 5], [1, 5], [1, 5]]), 3, `${fn.name} duplicates`)
    eq(fn([[1, 10], [2, 3], [4, 5]]), 2, `${fn.name} two short ones inside a long one`)
    eq(fn([[9, 10], [4, 9], [4, 17]]), 2, `${fn.name} release exactly on the next start`)
    eq(fn([[1, 4], [2, 5], [3, 6], [7, 8]]), 3, `${fn.name} staircase peak`)
  }
  report('meeting-rooms-ii')
}
