'use strict'
/**
 * ADD AND SEARCH WORD (DESIGN A DATA STRUCTURE)
 *
 * Support addWord(word) and search(word), where the search string may contain
 * '.' meaning "any single character". Length still has to match exactly.
 *
 *   addWord("bad"); addWord("dad"); addWord("mad")
 *   search("pad") -> false;  search("bad") -> true
 *   search(".ad") -> true;   search("b..") -> true;  search("....") -> false
 *
 * This is problem 71 with one change, and the change is structural. A plain
 * trie search WALKS: at each character there is exactly one edge to take. A '.'
 * removes that certainty, so the walk becomes a DFS that tries every child at
 * that position. Everything else about the trie is unchanged.
 *
 * Pattern: trie + DFS
 */

const { TrieNode } = require('./71-implement-trie')

/**
 * Approach 1 — scan every word.  O(1) add, O(n * L) per search.
 *
 * Compare the query against each stored word character by character, treating
 * '.' as an automatic match. The wildcard costs nothing here, which is the one
 * thing this version has going for it — but every search reads the whole
 * dictionary, including words of the wrong length.
 */
class WordDictionaryByScan {
  constructor() { this.words = [] }
  addWord(word) { this.words.push(word) }
  search(word) {
    return this.words.some(w => {
      if (w.length !== word.length) return false
      for (let i = 0; i < word.length; i++) {
        if (word[i] !== '.' && word[i] !== w[i]) return false
      }
      return true
    })
  }
}

/**
 * Approach 2 — bucket the words by length.  O(1) add, O(k * L) per search.
 *
 * Length has to match, so only words of exactly the query's length can
 * possibly match; k is how many of those there are. On a real dictionary that
 * removes most of the work.
 *
 * It is still a constant-factor win. The worst case — every word the same
 * length — is approach 1 again. And it shares nothing between words with the
 * same prefix, which is the saving the trie is after.
 */
class WordDictionaryByLength {
  constructor() { this.byLength = new Map() }
  addWord(word) {
    if (!this.byLength.has(word.length)) this.byLength.set(word.length, [])
    this.byLength.get(word.length).push(word)
  }
  search(word) {
    const bucket = this.byLength.get(word.length) ?? []
    return bucket.some(w => {
      for (let i = 0; i < word.length; i++) {
        if (word[i] !== '.' && word[i] !== w[i]) return false
      }
      return true
    })
  }
}

/**
 * Approach 3 — trie plus DFS on the dots.
 * O(L) add. Search is O(L) with no dots, O(26^d * L) worst case with d dots.  ** optimal **
 *
 * The trie already encodes "all words with this prefix" as a single node, so a
 * concrete character is one Map lookup and the search never looks at unrelated
 * words. A '.' is the only place the search has to branch: try every child of
 * the current node, and succeed if any branch succeeds.
 *
 * Two details worth stating:
 *
 *   - the depth check comes first. Reaching the end of the query means the
 *     answer is node.isWord, NOT "we got here so true" — otherwise "ba" would
 *     match the stored word "bad".
 *
 *   - the dot branches over node.children, not over the 26 letters. A node
 *     usually has two or three children, so the 26^d bound is pessimistic in
 *     practice. Leading dots are the expensive case, because the branching
 *     happens where the trie is widest; a query like "...a" explores nearly the
 *     whole structure.
 */
class WordDictionary {
  constructor() { this.root = new TrieNode() }

  addWord(word) {
    let node = this.root
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode())
      node = node.children.get(ch)
    }
    node.isWord = true
  }

  search(word) {
    const dfs = (node, i) => {
      if (i === word.length) return node.isWord        // end of query: must be a word end
      const ch = word[i]
      if (ch === '.') {
        for (const child of node.children.values()) {
          if (dfs(child, i + 1)) return true           // any branch will do
        }
        return false
      }
      const next = node.children.get(ch)
      return next ? dfs(next, i + 1) : false
    }
    return dfs(this.root, 0)
  }
}

module.exports = { WordDictionary, WordDictionaryByScan, WordDictionaryByLength }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const Impl of [WordDictionary, WordDictionaryByScan, WordDictionaryByLength]) {
    const name = Impl.name
    const d = new Impl()

    eq(d.search('anything'), false, `${name} empty dictionary`)

    d.addWord('bad'); d.addWord('dad'); d.addWord('mad')
    eq(d.search('bad'), true, `${name} exact match`)
    eq(d.search('pad'), false, `${name} no match`)
    eq(d.search('.ad'), true, `${name} leading wildcard`)
    eq(d.search('b..'), true, `${name} trailing wildcards`)
    eq(d.search('b.d'), true, `${name} wildcard in the middle`)
    eq(d.search('...'), true, `${name} all wildcards`)
    // Length must match exactly. This is where "we reached the end, return
    // true" and "we ran out of query, return true" both fall over.
    eq(d.search('..'), false, `${name} too short`)
    eq(d.search('....'), false, `${name} too long`)
    eq(d.search('ba'), false, `${name} prefix of a stored word is not a match`)
    eq(d.search('.a.d'), false, `${name} wildcards do not stretch`)

    // A stored word that is a strict prefix of another.
    d.addWord('b')
    eq(d.search('b'), true, `${name} single character word`)
    eq(d.search('.'), true, `${name} single wildcard matches it`)
    d.addWord('badge')
    eq(d.search('bad'), true, `${name} shorter word survives a longer one`)
    eq(d.search('badg'), false, `${name} interior node is not a word`)
    eq(d.search('b...e'), true, `${name} mixed wildcards on the longer word`)

    // Duplicate add must not change anything.
    d.addWord('bad')
    eq(d.search('bad'), true, `${name} duplicate add is harmless`)
    eq(d.search('zzz'), false, `${name} unrelated word of the right length`)
  }

  report('add-and-search-word')
}
