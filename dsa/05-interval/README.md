# Interval — 5 problems

| # | Problem | Difficulty | Brute | Optimal | Pattern |
|---|---|---|---|---|---|
| 35 | [Insert Interval](35-insert-interval.js) | Medium | O(n log n) | **O(n)** | Sort by start (already sorted) |
| 36 | [Merge Intervals](36-merge-intervals.js) | Medium | O(n³) | **O(n log n)** | Sort by start |
| 37 | [Non-overlapping Intervals](37-non-overlapping-intervals.js) | Medium | O(2ⁿ) | **O(n log n)** | Sort by **end**, greedy |
| 38 | [Meeting Rooms](38-meeting-rooms.js) | Easy | O(n²) | **O(n log n)** | Sort by start |
| 39 | [Meeting Rooms II](39-meeting-rooms-ii.js) | Medium | O(n²) | **O(n log n)** | Sweep line / min-heap |

Run any file directly to check it: `node dsa/05-interval/39-meeting-rooms-ii.js`

Problems 38 and 39 are not free on most sites, so both files restate them in
full before solving them.

---

## What this category is really teaching

**All five are "sort by one endpoint, then sweep".** The category is small
because the technique is one sentence. The interesting part is which endpoint,
and that choice is the whole difficulty.

**Sort by START when you are combining things.** Insert Interval, Merge
Intervals and Meeting Rooms all do this. Sorting by start makes overlap a
*local* property: once the starts are ordered, anything that overlaps the
current interval must be the one right next to it, because every earlier
interval started sooner and its reach is already folded into the block you are
building. That is why merging needs only one comparison per element, and why
Meeting Rooms can check neighbours instead of all pairs.

**Sort by END when you are choosing things.** Non-overlapping Intervals is the
odd one out, and it is the only one with a proof obligation. Keeping the
earliest-finishing interval is safe because the only cost a kept interval
imposes on the future is how late it ends — so finishing soonest dominates every
alternative. The exchange argument is in the file: swap the first interval of
any optimal solution for the earliest-finishing one and the solution stays the
same size. Sort that problem by start instead and `[[1, 100], [2, 3], [4, 5]]`
deletes two intervals where one was enough.

**Counting overlaps is a different question from merging them**, and that is
Meeting Rooms II. The reframe is that rooms are interchangeable, so the answer
is just the peak number of simultaneously live meetings. Two ways to find that
peak, both in the file:

- **Min-heap of end times** — process starts in order, keep the ends of busy
  rooms in a heap, pop the ones that have freed. The heap answers exactly one
  question, "when does the first room free up". Use this version when the
  follow-up asks *which* room each meeting is in; the ids ride along with the
  ends.
- **Chronological sweep** — sort starts and ends into two separate arrays and
  walk them with two pointers. Separating them throws away the pairing, which is
  the point: a sorted `ends` array already gives you the earliest free room at
  its front, so the heap has nothing left to do. Fewer moving parts, better
  constants, and no data structure to reproduce from memory.

**Insert Interval is Merge Intervals with the sort already paid for.** The input
arrives sorted and non-overlapping, so the list splits into three runs — before,
overlapping, after — and one pass handles each. It is also the one problem where
binary search looks tempting and is not worth it: you still copy n intervals
into the output, so O(n) is the floor and the search only saves comparisons.

## The JS-specific traps in this category

- **`sort()` without a comparator is lexicographic.** `[[10, 20], [9, 30]].sort()`
  compares `"10,20"` against `"9,30"` and puts 10 first. Every sort in this
  folder passes `(a, b) => a[0] - b[0]` or `(a, b) => a[1] - b[1]`.
- **`sort()` mutates.** Every file copies first — `[...intervals]` for a
  reorder, `intervals.map(iv => [...iv])` when the inner arrays get written to.
  Merge Intervals mutates `last[1]`, so a shallow copy is not enough there.
- **Touching intervals are the off-by-one.** Merging treats `[1, 4]` and
  `[4, 5]` as overlapping (`s <= last[1]`); meetings treat them as fine
  (`start < previousEnd` is the clash test, strictly). Get the `=` on the wrong
  side and every test with adjacent endpoints flips.
- **`Math.max` when extending a block.** `last[1] = e` instead of
  `last[1] = Math.max(last[1], e)` silently shrinks a merged block whenever one
  interval is fully inside another — `[[1, 10], [2, 3]]` comes back as `[1, 3]`.
- **Sorting `+1/-1` events needs a tie-break.** `(a, b) => a[0] - b[0]` alone
  leaves equal timestamps in arbitrary order, and for meetings the `-1` must go
  first or a room looks occupied for an instant it is not. Chain the comparator:
  `a[0] - b[0] || a[1] - b[1]`.

See [javascript/pitfalls.md](../../javascript/pitfalls.md) for the full list.
