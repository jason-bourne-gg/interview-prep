'use strict'
/**
 * REMOVE NTH NODE FROM END OF LIST
 *
 * Remove the n-th node counting from the end of the list and return the head.
 * n is always valid: 1 <= n <= length. n = 1 means the last node.
 *
 *   1 -> 2 -> 3 -> 4 -> 5, n = 2  ->  1 -> 2 -> 3 -> 5
 *
 * The whole difficulty is that a singly linked list only counts forwards, and
 * that removing a node requires the node BEFORE it.
 *
 * Pattern: fast & slow pointers (fixed gap)
 */

const { ListNode, toList, fromList } = require('../_lib/structures')

/**
 * Approach 1 — collect the nodes into an array, index from the end.
 * O(L) time, O(L) space.
 *
 * Buys random access with memory. It is honest and it works, but it stores L
 * node references to use exactly two of them, which is what the pointer version
 * removes.
 */
function removeNthFromEndArray(head, n) {
  const nodes = []
  for (let node = head; node; node = node.next) nodes.push(node)
  const target = nodes.length - n            // index of the node to drop
  if (target === 0) return head.next         // dropping the head: new head is the second node
  nodes[target - 1].next = nodes[target].next
  return head
}

/**
 * Approach 2 — two passes: measure, then walk.  O(L) time, O(1) space.
 *
 * Count the length L, then stop at index L - n - 1, the node before the target.
 * Correct and easy to defend. Two passes are only a problem when the list is a
 * stream you cannot rewind, which is the usual reason the interviewer asks for
 * one pass.
 *
 * Note the dummy: without it, `L - n - 1` is -1 when the target is the head, and
 * you need a separate branch. The dummy turns that index into 0 and the branch
 * disappears.
 */
function removeNthFromEndTwoPass(head, n) {
  let length = 0
  for (let node = head; node; node = node.next) length++

  const dummy = new ListNode(0, head)
  let prev = dummy
  for (let i = 0; i < length - n; i++) prev = prev.next
  prev.next = prev.next.next
  return dummy.next
}

/**
 * Approach 3 — one pass, two pointers held n apart.  O(L) time, O(1) space.
 * ** optimal **
 *
 * You cannot count from the end, but you can hold a fixed gap. Put `fast` n
 * nodes ahead of `slow`, then advance both together. When fast can go no
 * further, slow is exactly n nodes from the end — the gap did the counting for
 * you, and the list length never had to be known.
 *
 * Two details decide whether this works:
 *
 *   - Start both at the DUMMY, not at head. That shifts slow one node back, so
 *     it lands on the node BEFORE the target — the one you need in order to
 *     unlink. Starting at head lands you on the target itself, which you cannot
 *     remove from a singly linked list.
 *   - Stop on `while (fast.next)`, not `while (fast)`. The first leaves fast on
 *     the last node; the second runs one step too far and deletes the wrong
 *     node. This is the off-by-one the problem is really testing.
 *
 * The dummy also handles n === L, where the head itself is removed and the
 * answer is a list one shorter — or empty.
 */
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head)
  let fast = dummy, slow = dummy
  for (let i = 0; i < n; i++) fast = fast.next      // open the gap
  while (fast.next) { fast = fast.next; slow = slow.next }
  slow.next = slow.next.next                        // slow sits just before the target
  return dummy.next
}

module.exports = { removeNthFromEnd, removeNthFromEndTwoPass, removeNthFromEndArray }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const fn of [removeNthFromEnd, removeNthFromEndTwoPass, removeNthFromEndArray]) {
    eq(fromList(fn(toList([1, 2, 3, 4, 5]), 2)), [1, 2, 3, 5], `${fn.name} worked example`)
    eq(fromList(fn(toList([1]), 1)), [], `${fn.name} single node becomes empty`)
    eq(fromList(fn(toList([1, 2]), 1)), [1], `${fn.name} remove the tail`)
    eq(fromList(fn(toList([1, 2]), 2)), [2], `${fn.name} remove the head`)
    // n === length: the case that needs the dummy. Without it the code reaches
    // for the node before the head and throws, or silently returns the list
    // unchanged.
    eq(fromList(fn(toList([1, 2, 3]), 3)), [2, 3], `${fn.name} n equals length`)
    // n === 1: the case that catches while(fast) instead of while(fast.next).
    eq(fromList(fn(toList([1, 2, 3]), 1)), [1, 2], `${fn.name} n equals one`)
    eq(fromList(fn(toList([4, 4, 4, 4]), 3)), [4, 4, 4], `${fn.name} duplicates`)
    eq(fromList(fn(toList([1, 2, 3, 4, 5]), 5)), [2, 3, 4, 5], `${fn.name} longer list, remove head`)
  }

  report('remove-nth-node-from-end-of-list')
}
