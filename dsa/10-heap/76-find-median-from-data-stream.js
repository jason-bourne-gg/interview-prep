'use strict'
/**
 * FIND MEDIAN FROM DATA STREAM
 *
 * Design a structure with two operations: addNum(x) accepts the next number of
 * an endless stream, and findMedian() returns the median of everything added so
 * far. With an even count the median is the average of the middle two.
 *
 *   add 1, add 2  ->  findMedian() === 1.5
 *   add 3         ->  findMedian() === 2
 *
 * This is a design problem, so "optimal" means the best pair of costs, not one
 * number. The three designs below trade the two operations against each other:
 * O(1) add with O(n log n) find, O(n) add with O(1) find, and finally O(log n)
 * add with O(1) find.
 *
 * Pattern: heap (two heaps, balanced)
 */

const { MinHeap } = require('../_lib/structures')

/**
 * Approach 1 — keep everything, sort on every query.
 * addNum O(1), findMedian O(n log n).  O(n) space.
 *
 * The baseline. It is genuinely the right answer if findMedian is called once
 * at the end. It falls apart under the actual stream workload, where reads are
 * interleaved with writes and the same data gets re-sorted on every call.
 */
class MedianFinderBrute {
  constructor() { this.data = [] }
  addNum(x) { this.data.push(x) }
  findMedian() {
    if (!this.data.length) return NaN
    const s = [...this.data].sort((a, b) => a - b)     // comparator, always
    const mid = s.length >> 1
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
  }
}

/**
 * Approach 2 — keep the array sorted as you insert.
 * addNum O(n), findMedian O(1).  O(n) space.
 *
 * The step up: sorting the same data repeatedly is waste, so pay once per
 * insert instead. Binary search finds the insertion point in O(log n) — but
 * splice then shifts every element after it, so the insert is still O(n).
 *
 * Worth writing out because it isolates what actually has to be fixed. The
 * search is already fast. The cost is maintaining a total order over all n
 * elements, and the answer needs nothing of the sort: it needs the middle one
 * or two. Everything else only has to be on the correct SIDE of the middle.
 * That sentence is what produces approach 3.
 */
class MedianFinderSorted {
  constructor() { this.data = [] }
  addNum(x) {
    let lo = 0, hi = this.data.length
    while (lo < hi) {
      const mid = lo + ((hi - lo) >> 1)
      if (this.data[mid] < x) lo = mid + 1
      else hi = mid
    }
    this.data.splice(lo, 0, x)                          // the O(n) shift
  }
  findMedian() {
    const n = this.data.length
    if (!n) return NaN
    const mid = n >> 1
    return n % 2 ? this.data[mid] : (this.data[mid - 1] + this.data[mid]) / 2
  }
}

/**
 * Approach 3 — two heaps.  addNum O(log n), findMedian O(1).  O(n) space.
 * ** optimal **
 *
 * Split the numbers into the lower half and the upper half. The median is made
 * only of the largest element of the lower half and the smallest of the upper
 * half — so keep the lower half in a MAX-heap and the upper half in a MIN-heap,
 * and both candidates are sitting at a root where reading them costs O(1).
 * Within each half the order is never computed, which is exactly the work that
 * approach 2 was paying for and throwing away.
 *
 * MinHeap in ../_lib/structures is comparator-based, so a max-heap is the same
 * class with the comparison inverted — (b, a) instead of (a, b). There is no
 * second class to write, and in an interview this is the line to say out loud
 * rather than implementing a MaxHeap from scratch.
 *
 * Two invariants have to hold after every add:
 *
 *   1. ORDER — every element of `lower` is <= every element of `upper`.
 *   2. BALANCE — lower.size === upper.size, or exactly one more.
 *
 * Order is what makes the two roots the middle elements. Balance is what pins
 * the middle at the roots rather than somewhere inside a heap.
 *
 * The push-then-funnel trick enforces both without any comparison in the code.
 * Push onto `lower`, immediately move lower's max into `upper`, then move
 * upper's min back if upper got too big. The new number is compared against
 * everything only by the heaps themselves, so there is no "is x <= lower.peek()"
 * branch to get wrong, and no empty-heap special case — peek() on an empty heap
 * is never reached, because the funnel only pops what it just pushed.
 *
 * With lower allowed to be the larger half, an odd total puts the median at
 * lower's root alone; an even total averages the two roots.
 *
 * The classic bug here is balancing by size without funnelling. Pushing a new
 * number onto whichever heap is smaller keeps invariant 2 and quietly breaks
 * invariant 1, and the medians come back wrong only once the stream is
 * unsorted — which is why a test that feeds 1, 2, 3, 4 in order passes it.
 */
class MedianFinder {
  constructor() {
    this.lower = new MinHeap((a, b) => b - a)     // max-heap: lower half
    this.upper = new MinHeap((a, b) => a - b)     // min-heap: upper half
  }

  addNum(x) {
    this.lower.push(x)
    this.upper.push(this.lower.pop())                       // funnel: keeps order
    if (this.upper.size > this.lower.size) this.lower.push(this.upper.pop())
  }

  findMedian() {
    if (!this.lower.size) return NaN
    if (this.lower.size > this.upper.size) return this.lower.peek()
    return (this.lower.peek() + this.upper.peek()) / 2
  }
}

module.exports = { MedianFinder, MedianFinderBrute, MedianFinderSorted }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  /** Replay a script of ['add', x] / ['med'] steps and collect the medians. */
  const run = (Cls, script) => {
    const mf = new Cls()
    const out = []
    for (const [op, x] of script) {
      if (op === 'add') mf.addNum(x)
      else out.push(mf.findMedian())
    }
    return out
  }

  for (const Cls of [MedianFinder, MedianFinderBrute, MedianFinderSorted]) {
    const name = Cls.name

    eq(run(Cls, [['add', 1], ['add', 2], ['med'], ['add', 3], ['med']]), [1.5, 2], `${name} worked example`)
    eq(Number.isNaN(new Cls().findMedian()), true, `${name} empty stream`)
    eq(run(Cls, [['add', 5], ['med']]), [5], `${name} single element`)
    eq(run(Cls, [['add', 4], ['add', 4], ['add', 4], ['med']]), [4], `${name} all duplicates`)
    // Descending input. A balance-by-size design with no funnel puts the larger
    // numbers in the lower half and reports the wrong median from here on.
    eq(run(Cls, [['add', 5], ['add', 4], ['add', 3], ['add', 2], ['add', 1], ['med']]), [3], `${name} descending stream`)
    // A median after every single add, so an off-by-one in the odd/even branch
    // shows up on the first step that has it wrong rather than at the end.
    eq(
      run(Cls, [['add', 6], ['med'], ['add', 10], ['med'], ['add', 2], ['med'], ['add', 6], ['med'], ['add', 5], ['med']]),
      [6, 8, 6, 6, 6],
      `${name} median after every add`,
    )
    // Negatives and a fractional even-count average.
    eq(run(Cls, [['add', -1], ['add', -2], ['med'], ['add', -3], ['med'], ['add', 0], ['med']]), [-1.5, -2, -1.5], `${name} negatives`)
    // The new number belongs strictly inside the existing range, which is the
    // case that forces a rebalance across both heaps rather than an append.
    eq(run(Cls, [['add', 1], ['add', 100], ['add', 50], ['med']]), [50], `${name} insert into the middle`)
    // Even count where the two middles differ by an odd amount, so the median is
    // not an integer — catches an implementation that truncates.
    eq(run(Cls, [['add', 1], ['add', 2], ['add', 3], ['add', 4], ['med']]), [2.5], `${name} non-integer median`)
  }

  report('find-median-from-data-stream')
}
