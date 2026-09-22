'use strict'
/**
 * MERGE TWO SORTED LISTS
 *
 * Given the heads of two lists already sorted ascending, splice them into one
 * sorted list and return its head. Reuse the existing nodes; do not allocate a
 * new node per value.
 *
 *   1 -> 2 -> 4   and   1 -> 3 -> 4   ->   1 -> 1 -> 2 -> 3 -> 4 -> 4
 *
 * Pattern: two pointers + dummy head
 */

const { ListNode, toList, fromList } = require('../_lib/structures')

/**
 * Approach 1 — dump the values, sort, rebuild.  O((n+m) log(n+m)) time,
 * O(n+m) space.
 *
 * Slow for the obvious reason: it pays log-linear for a sort when the inputs
 * are already sorted, and throws away the one fact the problem handed you. It
 * also builds brand new nodes, so the original lists are left intact — the
 * opposite of what "merge in place" asks for.
 */
function mergeTwoListsBrute(a, b) {
  const vals = []
  for (let n = a; n; n = n.next) vals.push(n.val)
  for (let n = b; n; n = n.next) vals.push(n.val)
  vals.sort((x, y) => x - y)          // comparator, always — default sort is lexicographic
  return toList(vals)
}

/**
 * Approach 2 — recursion.  O(n+m) time, O(n+m) stack.
 *
 * The whole solution is one sentence: the smaller of the two heads is the
 * answer's head, and its tail is the merge of what remains. That is the
 * clearest statement of the algorithm, which is why it is worth writing even
 * though the iterative version is strictly better.
 *
 * Using `<=` rather than `<` keeps equal values in their original relative
 * order — the merge stays stable, which matters when the nodes carry more than
 * a number.
 *
 * Cost: one stack frame per node, so it blows up on long lists.
 */
function mergeTwoListsRecursive(a, b) {
  if (!a) return b
  if (!b) return a
  if (a.val <= b.val) {
    a.next = mergeTwoListsRecursive(a.next, b)
    return a
  }
  b.next = mergeTwoListsRecursive(a, b.next)
  return b
}

/**
 * Approach 3 — iterative with a dummy head.  O(n+m) time, O(1) space.
 * ** optimal **
 *
 * The dummy node exists to remove a special case. Without it, the first
 * append has to decide "am I setting the head, or extending a tail?" and that
 * branch is where the bug lives. With it, every append is the same two lines,
 * and the real head is read off dummy.next at the end.
 *
 * The final line is the other half of the trick: as soon as one list runs out,
 * the rest of the other is already a sorted list, so you point at it once
 * instead of copying node by node.
 */
function mergeTwoLists(a, b) {
  const dummy = new ListNode()
  let tail = dummy
  while (a && b) {
    if (a.val <= b.val) { tail.next = a; a = a.next }
    else { tail.next = b; b = b.next }
    tail = tail.next
  }
  tail.next = a || b                  // one is null; attach the remaining run wholesale
  return dummy.next
}

module.exports = { mergeTwoLists, mergeTwoListsRecursive, mergeTwoListsBrute }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const fn of [mergeTwoLists, mergeTwoListsRecursive, mergeTwoListsBrute]) {
    eq(fromList(fn(toList([1, 2, 4]), toList([1, 3, 4]))), [1, 1, 2, 3, 4, 4], `${fn.name} worked example`)
    eq(fromList(fn(toList([]), toList([]))), [], `${fn.name} both empty`)
    eq(fromList(fn(toList([]), toList([0]))), [0], `${fn.name} one empty`)
    eq(fromList(fn(toList([5]), toList([]))), [5], `${fn.name} other empty`)
    eq(fromList(fn(toList([2, 2, 2]), toList([2, 2]))), [2, 2, 2, 2, 2], `${fn.name} all duplicates`)
    // Disjoint ranges: the case that catches a loop which forgets to attach the
    // leftover tail and returns [1, 2, 3] instead of all six nodes.
    eq(fromList(fn(toList([1, 2, 3]), toList([4, 5, 6]))), [1, 2, 3, 4, 5, 6], `${fn.name} a entirely before b`)
    eq(fromList(fn(toList([4, 5, 6]), toList([1, 2, 3]))), [1, 2, 3, 4, 5, 6], `${fn.name} b entirely before a`)
    eq(fromList(fn(toList([-3, -1]), toList([-2, 0]))), [-3, -2, -1, 0], `${fn.name} negatives interleaved`)
  }

  // The in-place versions splice existing nodes; they do not allocate copies.
  const a = toList([1, 3])
  const merged = mergeTwoLists(a, toList([2]))
  eq(merged === a, true, 'mergeTwoLists reuses the input nodes')

  report('merge-two-sorted-lists')
}
