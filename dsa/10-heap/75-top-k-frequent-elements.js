'use strict'
/**
 * TOP K FREQUENT ELEMENTS
 *
 * Given an array of integers and a number k, return the k values that occur
 * most often. The order of the returned values does not matter, and k is always
 * valid — it never exceeds the number of distinct values.
 *
 *   [1, 1, 1, 2, 2, 3], k = 2  ->  [1, 2]      (1 appears 3x, 2 appears 2x)
 *
 * Every approach below starts the same way: one pass to build a count map, which
 * is O(n) and unavoidable. The whole question is what you do with those counts
 * afterwards, and the three answers are n log n, n log k, and n.
 *
 * Pattern: heap (top k) — with a bucket-sort escape hatch
 */

const { MinHeap } = require('../_lib/structures')

/** Count occurrences. O(n) time, O(d) space where d is the distinct-value count. */
function counts(nums) {
  const map = new Map()
  for (const n of nums) map.set(n, (map.get(n) ?? 0) + 1)
  return map
}

/**
 * Approach 1 — count, then sort by count descending.  O(n log n) time, O(n) space.
 *
 * The obvious answer, and a perfectly good first sentence. The waste is visible
 * once you say what it does: it fully orders all d distinct values when the
 * question only asked which k are on top. Everything below rank k is sorted for
 * nothing.
 *
 * Strictly the sort is O(d log d) and d <= n, so on input that is mostly
 * repeats this is already close to linear. Quote it as n log n anyway — the
 * worst case is all-distinct, where d === n.
 */
function topKFrequentSort(nums, k) {
  return [...counts(nums).entries()]
    .sort((a, b) => b[1] - a[1])          // by count, descending
    .slice(0, k)
    .map(([value]) => value)
}

/**
 * Approach 2 — min-heap capped at size k.  O(n log k) time, O(n) space.
 *
 * The insight that drops the log: you never need the losers ordered, you only
 * need to know whether an incoming value beats the current worst survivor. A
 * MIN-heap of size k answers exactly that, because its root is the weakest of
 * the k you are holding. Push, and if the heap has grown past k, pop the root.
 *
 * The min-heap feels backwards the first time — you want the k LARGEST counts,
 * so you keep a heap ordered by SMALLEST, because the thing you must evict
 * cheaply is the weakest one you are keeping.
 *
 * Space is still O(n) because the count map is O(n); the heap itself is O(k).
 * That distinction matters when k is small and the stream is huge, which is the
 * real-world shape of this problem: top k search terms, top k error codes.
 *
 * Counts are compared, not values, so the comparator reads entry[1].
 */
function topKFrequentHeap(nums, k) {
  const heap = new MinHeap((a, b) => a[1] - b[1])     // [value, count], weakest count on top
  for (const entry of counts(nums)) {
    heap.push(entry)
    if (heap.size > k) heap.pop()                     // evict the weakest survivor
  }
  const out = []
  while (heap.size) out.push(heap.pop()[0])
  return out
}

/**
 * Approach 3 — bucket sort by count.  O(n) time, O(n) space.  ** optimal **
 *
 * The observation the heap misses: a count is not an arbitrary number. A value
 * in an array of length n can appear at most n times, so every count is an
 * integer in 1..n. Comparison sorting exists to order unbounded keys; when the
 * keys are small bounded integers you can use the key as an index instead and
 * skip comparing altogether.
 *
 * So build n+1 buckets, drop each value into the bucket for its count, then walk
 * the buckets from n down to 1 and take values until you have k. No comparisons,
 * no heap, one linear pass each way.
 *
 * This surprises people, because "top k" is taught as the heap problem and the
 * heap is presented as the good answer. It is the good answer when the keys are
 * unbounded or the data arrives as a stream you cannot store. Here the keys are
 * bounded by n and you already hold the whole array, so bucket sort strictly
 * beats it: O(n) against O(n log k).
 *
 * The bounded-key condition is the thing to check before reaching for this. Top
 * k by float score, or by a running count over an unbounded stream, gives you
 * no bucket index and puts you back on the heap.
 *
 * Off-by-one to watch: buckets are indexed by count, and counts start at 1, so
 * the array needs n+1 slots and slot 0 stays empty.
 */
function topKFrequent(nums, k) {
  const buckets = Array.from({ length: nums.length + 1 }, () => [])
  for (const [value, count] of counts(nums)) buckets[count].push(value)

  const out = []
  for (let count = nums.length; count >= 1 && out.length < k; count--) {
    for (const value of buckets[count]) {
      out.push(value)
      if (out.length === k) break
    }
  }
  return out
}

module.exports = { topKFrequent, topKFrequentSort, topKFrequentHeap }

if (require.main === module) {
  const { eq, eqUnordered, report } = require('../_lib/test')

  // Output order is unspecified, so compare as sets. The cases below also avoid
  // ties that straddle the k boundary: if the k-th and (k+1)-th values have the
  // same count, every approach is free to pick a different one and still be
  // right, so such a case cannot be asserted against a fixed answer.
  for (const fn of [topKFrequent, topKFrequentSort, topKFrequentHeap]) {
    eqUnordered(fn([1, 1, 1, 2, 2, 3], 2), [1, 2], `${fn.name} worked example`)
    eqUnordered(fn([], 0), [], `${fn.name} empty input, k = 0`)
    eqUnordered(fn([7], 1), [7], `${fn.name} single element`)
    eqUnordered(fn([4, 4, 4, 4], 1), [4], `${fn.name} one value repeated`)
    eqUnordered(fn([5, 5, 6, 6, 7], 3), [5, 6, 7], `${fn.name} k equals the distinct count`)
    eqUnordered(fn([-1, -1, -1, -2, -2, 9], 2), [-1, -2], `${fn.name} negatives`)
    // Every value appears exactly once, so the answer is any k of them. Assert
    // the size and that the picks are real values, not the picks themselves.
    const all = fn([1, 2, 3, 4, 5], 3)
    eq(all.length, 3, `${fn.name} all counts tied returns exactly k`)
    eq(all.every(v => [1, 2, 3, 4, 5].includes(v)) && new Set(all).size === 3, true, `${fn.name} all counts tied returns k distinct inputs`)
    // The most frequent value sits at the END of the array and is not the
    // largest value — catches an approach that sorts by value, or that walks
    // the buckets from 1 upward instead of from n down.
    eqUnordered(fn([9, 8, 8, 1, 1, 1], 1), [1], `${fn.name} winner is last and smallest`)
    // Counts hit the ceiling: the top count equals nums.length, so the bucket
    // walk must start at index n, not n - 1.
    eqUnordered(fn([3, 3, 3], 1), [3], `${fn.name} count equals array length`)
  }

  report('top-k-frequent-elements')
}
