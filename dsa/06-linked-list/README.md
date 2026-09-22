# Linked List — 6 problems

| # | Problem | Difficulty | Brute | Optimal | Pattern |
|---|---|---|---|---|---|
| 40 | [Reverse a Linked List](40-reverse-a-linked-list.js) | Easy | O(n), O(n) space | **O(n), O(1)** | Pointer reversal |
| 41 | [Detect Cycle in a Linked List](41-detect-cycle-in-a-linked-list.js) | Easy | O(n²) | **O(n), O(1)** | Fast & slow pointers |
| 42 | [Merge Two Sorted Lists](42-merge-two-sorted-lists.js) | Easy | O((n+m) log(n+m)) | **O(n+m), O(1)** | Two pointers + dummy head |
| 43 | [Merge K Sorted Lists](43-merge-k-sorted-lists.js) | Hard | O(N log N) | **O(N log k)** | Heap / divide and conquer |
| 44 | [Remove Nth Node From End Of List](44-remove-nth-node-from-end-of-list.js) | Medium | O(L), O(L) space | **O(L), O(1), one pass** | Fixed-gap pointers |
| 45 | [Reorder List](45-reorder-list.js) | Medium | O(n²) | **O(n), O(1)** | Split + reverse + merge |

Run any file directly to check it: `node dsa/06-linked-list/45-reorder-list.js`

Merge K Sorted Lists also appears as #74 in the [Heap](../10-heap) category. It
is one problem and one file — this one.

---

## What this category is really teaching

**A singly linked list gives you one power and denies you two.** You can walk
forward. You cannot walk backward, and you cannot jump to an index. Every
problem here is a different trick for getting one of those two back without
paying O(n) memory for it.

**Three of the six are a fixed gap between two pointers.** Detect Cycle moves
them at different speeds; Remove Nth holds them a constant n apart; Reorder List
uses the speed difference to locate the middle. The shared idea: you cannot
count from the end of a list, but you can arrange for a second pointer to be a
known distance away and let it do the counting. Get comfortable with the exact
loop condition — `while (fast.next && fast.next.next)` versus `while (fast &&
fast.next)` is the difference between the first middle and the second, and both
of those problems care which one you land on.

**Two of the six are merging, and they are the same merge.** Merge Two Sorted
Lists is the primitive; Merge K Sorted Lists is the question of how to schedule
k-1 calls to it. Sequential merging costs O(N·k) because the accumulator grows
while its partner stays small. Pairing the lists up makes every merge balanced
and each node get traversed log k times instead of up to k. The heap attacks it
from the other side — instead of scheduling merges cleverly, it keeps only the k
current heads and asks which is smallest. Same O(N log k), different memory
profile: the heap needs O(k) and works on streams, the pairwise version needs
nothing and is faster in practice.

**Reverse is the primitive the rest are built from.** Reorder List imports it
directly. Once you can reverse a sublist in place with three pointers, the
"read the second half backwards" requirement stops being a memory problem.

**The dummy head is not a style choice.** Merge Two Sorted Lists and Remove Nth
both have a case where the answer's head is not the input's head. Without a
dummy, that case is a separate branch, and that branch is where the bug lives.
With one, every path through the code is identical and you return `dummy.next`.

## The JS-specific traps in this category

- **These functions destroy their input.** `reverseList(head)` leaves the
  original head pointing at null, and the merges splice nodes out of one list
  and into another. Every test in this folder rebuilds with `toList(...)` per
  approach — reusing one list across two approaches means the second one
  measures the wreckage the first left behind.

- **Identity, not equality.** `Set` and `Map` hash objects by reference, which
  is exactly what cycle detection needs: two distinct nodes both holding `1` are
  two distinct entries. Comparing `a.val === b.val` instead of `a === b` reports
  a cycle on `[1, 1]`.

- **A cyclic list is not printable.** `JSON.stringify` throws "Converting
  circular structure to JSON", and a hand-rolled walk like `fromList` simply
  never returns. A test that hangs instead of failing is usually a missing cut —
  the `slow.next = null` in Reorder List, or the `tail.next = null` after a
  k-way merge.

- **No tail-call optimisation.** V8 never shipped it, so the recursive versions
  of Reverse and Merge Two Sorted Lists are genuinely O(n) stack and throw
  `RangeError: Maximum call stack size exceeded` around ten thousand nodes.
  Write them because they explain the algorithm, then say out loud why you would
  ship the iterative one.

- **`?.` short-circuits to `undefined`, not `null`.** `fast?.next?.next` is
  compact and correct for guarding, but if you store the result, a falsy check
  is fine while `=== null` is not. The loops here spell the guards out for that
  reason.

- **`new ListNode()` defaults to `val = 0`**, which is what makes
  `new ListNode(0, head)` and a bare `new ListNode()` both usable as dummies.
  Do not read a dummy's value; it means nothing.
