'use strict'
/**
 * VALID PARENTHESES
 *
 * The string holds only the six characters ()[]{}. It is valid when every
 * opener is closed by the matching closer, and the pairs nest rather than cross.
 *
 *   '{[]}'  ->  true
 *   '([)]'  ->  false   (balanced counts, but the pairs cross)
 *
 * Counting brackets is not enough, and that second example is why: three
 * counters all reach zero on '([)]'. What has to be remembered is the ORDER the
 * openers arrived in, and the newest one must close first — which is the
 * definition of a stack.
 *
 * Pattern: stack (the monotonic-stack family in PATTERNS.md)
 */

/**
 * Approach 1 — delete matched pairs until nothing changes.  O(n^2) time, O(n)
 * space.
 *
 * An innermost pair is always adjacent, so erasing '()', '[]' and '{}' wherever
 * they appear peels the string one layer at a time. Valid input erases to
 * nothing. Correct, and it makes the nesting visible, but each sweep is O(n) and
 * a string like '((((...))))' needs one sweep per layer.
 *
 * Note that String.replace with a string argument replaces the FIRST match only,
 * which is why this sits inside a loop that runs until the string stops
 * shrinking.
 */
function isValidReplace(s) {
  let prev
  do {
    prev = s
    s = s.replace('()', '').replace('[]', '').replace('{}', '')
  } while (s !== prev)
  return s.length === 0
}

/**
 * Approach 2 — stack.  O(n) time, O(n) space.  ** optimal **
 *
 * One pass. Push every opener; on a closer, the only thing that can legally be
 * on top is its partner. That single check enforces both rules at once — the
 * right partner, and the right order.
 *
 * Two endings people forget:
 *   - a closer arriving with an empty stack is invalid, not a no-op ( ')' )
 *   - leftovers on the stack at the end are invalid ( '(' )
 * Returning `stack.length === 0` rather than `true` handles the second.
 */
function isValid(s) {
  const partner = { ')': '(', ']': '[', '}': '{' }
  const stack = []
  for (const c of s) {
    if (c in partner) {
      if (stack.pop() !== partner[c]) return false   // pop() on [] gives undefined
    } else {
      stack.push(c)
    }
  }
  return stack.length === 0
}

module.exports = { isValid, isValidReplace }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [isValid, isValidReplace]) {
    eq(fn('{[]}'), true, `${fn.name} worked example`)
    eq(fn('([)]'), false, `${fn.name} crossed pairs`)
    eq(fn(''), true, `${fn.name} empty is valid`)
    eq(fn('()'), true, `${fn.name} minimal pair`)
    eq(fn('()[]{}'), true, `${fn.name} sequential pairs`)
    eq(fn('(]'), false, `${fn.name} wrong partner`)
    eq(fn('('), false, `${fn.name} leftover opener`)
    eq(fn(')'), false, `${fn.name} closer with nothing open`)
    eq(fn(')('), false, `${fn.name} balanced counts, wrong order`)
    eq(fn('(((((())))))'), true, `${fn.name} deep nesting`)
  }
  report('valid-parentheses')
}
