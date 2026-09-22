'use strict'
/**
 * LONGEST PALINDROMIC SUBSTRING
 *
 * Return the longest contiguous stretch of s that reads the same both ways. When
 * several are tied for longest, these implementations all return the leftmost.
 *
 *   'babad'  ->  'bab'   ('aba' is equally long, but starts later)
 *   'cbbd'   ->  'bb'
 *
 * Pattern: two pointers (expanding from a centre)
 */

/**
 * Approach 1 — check every substring.  O(n^3) time, O(n) space.
 *
 * n^2 substrings, each verified in O(n). The waste is that verifying 'abcba'
 * re-reads the 'bcb' we already verified a moment earlier. Both better
 * approaches are different ways of reusing that result.
 */
function longestPalindromeBrute(s) {
  const isPal = (i, j) => {
    while (i < j) {
      if (s[i] !== s[j]) return false
      i++
      j--
    }
    return true
  }

  let bestStart = 0, bestLen = s.length ? 1 : 0
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      if (j - i + 1 > bestLen && isPal(i, j)) { bestStart = i; bestLen = j - i + 1 }
    }
  }
  return s.slice(bestStart, bestStart + bestLen)
}

/**
 * Approach 2 — dynamic programming.  O(n^2) time, O(n^2) space.
 *
 * s[i..j] is a palindrome when its ends match AND the inside s[i+1..j-1] already
 * is. That recurrence reuses the earlier check instead of redoing it, which is
 * what drops the cubic factor.
 *
 * Fill by increasing length, so the inside is always solved before the outside.
 * Lengths 1 and 2 have no inside and are the base cases.
 *
 * Worth knowing because the same table answers "count the palindromes" and
 * several other variants, but it pays O(n^2) memory for something approach 3
 * gets in O(1).
 */
function longestPalindromeDP(s) {
  const n = s.length
  if (n === 0) return ''
  const dp = Array.from({ length: n }, () => new Array(n).fill(false))
  let bestStart = 0, bestLen = 1

  for (let len = 1; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      dp[i][j] = s[i] === s[j] && (len <= 2 || dp[i + 1][j - 1])
      if (dp[i][j] && len > bestLen) { bestStart = i; bestLen = len }
    }
  }
  return s.slice(bestStart, bestStart + bestLen)
}

/**
 * Approach 3 — expand around every centre.  O(n^2) time, O(1) space.
 * ** optimal **
 *
 * Turn the question around. Instead of testing substrings and asking whether
 * they are palindromes, start from the middle of a palindrome and grow outwards
 * while the ends match. Every palindrome has exactly one centre, so trying all
 * centres finds all of them, and nothing is stored.
 *
 * There are 2n-1 centres, not n: a palindrome of even length is centred between
 * two characters. Forgetting the even case is the standard bug — it returns 'b'
 * for 'cbbd'.
 *
 * Manacher's algorithm does this in O(n) by reusing the palindrome radii already
 * computed on the left of the current centre, so it never re-expands over known
 * ground. Nobody expects it in an interview; mentioning that it exists and that
 * it buys O(n) is enough, and the saving is irrelevant at interview input sizes.
 */
function longestPalindrome(s) {
  let bestStart = 0, bestLen = s.length ? 1 : 0

  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--
      r++
    }
    const len = r - l - 1                 // the loop overshoots by one on each side
    if (len > bestLen) { bestStart = l + 1; bestLen = len }
  }

  for (let i = 0; i < s.length; i++) {
    expand(i, i)                          // odd length, centred on a character
    expand(i, i + 1)                      // even length, centred between two
  }
  return s.slice(bestStart, bestStart + bestLen)
}

module.exports = { longestPalindrome, longestPalindromeBrute, longestPalindromeDP }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [longestPalindrome, longestPalindromeBrute, longestPalindromeDP]) {
    eq(fn('babad'), 'bab', `${fn.name} worked example, leftmost of a tie`)
    eq(fn('cbbd'), 'bb', `${fn.name} even-length centre`)
    eq(fn(''), '', `${fn.name} empty`)
    eq(fn('a'), 'a', `${fn.name} single character`)
    eq(fn('ac'), 'a', `${fn.name} nothing longer than one`)
    eq(fn('aa'), 'aa', `${fn.name} two identical characters`)
    eq(fn('aaaa'), 'aaaa', `${fn.name} all duplicates`)
    eq(fn('forgeeksskeegfor'), 'geeksskeeg', `${fn.name} buried even-length answer`)
    eq(fn('abacdfgdcaba'), 'aba', `${fn.name} two tied answers far apart`)
  }
  report('longest-palindromic-substring')
}
