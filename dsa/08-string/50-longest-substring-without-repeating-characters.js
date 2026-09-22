'use strict'
/**
 * LONGEST SUBSTRING WITHOUT REPEATING CHARACTERS
 *
 * Return the length of the longest contiguous stretch of s in which no
 * character repeats. Contiguous is the whole point — a subsequence would be a
 * different, easier problem.
 *
 *   'abcabcbb'  ->  3   ('abc')
 *   'pwwkew'    ->  3   ('wke', not the subsequence 'pwke')
 *
 * Pattern: sliding window
 */

/**
 * Approach 1 — every substring.  O(n^3) time, O(n) space.
 *
 * Build each substring and ask whether it has a duplicate. The wasted work is
 * obvious once you name it: after checking 'abc' we throw the Set away and
 * rebuild it to check 'abcd'. Keeping that Set alive is the whole improvement.
 */
function lengthOfLongestSubstringBrute(s) {
  const chars = [...s]
  let best = 0
  for (let i = 0; i < chars.length; i++) {
    for (let j = i; j < chars.length; j++) {
      const seen = new Set(chars.slice(i, j + 1))
      if (seen.size === j - i + 1) best = Math.max(best, j - i + 1)
    }
  }
  return best
}

/**
 * Approach 2 — sliding window, shrink one at a time.  O(n) time, O(k) space
 * where k is the alphabet size.
 *
 * Keep a window that is always duplicate-free. Extending right can break that
 * invariant in exactly one way — the new character is already inside — so drop
 * characters off the left until it is gone.
 *
 * The nested loop is not quadratic: every index is added once and removed at
 * most once, so the total work across both loops is 2n.
 */
function lengthOfLongestSubstringWindow(s) {
  const chars = [...s]
  const inWindow = new Set()
  let l = 0, best = 0
  for (let r = 0; r < chars.length; r++) {
    while (inWindow.has(chars[r])) {
      inWindow.delete(chars[l])
      l++
    }
    inWindow.add(chars[r])
    best = Math.max(best, r - l + 1)
  }
  return best
}

/**
 * Approach 3 — remember the last index of each character.  O(n) time, O(k)
 * space.  ** optimal **
 *
 * Approach 2 walks the left edge forward one step at a time. But if we store
 * where each character was last seen, we know exactly where the left edge has
 * to land: one past that position. The inner loop becomes a single assignment.
 *
 * The `prev >= l` guard is the bug this problem is really testing. The map keeps
 * stale entries for characters that already fell out of the window, and without
 * the guard they drag l backwards. On 'abba': at the final 'a' the map still
 * says index 0, l is already 2, and an unguarded jump would report 3.
 */
function lengthOfLongestSubstring(s) {
  const chars = [...s]
  const lastSeen = new Map()                  // character -> most recent index
  let l = 0, best = 0
  for (let r = 0; r < chars.length; r++) {
    const prev = lastSeen.get(chars[r])
    if (prev !== undefined && prev >= l) l = prev + 1   // never move l backwards
    lastSeen.set(chars[r], r)
    best = Math.max(best, r - l + 1)
  }
  return best
}

module.exports = {
  lengthOfLongestSubstring,
  lengthOfLongestSubstringBrute,
  lengthOfLongestSubstringWindow
}

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  const fns = [
    lengthOfLongestSubstring,
    lengthOfLongestSubstringBrute,
    lengthOfLongestSubstringWindow
  ]
  for (const fn of fns) {
    eq(fn('abcabcbb'), 3, `${fn.name} worked example`)
    eq(fn('pwwkew'), 3, `${fn.name} substring not subsequence`)
    eq(fn(''), 0, `${fn.name} empty`)
    eq(fn('a'), 1, `${fn.name} single character`)
    eq(fn('bbbbb'), 1, `${fn.name} all duplicates`)
    eq(fn(' '), 1, `${fn.name} space counts`)
    eq(fn('abba'), 2, `${fn.name} stale index must not move l back`)
    eq(fn('dvdf'), 3, `${fn.name} answer sits after the repeat`)
    // [...str] splits by code point; 'a'.split('') would tear the surrogate pair
    // in two and report 3 here.
    eq(fn('\u{1F44D}\u{1F44D}a'), 2, `${fn.name} astral characters`)
  }
  report('longest-substring-without-repeating-characters')
}
