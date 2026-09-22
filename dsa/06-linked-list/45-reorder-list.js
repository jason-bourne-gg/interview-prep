'use strict'
/**
 * REORDER LIST
 *
 * Given L0 -> L1 -> ... -> Ln-1 -> Ln, rearrange it in place to
 * L0 -> Ln -> L1 -> Ln-1 -> L2 -> ... — first, last, second, second-last, and
 * so on. Values may not be swapped between nodes; the links must move.
 *
 *   1 -> 2 -> 3 -> 4      ->   1 -> 4 -> 2 -> 3
 *   1 -> 2 -> 3 -> 4 -> 5 ->   1 -> 5 -> 2 -> 4 -> 3
 *
 * Pattern: fast & slow pointers, then reverse, then merge
 */

const { toList, fromList } = require('../_lib/structures')
const { reverseList } = require('./40-reverse-a-linked-list')

/**
 * Approach 1 — repeatedly cut off the last node and splice it in.
 * O(n^2) time, O(1) space.
 *
 * Direct from the problem statement: take the last node, put it after the
 * current one, move on. Finding "the node before the last" costs a full walk
 * every time, and there are n/2 of them, hence quadratic. Its one virtue is
 * that it needs no extra memory, which is what makes the O(n) answer look
 * non-obvious at first.
 */
function reorderListQuadratic(head) {
  let cur = head
  while (cur && cur.next) {
    let prev = cur
    while (prev.next.next) prev = prev.next     // prev ends up just before the last node
    const last = prev.next
    if (last === cur.next) break                // already adjacent: nothing to move
    prev.next = null
    last.next = cur.next
    cur.next = last
    cur = last.next
  }
  return head
}

/**
 * Approach 2 — put the nodes in an array, then two pointers.
 * O(n) time, O(n) space.
 *
 * The array buys the thing a singly linked list refuses to give you: a way to
 * walk backwards. Once you have it, the answer is just an inward two-pointer
 * sweep re-writing next pointers.
 *
 * This is a perfectly good answer and fast to write. The only objection is the
 * O(n) memory, and the third approach removes it by manufacturing the backwards
 * walk instead of storing it.
 */
function reorderListArray(head) {
  if (!head) return head
  const nodes = []
  for (let n = head; n; n = n.next) nodes.push(n)

  let i = 0, j = nodes.length - 1
  while (i < j) {
    nodes[i].next = nodes[j]
    i++
    if (i === j) break             // the middle node is now the tail; stop before re-linking it
    nodes[j].next = nodes[i]
    j--
  }
  nodes[i].next = null             // whichever node ended up last must terminate
  return head
}

/**
 * Approach 3 — split at the middle, reverse the back half, interleave.
 * O(n) time, O(1) space.  ** optimal **
 *
 * The array version only ever needed to read the second half backwards. A
 * reversed list gives you the same thing for free, so reverse the second half
 * in place and the problem collapses into a plain merge of two forward lists.
 *
 * Three steps, each one a problem you already solved:
 *
 *   1. Find the middle with slow/fast. The condition `fast.next &&
 *      fast.next.next` stops slow on the END of the first half, so for an even
 *      length the split is [1,2][3,4] and for an odd one it is [1,2,3][4,5] —
 *      the first half is never shorter than the second. That ordering is what
 *      lets the merge loop below finish cleanly.
 *   2. Cut with slow.next = null BEFORE reversing. Skip that line and the first
 *      half still points into the second, and the reversed half points back —
 *      you get a cycle, and printing the list hangs forever.
 *   3. Interleave, saving both successors before overwriting either pointer.
 *      Second runs out first or at the same time, so the loop is driven by it.
 *
 * Reverse is imported rather than rewritten — same problem, one file up.
 */
function reorderList(head) {
  if (!head || !head.next) return head

  let slow = head, fast = head
  while (fast.next && fast.next.next) {      // slow stops at the end of the first half
    slow = slow.next
    fast = fast.next.next
  }

  let second = reverseList(slow.next)
  slow.next = null                           // cut, or the two halves form a cycle

  let first = head
  while (second) {
    const fNext = first.next, sNext = second.next
    first.next = second
    second.next = fNext
    first = fNext
    second = sNext
  }
  return head
}

module.exports = { reorderList, reorderListArray, reorderListQuadratic }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const fn of [reorderList, reorderListArray, reorderListQuadratic]) {
    eq(fromList(fn(toList([1, 2, 3, 4]))), [1, 4, 2, 3], `${fn.name} even length`)
    eq(fromList(fn(toList([1, 2, 3, 4, 5]))), [1, 5, 2, 4, 3], `${fn.name} odd length`)
    eq(fromList(fn(toList([]))), [], `${fn.name} empty list`)
    eq(fromList(fn(toList([1]))), [1], `${fn.name} single node`)
    // Two and three nodes are where an off-by-one in the middle-finding split
    // shows up first: either the list comes back reversed or a node is dropped.
    eq(fromList(fn(toList([1, 2]))), [1, 2], `${fn.name} two nodes are already in order`)
    eq(fromList(fn(toList([1, 2, 3]))), [1, 3, 2], `${fn.name} three nodes`)
    eq(fromList(fn(toList([7, 7, 7, 7]))), [7, 7, 7, 7], `${fn.name} duplicates keep the length`)
    eq(fromList(fn(toList([1, 2, 3, 4, 5, 6]))), [1, 6, 2, 5, 3, 4], `${fn.name} six nodes`)
  }

  // Missing the cut (slow.next = null) leaves a cycle, and fromList would hang
  // rather than fail. Walk a bounded number of steps to catch that directly.
  const head = reorderList(toList([1, 2, 3, 4, 5]))
  let steps = 0
  for (let n = head; n && steps < 50; n = n.next) steps++
  eq(steps, 5, 'reorderList terminates — the halves are cut apart, not looped')

  report('reorder-list')
}
