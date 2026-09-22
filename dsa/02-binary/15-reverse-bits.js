'use strict'
/**
 * REVERSE BITS
 *
 * Reverse the bits of a 32-bit unsigned integer.
 *
 *   0b00000010100101000001111010011100
 *   -> 0b00111001011110000010100101000000
 *
 * Pattern: shift out of one end, shift into the other
 */

/**
 * Approach 1 — bit by bit.  O(32) time, O(1) space.  ** optimal for one call **
 *
 * Two JS-specific traps, both easy to miss and both silent:
 *
 *   n >>>= 1   NOT >>=. The signed shift preserves the sign bit, so a negative
 *              input never terminates its bits correctly.
 *   >>> 0      on the way out. `<<` produces a SIGNED 32-bit value, so a result
 *              with the top bit set comes back negative without this.
 */
function reverseBits(n) {
  let result = 0
  for (let i = 0; i < 32; i++) {
    result = (result << 1) | (n & 1)     // shift result left, drop in n's lowest bit
    n >>>= 1
  }
  return result >>> 0
}

/**
 * Approach 2 — divide and conquer, swapping halves.  O(1), no loop.
 *
 * Swap adjacent bits, then pairs, then nibbles, then bytes, then halves. Five
 * fixed steps. Elegant, and the kind of thing to mention rather than lead with.
 */
function reverseBitsSwap(n) {
  n = ((n >>> 1) & 0x55555555) | ((n & 0x55555555) << 1)   // odd/even bits
  n = ((n >>> 2) & 0x33333333) | ((n & 0x33333333) << 2)   // pairs
  n = ((n >>> 4) & 0x0f0f0f0f) | ((n & 0x0f0f0f0f) << 4)   // nibbles
  n = ((n >>> 8) & 0x00ff00ff) | ((n & 0x00ff00ff) << 8)   // bytes
  n = (n >>> 16) | (n << 16)                               // halves
  return n >>> 0
}

/**
 * Approach 3 — byte lookup table, for the "called many times" follow-up.
 *
 * Precompute the reversal of all 256 bytes once, then reverse any 32-bit number
 * with four lookups. This is the answer the follow-up is fishing for.
 */
const BYTE_REVERSED = Array.from({ length: 256 }, (_, b) => {
  let r = 0
  for (let i = 0; i < 8; i++) r = (r << 1) | ((b >>> i) & 1)
  return r
})

function reverseBitsCached(n) {
  return (
    (BYTE_REVERSED[n & 0xff] << 24) |
    (BYTE_REVERSED[(n >>> 8) & 0xff] << 16) |
    (BYTE_REVERSED[(n >>> 16) & 0xff] << 8) |
    BYTE_REVERSED[(n >>> 24) & 0xff]
  ) >>> 0
}

module.exports = { reverseBits, reverseBitsSwap, reverseBitsCached }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [reverseBits, reverseBitsSwap, reverseBitsCached]) {
    eq(fn(0b00000010100101000001111010011100), 964176192, `${fn.name} basic`)
    eq(fn(0b11111111111111111111111111111101), 3221225471, `${fn.name} nearly all ones`)
    eq(fn(0), 0, `${fn.name} zero`)
    eq(fn(1), 2147483648, `${fn.name} lowest bit to highest`)
  }
  report('reverse-bits')
}
