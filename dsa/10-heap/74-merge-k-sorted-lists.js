'use strict'
/**
 * MERGE K SORTED LISTS  (re-export — the solution lives in ../06-linked-list)
 *
 * Given k linked lists, each already sorted ascending, merge them into one
 * sorted list and return its head.
 *
 *   [[1, 4, 5], [1, 3, 4], [2, 6]]  ->  1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6
 *
 * WHY THIS FILE IS A STUB
 *
 * The canonical Blind 75 list has 76 entries and 75 distinct problems. Merge K
 * Sorted Lists is the duplicate: it appears once under Linked List and once
 * under Heap. That is not an error in the list, it is the list admitting that
 * the problem has two different doors into it. Categorising by data structure
 * fails when a problem needs two of them.
 *
 * The full write-up with all four approaches is #43, in ../06-linked-list. A
 * second copy of that code here would be a second thing to keep correct, so
 * this file re-exports instead and only adds what the heap lens contributes.
 *
 * WHAT THE HEAP LENS ADDS
 *
 * From the linked-list side, the question reads as pointer surgery: splice k
 * sorted chains together without losing a tail. The best answer from that angle
 * is pairwise divide and conquer, which is why #43 marks that one optimal — it
 * needs no auxiliary structure and wins on constants.
 *
 * From the heap side the question is not about lists at all. It is the k-way
 * merge: you have k sorted SOURCES and repeatedly need the smallest unconsumed
 * item across all of them. A heap of the k current fronts answers that in
 * O(log k) per item, and it never holds more than k items no matter how long
 * the sources are. Restated that way the same code merges k sorted files that
 * do not fit in memory, or k sorted shards from k database replicas, or k
 * event streams being interleaved by timestamp. The linked list is incidental.
 *
 * That is also the practical split between #43's two fast approaches. Both are
 * O(N log k). Divide and conquer needs every list materialised up front so it
 * can pair them; the heap only ever needs the current front of each source, so
 * it is the one that survives when the inputs are streams. Say that distinction
 * out loud — "same complexity, different memory model" — rather than picking
 * one and hoping.
 *
 * Pattern: heap (k-way merge) / divide and conquer
 */

const {
  mergeKLists,
  mergeKListsHeap,
  mergeKListsSequential,
  mergeKListsBrute,
} = require('../06-linked-list/43-merge-k-sorted-lists')

module.exports = { mergeKLists, mergeKListsHeap, mergeKListsSequential, mergeKListsBrute }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  const { toList, fromList } = require('../_lib/structures')
  const build = arrs => arrs.map(toList)

  // Re-exports can rot: a rename on the other side leaves `undefined` bound
  // here, and nothing complains until something calls it. So this file runs
  // the assertions itself rather than trusting the require.
  for (const fn of [mergeKLists, mergeKListsHeap, mergeKListsSequential, mergeKListsBrute]) {
    eq(typeof fn, 'function', 'all four approaches are re-exported')
  }

  for (const fn of [mergeKLists, mergeKListsHeap, mergeKListsSequential, mergeKListsBrute]) {
    eq(fromList(fn(build([[1, 4, 5], [1, 3, 4], [2, 6]]))), [1, 1, 2, 3, 4, 4, 5, 6], `${fn.name} worked example`)
    eq(fromList(fn(build([]))), [], `${fn.name} no lists at all`)
    eq(fromList(fn(build([[]]))), [], `${fn.name} one empty list`)
    eq(fromList(fn(build([[3]]))), [3], `${fn.name} single list, single node`)
    eq(fromList(fn(build([[2, 2], [2], [2, 2]]))), [2, 2, 2, 2, 2], `${fn.name} duplicates across lists`)
    // An empty list in the middle. The heap must not push a null front, and the
    // pairing must not read the empty slot as the end of the array.
    eq(fromList(fn(build([[1, 5], [], [0, 6], []]))), [0, 1, 5, 6], `${fn.name} empty lists interleaved`)
    // Odd k, so the last pairing round carries one list forward unmerged.
    eq(fromList(fn(build([[1], [2], [3], [4], [5]]))), [1, 2, 3, 4, 5], `${fn.name} odd k forces a carry`)
    eq(fromList(fn(build([[-5, -1], [-4, 0], [-3]]))), [-5, -4, -3, -1, 0], `${fn.name} negatives`)
    // Disjoint ranges given in reverse order — catches a merge that drops the
    // leftover tail once one side runs out.
    eq(fromList(fn(build([[7, 8], [4, 5], [1, 2]]))), [1, 2, 4, 5, 7, 8], `${fn.name} disjoint ranges, reversed`)
  }

  report('merge-k-sorted-lists (heap view)')
}
