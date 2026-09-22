'use strict'
/**
 * IMPLEMENT TRIE (PREFIX TREE)
 *
 * Build a structure supporting three operations over a set of lowercase words:
 *
 *   insert(word)      add a word
 *   search(word)      is this exact word present
 *   startsWith(pre)   is any stored word prefixed by pre
 *
 *   insert("apple"); search("apple") -> true; search("app") -> false;
 *   startsWith("app") -> true; insert("app"); search("app") -> true
 *
 * A trie stores words by sharing their prefixes: one node per character
 * position, one edge per distinct next character. "apple" and "app" occupy the
 * same first three nodes.
 *
 * Pattern: trie
 */

/**
 * Approach 1 — keep the words in a list.  O(1) insert, O(n * L) per query.
 *
 * n words of length up to L. Perfectly reasonable for a handful of words, and
 * the reason to move on is in the complexity: every query rescans the entire
 * dictionary, and the cost grows with words you are not even looking at.
 */
class TrieByScan {
  constructor() { this.words = [] }
  insert(word) { this.words.push(word) }
  search(word) { return this.words.includes(word) }
  startsWith(prefix) { return this.words.some(w => w.startsWith(prefix)) }
}

/**
 * Approach 2 — hash every word and every prefix.
 * O(L^2) insert time and space, O(L) per query.
 *
 * Queries are now independent of the dictionary size, which is the property we
 * actually want. The price is paid at insert: storing all L prefixes of a word
 * means building L substrings, and a substring of length i costs O(i) to build
 * and to store.
 *
 * So "apple" and "applesauce" each store their own copies of "a", "ap", "app".
 * Nothing is shared. That duplication is exactly what the trie removes — it
 * stores each distinct prefix once, as a path.
 */
class TrieByPrefixSet {
  constructor() { this.words = new Set(); this.prefixes = new Set() }
  insert(word) {
    this.words.add(word)
    for (let i = 0; i <= word.length; i++) this.prefixes.add(word.slice(0, i))
  }
  search(word) { return this.words.has(word) }
  startsWith(prefix) { return this.prefixes.has(prefix) }
}

/** One trie node: the outgoing edges, plus whether a word ends here. */
class TrieNode {
  constructor() { this.children = new Map(); this.isWord = false }
}

/**
 * Approach 3 — the trie.  O(L) for every operation, O(total characters) space.  ** optimal **
 *
 * Each character is an edge. Walking a word is walking a path, so cost depends
 * on the word's length and nothing else — not on how many words are stored.
 *
 * Two details carry the design:
 *
 *   - isWord is a FLAG, not a sentinel character. Using a marker like '$' as a
 *     child key works right up until the alphabet can contain '$'. The flag
 *     also makes the difference between search and startsWith one line: both
 *     walk the same path, then search additionally asks "does a word end here".
 *
 *   - children is a Map rather than a 26-slot array. An array is a little
 *     faster for fixed lowercase input; a Map costs nothing on a sparse node
 *     and does not silently assume the alphabet. Say which you chose and why.
 *
 * This is the structure problems 72 and 73 are built on: 72 changes how the
 * path is walked, 73 walks it against a board instead of a query string.
 */
class Trie {
  constructor() { this.root = new TrieNode() }

  /** Walk the path for a string, creating nodes as needed. */
  insert(word) {
    let node = this.root
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode())
      node = node.children.get(ch)
    }
    node.isWord = true
  }

  /** Walk without creating. Returns the node the path ends at, or null. */
  _find(str) {
    let node = this.root
    for (const ch of str) {
      node = node.children.get(ch)
      if (!node) return null
    }
    return node
  }

  search(word) { return this._find(word)?.isWord === true }
  startsWith(prefix) { return this._find(prefix) !== null }
}

module.exports = { Trie, TrieNode, TrieByScan, TrieByPrefixSet }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const Impl of [Trie, TrieByScan, TrieByPrefixSet]) {
    const name = Impl.name
    const t = new Impl()

    t.insert('apple')
    eq(t.search('apple'), true, `${name} finds the inserted word`)
    // A prefix of a stored word is not itself a stored word. This is the
    // whole reason the isWord flag exists.
    eq(t.search('app'), false, `${name} a prefix is not a word`)
    eq(t.startsWith('app'), true, `${name} but it is a prefix`)
    eq(t.startsWith('apple'), true, `${name} a full word is a prefix of itself`)
    eq(t.startsWith(''), true, `${name} empty prefix matches`)
    eq(t.search(''), false, `${name} empty string was never inserted`)

    t.insert('app')
    eq(t.search('app'), true, `${name} now it is a word`)
    eq(t.search('apple'), true, `${name} the longer word survives`)

    // Off by one at the end of the path: one character too many, one too few.
    eq(t.search('appl'), false, `${name} one character short`)
    eq(t.search('apples'), false, `${name} one character long`)
    eq(t.startsWith('apples'), false, `${name} prefix longer than any word`)

    // A branch, and a word that is not on it.
    t.insert('apricot')
    eq(t.startsWith('ap'), true, `${name} shared prefix`)
    eq(t.startsWith('apr'), true, `${name} branch taken`)
    eq(t.search('b'), false, `${name} unrelated single character`)
    eq(t.startsWith('b'), false, `${name} unrelated prefix`)

    // Re-inserting must be idempotent, not corrupting.
    t.insert('app')
    eq(t.search('app'), true, `${name} duplicate insert is harmless`)

    // The empty word: a word can end at the root.
    t.insert('')
    eq(t.search(''), true, `${name} empty string inserted`)
  }

  report('implement-trie')
}
