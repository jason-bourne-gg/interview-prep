'use strict'
/**
 * COMBINATION SUM
 *
 * Given an array of distinct positive integers and a target, count the ways to
 * add them up to the target. Numbers may be reused without limit, and ORDER
 * COUNTS: 1 + 2 and 2 + 1 are two different answers.
 *
 *   [1, 2, 3], target 4  ->  7
 *   (1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2, 1+3, 3+1)
 *
 * Recurrence: ways(t) = sum over n in nums of ways(t - n), with ways(0) = 1
 * (the empty sum) and ways(t) = 0 for t < 0. Every sequence has a first number;
 * group the sequences by what that first number is, and the groups are disjoint.
 *
 * ON THE NAME. The Blind 75 list titles this "Combination Sum", but the problem
 * it points at is the counting one above, where permutations are counted
 * separately — despite "combination" meaning the opposite in ordinary usage.
 * The classic problem with the same name asks for the DISTINCT UNORDERED
 * combinations themselves, as lists, where [1, 3] and [3, 1] are one answer.
 * Interviewers ask both, and confusing them is the usual way to lose the
 * question, so both are solved here.
 *
 * The difference is one line of code: the LOOP ORDER of the table.
 *   - target outer, numbers inner  ->  ORDERED (each new number can follow any
 *     sequence, so orderings are recounted)
 *   - numbers outer, target inner  ->  UNORDERED (a number is only ever appended
 *     after numbers considered earlier, so each multiset is built exactly once)
 * That is the whole lesson. The unordered version is the coin-change counting
 * table; see 17-coin-change.js for the same grid used for a different question.
 *
 * Pattern: dynamic programming (knapsack, unbounded) — and backtracking for the
 * variant that returns the combinations themselves
 */

/**
 * Approach 1 — naive recursion.  O(branches^target) time, O(target) stack.
 *
 * Spell the recurrence out: subtract each number in turn and recurse. Reaching a
 * remaining total of 0 is one valid sequence. It re-solves the same remainder
 * once per path that reaches it, and the number of paths is the answer itself,
 * which grows exponentially — so the work is proportional to the output, not to
 * the input.
 */
function countOrderedCombinationsBrute(nums, target) {
  const ways = rest => {
    if (rest === 0) return 1
    if (rest < 0) return 0
    let total = 0
    for (const n of nums) total += ways(rest - n)
    return total
  }
  return ways(target)
}

/**
 * Approach 2 — memoised recursion (top-down).  O(target * n) time, O(target)
 * space.
 *
 * The remaining total is the entire state: which numbers you already used, and
 * in what order, has no effect on how many ways the rest can be completed. Cache
 * on that one integer and the exponential count comes out in linear work.
 */
function countOrderedCombinationsMemo(nums, target) {
  const memo = new Map()
  const ways = rest => {
    if (rest === 0) return 1
    if (rest < 0) return 0
    if (memo.has(rest)) return memo.get(rest)
    let total = 0
    for (const n of nums) total += ways(rest - n)
    memo.set(rest, total)
    return total
  }
  return ways(target)
}

/**
 * Approach 3 — tabulation, target outer.  O(target * n) time, O(target) space.
 * ** optimal **
 *
 * dp[t] is the number of ordered sequences summing to t. Filling t upwards, the
 * inner loop appends each number to every sequence that reached t - n. Because
 * the target loop is on the outside, a given multiset is reached once per
 * ordering — which is what this version of the problem wants.
 *
 * dp[0] = 1 is not a hack: there is exactly one way to make 0, by choosing
 * nothing, and every other entry is built on top of it.
 */
function countOrderedCombinations(nums, target) {
  const dp = Array(target + 1).fill(0)
  dp[0] = 1
  for (let t = 1; t <= target; t++) {
    for (const n of nums) {
      if (n <= t) dp[t] += dp[t - n]
    }
  }
  return dp[target]
}

/**
 * Variant — count DISTINCT UNORDERED combinations.  O(target * n) time,
 * O(target) space.
 *
 * Exactly the table above with the loops swapped. Fixing a number on the outside
 * means every sequence it contributes to is built by appending that number after
 * numbers already processed, so each multiset is counted once and 1 + 3 never
 * recurs as 3 + 1.
 *
 *   [1, 2, 3], target 4  ->  4        (1+1+1+1, 1+1+2, 2+2, 1+3)
 */
function countUnorderedCombinations(nums, target) {
  const dp = Array(target + 1).fill(0)
  dp[0] = 1
  for (const n of nums) {
    for (let t = n; t <= target; t++) dp[t] += dp[t - n]
  }
  return dp[target]
}

/**
 * Variant — return the distinct unordered combinations themselves.
 * O(n^(target / min)) time in the worst case, O(target) stack plus the output.
 *
 * Counting can be done with a table; LISTING cannot, because there is no
 * structure smaller than the answer set. So this one is backtracking, not DP.
 *
 * Two details carry it. Passing `start` and never looking left again is what
 * enforces non-decreasing order, which is the same "numbers outer" trick that
 * made the counting table unordered. Sorting first lets the loop `break` instead
 * of `continue` the moment a candidate exceeds the remainder — every later
 * candidate is larger, so the whole branch is dead. That pruning is what keeps
 * it fast enough to be acceptable.
 *
 *   [2, 3, 6, 7], target 7  ->  [[2, 2, 3], [7]]
 */
function combinationsUnordered(nums, target) {
  const sorted = [...nums].sort((a, b) => a - b)
  const out = []
  const path = []
  const walk = (start, rest) => {
    if (rest === 0) { out.push([...path]); return }   // copy — path keeps mutating
    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > rest) break                      // sorted: everything after is worse
      path.push(sorted[i])
      walk(i, rest - sorted[i])                        // i, not i + 1 — reuse is allowed
      path.pop()
    }
  }
  if (target > 0) walk(0, target)
  else if (target === 0) out.push([])
  return out
}

module.exports = {
  countOrderedCombinations,
  countOrderedCombinationsBrute,
  countOrderedCombinationsMemo,
  countUnorderedCombinations,
  combinationsUnordered,
}

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  const ordered = [countOrderedCombinations, countOrderedCombinationsBrute, countOrderedCombinationsMemo]
  for (const fn of ordered) {
    eq(fn([1, 2, 3], 4), 7, `${fn.name} worked example, orderings counted`)
    eq(fn([1, 2], 3), 3, `${fn.name} 1+1+1, 1+2, 2+1`)
    eq(fn([2, 3], 7), 3, `${fn.name} 2+2+3 in three orders`)
    eq(fn([9], 3), 0, `${fn.name} target unreachable`)
    eq(fn([3], 3), 1, `${fn.name} single number, exact hit`)
    eq(fn([1], 0), 1, `${fn.name} target zero is the empty sum`)
    eq(fn([], 5), 0, `${fn.name} no numbers`)
  }

  // Same inputs, unordered: strictly fewer answers wherever a multiset has more
  // than one arrangement.
  eq(countUnorderedCombinations([1, 2, 3], 4), 4, 'unordered count, worked example')
  eq(countUnorderedCombinations([1, 2], 3), 2, 'unordered count, 1+1+1 and 1+2')
  eq(countUnorderedCombinations([2, 3], 7), 1, 'unordered count, only the multiset {2,2,3}')
  eq(countUnorderedCombinations([9], 3), 0, 'unordered count, unreachable')
  eq(countUnorderedCombinations([1], 0), 1, 'unordered count, target zero')

  eq(combinationsUnordered([2, 3, 6, 7], 7), [[2, 2, 3], [7]], 'combinations listed')
  eq(combinationsUnordered([2, 3, 5], 8), [[2, 2, 2, 2], [2, 3, 3], [3, 5]], 'combinations, reuse allowed')
  eq(combinationsUnordered([2], 1), [], 'combinations, none possible')
  eq(combinationsUnordered([7, 3, 2], 7), [[2, 2, 3], [7]], 'combinations, unsorted input is sorted first')
  eq(combinationsUnordered([1, 2], 0), [[]], 'combinations, target zero is the empty combination')

  report('combination-sum')
}
