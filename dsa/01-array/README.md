# Array — 10 problems

| # | Problem | Difficulty | Brute | Optimal | Pattern |
|---|---|---|---|---|---|
| 1 | [Two Sum](01-two-sum.js) | Easy | O(n²) | **O(n)** | Hash map |
| 2 | [Best Time to Buy and Sell Stock](02-best-time-to-buy-and-sell-stock.js) | Easy | O(n²) | **O(n)** | Running min |
| 3 | [Contains Duplicate](03-contains-duplicate.js) | Easy | O(n²) | **O(n)** | Set |
| 4 | [Product of Array Except Self](04-product-of-array-except-self.js) | Medium | O(n²) | **O(n), O(1) extra** | Prefix/suffix |
| 5 | [Maximum Subarray](05-maximum-subarray.js) | Medium | O(n³) | **O(n)** | Kadane |
| 6 | [Maximum Product Subarray](06-maximum-product-subarray.js) | Medium | O(n²) | **O(n)** | Kadane + min |
| 7 | [Find Minimum in Rotated Sorted Array](07-find-minimum-in-rotated-sorted-array.js) | Medium | O(n) | **O(log n)** | Binary search |
| 8 | [Search in Rotated Sorted Array](08-search-in-rotated-sorted-array.js) | Medium | O(n) | **O(log n)** | Binary search |
| 9 | [3Sum](09-3sum.js) | Medium | O(n³) | **O(n²)** | Sort + two pointers |
| 10 | [Container With Most Water](10-container-with-most-water.js) | Medium | O(n²) | **O(n)** | Two pointers |

Run any file directly to check it: `node dsa/01-array/09-3sum.js`

---

## What this category is really teaching

**Three of these ten are "remove the inner loop".** Two Sum, Best Time to Buy,
and Contains Duplicate all start as O(n²) where the inner loop is a *search*.
Recognising a search inside a loop — and replacing it with a hash map or a
running value — is the single most reusable move in the list.

**Two are Kadane.** Maximum Subarray asks the question "is my running total
helping?"; Maximum Product adds the twist that a large negative is an asset, not
junk, because the next negative flips it.

**Two are binary search on a broken invariant.** The rotated-array pair are the
same insight: the array is two sorted runs, so at any midpoint one side is
sorted and you can reason about which side the answer is on.

**Two are two pointers**, and both hinge on an argument you have to be able to
defend out loud: in 3Sum, why sorting lets you skip duplicates safely; in
Container With Most Water, why discarding the shorter line can never lose the
answer.

## The JS-specific traps in this category

- `sort()` without a comparator is **lexicographic** — `[10, 9].sort()` is
  `[10, 9]`. Every sort in this folder passes `(a, b) => a - b`.
- `sort()` **mutates**. 3Sum and Contains Duplicate copy first with `[...nums]`.
- Kadane must start at `nums[0]`, not `0`, or an all-negative array returns 0.

See [javascript/pitfalls.md](../../javascript/pitfalls.md) for the full list.
