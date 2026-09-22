'use strict'
/**
 * NUMBER OF 1 BITS  (Hamming weight)
 *
 * Count the set bits in a 32-bit unsigned integer.
 *
 *   0b1011  ->  3
 *
 * Pattern: n & (n - 1) clears the lowest set bit
 */

/**
 * Approach 1 — check every bit.  O(32) time, O(1) space.
 *
 * Use >>> not >>. The signed shift copies the sign bit, so a negative input
 * gives the wrong count.
 */
function hammingWeightLoop(n) {
  let count = 0
  for (let i = 0; i < 32; i++) if ((n >>> i) & 1) count++
  return count
}

/**
 * Approach 2 — n & (n - 1).  O(set bits) time, O(1) space.  ** optimal **
 *
 * Subtracting 1 flips the lowest set bit to 0 and turns everything below it
 * into 1s. ANDing therefore erases exactly one set bit:
 *
 *   n        = 1011000
 *   n - 1    = 1010111
 *   n & (n-1)= 1010000     <- the lowest 1 is gone
 *
 * So the loop runs once per set bit, not 32 times. Worth knowing cold — this
 * trick shows up inside other problems.
 */
function hammingWeight(n) {
  let count = 0
  while (n !== 0) {
    n &= n - 1
    count++
  }
  return count
}

module.exports = { hammingWeight, hammingWeightLoop }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [hammingWeight, hammingWeightLoop]) {
    eq(fn(0b1011), 3, `${fn.name} basic`)
    eq(fn(0), 0, `${fn.name} zero`)
    eq(fn(0b10000000000000000000000000000000 >>> 0), 1, `${fn.name} top bit`)
    eq(fn(4294967295), 32, `${fn.name} all ones`)
  }
  report('number-of-1-bits')
}
