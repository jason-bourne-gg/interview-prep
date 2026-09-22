'use strict'
/**
 * HOUSE ROBBER
 *
 * Houses in a row each hold some money. You cannot rob two adjacent houses.
 * Return the most you can take.
 *
 *   [2, 7, 9, 3, 1]  ->  12        (2 + 9 + 1)
 *
 * Recurrence: best(i) = max(best(i - 1), best(i - 2) + nums[i]), where best(i)
 * is the most obtainable from the first i + 1 houses. Either you skip house i,
 * and the answer is whatever the prefix without it gave, or you rob it, in which
 * case house i - 1 is off limits and you add to best(i - 2).
 *
 * The worked example is worth staring at: the greedy "take the biggest" would
 * grab 9, then 2 and 1, reaching 12 by luck. On [2, 1, 1, 2] greedy takes a 2,
 * then is blocked, and misses that both 2s are compatible. Greedy has no way to
 * know that skipping a large house can pay for two others.
 *
 * Pattern: dynamic programming (linear)
 */

/**
 * Approach 1 — naive recursion.  O(2^n) time, O(n) stack.
 *
 * Branch on rob-or-skip at each house. Both branches descend into overlapping
 * prefixes — skip-then-skip and rob-then-nothing both land on i - 2 — so the
 * tree is exponential while the number of distinct questions is only n.
 */
function robNaive(nums) {
  const best = i => {
    if (i < 0) return 0
    return Math.max(best(i - 1), best(i - 2) + nums[i])
  }
  return best(nums.length - 1)
}

/**
 * Approach 2 — memoised recursion (top-down).  O(n) time, O(n) space.
 *
 * The index is the whole state. Which houses you robbed earlier does not
 * constrain the prefix answer, because the only rule is local: no two adjacent.
 * That locality is what makes the state one-dimensional.
 */
function robMemo(nums) {
  const memo = new Map()
  const best = i => {
    if (i < 0) return 0
    if (memo.has(i)) return memo.get(i)
    const value = Math.max(best(i - 1), best(i - 2) + nums[i])
    memo.set(i, value)
    return value
  }
  return best(nums.length - 1)
}

/**
 * Approach 3 — tabulation (bottom-up).  O(n) time, O(n) space.
 *
 * Fill left to right. The offset-by-one table (dp has n + 1 entries, dp[i]
 * covers the first i houses) removes the negative-index guards entirely, which
 * is why it is worth the extra cell.
 */
function robTable(nums) {
  const dp = Array(nums.length + 1).fill(0)
  dp[0] = 0                                     // no houses
  dp[1] = nums.length ? nums[0] : 0             // one house
  for (let i = 2; i <= nums.length; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i - 1])
  }
  return dp[nums.length]
}

/**
 * Approach 4 — rolling variables.  O(n) time, O(1) space.  ** optimal **
 *
 * Only the last two entries are ever read, so the table collapses to two
 * numbers. Name them for what they mean — the best including this house and the
 * best excluding it — and the update reads as the recurrence, which is how you
 * avoid swapping them in the wrong order under pressure.
 */
function rob(nums) {
  let skip = 0      // best for houses before the previous one
  let take = 0      // best for houses up to the previous one
  for (const money of nums) {
    const next = Math.max(take, skip + money)
    skip = take
    take = next
  }
  return take
}

module.exports = { rob, robNaive, robMemo, robTable }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [rob, robNaive, robMemo, robTable]) {
    eq(fn([2, 7, 9, 3, 1]), 12, `${fn.name} worked example`)
    eq(fn([1, 2, 3, 1]), 4, `${fn.name} skip the middle`)
    eq(fn([]), 0, `${fn.name} no houses`)
    eq(fn([5]), 5, `${fn.name} single house`)
    eq(fn([2, 1, 1, 2]), 4, `${fn.name} greedy grabs one 2 and misses the other`)
    eq(fn([0, 0, 0]), 0, `${fn.name} all zeros`)
    eq(fn([100, 1, 1, 100]), 200, `${fn.name} both ends`)
    eq(fn([2, 2]), 2, `${fn.name} two adjacent, take one`)
  }
  report('house-robber')
}
