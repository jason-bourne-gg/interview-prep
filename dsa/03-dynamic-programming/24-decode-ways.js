'use strict'
/**
 * DECODE WAYS
 *
 * 'A' through 'Z' are encoded as "1" through "26". Given a digit string, count
 * the ways to decode it back into letters.
 *
 *   "226"  ->  3        (2 2 6 = BBF, 22 6 = VF, 2 26 = BZ)
 *
 * Recurrence, where ways(i) counts decodings of the first i characters:
 *   ways(i) = ways(i - 1)  if s[i - 1] is '1'..'9'
 *           + ways(i - 2)  if s[i - 2..i - 1] reads 10..26
 * with ways(0) = 1. The last letter came from either one digit or two, and those
 * cases are disjoint, so you add.
 *
 * Everything hard about this problem is '0'. A zero can never stand alone, and
 * it can only survive as the second digit of "10" or "20". So "06" is 0 ways,
 * not 1 — leading zeros are not a valid encoding of 6 — and "100" is 0 ways,
 * because the final 0 has no 1 or 2 in front of it. Also "27" is 1 way, not 2:
 * 27 is past Z. Those three strings are the test cases that catch every bug in
 * this problem.
 *
 * Pattern: dynamic programming (linear)
 */

/** One digit decodes iff it is not '0'. */
const oneOk = ch => ch >= '1' && ch <= '9'

/** Two digits decode iff they read 10..26 — so '1' followed by anything, or '2' followed by 0..6. */
const twoOk = (a, b) => a === '1' || (a === '2' && b >= '0' && b <= '6')

/**
 * Approach 1 — naive recursion.  O(2^n) time, O(n) stack.
 *
 * From each position, consume one digit or two and recurse. The two branches
 * re-converge two positions later and redo the same suffix, which is the
 * Fibonacci-shaped blow-up — and the reason the answer for a string of n ones is
 * the nth Fibonacci number.
 */
function numDecodingsNaive(s) {
  if (!s.length) return 0
  const go = i => {
    if (i === s.length) return 1
    if (!oneOk(s[i])) return 0                   // a leading '0' kills the branch
    let total = go(i + 1)
    if (i + 1 < s.length && twoOk(s[i], s[i + 1])) total += go(i + 2)
    return total
  }
  return go(0)
}

/**
 * Approach 2 — memoised recursion (top-down).  O(n) time, O(n) space.
 *
 * The state is the start index and nothing else: how the prefix was decoded
 * places no constraint on the suffix. One cache line per position turns the
 * exponential tree into n distinct calls.
 */
function numDecodingsMemo(s) {
  if (!s.length) return 0
  const memo = new Map()
  const go = i => {
    if (i === s.length) return 1
    if (!oneOk(s[i])) return 0
    if (memo.has(i)) return memo.get(i)
    let total = go(i + 1)
    if (i + 1 < s.length && twoOk(s[i], s[i + 1])) total += go(i + 2)
    memo.set(i, total)
    return total
  }
  return go(0)
}

/**
 * Approach 3 — tabulation (bottom-up).  O(n) time, O(n) space.
 *
 * dp[i] counts decodings of the first i characters, so dp is one longer than the
 * string and s[i - 1] is "the character dp[i] just added". Going forwards makes
 * the two contributions independent tests rather than nested branches, which is
 * much harder to get wrong than the recursion.
 */
function numDecodingsTable(s) {
  if (!s.length) return 0
  const dp = Array(s.length + 1).fill(0)
  dp[0] = 1                                      // the empty prefix decodes one way
  dp[1] = oneOk(s[0]) ? 1 : 0
  for (let i = 2; i <= s.length; i++) {
    if (oneOk(s[i - 1])) dp[i] += dp[i - 1]
    if (twoOk(s[i - 2], s[i - 1])) dp[i] += dp[i - 2]
  }
  return dp[s.length]
}

/**
 * Approach 4 — rolling variables.  O(n) time, O(1) space.  ** optimal **
 *
 * dp[i] reads only dp[i - 1] and dp[i - 2], so two numbers replace the array.
 *
 * The trap here is not the arithmetic, it is the reset: `prev` must become the
 * OLD `curr` even when `curr` was just computed as 0. Writing the shift as a
 * single tuple assignment, rather than two statements, is what stops that from
 * going wrong on strings like "100" where the count legitimately collapses.
 */
function numDecodings(s) {
  if (!s.length) return 0
  let prev = 1                                   // dp[i - 2]
  let curr = oneOk(s[0]) ? 1 : 0                 // dp[i - 1]
  for (let i = 2; i <= s.length; i++) {
    let next = 0
    if (oneOk(s[i - 1])) next += curr
    if (twoOk(s[i - 2], s[i - 1])) next += prev
    ;[prev, curr] = [curr, next]
  }
  return curr
}

module.exports = { numDecodings, numDecodingsNaive, numDecodingsMemo, numDecodingsTable }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [numDecodings, numDecodingsNaive, numDecodingsMemo, numDecodingsTable]) {
    eq(fn('226'), 3, `${fn.name} worked example`)
    eq(fn('12'), 2, `${fn.name} AB or L`)
    eq(fn(''), 0, `${fn.name} empty string`)
    eq(fn('1'), 1, `${fn.name} single digit`)
    eq(fn('0'), 0, `${fn.name} a lone zero decodes no way`)
    eq(fn('06'), 0, `${fn.name} leading zero is not 6`)
    eq(fn('10'), 1, `${fn.name} zero rescued by the 1`)
    eq(fn('100'), 0, `${fn.name} the second zero has nothing in front of it`)
    eq(fn('27'), 1, `${fn.name} 27 is past Z`)
    eq(fn('2101'), 1, `${fn.name} zeros forcing the split`)
    eq(fn('11106'), 2, `${fn.name} longer, with a rescued zero`)
    eq(fn('111'), 3, `${fn.name} fibonacci shape`)
  }
  report('decode-ways')
}
