# The patterns

Blind 75 is not 75 problems. It is about 12 patterns, each appearing 4–8 times.
Learn to *recognise* the pattern from the problem statement and most of the list
collapses.

Read this before grinding. It is the difference between memorising 75 solutions
and being able to solve the 76th.

---

## How to recognise which pattern

| The problem says… | Reach for |
|---|---|
| "sorted array", "find a value", "minimise the maximum" | **Binary search** |
| "contiguous subarray/substring", "at most k" | **Sliding window** |
| "pair that sums to", sorted input, "in-place" | **Two pointers** |
| "has it appeared before", "count of" | **Hash map** |
| "next greater/smaller", "valid parentheses" | **Monotonic stack** |
| "top k", "k largest", "median of a stream" | **Heap** |
| "all paths", "connected", "islands", "course schedule" | **BFS / DFS / topological sort** |
| "maximum/minimum ways", overlapping subproblems | **Dynamic programming** |
| "merge", "overlap", "meeting rooms" | **Intervals (sort by start)** |
| "cycle", "middle", "kth from end" in a list | **Fast & slow pointers** |
| "prefix", "dictionary of words" | **Trie** |
| "in-place with O(1) extra" on a bounded range | **Index as a hash / sign marking** |

---

## 1. Two pointers

Two indices moving through a structure, usually inward from both ends or both
forward at different speeds.

```js
let l = 0, r = arr.length - 1
while (l < r) {
  const sum = arr[l] + arr[r]
  if (sum === target) return [l, r]
  sum < target ? l++ : r--          // only valid because arr is SORTED
}
```

**Why it works:** sorting gives you a monotonic relationship, so moving a pointer
tells you which direction the sum goes. Without sorted input, you need a hash map.

**In the list:** Two Sum II, 3Sum, Container With Most Water, Trapping Rain Water,
Valid Palindrome.

## 2. Sliding window

A window `[l, r]` that grows on the right and shrinks on the left. The invariant
is what makes it work — decide it before writing code.

```js
let l = 0, best = 0
const seen = new Map()
for (let r = 0; r < s.length; r++) {
  seen.set(s[r], (seen.get(s[r]) ?? 0) + 1)
  while (/* window is invalid */) {
    seen.set(s[l], seen.get(s[l]) - 1)
    if (seen.get(s[l]) === 0) seen.delete(s[l])
    l++
  }
  best = Math.max(best, r - l + 1)
}
```

**Fixed window:** shrink by exactly one each step. **Variable window:** shrink
while invalid.

Every element enters once and leaves once → **O(n)**, despite the nested loop.

**In the list:** Longest Substring Without Repeating Characters, Longest Repeating
Character Replacement, Minimum Window Substring, Best Time to Buy and Sell Stock.

## 3. Fast & slow pointers (Floyd)

```js
let slow = head, fast = head
while (fast?.next) {
  slow = slow.next
  fast = fast.next.next
  if (slow === fast) return true      // cycle
}
```

**Finding the cycle start:** after they meet, reset one pointer to `head` and
advance both one step at a time; they meet at the entry. **Finding the middle:**
when `fast` hits the end, `slow` is at the middle.

**In the list:** Linked List Cycle, Reorder List, Remove Nth Node, Find the
Duplicate Number.

## 4. Binary search

Not just "find a value in a sorted array". The real pattern is: **a boolean
predicate that flips exactly once** across the range.

```js
let lo = 0, hi = n - 1
while (lo <= hi) {
  const mid = lo + Math.floor((hi - lo) / 2)     // avoids overflow in other languages; habit worth keeping
  if (ok(mid)) hi = mid - 1
  else lo = mid + 1
}
return lo      // first index where ok() is true
```

**Getting the boundaries right is the whole difficulty.** Pick one template and
stick to it. With `while (lo <= hi)` and `hi = mid - 1`, `lo` ends at the first
`true`.

**Binary search on the answer:** when asked to minimise a maximum ("split array
into k parts, minimise the largest sum"), binary search over the *answer space*
and ask "is this achievable?"

**In the list:** Search in Rotated Sorted Array, Find Minimum in Rotated Sorted
Array, Median of Two Sorted Arrays.

## 5. Monotonic stack

A stack kept sorted. Pop while the incoming element breaks the order — the pop is
where the answer gets recorded.

```js
const stack = []                    // holds indices, values decreasing
for (let i = 0; i < n; i++) {
  while (stack.length && heights[stack.at(-1)] > heights[i]) {
    const h = heights[stack.pop()]
    const w = stack.length ? i - stack.at(-1) - 1 : i
    best = Math.max(best, h * w)
  }
  stack.push(i)
}
```

Each index is pushed once and popped once → **O(n)**.

**In the list:** Valid Parentheses, Largest Rectangle in Histogram, Daily
Temperatures.

## 6. Hash map for complement / seen-before

```js
const seen = new Map()
for (let i = 0; i < nums.length; i++) {
  if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i]
  seen.set(nums[i], i)
}
```

Trades O(n) space for dropping a nested loop. **Check before you insert**, or a
number can pair with itself.

**In the list:** Two Sum, Contains Duplicate, Group Anagrams, Longest Consecutive
Sequence.

## 7. Intervals

Sort by start, then sweep. Almost every interval problem is this.

```js
intervals.sort((a, b) => a[0] - b[0])
const out = [intervals[0]]
for (const [s, e] of intervals.slice(1)) {
  const last = out.at(-1)
  if (s <= last[1]) last[1] = Math.max(last[1], e)   // overlap → merge
  else out.push([s, e])
}
```

For "how many rooms/resources at once", use a **min-heap of end times**, or sweep
starts and ends separately.

**In the list:** Merge Intervals, Insert Interval, Non-overlapping Intervals,
Meeting Rooms I & II.

## 8. BFS / DFS on graphs and grids

```js
// BFS — shortest path in an UNWEIGHTED graph
const q = [start]; const dist = new Map([[start, 0]])
for (let i = 0; i < q.length; i++) {
  const node = q[i]
  for (const nxt of neighbours(node)) {
    if (dist.has(nxt)) continue
    dist.set(nxt, dist.get(node) + 1)
    q.push(nxt)
  }
}
```

**BFS for shortest path, DFS for "does a path exist" / connectivity / cycles.**

Grid directions:

```js
const DIRS = [[0,1],[0,-1],[1,0],[-1,0]]
for (const [dr, dc] of DIRS) {
  const nr = r + dr, nc = c + dc
  if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
  // ...
}
```

**Mark visited when you enqueue, not when you dequeue** — otherwise a node can be
queued many times.

**In the list:** Number of Islands, Clone Graph, Pacific Atlantic Water Flow,
Course Schedule, Word Ladder.

## 9. Topological sort

For "can this be ordered / is there a cycle" in a directed graph.

```js
const indeg = Array(n).fill(0)
for (const [a, b] of edges) indeg[a]++          // b → a
const q = []
for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i)
let seen = 0
for (let i = 0; i < q.length; i++) {
  seen++
  for (const nxt of graph[q[i]]) if (--indeg[nxt] === 0) q.push(nxt)
}
return seen === n          // false ⇒ there is a cycle
```

**In the list:** Course Schedule, Alien Dictionary.

## 10. Dynamic programming

Two questions, in this order:

1. **What is the state?** What do I need to know to make the next decision?
2. **What is the transition?** How does a bigger state depend on smaller ones?

Write the recursion with memoisation first, then convert to a table if asked.

```js
// 1-D: state = "best answer considering the first i items"
const dp = Array(n + 1).fill(0)
for (let i = 1; i <= n; i++) dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i - 1])
```

Common shapes:
- **Linear** — House Robber, Climbing Stairs, Decode Ways
- **Knapsack** — Coin Change, Partition Equal Subset Sum
- **On strings (2-D)** — Edit Distance, Longest Common Subsequence
- **On intervals** — Burst Balloons
- **Bitmask** — Travelling Salesman (rare in interviews)

**Space optimisation:** if `dp[i]` only reads `dp[i-1]` and `dp[i-2]`, keep two
variables instead of an array. Say this even if you do not implement it.

## 11. Backtracking

DFS over decisions, undoing after each branch.

```js
const res = []
const path = []
function backtrack(start) {
  res.push([...path])                // copy — path keeps mutating
  for (let i = start; i < nums.length; i++) {
    path.push(nums[i])
    backtrack(i + 1)
    path.pop()                        // undo
  }
}
```

**Pruning is what makes it fast enough.** Sorting first often lets you `break`
early and skip duplicates.

**In the list:** Combination Sum, Word Search, Subsets, Permutations, N-Queens.

## 12. Trie

When the input is a set of words and you need prefixes. Turns "check 10,000 words
against this board" into one traversal.

**In the list:** Implement Trie, Design Add and Search Words, Word Search II.

---

## Complexity, quickly

| n | What fits in ~1 second |
|---|---|
| ≤ 10 | O(n!) — permutations |
| ≤ 20 | O(2ⁿ) — subsets, bitmask DP |
| ≤ 500 | O(n³) |
| ≤ 5,000 | O(n²) |
| ≤ 10⁶ | O(n log n) |
| ≤ 10⁸ | O(n) |

Read the constraints **first**. They tell you the intended complexity, which
tells you the pattern.
