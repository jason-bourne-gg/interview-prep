'use strict'
/**
 * PALINDROMIC SUBSTRINGS
 *
 * Count how many substrings of s are palindromes. Substrings at different
 * positions count separately even when they are the same text, and every single
 * character counts as one.
 *
 *   'abc'  ->  3   (a, b, c)
 *   'aaa'  ->  6   (a, a, a, aa, aa, aaa)
 *
 * Pattern: two pointers (expanding from a centre)
 */

/**
 * Approach 1 — check every substring.  O(n^3) time, O(1) space.
 *
 * The definition, done literally: n^2 substrings, O(n) to verify each. Same
 * redundancy as in Longest Palindromic Substring — the check for 'abcba' throws
 * away the identical check just done for 'bcb'.
 */
function countSubstringsBrute(s) {
  const isPal = (i, j) => {
    while (i < j) {
      if (s[i] !== s[j]) return false
      i++
      j--
    }
    return true
  }

  let count = 0
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) if (isPal(i, j)) count++
  }
  return count
}

/**
 * Approach 2 — dynamic programming.  O(n^2) time, O(n^2) space.
 *
 * s[i..j] is a palindrome when the ends match and the inside already is. Filling
 * by increasing length guarantees the inside is known first, and each cell is
 * then O(1) instead of O(n).
 *
 * Counting is just "how many true cells", which is why this table is a natural
 * fit here even though the memory is worse than approach 3.
 */
function countSubstringsDP(s) {
  const n = s.length
  const dp = Array.from({ length: n }, () => new Array(n).fill(false))
  let count = 0

  for (let len = 1; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      dp[i][j] = s[i] === s[j] && (len <= 2 || dp[i + 1][j - 1])
      if (dp[i][j]) count++
    }
  }
  return count
}

/**
 * Approach 3 — expand around every centre.  O(n^2) time, O(1) space.
 * ** optimal **
 *
 * Every palindrome has exactly one centre, so counting centres-and-radii counts
 * each palindrome exactly once, with no table. The step that makes this a
 * counting problem rather than a search: each successful expansion IS a distinct
 * palindrome, so increment on every step outwards rather than only at the end.
 *
 * 2n-1 centres — n characters plus n-1 gaps between them. Skipping the gaps
 * loses every even-length palindrome, and 'aa' would come back as 2 instead of 3.
 *
 * Manacher's does the same work in O(n) by reusing radii already computed on the
 * mirror side of the current centre. It is not expected in an interview; knowing
 * it exists and that it removes the quadratic factor is the useful part.
 */
function countSubstrings(s) {
  let count = 0

  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      count++                             // this exact window is a palindrome
      l--
      r++
    }
  }

  for (let i = 0; i < s.length; i++) {
    expand(i, i)                          // odd length
    expand(i, i + 1)                      // even length
  }
  return count
}

module.exports = { countSubstrings, countSubstringsBrute, countSubstringsDP }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [countSubstrings, countSubstringsBrute, countSubstringsDP]) {
    eq(fn('abc'), 3, `${fn.name} worked example, singles only`)
    eq(fn('aaa'), 6, `${fn.name} overlapping duplicates`)
    eq(fn(''), 0, `${fn.name} empty`)
    eq(fn('a'), 1, `${fn.name} single character`)
    eq(fn('aa'), 3, `${fn.name} even-length centre counts`)
    eq(fn('aba'), 4, `${fn.name} odd-length centre`)
    eq(fn('abba'), 6, `${fn.name} nested even palindrome`)
    eq(fn('abab'), 6, `${fn.name} two overlapping odd palindromes`)
  }
  report('palindromic-substrings')
}
