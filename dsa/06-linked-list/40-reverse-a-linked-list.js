'use strict'
/**
 * REVERSE A LINKED LIST
 *
 * Given the head of a singly linked list, reverse it and return the new head.
 * Every node keeps its identity — only the next pointers move.
 *
 *   1 -> 2 -> 3 -> 4 -> null   ->   4 -> 3 -> 2 -> 1 -> null
 *
 * Pattern: in-place pointer reversal
 */

const { ListNode, toList, fromList } = require('../_lib/structures')

/**
 * Approach 1 — copy the values out, write them back reversed.
 * O(n) time, O(n) space.
 *
 * It passes the tests and it is the wrong answer. The list is never actually
 * reversed: the nodes stay exactly where they were and only their payloads
 * move. Any caller holding a reference to the old head still holds the node
 * that is now first, but with a different value in it, and any problem where
 * nodes carry identity (Reorder List, cycle detection) breaks outright.
 * Worth writing once so you can say why you are not using it.
 */
function reverseListValues(head) {
  const vals = []
  for (let n = head; n; n = n.next) vals.push(n.val)
  let i = vals.length - 1
  for (let n = head; n; n = n.next) n.val = vals[i--]
  return head
}

/**
 * Approach 2 — recursion.  O(n) time, O(n) stack.
 *
 * The recursive step reads as: reverse everything after me, then fix my own
 * two pointers. After the call, `rest` is the head of the already-reversed
 * tail, and head.next is still pointing at the node that is now the LAST node
 * of that tail. So `head.next.next = head` hooks me onto the end without
 * having to walk there, and `head.next = null` makes me the new terminator.
 *
 * O(n) stack is the reason this is not the answer you give first — a list of a
 * million nodes overflows.
 */
function reverseListRecursive(head) {
  if (!head || !head.next) return head
  const rest = reverseListRecursive(head.next)
  head.next.next = head
  head.next = null
  return rest
}

/**
 * Approach 3 — three pointers, one pass.  O(n) time, O(1) space.  ** optimal **
 *
 * Walk the list flipping one link per step. The only subtlety is that the
 * moment you write `cur.next = prev` you have destroyed your way forward, so
 * you must save `cur.next` into `nxt` BEFORE the flip. That one line is the
 * whole problem; everything else is bookkeeping.
 *
 * `prev` starts at null, which is what makes the old head terminate correctly,
 * and ends on the last node, which is the new head.
 */
function reverseList(head) {
  let prev = null, cur = head
  while (cur) {
    const nxt = cur.next      // save first — the next line destroys it
    cur.next = prev
    prev = cur
    cur = nxt
  }
  return prev
}

module.exports = { reverseList, reverseListRecursive, reverseListValues }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const fn of [reverseList, reverseListRecursive, reverseListValues]) {
    eq(fromList(fn(toList([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1], `${fn.name} worked example`)
    eq(fromList(fn(toList([]))), [], `${fn.name} empty list`)
    eq(fromList(fn(toList([7]))), [7], `${fn.name} single node`)
    eq(fromList(fn(toList([1, 2]))), [2, 1], `${fn.name} two nodes`)
    eq(fromList(fn(toList([4, 4, 4]))), [4, 4, 4], `${fn.name} duplicates`)
    eq(fromList(fn(fn(toList([1, 2, 3])))), [1, 2, 3], `${fn.name} reversing twice is identity`)
  }

  // The classic bug: forgetting head.next = null in the recursive version, or
  // dropping `prev = null` in the loop, leaves the old head pointing at the old
  // second node — a 2-cycle. Walking a fixed number of steps catches it where
  // fromList would hang.
  const head = reverseList(toList([1, 2, 3]))
  let steps = 0
  for (let n = head; n && steps < 10; n = n.next) steps++
  eq(steps, 3, 'reverseList terminates — old head is not left pointing back')

  // Node identity survives: the node that held 1 is the tail, not a copy.
  const first = toList([1, 2, 3])
  const rev = reverseList(first)
  eq(rev.next.next === first, true, 'reverseList moves links, not values')
  eq(first instanceof ListNode, true, 'nodes are reused, not rebuilt')

  report('reverse-a-linked-list')
}
