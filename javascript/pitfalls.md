# 20 JavaScript pitfalls that break correct algorithms

Each one is a real bug, not a style note. They are ordered by how often they
cost people a question.

---

## 1. `sort()` is lexicographic by default

```js
[10, 9, 1].sort()            // [1, 10, 9]   ← string comparison
[10, 9, 1].sort((a, b) => a - b)   // [1, 9, 10]  ✅
```

**Always pass a comparator for numbers.** This is the single most common cause
of a "my solution is right but fails" moment.

Sorting objects or pairs:

```js
intervals.sort((a, b) => a[0] - b[0])              // by start
people.sort((a, b) => b.height - a.height || a.k - b.k)  // height desc, then k asc
```

The `||` trick works because a `0` comparison is falsy, so it falls through to
the tiebreaker.

## 2. `sort()` mutates

```js
const sorted = arr.sort((a, b) => a - b)   // arr is now sorted too
const sorted = [...arr].sort((a, b) => a - b)   // ✅ if you need the original
```

Matters when you sort inside a loop over the original array.

## 3. There is no integer division

```js
5 / 2            // 2.5
Math.floor(5 / 2)   // 2   ✅
(5 / 2) | 0         // 2   — fast, but breaks above 2^31
5 >> 1              // 2   — same limit
```

Binary search mid, tree indices, and `n/2` recursions all need `Math.floor`.
`| 0` and `>> 1` silently corrupt anything past ~2.1 billion.

## 4. `Math.floor` on negatives is not truncation

```js
Math.floor(-5 / 2)    // -3   (floor)
Math.trunc(-5 / 2)    // -2   (toward zero)
-5 / 2 | 0            // -2
```

Pick deliberately. For "how many buckets of size k", `Math.ceil` is usually what
you actually mean.

## 5. `%` returns a negative for negative operands

```js
-1 % 3      // -1, not 2
((-1 % 3) + 3) % 3   // 2  ✅
```

Bites in circular-array problems and hashing.

## 6. Numbers lose precision past `2^53`

```js
Number.MAX_SAFE_INTEGER      // 9007199254740991
9007199254740992 === 9007199254740993   // true  😱
```

If a problem says "the answer may be large, return it modulo 1e9+7", do the
modulo **inside** the loop, not at the end. For genuinely huge values use
`BigInt` (`10n ** 20n`), but note `BigInt` and `Number` never mix without a cast.

## 7. Bitwise operators are 32-bit

```js
1 << 31          // -2147483648  (sign bit)
1 << 32          // 1            (wraps)
2 ** 32 | 0      // 0
```

Bitmask DP over more than 31 items needs a different representation.

## 8. `Array(n)` gives holes, not values

```js
Array(3)                    // [ <3 empty items> ]
Array(3).map(x => 0)        // [ <3 empty items> ]  — map skips holes!
Array(3).fill(0)            // [0, 0, 0]  ✅
Array.from({ length: 3 }, () => 0)   // [0, 0, 0]  ✅
```

## 9. `fill` with an object shares one reference

```js
const grid = Array(3).fill([])      // all three are THE SAME array
grid[0].push(1)                     // grid[1] is [1] too

const grid = Array.from({ length: 3 }, () => [])   // ✅ three distinct arrays
```

The classic 2-D DP bug:

```js
const dp = Array(m).fill(Array(n).fill(0))                      // ✗ broken
const dp = Array.from({ length: m }, () => Array(n).fill(0))    // ✅
```

## 10. `delete arr[i]` leaves a hole

```js
const a = [1, 2, 3]
delete a[1]        // [1, <1 empty>, 3]  — length is still 3
a.splice(1, 1)     // [1, 3]  ✅
```

## 11. Objects stringify their keys

```js
const m = {}
m[1] = 'a'
Object.keys(m)     // ['1']  — a string
```

Use a `Map` when keys are numbers, tuples or objects, and you need them back in
their original type. `Map` also preserves insertion order and has `.size`.

## 12. `Set`/`Map` compare objects by reference

```js
new Set([[1,2], [1,2]]).size    // 2 — two distinct arrays
```

To deduplicate coordinate pairs, key on a primitive: `` `${r},${c}` `` or
`r * COLS + c`.

## 13. `for...in` iterates keys, and inherited ones

```js
for (const x of [10, 20]) { }   // 10, 20  ✅ values
for (const i in [10, 20]) { }   // '0', '1'  — string indices
```

Use `for...of` for values, `.entries()` for both:

```js
for (const [i, v] of arr.entries()) { }
```

## 14. `NaN` breaks every comparison

```js
NaN === NaN            // false
[NaN].includes(NaN)    // true   (uses SameValueZero)
[NaN].indexOf(NaN)     // -1     (uses ===)
```

`Math.max()` of an empty array is `-Infinity`; `Math.max(...[])` is too. Guard
before spreading a possibly-empty array.

## 15. Spread blows the stack on large arrays

```js
Math.max(...bigArray)     // RangeError past ~100k elements
bigArray.reduce((a, b) => Math.max(a, b), -Infinity)   // ✅
```

Same for `arr.push(...other)` — use a loop or `concat` for large inputs.

## 16. `shift()` is O(n)

```js
while (queue.length) {
  const node = queue.shift()    // O(n) each time → O(n²) BFS
}
```

Use an index pointer instead:

```js
let head = 0
while (head < queue.length) {
  const node = queue[head++]
}
```

For interviews this is usually accepted either way, but say it out loud — it is
exactly the kind of thing an interviewer is listening for.

## 17. String concatenation in a loop

Strings are immutable, so `s += c` in a loop is O(n²) in the worst case. Build
an array and `join('')`.

## 18. `str.split('').reverse().join('')` breaks on emoji

```js
'👍'.length          // 2  — surrogate pair
[...'👍'].length     // 1  ✅ spread is code-point aware
```

Rarely tested, occasionally the whole point of the question.

## 19. Closures in loops — `var` vs `let`

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i))   // 3 3 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i))   // 0 1 2
```

`var` is function-scoped, so all three closures share one binding. `let` creates
a fresh binding per iteration. This is also a favourite standalone question.

## 20. Recursion depth is ~10k

Node blows the stack around 10,000–15,000 frames. A DFS over a 10⁵-node
linked-list-shaped graph will overflow. Convert to an explicit stack when `n`
can be large — and mention that you would, even if you write the recursive one.

---

## Two more worth knowing

**`==` coerces, `===` does not.** Use `===` always. The exception worth knowing:
`x == null` is a neat check for "null or undefined" and nothing else.

**Optional chaining short-circuits.** `a?.b.c` returns `undefined` if `a` is
nullish — it does not then throw on `.c`.
