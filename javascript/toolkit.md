# The toolkit JS doesn't give you

Python ships `heapq`, `deque`, `Counter`, `defaultdict`. JavaScript ships none of
them. Here is what to write instead — short enough to reproduce in an interview.

---

## MinHeap / priority queue

Needed for: Merge K Sorted Lists, Top K Frequent, Find Median from Data Stream,
Dijkstra. This is the single biggest gap.

```js
class MinHeap {
  constructor(cmp = (a, b) => a - b) { this.h = []; this.cmp = cmp }
  get size() { return this.h.length }
  peek() { return this.h[0] }

  push(v) {
    this.h.push(v)
    let i = this.h.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (this.cmp(this.h[i], this.h[p]) >= 0) break
      [this.h[i], this.h[p]] = [this.h[p], this.h[i]]
      i = p
    }
  }

  pop() {
    const top = this.h[0], last = this.h.pop()
    if (this.h.length) {
      this.h[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1, r = l + 1
        let small = i
        if (l < this.h.length && this.cmp(this.h[l], this.h[small]) < 0) small = l
        if (r < this.h.length && this.cmp(this.h[r], this.h[small]) < 0) small = r
        if (small === i) break
        [this.h[i], this.h[small]] = [this.h[small], this.h[i]]
        i = small
      }
    }
    return top
  }
}
```

**Max-heap:** pass `(a, b) => b - a`.
**Heap of pairs:** `new MinHeap((a, b) => a[0] - b[0])`.

`push` and `pop` are O(log n), `peek` is O(1).

## Queue without O(n) shift

```js
class Queue {
  constructor() { this.items = []; this.head = 0 }
  get size() { return this.items.length - this.head }
  push(v) { this.items.push(v) }
  shift() {
    const v = this.items[this.head]
    this.items[this.head++] = undefined      // let it be collected
    if (this.head > 1000 && this.head * 2 > this.items.length) {
      this.items = this.items.slice(this.head); this.head = 0
    }
    return v
  }
}
```

In practice, a plain array with a moving index is enough for interview inputs:

```js
const q = [start]
for (let i = 0; i < q.length; i++) {
  const node = q[i]
  // ...push neighbours onto q
}
```

## Deque

Needed for: Sliding Window Maximum. A plain array works if you only push/pop at
both ends and `n` is interview-sized — `shift()` is O(n) but the window is small.
For correctness under scrutiny, use two indices over an array as above.

## Counter

```js
const count = new Map()
for (const c of s) count.set(c, (count.get(c) ?? 0) + 1)
```

For lowercase letters only, an array is faster and easier to reason about:

```js
const count = Array(26).fill(0)
for (const c of s) count[c.charCodeAt(0) - 97]++
```

## defaultdict(list)

```js
const graph = new Map()
const add = (u, v) => {
  if (!graph.has(u)) graph.set(u, [])
  graph.get(u).push(v)
}
```

Or, for integer nodes `0..n-1`, an adjacency array is simpler and faster:

```js
const graph = Array.from({ length: n }, () => [])
for (const [u, v] of edges) { graph[u].push(v); graph[v].push(u) }
```

## Union-Find (disjoint set)

Needed for: Number of Connected Components, Graph Valid Tree.

```js
class DSU {
  constructor(n) { this.p = Array.from({ length: n }, (_, i) => i); this.r = Array(n).fill(0); this.count = n }
  find(x) {
    while (this.p[x] !== x) { this.p[x] = this.p[this.p[x]]; x = this.p[x] }  // path halving
    return x
  }
  union(a, b) {
    const ra = this.find(a), rb = this.find(b)
    if (ra === rb) return false                    // already connected
    if (this.r[ra] < this.r[rb]) { this.p[ra] = rb }
    else if (this.r[ra] > this.r[rb]) { this.p[rb] = ra }
    else { this.p[rb] = ra; this.r[ra]++ }
    this.count--
    return true
  }
}
```

`union` returning `false` when already connected is what detects a cycle.

## Trie

Needed for: Implement Trie, Word Search II, Design Add and Search Words.

```js
class TrieNode {
  constructor() { this.children = new Map(); this.isWord = false }
}

class Trie {
  constructor() { this.root = new TrieNode() }
  insert(word) {
    let node = this.root
    for (const c of word) {
      if (!node.children.has(c)) node.children.set(c, new TrieNode())
      node = node.children.get(c)
    }
    node.isWord = true
  }
  _walk(word) {
    let node = this.root
    for (const c of word) {
      node = node.children.get(c)
      if (!node) return null
    }
    return node
  }
  search(word) { return this._walk(word)?.isWord ?? false }
  startsWith(prefix) { return this._walk(prefix) !== null }
}
```

## Linked list node

```js
class ListNode { constructor(val = 0, next = null) { this.val = val; this.next = next } }
class TreeNode { constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right } }
```

LeetCode provides these; write them yourself when practising locally.
