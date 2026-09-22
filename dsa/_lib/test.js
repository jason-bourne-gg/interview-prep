'use strict'
/**
 * A three-line test harness.
 *
 * Every solution file runs its own checks when executed directly, so `node
 * <file>` tells you whether the code on the page actually works. A solution
 * nobody ran is a solution with a bug in it.
 */
let passed = 0, failed = 0

const eq = (actual, expected, label = '') => {
  const a = JSON.stringify(actual), e = JSON.stringify(expected)
  if (a === e) { passed++; return }
  failed++
  console.error(`  ✗ ${label}\n      got      ${a}\n      expected ${e}`)
}

/** Compare ignoring order — for problems whose output order is unspecified. */
const eqUnordered = (actual, expected, label = '') => {
  const norm = x => JSON.stringify([...x].map(v => JSON.stringify(v)).sort())
  if (norm(actual) === norm(expected)) { passed++; return }
  failed++
  console.error(`  ✗ ${label}\n      got      ${JSON.stringify(actual)}\n      expected ${JSON.stringify(expected)}`)
}

const report = name => {
  if (failed) { console.error(`${name}: ${passed} passed, ${failed} FAILED`); process.exitCode = 1 }
  else console.log(`${name}: ${passed} passed`)
}

module.exports = { eq, eqUnordered, report }
