'use strict'
/**
 * VALID PALINDROME
 *
 * Read the string forwards and backwards considering only letters and digits,
 * treating upper and lower case as the same. Everything else is ignored.
 *
 *   'A man, a plan, a canal: Panama'  ->  true
 *   'race a car'                      ->  false
 *
 * Pattern: two pointers
 */

/** True for a-z, A-Z and 0-9 only. Note that '_' is NOT alphanumeric here. */
function isAlphaNumeric(c) {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')
}

/**
 * Approach 1 — clean, reverse, compare.  O(n) time, O(n) space.
 *
 * The definition, written out literally. Perfectly fine to state first in an
 * interview; the cost is the two extra strings it builds.
 *
 * The regex is worth reading carefully: /[^a-z0-9]/gi is spelled out rather than
 * using \W, because \W keeps the underscore. With \W, 'ab_a' cleans to 'ab_a'
 * and reports false, when the right answer is true.
 */
function isPalindromeReverse(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '')
  return clean === [...clean].reverse().join('')
}

/**
 * Approach 2 — clean once, then two pointers.  O(n) time, O(n) space.
 *
 * Once the string is cleaned, there is no reason to build a reversed copy: walk
 * one index in from each end and compare. This also short-circuits on the first
 * mismatch instead of always doing the full O(n) work.
 *
 * Still allocates the cleaned string, which is the last thing to go.
 */
function isPalindromeFiltered(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '')
  let l = 0, r = clean.length - 1
  while (l < r) {
    if (clean[l] !== clean[r]) return false
    l++
    r--
  }
  return true
}

/**
 * Approach 3 — two pointers over the original.  O(n) time, O(1) space.
 * ** optimal **
 *
 * The cleaned string was only ever used to decide which characters to skip, and
 * that decision can be made in place: advance each pointer past anything that is
 * not alphanumeric, then compare. Nothing is allocated.
 *
 * The skip loops need the `l < r` guard inside them, not just on the outer
 * while. A string of pure punctuation like ',.' would otherwise run l off the
 * end of the string.
 *
 * Fold case with toLowerCase, not arithmetic on char codes. '0' and 'P' differ
 * by exactly 32, so the classic "flip bit 5" trick reports '0P' as a palindrome.
 */
function isPalindrome(s) {
  let l = 0, r = s.length - 1
  while (l < r) {
    while (l < r && !isAlphaNumeric(s[l])) l++
    while (l < r && !isAlphaNumeric(s[r])) r--
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false
    l++
    r--
  }
  return true
}

module.exports = { isPalindrome, isPalindromeReverse, isPalindromeFiltered }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [isPalindrome, isPalindromeReverse, isPalindromeFiltered]) {
    eq(fn('A man, a plan, a canal: Panama'), true, `${fn.name} worked example`)
    eq(fn('race a car'), false, `${fn.name} not a palindrome`)
    eq(fn(''), true, `${fn.name} empty`)
    eq(fn(' '), true, `${fn.name} nothing left after cleaning`)
    eq(fn(',.;'), true, `${fn.name} pure punctuation, pointers must not run off`)
    eq(fn('a'), true, `${fn.name} single character`)
    eq(fn('ab'), false, `${fn.name} minimal failure`)
    eq(fn('aba'), true, `${fn.name} odd length`)
    eq(fn('abba'), true, `${fn.name} even length`)
    eq(fn('0P'), false, `${fn.name} digit vs letter 32 apart`)
    eq(fn('ab_a'), true, `${fn.name} underscore is not alphanumeric`)
  }
  report('valid-palindrome')
}
