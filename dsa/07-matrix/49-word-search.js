'use strict'
/**
 * WORD SEARCH
 *
 * Given a grid of characters and a word, decide whether the word can be spelled
 * by walking the grid one step at a time, up, down, left or right. A cell may
 * not be used twice in the same path.
 *
 *   board = [['A','B','C','E'],
 *            ['S','F','C','S'],     "ABCCED" -> true    (A B C down-C E D)
 *            ['A','D','E','E']]     "ABCB"   -> false   (the second B would reuse a cell)
 *
 * Pattern: backtracking
 */

const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]]

/**
 * Approach 1 — DFS with a visited Set.  O(m*n*4^L) time, O(L) space for the set.
 *
 * The search itself is the easy half: from every cell, walk in each direction
 * while the characters keep matching, and unwind when they stop. The half that
 * decides whether the answer is right is "a cell may not be used twice" — and
 * only within the current path, not globally. A cell rejected on one route must
 * be free again on the next, so whatever records it has to be undone on the way
 * back out. That undo is what makes this backtracking rather than a flood fill.
 *
 * Cost of doing it with a Set of "r,c" strings: a string is built and hashed on
 * every single cell visit, inside a search that visits exponentially many.
 */
function existSet(board, word) {
  if (!word.length) return true                    // vacuously true; the problem leaves it open
  const rows = board.length
  if (!rows || !board[0].length) return false
  const cols = board[0].length
  const visited = new Set()

  function dfs(r, c, i) {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return false
    const key = `${r},${c}`
    if (visited.has(key) || board[r][c] !== word[i]) return false
    if (i === word.length - 1) return true
    visited.add(key)
    for (const [dr, dc] of DIRS) {
      if (dfs(r + dr, c + dc, i + 1)) { visited.delete(key); return true }
    }
    visited.delete(key)                            // undo before the caller tries another branch
    return false
  }

  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (dfs(r, c, 0)) return true
  return false
}

/**
 * Approach 2 — DFS with a boolean grid.  O(m*n*4^L) time, O(m*n) space.
 *
 * Same algorithm, cheaper bookkeeping. The coordinates are already two small
 * integers, so they can index an array directly — no key to build, no hash to
 * compute, no garbage. Big constant-factor win over the Set for free.
 *
 * What it still costs is a second m x n grid allocated per call, which is more
 * memory than the path ever uses.
 */
function existGrid(board, word) {
  if (!word.length) return true
  const rows = board.length
  if (!rows || !board[0].length) return false
  const cols = board[0].length
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false))

  function dfs(r, c, i) {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return false
    if (seen[r][c] || board[r][c] !== word[i]) return false
    if (i === word.length - 1) return true
    seen[r][c] = true
    for (const [dr, dc] of DIRS) {
      if (dfs(r + dr, c + dc, i + 1)) { seen[r][c] = false; return true }
    }
    seen[r][c] = false
    return false
  }

  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (dfs(r, c, 0)) return true
  return false
}

/**
 * Approach 3 — mark the cell itself, restore on the way out.
 *                        O(m*n*4^L) time, O(L) space (recursion only).  ** optimal **
 *
 * Why marking the board beats a separate visited structure: the check that
 * reads the mark is the same check that reads the character. Overwrite the cell
 * with a sentinel that cannot appear in the word and the existing test
 * `board[r][c] !== word[i]` rejects a revisit for free — one memory access
 * instead of two, no second structure allocated, and nothing to keep in sync
 * with the path. In a search that is exponential in the word length, the
 * per-visit constant is what you are actually optimising.
 *
 * The price is that the input is temporarily corrupted, so every exit path must
 * restore the character — including the successful one. Most write-ups return
 * true without restoring, which leaves sentinels in the caller's board; that is
 * invisible until something reuses the board, and then it fails mysteriously.
 * The test below checks the board is unchanged after a match.
 *
 * '\0' is used rather than '#' because '#' is a character a word could contain.
 *
 * The prune in front is cheap and often decisive: if the board does not hold
 * enough copies of some letter, no path exists and the exponential search never
 * starts. The related trick worth mentioning out loud — if the word's last
 * letter is rarer on the board than its first, search for the word reversed,
 * because the branching happens at the start of the path.
 */
function exist(board, word) {
  if (!word.length) return true
  const rows = board.length
  if (!rows || !board[0].length) return false
  const cols = board[0].length
  if (word.length > rows * cols) return false

  const have = new Map()
  for (const row of board) for (const ch of row) have.set(ch, (have.get(ch) ?? 0) + 1)
  const need = new Map()
  for (const ch of word) need.set(ch, (need.get(ch) ?? 0) + 1)
  for (const [ch, n] of need) if ((have.get(ch) ?? 0) < n) return false

  function dfs(r, c, i) {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return false
    if (board[r][c] !== word[i]) return false      // also rejects '\0', the visited mark
    if (i === word.length - 1) return true
    const ch = board[r][c]
    board[r][c] = '\0'
    for (const [dr, dc] of DIRS) {
      if (dfs(r + dr, c + dc, i + 1)) { board[r][c] = ch; return true }   // restore on success too
    }
    board[r][c] = ch
    return false
  }

  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (dfs(r, c, 0)) return true
  return false
}

module.exports = { exist, existSet, existGrid }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  const BOARD = [['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']]
  const grid = g => g.map(row => [...row])

  for (const fn of [exist, existSet, existGrid]) {
    eq(fn(grid(BOARD), 'ABCCED'), true, `${fn.name} worked example`)
    eq(fn(grid(BOARD), 'SEE'), true, `${fn.name} starts mid-board`)
    eq(fn(grid(BOARD), 'ABCB'), false, `${fn.name} may not reuse a cell`)
    eq(fn(grid(BOARD), 'ADEESCFBA'), true, `${fn.name} long winding path`)
    eq(fn(grid(BOARD), 'ABCD'), false, `${fn.name} letter not adjacent`)
    eq(fn([['A']], 'A'), true, `${fn.name} single cell match`)
    eq(fn([['A']], 'B'), false, `${fn.name} single cell miss`)
    eq(fn([], 'A'), false, `${fn.name} empty board`)
    eq(fn([['A', 'A']], 'AA'), true, `${fn.name} duplicates, both cells used`)
    eq(fn([['A', 'A']], 'AAA'), false, `${fn.name} duplicates, not enough cells`)
    eq(fn(grid(BOARD), ''), true, `${fn.name} empty word`)
    // the board must come back untouched, including after a successful search
    const board = grid(BOARD)
    fn(board, 'ABCCED')
    eq(board, BOARD, `${fn.name} board restored after a match`)
  }
  report('word-search')
}
