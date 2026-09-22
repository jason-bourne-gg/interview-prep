# Heap — 3 problems

| # | Problem | Difficulty | Brute | Optimal | Pattern |
|---|---|---|---|---|---|
| 74 | [Merge K Sorted Lists](74-merge-k-sorted-lists.js) | Hard | O(N log N) | **O(N log k)** | k-way merge |
| 75 | [Top K Frequent Elements](75-top-k-frequent-elements.js) | Medium | O(n log n) | **O(n)** | Bucket sort (heap is the runner-up) |
| 76 | [Find Median from Data Stream](76-find-median-from-data-stream.js) | Hard | O(n log n) per query | **O(log n) add, O(1) query** | Two heaps |

Run any file directly to check it: `node dsa/10-heap/75-top-k-frequent-elements.js`

#74 is the duplicate in the Blind 75 — the list has 76 entries and 75 distinct
problems. The implementation lives in
[06-linked-list/43](../06-linked-list/43-merge-k-sorted-lists.js); the file here
re-exports it and explains what changes when you read the same problem as a
k-way merge instead of as pointer surgery.

JavaScript has no heap, so all three use `MinHeap` from
[_lib/structures.js](../_lib/structures.js). Reproducing it from memory is part
of the drill — sift up on push, sift down on pop, about twenty lines.

---

## What this category is really teaching

**A heap is not for sorting. It is for the question "what is the smallest thing
right now?", asked over and over while the contents keep changing.** Every
problem here is that question wearing a different hat:

- **#74** — what is the smallest unconsumed item across k sorted sources? Hold
  only the k current fronts. The heap never grows past k no matter how long the
  sources are, which is why this is the version that works on streams too large
  to hold.
- **#75** — is this item better than the worst one I am keeping? Hold k items in
  a **min**-heap, so the weakest survivor is at the root and evicting it is O(log k).
- **#76** — what is in the middle? Hold two heaps pointed at each other, so both
  candidates for the middle sit at a root.

**The recurring move is: keep a bounded window of candidates, not the whole
dataset in order.** Approach 2 of #76 spells out why that wins — maintaining a
total order over n elements is work the answer never reads. Sorting gives you
rank for everything; these problems need rank for two or three things.

**A max-heap is a min-heap with an inverted comparator.** `new MinHeap((a, b) =>
b - a)`. #76 uses both orientations of the same class. Write a second class in an
interview and you have spent five minutes proving nothing.

**Bucket sort beats the heap in #75, which surprises people.** "Top k" is taught
as the heap problem, and the heap is the right reflex — but a count in an array
of length n is an integer in 1..n, and comparison sorting exists to order
*unbounded* keys. When the key is a small bounded integer you index by it instead
of comparing, and O(n log k) becomes O(n). The condition to check before reaching
for it: bounded integer keys, and the whole dataset in hand. Top k by float
score, or top k over a stream you cannot store, gives you no bucket index and
puts you straight back on the heap.

## The JS-specific traps in this category

- **There is no built-in heap.** No `heapq`, no `PriorityQueue`. `Array.sort()`
  inside a loop is the tempting substitute and it turns an O(n log k) solution
  into O(n² log n).
- **`sort()` without a comparator is lexicographic.** `[10, 9].sort()` is
  `[10, 9]`. Every sort in this folder passes `(a, b) => a - b`, and so does
  every heap comparator.
- **Comparator direction is the whole bug surface.** `(a, b) => a - b` is a
  min-heap, `(a, b) => b - a` is a max-heap, and in #75 the comparison is on
  `entry[1]` (the count) while the answer is `entry[0]` (the value). Reading the
  wrong slot returns a plausible-looking wrong answer rather than crashing.
- **`heap.pop()` on an empty heap returns `undefined`, it does not throw.** The
  `undefined` propagates into arithmetic and you get `NaN` several lines later,
  far from the cause. Guard on `heap.size`.
- **Integer division is not `/`.** `n / 2` on an odd `n` is a fraction; the
  middle index is `n >> 1` or `Math.floor(n / 2)`. In #76 the median genuinely is
  fractional half the time, so the two cases sit right next to each other and are
  easy to confuse.
- **`splice` looks like an insert and costs a copy.** #76's sorted-array approach
  finds the slot in O(log n) and then shifts every element after it, so the add
  is O(n). The binary search does not make it fast.
