'use strict'
/**
 * JUMP GAME
 *
 * Each entry is the MAXIMUM jump length from that index. Starting at index 0,
 * decide whether the last index is reachable.
 *
 *   [2, 3, 1, 1, 4]  ->  true        (0 -> 1 -> 4)
 *   [3, 2, 1, 0, 4]  ->  false       (every route lands on the 0 at index 3)
 *
 * Recurrence: reach(i) = OR over 1 <= k <= nums[i] of reach(i + k), with
 * reach(last) = true.
 *
 * This problem is in the DP category, and the DP is what most people write
 * first, but the DP is not the answer. The greedy below is O(n) and is what the
 * interviewer is waiting for. Both are here because knowing WHY the greedy is
 * safe is only convincing once you have seen the quadratic version it replaces.
 *
 * Pattern: greedy (reachability), with dynamic programming as the stepping stone
 */

/**
 * Approach 1 — brute-force recursion.  O(2^n) time, O(n) stack.
 *
 * From each index, try every jump length it allows. Exponential because the same
 * index is re-explored through every distinct route that reaches it, and the
 * number of routes is exponential even when the answer is a flat "no".
 */
function canJumpBrute(nums) {
  if (!nums.length) return true
  const last = nums.length - 1
  const go = i => {
    if (i >= last) return true
    for (let k = 1; k <= nums[i]; k++) {
      if (go(i + k)) return true
    }
    return false
  }
  return go(0)
}

/**
 * Approach 2 — tabulation from the right.  O(n^2) time, O(n) space.
 *
 * dp[i] is "the end is reachable from i". Fill right to left, so every dp[i + k]
 * the inner loop reads is already settled. This is the natural memoisation of
 * approach 1 and it is a perfectly good answer — it just does more work than the
 * problem requires, because it asks a separate question at every index instead
 * of carrying one running fact.
 */
function canJumpDP(nums) {
  if (!nums.length) return true
  const n = nums.length
  const dp = Array(n).fill(false)
  dp[n - 1] = true                               // the end reaches itself
  for (let i = n - 2; i >= 0; i--) {
    const furthest = Math.min(i + nums[i], n - 1)
    for (let k = i + 1; k <= furthest; k++) {
      if (dp[k]) { dp[i] = true; break }
    }
  }
  return dp[0]
}

/**
 * Approach 3 — greedy furthest reach.  O(n) time, O(1) space.  ** optimal **
 *
 * The observation that kills the inner loop: jumps are "up to" lengths, not
 * exact ones, so if index i is reachable then so is every index below it. The
 * reachable set is therefore always a PREFIX [0, reach], and a prefix is fully
 * described by one number.
 *
 * So sweep left to right keeping the furthest index reached so far. If the sweep
 * ever stands on an index beyond that number, there is a gap no jump can cross
 * and the answer is false — no need to look further. Otherwise the reach only
 * grows, and surviving to the end means the end was reachable.
 *
 * The greedy choice is safe precisely because it never commits to a route. It
 * tracks what is possible, not what to do, so there is no decision to regret.
 */
function canJump(nums) {
  let reach = 0
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false                  // a gap: nothing can land on i
    const from = i + nums[i]
    if (from > reach) reach = from
  }
  return true
}

module.exports = { canJump, canJumpBrute, canJumpDP }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [canJump, canJumpBrute, canJumpDP]) {
    eq(fn([2, 3, 1, 1, 4]), true, `${fn.name} worked example`)
    eq(fn([3, 2, 1, 0, 4]), false, `${fn.name} the 0 at index 3 blocks every route`)
    eq(fn([]), true, `${fn.name} empty`)
    eq(fn([0]), true, `${fn.name} single element, already at the end`)
    eq(fn([1, 0]), true, `${fn.name} the trailing 0 is the goal, not an obstacle`)
    eq(fn([0, 1]), false, `${fn.name} stuck at the start`)
    eq(fn([2, 0, 0]), true, `${fn.name} one jump clears both zeros`)
    eq(fn([1, 2, 0, 1]), true, `${fn.name} must jump over the zero`)
    eq(fn([2, 5, 0, 0]), true, `${fn.name} a later index extends the reach`)
    eq(fn([1, 1, 1, 0]), true, `${fn.name} exact arrival`)
  }
  report('jump-game')
}
