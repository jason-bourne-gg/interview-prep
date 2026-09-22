'use strict'
/**
 * DETECT CYCLE IN A LINKED LIST
 *
 * Return true if the list has a cycle — that is, if some node's next pointer
 * points back at a node already visited. Position is not given to you; you only
 * have the head.
 *
 *   3 -> 2 -> 0 -> -4, with -4 pointing back at 2   ->  true
 *   1 -> 2 -> null                                  ->  false
 *
 * Pattern: fast & slow pointers (Floyd)
 */

const { toList } = require('../_lib/structures')

/**
 * Approach 1 — re-scan from the head at every step.  O(n^2) time, O(1) space.
 *
 * Standing on the i-th node, walk the first i nodes from the head and check for
 * identity. If the i-th node is one of them, we have looped. It terminates even
 * on a cyclic list, because the first repeat happens within n steps.
 *
 * Compare by reference (===), never by value: [1, 1] is not a cycle.
 */
function hasCycleBrute(head) {
  let node = head, i = 0
  while (node) {
    let ahead = head
    for (let j = 0; j < i; j++) {
      if (ahead === node) return true
      ahead = ahead.next
    }
    node = node.next
    i++
  }
  return false
}

/**
 * Approach 2 — hash set of visited nodes.  O(n) time, O(n) space.
 *
 * The obvious O(n) answer, and the one to say first in an interview because it
 * is impossible to get wrong. A Set keyed on the node OBJECT works because JS
 * Sets hash by reference for objects — two distinct nodes holding the same
 * value are two distinct entries.
 *
 * The O(n) memory is the only thing wrong with it, and that is what motivates
 * Floyd.
 */
function hasCycleSet(head) {
  const seen = new Set()
  for (let n = head; n; n = n.next) {
    if (seen.has(n)) return true
    seen.add(n)
  }
  return false
}

/**
 * Approach 3 — Floyd's tortoise and hare.  O(n) time, O(1) space.  ** optimal **
 *
 * Slow moves one node per step, fast moves two. If there is no cycle, fast
 * falls off the end and we stop. If there is one, they must meet — and the
 * argument for that is the part people skip:
 *
 *   Once slow enters the cycle, both pointers are inside a ring of length C.
 *   Measure the gap as how far fast is AHEAD of slow going forward around the
 *   ring, a number in 0..C-1. Each step fast gains exactly 2 and slow gains
 *   exactly 1, so the gap grows by exactly 1 per step, modulo C.
 *
 *   A quantity that changes by exactly 1 each step cannot step over a value.
 *   So from a starting gap d it reaches 0 after exactly C - d steps, and gap 0
 *   means the two pointers are on the same node. They meet, and they meet
 *   within C steps of slow entering the cycle.
 *
 * That is why the step sizes must differ by exactly 1. With 1 and 3 the gap
 * grows by 2 each step and can jump straight over 0 — on an even-length cycle
 * with an odd starting gap, those two pointers never meet.
 *
 * Total work: slow walks at most the tail plus one lap, so O(n).
 */
function hasCycle(head) {
  let slow = head, fast = head
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) return true
  }
  return false                  // fast hit null: a null terminator means no cycle
}

/**
 * Bonus — where does the cycle start?  O(n) time, O(1) space.
 *
 * Let L be the distance from head to the cycle entry, C the cycle length, and m
 * the distance from the entry to the meeting point. Slow has walked L + m; fast
 * has walked 2(L + m); their difference is a whole number of laps, so
 *
 *     L + m = kC   for some k >= 1     hence     L = kC - m
 *
 * Read that right-hand side as: from the meeting point, walking L more steps
 * covers m + L = kC, a whole number of laps, landing back on the entry. So a
 * pointer at head and a pointer at the meeting point, both moving one step at a
 * time, arrive at the entry together. No counting, no modulo in the code.
 */
function cycleStart(head) {
  let slow = head, fast = head
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) {
      let p = head
      while (p !== slow) { p = p.next; slow = slow.next }
      return p
    }
  }
  return null
}

module.exports = { hasCycle, hasCycleSet, hasCycleBrute, cycleStart }

/** Build a list and point the tail at index `pos`; pos < 0 leaves it null. */
function withCycle(vals, pos) {
  const head = toList(vals)
  if (!head) return head
  let tail = head
  while (tail.next) tail = tail.next
  if (pos >= 0) {
    let entry = head
    for (let i = 0; i < pos; i++) entry = entry.next
    tail.next = entry
  }
  return head
}

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const fn of [hasCycle, hasCycleSet, hasCycleBrute]) {
    eq(fn(withCycle([3, 2, 0, -4], 1)), true, `${fn.name} worked example`)
    eq(fn(withCycle([1, 2], 0)), true, `${fn.name} two-node cycle`)
    eq(fn(withCycle([1], 0)), true, `${fn.name} self-loop`)
    eq(fn(withCycle([1, 2, 3, 4], -1)), false, `${fn.name} no cycle`)
    eq(fn(withCycle([], -1)), false, `${fn.name} empty list`)
    eq(fn(withCycle([1], -1)), false, `${fn.name} single node, no cycle`)
    // Equal values are not a cycle — the check must be by reference.
    eq(fn(withCycle([1, 1, 1], -1)), false, `${fn.name} duplicate values are not a cycle`)
    // Odd-length cycle: the case that breaks a naive "they meet after one lap"
    // assumption, and the one a 1-and-3 step rule gets wrong.
    eq(fn(withCycle([1, 2, 3, 4, 5, 6, 7], 4)), true, `${fn.name} odd-length cycle`)
  }

  eq(cycleStart(withCycle([3, 2, 0, -4], 1)).val, 2, 'cycleStart finds the entry')
  eq(cycleStart(withCycle([1, 2], 0)).val, 1, 'cycleStart with entry at head')
  eq(cycleStart(withCycle([1, 2, 3], -1)), null, 'cycleStart returns null without a cycle')

  report('detect-cycle-in-a-linked-list')
}
