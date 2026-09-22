'use strict'
/**
 * VALID ANAGRAM
 *
 * Return true when t is a rearrangement of s — same characters, same number of
 * each, order irrelevant.
 *
 *   'anagram', 'nagaram'  ->  true
 *   'rat', 'car'          ->  false
 *
 * Pattern: hash map (counting)
 */

/**
 * Approach 1 — sort both.  O(n log n) time, O(n) space.
 *
 * Two strings are anagrams exactly when their sorted forms match, because
 * sorting maps every rearrangement to the same canonical string. Short to write
 * and easy to justify, but sorting answers a stronger question (the full order)
 * than the problem asks, and that extra work is the log n.
 */
function isAnagramSort(s, t) {
  if ([...s].length !== [...t].length) return false
  const key = str => [...str].sort().join('')
  return key(s) === key(t)
}

/**
 * Approach 2 — count both, compare the tallies.  O(n) time, O(a) space.
 *
 * Order is irrelevant, so the only thing worth keeping is how many of each
 * character there are. Dropping the ordering information is what removes the
 * log n.
 */
function isAnagramCounts(s, t) {
  const tally = str => {
    const m = new Map()
    for (const c of str) m.set(c, (m.get(c) ?? 0) + 1)
    return m
  }
  const a = tally(s), b = tally(t)
  if (a.size !== b.size) return false
  for (const [c, n] of a) if (b.get(c) !== n) return false
  return true
}

/**
 * Approach 3 — one tally, up for s and down for t.  O(n) time, O(a) space.
 * ** optimal **
 *
 * Two maps are one map too many. Count s upwards and t downwards in the same
 * table: if the strings match, every entry cancels to zero. Same complexity as
 * approach 2, half the memory and one pass fewer.
 *
 * The length check is not an optimisation, it is a correctness guard. Without
 * it, 'a' against 'aab' leaves a stray +1 that this style of early exit can
 * miss, depending on which side you scan. Compare code-point counts with
 * [...s].length: 'a\u{1F44D}'.length is 3, because an astral character costs
 * two UTF-16 units.
 */
function isAnagram(s, t) {
  const a = [...s], b = [...t]
  if (a.length !== b.length) return false
  const balance = new Map()
  for (const c of a) balance.set(c, (balance.get(c) ?? 0) + 1)
  for (const c of b) {
    const left = (balance.get(c) ?? 0) - 1
    if (left < 0) return false                 // t has a character s never had
    balance.set(c, left)
  }
  return true
}

module.exports = { isAnagram, isAnagramSort, isAnagramCounts }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [isAnagram, isAnagramSort, isAnagramCounts]) {
    eq(fn('anagram', 'nagaram'), true, `${fn.name} worked example`)
    eq(fn('rat', 'car'), false, `${fn.name} same length, different letters`)
    eq(fn('', ''), true, `${fn.name} both empty`)
    eq(fn('a', ''), false, `${fn.name} one empty`)
    eq(fn('a', 'ab'), false, `${fn.name} prefix is not an anagram`)
    eq(fn('aa', 'a'), false, `${fn.name} counts matter, not the character set`)
    eq(fn('aacc', 'ccac'), false, `${fn.name} same set, wrong multiplicities`)
    eq(fn('ba', 'ab'), true, `${fn.name} minimal swap`)
    eq(fn('a\u{1F44D}', '\u{1F44D}a'), true, `${fn.name} astral characters`)
  }
  report('valid-anagram')
}
