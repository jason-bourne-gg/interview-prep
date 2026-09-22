# Binary — 5 problems

Bit manipulation looks like trivia until you see that four of these five come
from two ideas:

- **`n & (n - 1)` clears the lowest set bit** — subtracting 1 flips that bit to 0
  and everything below it to 1, so the AND erases exactly one bit.
- **XOR cancels pairs** — `x ^ x === 0`, so anything appearing twice vanishes.

| # | Problem | Difficulty | Brute | Optimal |
|---|---|---|---|---|
| 11 | [Sum of Two Integers](11-sum-of-two-integers.js) | Medium | — | **O(1)** |
| 12 | [Number of 1 Bits](12-number-of-1-bits.js) | Easy | O(32) | **O(set bits)** |
| 13 | [Counting Bits](13-counting-bits.js) | Easy | O(n log n) | **O(n)** |
| 14 | [Missing Number](14-missing-number.js) | Easy | O(n log n) | **O(n), O(1)** |
| 15 | [Reverse Bits](15-reverse-bits.js) | Easy | O(32) | **O(1)** |

---

## The JavaScript problem

**Bitwise operators coerce to 32-bit signed integers.** This is the single
biggest source of wrong answers in this category:

```js
1 << 31        // -2147483648   ← negative, not 2147483648
1 << 32        // 1             ← wraps
2 ** 32 | 0    // 0
```

Two rules that fix almost everything:

- **`>>>` not `>>`** when shifting a value you are treating as unsigned. The
  signed shift copies the sign bit down.
- **`>>> 0` on the way out** to read a result as unsigned. `<<` produces a signed
  value, so any result with the top bit set comes back negative.

Bitmask DP over more than 31 items needs a different representation entirely —
`BigInt`, or an array of words.

See [javascript/pitfalls.md](../../javascript/pitfalls.md) items 6 and 7.
