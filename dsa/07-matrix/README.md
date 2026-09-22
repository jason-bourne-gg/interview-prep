# Matrix — 4 problems

| # | Problem | Difficulty | Brute | Optimal | Pattern |
|---|---|---|---|---|---|
| 46 | [Set Matrix Zeroes](46-set-matrix-zeroes.js) | Medium | O(mn(m+n)), O(mn) space | **O(mn), O(1) extra** | In-place marking |
| 47 | [Spiral Matrix](47-spiral-matrix.js) | Medium | O(mn), O(mn) space | **O(mn), O(1) extra** | Boundary simulation |
| 48 | [Rotate Image](48-rotate-image.js) | Medium | O(n²), O(n²) space | **O(n²), O(1) extra** | Transpose + reverse |
| 49 | [Word Search](49-word-search.js) | Medium | O(mn·4ᴸ), O(mn) space | **O(mn·4ᴸ), O(L) space** | Backtracking |

Run any file directly to check it: `node dsa/07-matrix/48-rotate-image.js`

---

## What this category is really teaching

**Every one of these is already O(mn) at the brute-force stage.** You cannot
avoid touching each cell, so time is not the axis being tested — space is. In
all four problems the naive answer allocates a second grid, and in all four the
interview question is "now do it with O(1) extra", which is why they sit
together despite looking unrelated.

**Three of them answer that the same way: the matrix stores its own metadata.**
Set Matrix Zeroes puts the row and column verdicts in row 0 and column 0, whose
contents are about to be destroyed anyway. Word Search overwrites the cell it is
standing on with a sentinel instead of carrying a visited set. Rotate Image
keeps the four cells of a rotation cycle in the grid and moves them through one
temporary. Once you see "the data structure I need is the same size as a piece
of the input I no longer need", the O(1) versions stop being tricks.

**And all three then owe a debt: the metadata has to be undone or read in the
right order.** Word Search restores the character on the way out of every
branch, including the successful one. Set Matrix Zeroes applies its markers
bottom-up, because a zero written into row 0 is indistinguishable from a column
marker. Getting the write order or the undo wrong is the failure mode in this
whole category, and it never shows up on a square or symmetric test case.

**Spiral Matrix is the odd one out** — no marking, just four boundaries that
shrink. Its lesson is that a per-cell `visited` grid is often replaceable by a
handful of integers that describe the region still in play.

## The JS-specific traps in this category

- **`Array(n).fill(Array(n).fill(0))` creates one row, referenced n times.**
  `fill` copies the *value*, and the value is a single array object, so
  `grid[0][0] = 1` writes into every row. This is the most common way a correct
  matrix algorithm produces nonsense output. Build rows individually:

  ```js
  Array.from({ length: n }, () => Array(n).fill(0))
  ```

- **`matrix.map(row => [...row])` for a copy, not `[...matrix]`.** The spread
  copies the outer array, and its elements are still the original row objects,
  so a "copy" written through mutates the source.

- **`reverse()` mutates and returns the same array.** `rotate` relies on that;
  code that assumes a new array is returned will silently share state.

- **Destructuring swaps need a leading semicolon** when the previous line does
  not end in one — `[a, b] = [b, a]` on a new line continues the previous
  expression as an index. The files here write `;[a, b] = [b, a]`.

- **A path in a string-keyed visited set costs an allocation per cell visit.**
  Inside a 4ᴸ search that constant matters; `r * cols + c` is a cheap integer
  key, and marking the board itself is cheaper still.

See [javascript/pitfalls.md](../../javascript/pitfalls.md) for the full list.
