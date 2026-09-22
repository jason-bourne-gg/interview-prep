# Dynamic programming — 11 problems

| # | Problem | Difficulty | Brute | Optimal | Pattern |
|---|---|---|---|---|---|
| 16 | [Climbing Stairs](16-climbing-stairs.js) | Easy | O(2ⁿ) | **O(n), O(1) space** | Linear DP |
| 17 | [Coin Change](17-coin-change.js) | Medium | O(cᵃ) | **O(amount·c)** | Unbounded knapsack |
| 18 | [Longest Increasing Subsequence](18-longest-increasing-subsequence.js) | Medium | O(2ⁿ) | **O(n log n)** | Patience piles + binary search |
| 19 | [Longest Common Subsequence](19-longest-common-subsequence.js) | Medium | O(2^(m+n)) | **O(mn), O(min(m,n)) space** | 2-D grid on strings |
| 20 | [Word Break](20-word-break.js) | Medium | O(2ⁿ) | **O(n·k·L)** | Linear DP over cut points |
| 21 | [Combination Sum](21-combination-sum.js) | Medium | O(bᵗ) | **O(target·n)** | Unbounded knapsack + backtracking |
| 22 | [House Robber](22-house-robber.js) | Medium | O(2ⁿ) | **O(n), O(1) space** | Linear DP |
| 23 | [House Robber II](23-house-robber-ii.js) | Medium | O(2ⁿ) | **O(n), O(1) space** | Linear DP, run twice |
| 24 | [Decode Ways](24-decode-ways.js) | Medium | O(2ⁿ) | **O(n), O(1) space** | Linear DP |
| 25 | [Unique Paths](25-unique-paths.js) | Medium | O(2^(m+n)) | **O(min(m,n)), O(1) space** | 2-D grid, then binomial |
| 26 | [Jump Game](26-jump-game.js) | Medium | O(2ⁿ) | **O(n)** | Greedy reachability |

Run any file directly to check it: `node dsa/03-dynamic-programming/22-house-robber.js`

---

## What this category is really teaching

**Every one of these is the same four-step ladder.** Naive recursion, then
memoise it, then turn the recursion inside out into a table, then throw the table
away if each row only reads the last one or two. Nine of the eleven walk all four
rungs. Climb them in order in an interview: the naive version proves you have the
recurrence right, and each step after it is a mechanical, explainable
improvement. Jumping straight to the rolling-variable version and getting an
index wrong is a much worse outcome than arriving there slowly.

**The hard part is naming the state, not writing the loop.** Three problems make
that explicit. Longest Increasing Subsequence is exponential while the state is
"index plus the previous value taken", and becomes n states the moment you
restate it as "longest sequence *ending at* i". Coin Change looks like it should
depend on which coins you already spent; it does not, and once you see that the
state is one integer. Word Break seems to need the list of words chosen so far;
it needs only the current position. Each time, the question is the same: what is
the least I must remember to make the next decision?

**Four of them are one linear recurrence wearing different clothes.** Climbing
Stairs, House Robber, House Robber II and Decode Ways all read exactly two cells
back and all collapse to two variables. The differences are cosmetic — House
Robber adds a value instead of counting, Decode Ways gates each of the two terms
on a validity check, House Robber II runs the whole thing twice over two windows
because the ends are adjacent.

**Two are counting problems where the loop order decides the answer.** This is
the one thing in the category most likely to be got wrong under pressure.
Combination Sum makes it the subject: put the target on the outer loop and you
count ordered sequences, put the numbers on the outer loop and you count
unordered multisets. Coin Change's counting sibling is the same table. If you can
state why the loop order does that, you understand the knapsack family.

**Two are grids, and both reward asking whether DP is needed at all.** Longest
Common Subsequence genuinely needs the grid — keep the full table if the
interviewer then asks you to reconstruct the subsequence, because the traceback
reads cells the rolling version has already discarded. Unique Paths does not need
it: the answer is C(m + n - 2, m - 1), and the table only earns its keep once the
grid has obstacles.

**One is here as a trap.** Jump Game sits in the DP category and the O(n²) DP is
what most people write, but the answer is a greedy sweep. It is safe because
jumps are "up to" lengths, so the reachable set is always a prefix, and a prefix
is one number. Recognising that a DP state is really an interval is what turns
quadratic into linear.

## The JS-specific traps in this category

- **Never build a 2-D table with `Array(m).fill(Array(n).fill(0))`.** Every row
  is the *same array object*, so writing `dp[1][2]` writes every row at once, and
  the bug looks like a wrong recurrence. Use
  `Array.from({ length: m }, () => Array(n).fill(0))`.
- **`Array(n)` alone produces holes, not zeros.** `map` and `forEach` skip holes
  entirely, so a table built that way silently keeps its `undefined`s. Always
  `.fill(...)`.
- **A `Map` keyed on `[i, j]` never hits.** Array literals compare by identity,
  so every lookup misses and the memo becomes an expensive no-op that still
  returns correct answers — the slowest kind of bug to notice. Encode the key:
  `i * (n + 1) + j`, or a string.
- **A line starting with `[` continues the previous statement.** The rolling
  swap `[prev, curr] = [curr, next]` gets glued onto the line above and throws.
  Every destructuring swap in this folder is written `;[prev, curr] = ...`.
- **Counting answers exceed `Number.MAX_SAFE_INTEGER` sooner than you expect** —
  Climbing Stairs passes it around n = 79. Build binomial coefficients factor by
  factor, as in Unique Paths, rather than via factorials.
- **Top-down memoisation blows the call stack** at around 10,000 frames. On a
  10⁵-length input the tabulated version is not a style preference, it is the
  only one that runs.

See [javascript/pitfalls.md](../../javascript/pitfalls.md) for the full list.
