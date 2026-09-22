'use strict'
/**
 * MERGE K SORTED LISTS
 *
 * You are given an array of k linked lists, each already sorted ascending.
 * Merge them all into one sorted list and return its head. Some entries may be
 * empty, and the array itself may be empty.
 *
 *   [[1, 4, 5], [1, 3, 4], [2, 6]]  ->  1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6
 *
 * Throughout: N is the TOTAL number of nodes across all lists, k is the number
 * of lists. Mixing those two up is how people end up quoting the wrong
 * complexity for the heap.
 *
 * This is the same problem as #74 in the Heap category (../10-heap). The
 * implementation lives here; that entry points back at this file.
 *
 * Pattern: heap (k-way merge) / divide and conquer
 */

const { MinHeap, toList, fromList } = require('../_lib/structures')
const { mergeTwoLists } = require('./42-merge-two-sorted-lists')

/**
 * Approach 1 — collect every value, sort, rebuild.  O(N log N) time, O(N) space.
 *
 * The baseline. It ignores the fact that each list is already sorted, which is
 * exactly the information that gets the log down from log N to log k. Fine as a
 * first sentence in an interview, never as the last one.
 */
function mergeKListsBrute(lists) {
  const vals = []
  for (const head of lists) for (let n = head; n; n = n.next) vals.push(n.val)
  vals.sort((a, b) => a - b)
  return toList(vals)
}

/**
 * Approach 2 — merge them one at a time into an accumulator.
 * O(N * k) time, O(1) space.
 *
 * Reuses Merge Two Sorted Lists k-1 times. The cost is the trap: the
 * accumulator is re-walked on every merge. With k lists of N/k nodes each, the
 * i-th merge walks i*N/k accumulated nodes, and summing i = 1..k gives
 * N*k/2 = O(N*k). The first list's nodes are traversed k-1 times; the last
 * list's, once.
 *
 * So this is not "k merges, therefore k times the work of one merge" — the work
 * is quadratic in k. That imbalance is the thing to fix, and both faster
 * approaches below fix it in different ways.
 */
function mergeKListsSequential(lists) {
  let acc = null
  for (const head of lists) acc = mergeTwoLists(acc, head)
  return acc
}

/**
 * Approach 3 — min-heap of the k current heads.  O(N log k) time, O(k) space.
 *
 * The insight: at any moment the next node of the answer is the smallest of the
 * k list heads, and nothing else can beat it, because each list is sorted. So
 * you never need to look past the front of each list. A heap holding exactly
 * those k fronts answers "which is smallest" in O(log k).
 *
 * Every node is pushed once and popped once: N pops, each O(log k). The heap
 * never holds more than k nodes, so the space is O(k) regardless of N — this is
 * the approach to reach for when the lists are streams too large to hold.
 *
 * The comparator is on node.val; the heap stores the NODES, so popping one
 * hands you its successor for free.
 */
function mergeKListsHeap(lists) {
  const heap = new MinHeap((a, b) => a.val - b.val)
  for (const head of lists) if (head) heap.push(head)     // skip empty lists

  const dummy = { next: null }
  let tail = dummy
  while (heap.size) {
    const node = heap.pop()
    tail.next = node
    tail = node
    if (node.next) heap.push(node.next)
  }
  tail.next = null                  // cut the last node loose from its old list
  return dummy.next
}

/**
 * Approach 4 — divide and conquer, pairwise.  O(N log k) time, O(1) extra.
 * ** optimal **
 *
 * Same total complexity as the heap, reached by fixing the other end of the
 * problem. Sequential merging is slow because the accumulator grows while the
 * thing merged into it stays small. Pair the lists up instead — 1 with 2, 3
 * with 4 — so every merge joins two lists of roughly equal size.
 *
 * Count the work by rounds rather than by merges. Each round touches every node
 * at most once, so a round is O(N), and each round halves the number of lists,
 * so there are ceil(log2 k) rounds. O(N log k), with each node traversed log k
 * times instead of up to k times.
 *
 * Done iteratively as below it needs no heap and no recursion stack, so it beats
 * the heap on constants and on space. The heap still wins when the lists arrive
 * as streams and cannot all be held at once.
 *
 * The off-by-one to watch: an odd-length round leaves one list unpaired. It must
 * be carried forward untouched, not dropped and not merged with itself.
 */
function mergeKLists(lists) {
  if (!lists || lists.length === 0) return null
  let level = lists
  while (level.length > 1) {
    const next = []
    for (let i = 0; i < level.length; i += 2) {
      const second = i + 1 < level.length ? level[i + 1] : null   // odd one out rides along
      next.push(mergeTwoLists(level[i], second))
    }
    level = next
  }
  return level[0]
}

module.exports = { mergeKLists, mergeKListsHeap, mergeKListsSequential, mergeKListsBrute }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  const build = arrs => arrs.map(toList)

  for (const fn of [mergeKLists, mergeKListsHeap, mergeKListsSequential, mergeKListsBrute]) {
    eq(fromList(fn(build([[1, 4, 5], [1, 3, 4], [2, 6]]))), [1, 1, 2, 3, 4, 4, 5, 6], `${fn.name} worked example`)
    eq(fromList(fn(build([]))), [], `${fn.name} no lists at all`)
    eq(fromList(fn(build([[]]))), [], `${fn.name} one empty list`)
    eq(fromList(fn(build([[], []]))), [], `${fn.name} all lists empty`)
    eq(fromList(fn(build([[3]]))), [3], `${fn.name} single list, single node`)
    eq(fromList(fn(build([[2, 2], [2], [2, 2]]))), [2, 2, 2, 2, 2], `${fn.name} duplicates across lists`)
    // Empty list in the middle: the heap must not push null, and the pairing
    // must not treat an empty slot as the end of the array.
    eq(fromList(fn(build([[1, 5], [], [0, 6], []]))), [0, 1, 5, 6], `${fn.name} empty lists interleaved`)
    // Odd k, so the last round carries an unpaired list forward.
    eq(fromList(fn(build([[1], [2], [3], [4], [5]]))), [1, 2, 3, 4, 5], `${fn.name} odd k forces a carry`)
    eq(fromList(fn(build([[-5, -1], [-4, 0], [-3]]))), [-5, -4, -3, -1, 0], `${fn.name} negatives`)
    // Fully disjoint and in reverse order of the input — catches a merge that
    // drops a leftover tail.
    eq(fromList(fn(build([[7, 8], [4, 5], [1, 2]]))), [1, 2, 4, 5, 7, 8], `${fn.name} disjoint ranges, reversed`)
  }

  report('merge-k-sorted-lists')
}
