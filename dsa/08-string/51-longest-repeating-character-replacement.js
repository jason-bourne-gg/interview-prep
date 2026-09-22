'use strict'
/**
 * LONGEST REPEATING CHARACTER REPLACEMENT
 *
 * You may change at most k characters of s into any other letter. Return the
 * length of the longest stretch that can be made into one repeated character
 * once those changes are spent.
 *
 *   s = 'AABABBA', k = 1  ->  4   ('AABA' -> 'AAAA', one change)
 *
 * Pattern: sliding window
 */

/**
 * Approach 1 — every substring.  O(n^2) time, O(k) space for the counts.
 *
 * A window is fixable when (length - count of its most common character) <= k,
 * because everything that is not the majority character has to be rewritten.
 * Naming that test is most of the problem; the rest is how fast you evaluate it.
 *
 * Counting incrementally as j moves keeps this quadratic rather than cubic.
 */
function characterReplacementBrute(s, k) {
  let best = 0
  for (let i = 0; i < s.length; i++) {
    const count = new Map()
    let maxFreq = 0
    for (let j = i; j < s.length; j++) {
      count.set(s[j], (count.get(s[j]) ?? 0) + 1)
      maxFreq = Math.max(maxFreq, count.get(s[j]))
      if (j - i + 1 - maxFreq <= k) best = Math.max(best, j - i + 1)
    }
  }
  return best
}

/**
 * Approach 2 — one window per candidate letter.  O(a*n) time, O(a) space for
 * the alphabet of size a.
 *
 * Guess the letter the final run is made of. Once it is fixed, the validity test
 * stops mentioning "most common" and becomes a plain counter: how many
 * characters in this window are not the target. That is a textbook window —
 * grow right, shrink left while the count exceeds k.
 *
 * Easier to defend than approach 3, and fast enough for a 26-letter alphabet.
 */
function characterReplacementPerLetter(s, k) {
  let best = 0
  for (const target of new Set(s)) {
    let l = 0, others = 0
    for (let r = 0; r < s.length; r++) {
      if (s[r] !== target) others++
      while (others > k) {
        if (s[l] !== target) others--
        l++
      }
      best = Math.max(best, r - l + 1)
    }
  }
  return best
}

/**
 * Approach 3 — one window, high-water-mark count.  O(n) time, O(a) space.
 * ** optimal **
 *
 * The expensive part of a single window is recomputing "most common character"
 * after every shrink. The trick is that you never have to: maxFreq is kept as
 * the best majority count seen anywhere so far, and is deliberately allowed to
 * go stale.
 *
 * Why that is safe: a stale maxFreq is too large, so the window shrinks less
 * than it strictly should and can be momentarily invalid. But an invalid window
 * is never longer than the valid one that set maxFreq, so it cannot inflate the
 * answer. The window only actually grows when a genuinely larger majority
 * appears, which is the only case that matters.
 *
 * Do not "fix" this by recomputing the max — that is approach 2 in disguise.
 */
function characterReplacement(s, k) {
  const count = new Map()
  let l = 0, maxFreq = 0, best = 0
  for (let r = 0; r < s.length; r++) {
    count.set(s[r], (count.get(s[r]) ?? 0) + 1)
    maxFreq = Math.max(maxFreq, count.get(s[r]))
    while (r - l + 1 - maxFreq > k) {
      count.set(s[l], count.get(s[l]) - 1)
      l++
    }
    best = Math.max(best, r - l + 1)
  }
  return best
}

module.exports = {
  characterReplacement,
  characterReplacementBrute,
  characterReplacementPerLetter
}

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  const fns = [characterReplacement, characterReplacementBrute, characterReplacementPerLetter]
  for (const fn of fns) {
    eq(fn('AABABBA', 1), 4, `${fn.name} worked example`)
    eq(fn('ABAB', 2), 4, `${fn.name} whole string`)
    eq(fn('', 2), 0, `${fn.name} empty`)
    eq(fn('A', 0), 1, `${fn.name} single character`)
    eq(fn('AAAA', 0), 4, `${fn.name} no change needed`)
    eq(fn('ABCDE', 0), 1, `${fn.name} k of zero`)
    eq(fn('ABCDE', 4), 5, `${fn.name} k covers everything`)
    eq(fn('AABA', 0), 2, `${fn.name} off by one: two As, not three`)
    eq(fn('BAAAB', 2), 5, `${fn.name} majority in the middle`)
  }
  report('longest-repeating-character-replacement')
}
