# String — 10 problems

| # | Problem | Difficulty | Brute | Optimal | Pattern |
|---|---|---|---|---|---|
| 50 | [Longest Substring Without Repeating Characters](50-longest-substring-without-repeating-characters.js) | Medium | O(n³) | **O(n)** | Sliding window |
| 51 | [Longest Repeating Character Replacement](51-longest-repeating-character-replacement.js) | Medium | O(n²) | **O(n)** | Sliding window |
| 52 | [Minimum Window Substring](52-minimum-window-substring.js) | Hard | O(n²) | **O(n + m)** | Sliding window |
| 53 | [Valid Anagram](53-valid-anagram.js) | Easy | O(n log n) | **O(n)** | Hash map (counting) |
| 54 | [Group Anagrams](54-group-anagrams.js) | Medium | O(n²k) | **O(nk)** | Hash map (canonical key) |
| 55 | [Valid Parentheses](55-valid-parentheses.js) | Easy | O(n²) | **O(n)** | Stack |
| 56 | [Valid Palindrome](56-valid-palindrome.js) | Easy | O(n), O(n) space | **O(n), O(1) space** | Two pointers |
| 57 | [Longest Palindromic Substring](57-longest-palindromic-substring.js) | Medium | O(n³) | **O(n²), O(1) space** | Expand around centre |
| 58 | [Palindromic Substrings](58-palindromic-substrings.js) | Medium | O(n³) | **O(n²), O(1) space** | Expand around centre |
| 59 | [Encode and Decode Strings](59-encode-and-decode-strings.js) | Medium | O(n), incorrect | **O(n)** | Length-prefix framing |

Run any file directly to check it: `node dsa/08-string/52-minimum-window-substring.js`

---

## What this category is really teaching

**Three of these ten are the same window.** 50, 51 and 52 share one skeleton:

```js
let l = 0
for (let r = 0; r < s.length; r++) {
  add(s[r])
  while (/* window is invalid */) { remove(s[l]); l++ }
  record(r - l + 1)
}
```

Both pointers only move forward, so every index is added once and removed once
and the whole thing is O(n) despite the nested loop. What changes between the
three is only the validity test and what gets recorded:

| | Window is invalid when | Recorded |
|---|---|---|
| 50 | the new character is already inside | longest valid window |
| 51 | length − count of the majority character > k | longest valid window |
| 52 | it does NOT yet cover t | shortest valid window, recorded while shrinking |

52 inverts the loop: 50 and 51 want the largest window and record after
shrinking back to validity, while 52 wants the smallest and records *during* the
shrink, before the window breaks. Getting that inversion right is most of what
makes 52 the hard one.

The last step in each is the same move — stop recomputing the validity test from
scratch. 50 stores each character's last index so the left edge jumps in one
assignment; 52 keeps a counter of how many characters have their full quota. 51
is the odd one out: it lets its majority count go stale on purpose, and the
argument for why a stale count cannot inflate the answer is what the interviewer
is listening for.

**Two are canonical keys.** 53 and 54 both rest on the fact that anagrams have
one canonical form. Sorting gives you one, and character counts give you a
cheaper one — linear instead of k log k, at the cost of assuming a small fixed
alphabet. Say that trade out loud; it is the whole difference between the two.

**Two are expand-around-centre.** 57 and 58 are the same loop with a different
last line: 57 keeps the longest expansion, 58 counts every expansion. The shared
insight is that searching substrings is backwards — start from the middle of a
palindrome, where the structure is, and grow. There are 2n−1 centres, not n,
because an even-length palindrome is centred between two characters; dropping
the even case is the standard bug and shows up immediately on `'aa'`.

Manacher's algorithm solves both in O(n) by reusing the palindrome radii already
computed on the mirror side of the current centre, so it never re-expands over
ground it has covered. Nobody expects you to write it. Knowing it exists, and
that it removes the quadratic factor, is the part that is worth points.

**Two are about what a string cannot tell you.** 55 is the reminder that
counters lose ordering: `'([)]'` balances on every count and is still invalid, so
you need a stack to remember which opener is innermost. 59 is the same lesson
about data — a delimiter cannot work, because nothing stops the payload from
containing it, and no character is "rare enough". Either escape the delimiter so
it can never appear raw, or prefix each string with its length so the decoder is
told how far to read before it reads anything.

**One is pure pointer hygiene.** 56 goes from "clean the string, reverse it,
compare" to two pointers walking the original in place. Each rung removes an
allocation, and the final version needs the `l < r` guard inside the skip loops,
not only on the outer `while`, or a string of pure punctuation runs off the end.

## The JS-specific traps in this category

- **Strings are immutable.** `out += c` in a loop is O(n²) in the worst case,
  because each `+=` can copy everything built so far. Push into an array and
  `join('')` at the end. `decodeEscape` in 59 does this deliberately.
- **`.split('')` breaks on anything outside the basic plane.** It splits by
  UTF-16 code unit, so one emoji becomes two lone surrogate halves.
  `[...str]`, `Array.from(str)` and `for...of` split by code point and do not.
  In 50, `'👍👍a'.split('')` reports 3; the correct answer is 2.
- **`.length` is code units too** — `'a👍'.length` is 3, not 2. That is fine when
  both sides agree: 59 pairs `word.length` with `slice`, which counts the same
  units, and emoji round-trip. It breaks the moment you mix the two counts.
- **`\W` keeps the underscore.** `_` is a word character, so `/\W/g` leaves it in
  and 56 reports `'ab_a'` as not a palindrome. Spell the class out:
  `/[^a-z0-9]/g` after lowercasing.
- **Do not fold case with arithmetic.** `'0'` and `'P'` differ by exactly 32, so
  the "flip bit 5" trick calls `'0P'` a palindrome. Use `toLowerCase()`.
- **`String.replace` with a string argument replaces the first match only.** Only
  the regex form with `/g` replaces everything. 55's peel-the-pairs approach
  relies on the first-match behaviour and loops until the string stops shrinking.
- **`Map` beats a plain object for character counts.** No prototype keys to
  collide with, `size` is free, and it preserves insertion order — which is what
  keeps the group order stable in 54.

See [javascript/pitfalls.md](../../javascript/pitfalls.md) for the full list.
