'use strict'
/**
 * COIN CHANGE
 *
 * Given coin denominations of unlimited supply and a target amount, return the
 * fewest coins that sum to exactly that amount, or -1 if no combination does.
 *
 *   coins [1, 2, 5], amount 11  ->  3        (5 + 5 + 1)
 *
 * Recurrence: best(a) = 1 + min over coins c of best(a - c), with best(0) = 0
 * and best(a) = Infinity for a < 0. In words: some coin has to be the last one
 * placed; try each candidate for that role and keep the cheapest remainder.
 *
 * Note the greedy answer — always take the largest coin that fits — is WRONG.
 * With coins [1, 3, 4] and amount 6, greedy takes 4 then 1 then 1 for three
 * coins, but 3 + 3 is two. Greedy only works for denomination systems with a
 * special structure, and the interviewer will not give you one.
 *
 * Pattern: dynamic programming (knapsack, unbounded)
 */

/**
 * Approach 1 — naive recursion.  O(coins^amount) time, O(amount) stack.
 *
 * Branch on every coin at every level. It re-derives the same remainder through
 * many different orderings — reaching 7 via 5 then 2 and via 2 then 5 are two
 * separate subtrees doing identical work. That duplication is the opening for
 * memoisation.
 */
function coinChangeNaive(coins, amount) {
  const best = rest => {
    if (rest === 0) return 0
    if (rest < 0) return Infinity
    let fewest = Infinity
    for (const c of coins) fewest = Math.min(fewest, 1 + best(rest - c))
    return fewest
  }
  const answer = best(amount)
  return answer === Infinity ? -1 : answer
}

/**
 * Approach 2 — memoised recursion (top-down).  O(amount * coins) time,
 * O(amount) space.
 *
 * The state is just the remaining amount — the coins already chosen do not
 * change what the best completion is. That collapses the enormous tree into at
 * most `amount` distinct subproblems. Identifying the minimal state is the step
 * that earns the complexity drop; everything after it is bookkeeping.
 */
function coinChangeMemo(coins, amount) {
  const memo = new Map()
  const best = rest => {
    if (rest === 0) return 0
    if (rest < 0) return Infinity
    if (memo.has(rest)) return memo.get(rest)
    let fewest = Infinity
    for (const c of coins) fewest = Math.min(fewest, 1 + best(rest - c))
    memo.set(rest, fewest)
    return fewest
  }
  const answer = best(amount)
  return answer === Infinity ? -1 : answer
}

/**
 * Approach 3 — tabulation (bottom-up).  O(amount * coins) time, O(amount) space.
 * ** optimal **
 *
 * Fill dp[0..amount] in increasing order, so every dp[a - c] it reads is already
 * final. No recursion means no stack limit at large amounts, which is the only
 * practical difference from approach 2.
 *
 * There is no rolling-array rung here: dp[a] can reach back as far as the
 * largest coin, so you would have to keep that many cells anyway, and the coins
 * are unbounded. O(amount) space is the floor.
 *
 * Use Infinity, not a sentinel like amount + 1, and the "unreachable" case stays
 * honest — with `amount + 1` you have to remember that dp[a] > amount means -1,
 * and that check is a classic place to get the comparison backwards.
 */
function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity)
  dp[0] = 0                                     // zero coins make zero
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}

module.exports = { coinChange, coinChangeNaive, coinChangeMemo }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [coinChange, coinChangeNaive, coinChangeMemo]) {
    eq(fn([1, 2, 5], 11), 3, `${fn.name} worked example`)
    eq(fn([2], 3), -1, `${fn.name} unreachable`)
    eq(fn([1, 2, 5], 0), 0, `${fn.name} zero amount needs zero coins`)
    eq(fn([5], 5), 1, `${fn.name} single coin, exact`)
    eq(fn([7], 3), -1, `${fn.name} coin larger than amount`)
    eq(fn([], 4), -1, `${fn.name} no coins at all`)
    eq(fn([1, 3, 4], 6), 2, `${fn.name} greedy would say 3, answer is 2`)
    eq(fn([2, 5, 10, 1], 27), 4, `${fn.name} mixed denominations`)
  }
  // Only the two polynomial approaches can survive a realistic amount.
  for (const fn of [coinChange, coinChangeMemo]) {
    eq(fn([186, 419, 83, 408], 6249), 20, `${fn.name} large amount, awkward coins`)
  }
  report('coin-change')
}
