'use strict'
/**
 * GROUP ANAGRAMS
 *
 * Partition a list of words so that words which are rearrangements of each other
 * end up in the same group. Group order and the order of the groups themselves
 * are unspecified.
 *
 *   ['eat', 'tea', 'tan', 'ate', 'nat', 'bat']
 *     ->  [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
 *
 * Pattern: hash map (canonical key)
 */

/**
 * Approach 1 — compare against each existing group.  O(n^2 * k) time, O(n*k)
 * space for n words of length k.
 *
 * For each word, test it against one representative of every group so far. The
 * comparison count grows with the number of groups, which in the worst case is
 * every word. The fix is the standard one: stop comparing items to each other
 * and start computing a key that equal items share.
 */
function groupAnagramsBrute(strs) {
  const groups = []
  const isAnagram = (a, b) => {
    if (a.length !== b.length) return false
    const count = new Map()
    for (const c of a) count.set(c, (count.get(c) ?? 0) + 1)
    for (const c of b) {
      const left = (count.get(c) ?? 0) - 1
      if (left < 0) return false
      count.set(c, left)
    }
    return true
  }

  for (const word of strs) {
    const hit = groups.find(g => isAnagram(g[0], word))
    if (hit) hit.push(word)
    else groups.push([word])
  }
  return groups
}

/**
 * Approach 2 — sorted word as the key.  O(n * k log k) time, O(n*k) space.
 *
 * Every anagram sorts to the same string, so the sorted form is a canonical name
 * for the group. One pass, one map lookup per word, no cross-comparisons.
 *
 * This is the version to reach for when the alphabet is unknown or large —
 * unicode, mixed case, arbitrary symbols — because it assumes nothing.
 */
function groupAnagramsSort(strs) {
  const groups = new Map()
  for (const word of strs) {
    const key = [...word].sort().join('')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(word)
  }
  return [...groups.values()]
}

/**
 * Approach 3 — character counts as the key.  O(n * k) time, O(n*k) space.
 * ** optimal **
 *
 * Sorting produces a canonical name, but so does the count vector, and counting
 * is linear where sorting is k log k. '#1#0#0...' for 'a' is just as unique a
 * name as 'a' is.
 *
 * The catch worth saying out loud: this buys its speed by assuming a small fixed
 * alphabet (26 lowercase letters here). Widen the input to unicode and the
 * vector stops being fixed-width, at which point approach 2 is the honest
 * answer. Keep the separators — without them, counts of 1 and 11 collide with
 * 11 and 1.
 */
function groupAnagrams(strs) {
  const A = 'a'.charCodeAt(0)
  const groups = new Map()
  for (const word of strs) {
    const counts = new Array(26).fill(0)
    for (let i = 0; i < word.length; i++) counts[word.charCodeAt(i) - A]++
    const key = counts.join('#')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(word)
  }
  return [...groups.values()]
}

module.exports = { groupAnagrams, groupAnagramsBrute, groupAnagramsSort }

if (require.main === module) {
  const { eqUnordered, report } = require('../_lib/test')
  for (const fn of [groupAnagrams, groupAnagramsBrute, groupAnagramsSort]) {
    eqUnordered(
      fn(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']),
      [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']],
      `${fn.name} worked example`
    )
    eqUnordered(fn([]), [], `${fn.name} empty input`)
    eqUnordered(fn(['']), [['']], `${fn.name} the empty word is its own group`)
    eqUnordered(fn(['a']), [['a']], `${fn.name} single word`)
    eqUnordered(fn(['a', 'a']), [['a', 'a']], `${fn.name} identical duplicates group together`)
    eqUnordered(fn(['abc', 'def']), [['abc'], ['def']], `${fn.name} nothing groups`)
    eqUnordered(fn(['ab', 'aab']), [['ab'], ['aab']], `${fn.name} same letters, different counts`)
    eqUnordered(
      fn(['aab', 'aba', 'baa', 'abb']),
      [['aab', 'aba', 'baa'], ['abb']],
      `${fn.name} counts must not collide across positions`
    )
  }
  report('group-anagrams')
}
