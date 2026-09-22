'use strict'
/**
 * SUM OF TWO INTEGERS
 *
 * Return a + b without using + or -.
 *
 *   1, 2   ->  3
 *   -2, 3  ->  1
 *
 * Pattern: XOR is addition without carry; AND finds the carries
 */

/**
 * Approach — XOR and carry.  O(1) time (bounded by 32 bits), O(1) space.
 *
 * Split addition into two halves:
 *   a ^ b          the sum IGNORING carries (XOR is per-bit addition mod 2)
 *   (a & b) << 1   the carries, shifted into the column they belong to
 *
 * Repeat until there is no carry left. Each round pushes carries one column
 * left, so after at most 32 rounds they fall off the end and it terminates.
 *
 * Negatives need no special case: JS bitwise ops use two's complement, which is
 * exactly why hardware adders do not special-case them either.
 */
function getSum(a, b) {
  while (b !== 0) {
    const carry = (a & b) << 1
    a = a ^ b
    b = carry
  }
  return a
}

/** Subtraction, for the same reason: a - b === a + (-b), and -b is ~b + 1. */
function getDifference(a, b) {
  return getSum(a, getSum(~b, 1))
}

module.exports = { getSum, getDifference }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  eq(getSum(1, 2), 3, 'positive')
  eq(getSum(2, 3), 5, 'positive')
  eq(getSum(-2, 3), 1, 'mixed sign')
  eq(getSum(-5, -3), -8, 'both negative')
  eq(getSum(0, 0), 0, 'zeros')
  eq(getSum(-1, 1), 0, 'cancels')
  eq(getDifference(5, 3), 2, 'subtraction')
  report('sum-of-two-integers')
}
