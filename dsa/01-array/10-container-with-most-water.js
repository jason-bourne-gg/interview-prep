'use strict'
/**
 * CONTAINER WITH MOST WATER
 *
 * height[i] is a vertical line at x = i. Pick two lines so that they and the
 * x-axis hold the most water. Return that area.
 *
 *   [1, 8, 6, 2, 5, 4, 8, 3, 7]  ->  49
 *
 * Pattern: two pointers, shrinking from the widest
 */

/** Approach 1 — brute force. O(n^2) time, O(1) space. */
function maxAreaBrute(height) {
  let best = 0
  for (let i = 0; i < height.length; i++) {
    for (let j = i + 1; j < height.length; j++) {
      best = Math.max(best, Math.min(height[i], height[j]) * (j - i))
    }
  }
  return best
}

/**
 * Approach 2 — two pointers.  O(n) time, O(1) space.  ** optimal **
 *
 * Area = min(height[l], height[r]) * (r - l). Start at the widest pair, so
 * width can only shrink from here; the only way to gain is a taller line.
 *
 * Why discarding the shorter line is safe — and this argument IS the interview:
 * any container that still uses the shorter line but a narrower partner is both
 * no taller (the short line still caps it) and strictly thinner. It can never
 * beat the area we just recorded, so nothing is lost by moving past it.
 */
function maxArea(height) {
  let lo = 0, hi = height.length - 1, best = 0
  while (lo < hi) {
    best = Math.max(best, Math.min(height[lo], height[hi]) * (hi - lo))
    if (height[lo] < height[hi]) lo++              // move the SHORTER line
    else hi--
  }
  return best
}

module.exports = { maxArea, maxAreaBrute }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [maxArea, maxAreaBrute]) {
    eq(fn([1, 8, 6, 2, 5, 4, 8, 3, 7]), 49, `${fn.name} basic`)
    eq(fn([1, 1]), 1, `${fn.name} two equal`)
    eq(fn([1, 2, 1]), 2, `${fn.name} peak in middle`)
    eq(fn([2, 3, 4, 5, 18, 17, 6]), 17, `${fn.name} tall pair`)
  }
  report('container-with-most-water')
}
