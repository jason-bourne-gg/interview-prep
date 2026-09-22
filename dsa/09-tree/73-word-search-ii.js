'use strict'
/**
 * WORD SEARCH II
 *
 * Given a grid of letters and a list of words, return every word that can be
 * spelled by walking the grid up/down/left/right without reusing a cell.
 *
 *   board  o a a n        words ["oath", "pea", "eat", "rain"]
 *          e t a e          ->  ["oath", "eat"]
 *          i h k r
 *          i f l v
 *
 * The naive shape is "for each word, search the board". The trie inverts it:
 * search the board ONCE, carrying a position in the dictionary as you go.
 *
 * Pattern: trie + backtracking
 */

const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]]

/**
 * Approach 1 — run Word Search I once per word.
 * O(W * R * C * 4^L) time, O(L) space.
 *
 * W words, an R by C board, L the longest word. Correct, and it repeats
 * enormous amounts of work: "oath", "oats" and "oat" each re-walk the same
 * o -> a -> t path from scratch. With 10,000 words that is 10,000 board
 * traversals whose early steps are mostly identical.
 *
 * `board[r][c] = '#'` is the visited mark, restored on the way out — the
 * standard trick for backtracking on a grid without a separate visited matrix.
 */
function findWordsBrute(board, words) {
  const rows = board.length, cols = rows ? board[0].length : 0

  const exists = word => {
    const dfs = (r, c, i) => {
      if (i === word.length) return true
      if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] !== word[i]) return false
      const ch = board[r][c]
      board[r][c] = '#'
      const found = DIRS.some(([dr, dc]) => dfs(r + dr, c + dc, i + 1))
      board[r][c] = ch
      return found
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) if (dfs(r, c, 0)) return true
    }
    return false
  }

  return [...new Set(words)].filter(w => w.length > 0 && exists(w))
}

/**
 * Approach 2 — reject impossible words first, then brute force.
 * Same worst case, much faster in practice.
 *
 * A word cannot be on the board if the board does not even contain its letters
 * in sufficient quantity. Counting the board once is O(R * C), and each check
 * is O(L), so most of the dictionary is discarded before any DFS runs.
 *
 * Worth knowing as a general move — cheap necessary conditions before an
 * expensive search — but it is still one traversal per surviving word, and it
 * still shares nothing between words with a common prefix. That sharing is the
 * thing only a trie gives you.
 */
function findWordsFiltered(board, words) {
  const available = new Map()
  for (const row of board) for (const ch of row) available.set(ch, (available.get(ch) ?? 0) + 1)

  const possible = word => {
    const need = new Map()
    for (const ch of word) {
      const n = (need.get(ch) ?? 0) + 1
      if (n > (available.get(ch) ?? 0)) return false
      need.set(ch, n)
    }
    return true
  }

  return findWordsBrute(board, [...new Set(words)].filter(possible))
}

/**
 * A trie node for this problem. It stores the whole word at the terminal node
 * rather than a boolean, which saves rebuilding the string from the DFS path
 * every time a match is found, and gives a natural way to mark a word as
 * already reported: set it back to null.
 */
class WordTrieNode {
  constructor() { this.children = new Map(); this.word = null }
}

/**
 * Approach 3 — one board traversal, guided by a trie.
 * O(total characters) to build, then O(R * C * 4^L) to search.  ** optimal **
 *
 * Note what left the complexity: W. The number of words no longer multiplies
 * the board traversal, it only affects the one-off build. That is the whole
 * point of the trie here.
 *
 * The mechanism: the DFS carries a trie node alongside the grid position.
 * Stepping to a neighbouring cell is only legal if the trie has a child for
 * that letter, so all words sharing a prefix are explored together, exactly
 * once — and a path that no word continues is abandoned immediately instead of
 * being walked to the length of each candidate word.
 *
 * Three details that matter:
 *
 *   - after reporting a word, set node.word = null. Otherwise a word reachable
 *     by two different paths is reported twice, and so is a duplicate entry in
 *     the input list.
 *   - do not stop at a match. "oat" being found does not mean "oath" is not
 *     below it, so the DFS continues past a terminal node.
 *   - pruning. Once a node has no children and no word left on it, it can
 *     never contribute again, so delete it from its parent. On a large
 *     dictionary the trie collapses as the search proceeds, and later starting
 *     cells have far less to explore. This is what turns an accepted solution
 *     into a fast one.
 */
function findWords(board, words) {
  const rows = board.length, cols = rows ? board[0].length : 0
  const root = new WordTrieNode()
  for (const word of words) {
    if (!word.length) continue
    let node = root
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new WordTrieNode())
      node = node.children.get(ch)
    }
    node.word = word
  }

  const found = []

  const dfs = (r, c, parent) => {
    const ch = board[r][c]
    const node = parent.children.get(ch)
    if (!node) return                            // no word continues this way

    if (node.word !== null) { found.push(node.word); node.word = null }

    board[r][c] = '#'                            // mark visited
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && board[nr][nc] !== '#') dfs(nr, nc, node)
    }
    board[r][c] = ch                             // restore

    if (node.children.size === 0 && node.word === null) parent.children.delete(ch)   // prune
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) dfs(r, c, root)
  }
  return found
}

module.exports = { findWords, findWordsBrute, findWordsFiltered, WordTrieNode }

if (require.main === module) {
  const { eqUnordered, report } = require('../_lib/test')

  // Fresh copy per call: every approach marks cells and restores them, and a
  // bug in the restore would otherwise leak into the next assertion.
  const grid = rows => rows.map(r => [...r])

  const big = [
    ['o', 'a', 'a', 'n'],
    ['e', 't', 'a', 'e'],
    ['i', 'h', 'k', 'r'],
    ['i', 'f', 'l', 'v'],
  ]

  for (const fn of [findWords, findWordsBrute, findWordsFiltered]) {
    eqUnordered(fn(grid(big), ['oath', 'pea', 'eat', 'rain']), ['oath', 'eat'], `${fn.name} worked example`)
    eqUnordered(fn([], ['a']), [], `${fn.name} empty board`)
    eqUnordered(fn(grid(big), []), [], `${fn.name} no words`)
    eqUnordered(fn([['a']], ['a']), ['a'], `${fn.name} single cell`)
    eqUnordered(fn([['a']], ['b']), [], `${fn.name} single cell, no match`)
    // A cell cannot be reused: "aba" needs the 'a' twice.
    eqUnordered(fn([['a', 'b']], ['ab', 'aba']), ['ab'], `${fn.name} no cell reuse`)
    // Duplicates in the input must appear once in the output.
    eqUnordered(fn([['a', 'b']], ['ab', 'ab']), ['ab'], `${fn.name} duplicate input word`)
    // Reachable by two genuinely different paths — still reported once.
    eqUnordered(fn([['a', 'b'], ['b', 'a']], ['ab']), ['ab'], `${fn.name} two paths, one result`)
    // A word and its own prefix: finding the short one must not stop the search.
    eqUnordered(fn(grid(big), ['oa', 'oat', 'oath', 'oaths']), ['oa', 'oat', 'oath'], `${fn.name} prefixes of each other`)
    // Longer than the board has cells.
    eqUnordered(fn([['a', 'b']], ['abab']), [], `${fn.name} word longer than the board`)
    // Turns a corner rather than running straight.
    eqUnordered(fn([['a', 'b'], ['d', 'c']], ['abcd']), ['abcd'], `${fn.name} path turns corners`)
  }

  // The board must come back exactly as it went in.
  const board = grid(big)
  findWords(board, ['oath', 'eat'])
  eqUnordered(board, grid(big), 'findWords restores every cell it marked')

  report('word-search-ii')
}
