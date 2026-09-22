# Array — 10 problems

Every problem shows the approaches in the order you would actually reach them in
an interview: say the brute force, state its cost, then improve it. Interviewers
want to see the ladder, not just the top rung.

| # | Problem | Difficulty | Brute | Optimal |
|---|---|---|---|---|
| 1 | [Two Sum](https://leetcode.com/problems/two-sum/) | Easy | O(n²) | O(n) |
| 2 | [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) | Easy | O(n²) | O(n) |
| 3 | [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/) | Easy | O(n²) | O(n) |
| 4 | [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/) | Medium | O(n²) | O(n), O(1) extra |
| 5 | [Maximum Subarray](https://leetcode.com/problems/maximum-subarray/) | Medium | O(n³) | O(n) |
| 6 | [Maximum Product Subarray](https://leetcode.com/problems/maximum-product-subarray/) | Medium | O(n²) | O(n) |
| 7 | [Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) | Medium | O(n) | O(log n) |
| 8 | [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) | Medium | O(n) | O(log n) |
| 9 | [3Sum](https://leetcode.com/problems/3sum/) | Medium | O(n³) | O(n²) |
| 10 | [Container With Most Water](https://leetcode.com/problems/container-with-most-water/) | Medium | O(n²) | O(n) |

---

## 1. Two Sum

Return indices of the two numbers adding to `target`.

### Approach 1 — brute force · O(n²) time, O(1) space

Try every pair.

```js
function twoSumBrute(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j]
    }
  }
  return []
}
```

*Why it's slow:* for each `i` we re-scan the whole tail looking for one value.
That is a **search**, and searching is what hash maps are for.

### Approach 2 — sort + two pointers · O(n log n) time, O(n) space

```js
function twoSumSorted(nums, target) {
  const idx = nums.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0])
  let l = 0, r = idx.length - 1
  while (l < r) {
    const sum = idx[l][0] + idx[r][0]
    if (sum === target) return [idx[l][1], idx[r][1]]
    sum < target ? l++ : r--
  }
  return []
}
```

*Worth knowing* because it is the required answer for **Two Sum II** (input
already sorted, O(1) space). Here it is worse than the hash map — we pay
O(n log n) to sort, and we must carry original indices.

### Approach 3 — hash map · O(n) time, O(n) space ✅

As you walk, you already know what you need: `target - nums[i]`. Ask whether you
have seen it.

```js
function twoSum(nums, target) {
  const seen = new Map()                 // value → index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    if (seen.has(need)) return [seen.get(need), i]
    seen.set(nums[i], i)                 // insert AFTER checking
  }
  return []
}
```

**Gotcha.** Insert after checking. With `[3, 3]` and target `6`, inserting first
lets `3` match itself at the same index.

---

## 2. Best Time to Buy and Sell Stock

One buy, one later sell. Maximise profit.

### Approach 1 — brute force · O(n²) / O(1)

```js
function maxProfitBrute(prices) {
  let best = 0
  for (let i = 0; i < prices.length; i++)
    for (let j = i + 1; j < prices.length; j++)
      best = Math.max(best, prices[j] - prices[i])
  return best
}
```

### Approach 2 — one pass · O(n) / O(1) ✅

The best profit *ending today* is today's price minus the cheapest price so far.
You never need the inner loop, because the running minimum already holds it.

```js
function maxProfit(prices) {
  let min = Infinity, best = 0
  for (const p of prices) {
    min = Math.min(min, p)
    best = Math.max(best, p - min)       // min is always from an earlier day
  }
  return best
}
```

**Gotcha.** Update `min` first. Buying and selling the same day yields 0, which
is correct; selling before buying is not, and this ordering prevents it.

---

## 3. Contains Duplicate

### Approach 1 — brute force · O(n²) / O(1)

```js
function containsDuplicateBrute(nums) {
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      if (nums[i] === nums[j]) return true
  return false
}
```

### Approach 2 — sort · O(n log n) time, O(1) extra

```js
function containsDuplicateSort(nums) {
  const a = [...nums].sort((x, y) => x - y)
  for (let i = 1; i < a.length; i++) if (a[i] === a[i - 1]) return true
  return false
}
```

*The answer when the interviewer says "now do it in O(1) space".*

### Approach 3 — set · O(n) / O(n) ✅

```js
function containsDuplicate(nums) {
  return new Set(nums).size !== nums.length
}
```

Or short-circuit early, which is better on a long array with an early duplicate:

```js
function containsDuplicateEarly(nums) {
  const seen = new Set()
  for (const n of nums) {
    if (seen.has(n)) return true
    seen.add(n)
  }
  return false
}
```

---

## 4. Product of Array Except Self

`out[i]` = product of everything except `nums[i]`. **No division.** O(n).

### Approach 1 — brute force · O(n²) / O(1)

```js
function productExceptSelfBrute(nums) {
  return nums.map((_, i) =>
    nums.reduce((acc, v, j) => (j === i ? acc : acc * v), 1))
}
```

### Approach 2 — division · O(n) / O(1) — but disallowed, and fragile

```js
// total product ÷ nums[i] — breaks on zeros, and the question forbids it
```

Worth *mentioning* to show you spotted it, then explaining why it fails: one zero
makes every other entry 0 and the zero's own entry undefined; two zeros make
everything 0. Handling that needs a zero count, at which point the two-pass
version below is simpler.

### Approach 3 — prefix and suffix arrays · O(n) / O(n)

Everything-except-`i` = (product of all left of `i`) × (product of all right).

```js
function productExceptSelfArrays(nums) {
  const n = nums.length
  const left = Array(n).fill(1), right = Array(n).fill(1)
  for (let i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1]
  for (let i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1]
  return nums.map((_, i) => left[i] * right[i])
}
```

### Approach 4 — two passes, O(1) extra ✅

Same idea, but accumulate into the output array instead of keeping both sides.

```js
function productExceptSelf(nums) {
  const n = nums.length
  const out = Array(n).fill(1)

  let left = 1
  for (let i = 0; i < n; i++) { out[i] = left; left *= nums[i] }

  let right = 1
  for (let i = n - 1; i >= 0; i--) { out[i] *= right; right *= nums[i] }

  return out
}
```

**O(n) time, O(1) extra** — the output does not count against space, and saying
that explicitly is part of the answer.

---

## 5. Maximum Subarray

Largest sum of a contiguous subarray.

### Approach 1 — brute force · O(n³) / O(1)

Every `(i, j)` pair, summing each from scratch.

```js
function maxSubArrayBrute(nums) {
  let best = -Infinity
  for (let i = 0; i < nums.length; i++)
    for (let j = i; j < nums.length; j++) {
      let sum = 0
      for (let k = i; k <= j; k++) sum += nums[k]
      best = Math.max(best, sum)
    }
  return best
}
```

### Approach 2 — running sum · O(n²) / O(1)

The inner sum is recomputed from scratch for no reason.

```js
function maxSubArrayN2(nums) {
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    let sum = 0
    for (let j = i; j < nums.length; j++) { sum += nums[j]; best = Math.max(best, sum) }
  }
  return best
}
```

### Approach 3 — Kadane · O(n) / O(1) ✅

One question per element: *is the running sum helping?* If it has gone negative
it can only drag the next element down — drop it.

```js
function maxSubArray(nums) {
  let best = nums[0], cur = nums[0]
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i])   // start fresh, or extend
    best = Math.max(best, cur)
  }
  return best
}
```

**Gotcha.** Initialise to `nums[0]`, not `0`. An all-negative array must return
its largest element.

### Approach 4 — divide and conquer · O(n log n)

Asked occasionally to test recursion: the answer is entirely in the left half,
entirely in the right, or crosses the middle. Slower than Kadane, so mention it
and move on.

---

## 6. Maximum Product Subarray

### Approach 1 — brute force · O(n²) / O(1)

```js
function maxProductBrute(nums) {
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    let p = 1
    for (let j = i; j < nums.length; j++) { p *= nums[j]; best = Math.max(best, p) }
  }
  return best
}
```

### Approach 2 — track max and min · O(n) / O(1) ✅

Kadane breaks here: a large **negative** product becomes the largest positive the
moment it meets another negative. So carry both extremes, and swap them when the
current number is negative.

```js
function maxProduct(nums) {
  let best = nums[0], curMax = nums[0], curMin = nums[0]
  for (let i = 1; i < nums.length; i++) {
    const n = nums[i]
    if (n < 0) [curMax, curMin] = [curMin, curMax]   // negative flips the roles
    curMax = Math.max(n, curMax * n)
    curMin = Math.min(n, curMin * n)
    best = Math.max(best, curMax)
  }
  return best
}
```

**Zeros** reset both, because `Math.max(n, ...)` prefers starting fresh at `0`
over any product dragged through it.

---

## 7. Find Minimum in Rotated Sorted Array

### Approach 1 — linear scan · O(n) / O(1)

```js
const findMinBrute = nums => Math.min(...nums)
```

Correct, and worth saying — then note the sorted-ness is being wasted, which
means binary search.

### Approach 2 — binary search · O(log n) / O(1) ✅

The array is two sorted runs. Compare `mid` against `hi`: if `nums[mid] >
nums[hi]`, the wrap point is to the right.

```js
function findMin(nums) {
  let lo = 0, hi = nums.length - 1
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (nums[mid] > nums[hi]) lo = mid + 1    // minimum is right of mid
    else hi = mid                             // mid could BE the minimum
  }
  return nums[lo]
}
```

**Gotcha.** Compare to `hi`, not `lo` — comparing to `lo` fails on a
non-rotated array. And `hi = mid`, not `mid - 1`, because `mid` is a candidate.

---

## 8. Search in Rotated Sorted Array

### Approach 1 — linear scan · O(n) / O(1)

`nums.indexOf(target)`. Say it, then improve it.

### Approach 2 — find the pivot, then binary search · O(log n), two passes

Find the rotation point with the previous problem, then binary search the correct
half. Correct and easy to reason about — a good answer if you are short on time.

### Approach 3 — one-pass binary search · O(log n) / O(1) ✅

At any `mid`, **one half is guaranteed sorted**. Work out which, then ask whether
the target lies inside it.

```js
function search(nums, target) {
  let lo = 0, hi = nums.length - 1
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (nums[mid] === target) return mid

    if (nums[lo] <= nums[mid]) {                 // left half sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1
      else lo = mid + 1
    } else {                                     // right half sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1
      else hi = mid - 1
    }
  }
  return -1
}
```

**Gotcha.** `nums[lo] <= nums[mid]` needs the `=` for a two-element window where
`lo` and `mid` are the same index.

---

## 9. 3Sum

All **unique** triplets summing to zero.

### Approach 1 — brute force · O(n³) / O(n)

Three nested loops, dedupe with a Set of sorted triplets. Correct, far too slow,
and the dedupe is clumsy — which motivates sorting.

```js
function threeSumBrute(nums) {
  const set = new Set()
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      for (let k = j + 1; k < nums.length; k++)
        if (nums[i] + nums[j] + nums[k] === 0)
          set.add([nums[i], nums[j], nums[k]].sort((a, b) => a - b).join(','))
  return [...set].map(s => s.split(',').map(Number))
}
```

### Approach 2 — fix one, hash the rest · O(n²) time, O(n) space

For each `i`, run Two Sum on the remainder. Works, but deduping is still awkward.

### Approach 3 — sort + two pointers · O(n²) time, O(1) extra ✅

Sorting buys two things: the two-pointer scan, and cheap duplicate skipping.

```js
function threeSum(nums) {
  nums.sort((a, b) => a - b)                  // comparator! see pitfalls #1
  const res = []

  for (let i = 0; i < nums.length - 2; i++) {
    if (nums[i] > 0) break                            // sorted: can't reach 0
    if (i > 0 && nums[i] === nums[i - 1]) continue    // skip duplicate anchors

    let l = i + 1, r = nums.length - 1
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r]
      if (sum < 0) l++
      else if (sum > 0) r--
      else {
        res.push([nums[i], nums[l], nums[r]])
        while (l < r && nums[l] === nums[l + 1]) l++   // skip duplicate pairs
        while (l < r && nums[r] === nums[r - 1]) r--
        l++; r--
      }
    }
  }
  return res
}
```

**The three duplicate skips are the question.** Finding the triplets is easy;
returning them uniquely without a Set is what is being tested.

---

## 10. Container With Most Water

### Approach 1 — brute force · O(n²) / O(1)

```js
function maxAreaBrute(height) {
  let best = 0
  for (let i = 0; i < height.length; i++)
    for (let j = i + 1; j < height.length; j++)
      best = Math.max(best, Math.min(height[i], height[j]) * (j - i))
  return best
}
```

### Approach 2 — two pointers · O(n) / O(1) ✅

Start at the widest pair. Width only shrinks from here, so the only way to
improve is a taller line. Moving the **taller** pointer cannot help — the shorter
one still caps the height — so always move the shorter.

```js
function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0
  while (l < r) {
    best = Math.max(best, Math.min(height[l], height[r]) * (r - l))
    if (height[l] < height[r]) l++      // move the SHORTER line
    else r--
  }
  return best
}
```

**Be ready to justify why discarding the shorter line is safe** — that argument
*is* the interview. Any container using it with a narrower partner is both
shorter and thinner, so it can never beat what we just recorded.
