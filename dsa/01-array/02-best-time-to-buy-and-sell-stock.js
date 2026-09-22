'use strict'
/**
 * BEST TIME TO BUY AND SELL STOCK
 *
 * prices[i] is the price on day i. Buy on one day and sell on a LATER day.
 * Return the maximum profit, or 0 if no profit is possible.
 *
 *   [7, 1, 5, 3, 6, 4]  ->  5   (buy at 1, sell at 6)
 *   [7, 6, 4, 3, 1]     ->  0   (prices only fall)
 *
 * Pattern: running minimum
 */

/** Approach 1 — brute force. O(n^2) time, O(1) space. Every (buy, sell) pair. */
function maxProfitBrute(prices) {
  let best = 0
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      best = Math.max(best, prices[j] - prices[i])
    }
  }
  return best
}

/**
 * Approach 2 — one pass.  O(n) time, O(1) space.  ** optimal **
 *
 * The best profit achievable *selling today* is today's price minus the
 * cheapest price seen so far. The running minimum replaces the inner loop.
 *
 * Update the minimum FIRST. Buying and selling the same day gives 0, which is
 * legal; selling before buying is not, and this ordering rules it out.
 */
function maxProfit(prices) {
  let min = Infinity, best = 0
  for (const price of prices) {
    min = Math.min(min, price)
    best = Math.max(best, price - min)
  }
  return best
}

module.exports = { maxProfit, maxProfitBrute }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [maxProfit, maxProfitBrute]) {
    eq(fn([7, 1, 5, 3, 6, 4]), 5, `${fn.name} basic`)
    eq(fn([7, 6, 4, 3, 1]), 0, `${fn.name} only falls`)
    eq(fn([1]), 0, `${fn.name} single day`)
    eq(fn([2, 4, 1]), 2, `${fn.name} best is early`)
  }
  report('best-time-to-buy-and-sell-stock')
}
