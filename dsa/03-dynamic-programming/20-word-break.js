'use strict'
/**
 * WORD BREAK
 *
 * Given a string and a dictionary of words, decide whether the string can be
 * cut into a sequence of dictionary words. Words may be reused any number of
 * times, and the whole string must be consumed.
 *
 *   "sandcastle", ["sand", "castle"]  ->  true
 *   "catsandog", ["cats", "dog", "sand", "and", "cat"]  ->  false
 *
 * Recurrence: ok(i) is true when the suffix starting at i can be broken, and
 *   ok(i) = OR over words w that match at i of ok(i + w.length),  ok(n) = true.
 *
 * The reason a greedy longest-match fails is the second example: "cats" matches
 * at 0 and leaves "andog", which is dead. You have to be able to come back and
 * try "cat" instead, and the DP is what makes that backtracking cheap.
 *
 * Pattern: dynamic programming (linear over cut points)
 */

/**
 * Approach 1 — naive recursion.  O(2^n) time, O(n) stack.
 *
 * Try every prefix that is a word and recurse on the rest. The blow-up is real
 * and easy to demonstrate: with "aaaa...ab" and words ["a", "aa"] the same
 * suffix is re-examined once per distinct way of reaching it, and the number of
 * ways is exponential.
 */
function wordBreakNaive(s, wordDict) {
  const words = new Set(wordDict)
  const go = i => {
    if (i === s.length) return true
    for (const w of words) {
      if (s.startsWith(w, i) && go(i + w.length)) return true
    }
    return false
  }
  return go(0)
}

/**
 * Approach 2 — memoised recursion (top-down).  O(n * k * L) time, O(n) space,
 * for k words of length up to L.
 *
 * The state is only the start index — how you arrived at position i has no
 * bearing on whether the rest can be broken. Caching one boolean per index is
 * all it takes, and it turns the exponential retries into at most one failure
 * per position.
 */
function wordBreakMemo(s, wordDict) {
  const words = new Set(wordDict)
  const memo = new Map()
  const go = i => {
    if (i === s.length) return true
    if (memo.has(i)) return memo.get(i)
    let ok = false
    for (const w of words) {
      if (s.startsWith(w, i) && go(i + w.length)) { ok = true; break }
    }
    memo.set(i, ok)
    return ok
  }
  return go(0)
}

/**
 * Approach 3 — tabulation (bottom-up).  O(n * k * L) time, O(n) space.
 * ** optimal **
 *
 * dp[i] means "the first i characters can be broken". Walk forward, and at each
 * i ask which word could have ENDED here: if dp[i - w.length] is already true
 * and the slice matches, dp[i] is true.
 *
 * Reading the table forwards rather than the recursion backwards is what makes
 * the base case obvious — dp[0] is true because the empty prefix is a valid
 * (empty) sequence of words. Forgetting to seed dp[0] makes every input false,
 * which is the quiet failure in this problem.
 */
function wordBreak(s, wordDict) {
  const words = new Set(wordDict)
  const dp = Array(s.length + 1).fill(false)
  dp[0] = true
  for (let i = 1; i <= s.length; i++) {
    for (const w of words) {
      if (w.length <= i && dp[i - w.length] && s.startsWith(w, i - w.length)) {
        dp[i] = true
        break
      }
    }
  }
  return dp[s.length]
}

module.exports = { wordBreak, wordBreakNaive, wordBreakMemo }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [wordBreak, wordBreakNaive, wordBreakMemo]) {
    eq(fn('sandcastle', ['sand', 'castle']), true, `${fn.name} worked example`)
    eq(fn('applepenapple', ['apple', 'pen']), true, `${fn.name} word reused`)
    eq(fn('catsandog', ['cats', 'dog', 'sand', 'and', 'cat']), false,
      `${fn.name} greedy longest match would strand the tail`)
    eq(fn('', ['a']), true, `${fn.name} empty string breaks trivially`)
    eq(fn('a', ['a']), true, `${fn.name} single character, present`)
    eq(fn('a', ['b']), false, `${fn.name} single character, absent`)
    eq(fn('abc', []), false, `${fn.name} empty dictionary`)
    eq(fn('aaaaaaa', ['aaa', 'aaaa']), true, `${fn.name} 3 + 4 exactly`)
    eq(fn('cars', ['car', 'ca', 'rs']), true, `${fn.name} the shorter prefix is the right one`)
  }
  report('word-break')
}
