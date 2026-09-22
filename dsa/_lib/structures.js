'use strict'
/**
 * The data structures JavaScript does not ship.
 *
 * Python gives you heapq, deque, Counter and defaultdict. JS gives you none of
 * them, so these get written from memory in interviews. They are short on
 * purpose — you should be able to reproduce any of them on a whiteboard.
 */

/** Binary min-heap. Pass a comparator for max-heaps or heaps of pairs. */
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
      ;[this.h[i], this.h[p]] = [this.h[p], this.h[i]]
      i = p
    }
  }

  pop() {
    const top = this.h[0]
    const last = this.h.pop()
    if (this.h.length) {
      this.h[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1, r = l + 1
        let small = i
        if (l < this.h.length && this.cmp(this.h[l], this.h[small]) < 0) small = l
        if (r < this.h.length && this.cmp(this.h[r], this.h[small]) < 0) small = r
        if (small === i) break
        ;[this.h[i], this.h[small]] = [this.h[small], this.h[i]]
        i = small
      }
    }
    return top
  }
}

/**
 * Union-Find with path halving and union by rank.
 *
 * union() returns false when the two are already connected — that return value
 * is what detects a cycle, and is the point of the structure in most problems.
 */
class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i)
    this.rank = Array(n).fill(0)
    this.count = n
  }
  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]   // path halving
      x = this.parent[x]
    }
    return x
  }
  union(a, b) {
    const ra = this.find(a), rb = this.find(b)
    if (ra === rb) return false
    if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb
    else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra
    else { this.parent[rb] = ra; this.rank[ra]++ }
    this.count--
    return true
  }
}

/** Singly linked list node. */
class ListNode {
  constructor(val = 0, next = null) { this.val = val; this.next = next }
}

/** Binary tree node. */
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val; this.left = left; this.right = right
  }
}

/** Build a linked list from an array, and read one back. */
const toList = arr => arr.reduceRight((next, val) => new ListNode(val, next), null)
const fromList = head => { const out = []; while (head) { out.push(head.val); head = head.next } return out }

/**
 * Build a binary tree from a level-order array, using null for a missing child.
 * Matches the notation used in problem statements.
 */
function toTree(arr) {
  if (!arr.length || arr[0] == null) return null
  const root = new TreeNode(arr[0])
  const queue = [root]
  let i = 1
  while (i < arr.length) {
    const node = queue.shift()
    if (i < arr.length && arr[i] != null) { node.left = new TreeNode(arr[i]); queue.push(node.left) }
    i++
    if (i < arr.length && arr[i] != null) { node.right = new TreeNode(arr[i]); queue.push(node.right) }
    i++
  }
  return root
}

module.exports = { MinHeap, DSU, ListNode, TreeNode, toList, fromList, toTree }
