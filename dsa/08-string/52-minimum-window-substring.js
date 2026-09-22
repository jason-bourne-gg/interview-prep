'use strict'
/**
 * MINIMUM WINDOW SUBSTRING
 *
 * Return the shortest substring of s that contains every character of t,
 * counting duplicates: if t is 'AAB' the window needs two As. Order does not
 * matter, extra characters are allowed, and '' means no such window exists.
 *
 *   s = 'ADOBECODEBANC', t = 'ABC'  ->  'BANC'
 *
 * Pattern: sliding window
 */

/**
 * Approach 1 — every start, extend until covered.  O(n^2 + n*a) time, O(a)
 * space over an alphabet of size a.
 *
 * For each start, walk right until the window covers t, then stop — extending
 * further only makes it longer. Correct, and it shows the shape of the answer,
 * but it rebuilds the counts from scratch for every start.
 */
function minWindowBrute(s, t) {
  if (!t.length || s.length < t.length) return ''
  const need = new Map()
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1)

  let best = ''
  for (let i = 0; i < s.length; i++) {
    const have = new Map()
    for (let j = i; j < s.length; j++) {
      have.set(s[j], (have.get(s[j]) ?? 0) + 1)
      let covered = true
      for (const [c, n] of need) if ((have.get(c) ?? 0) < n) { covered = false; break }
      if (covered) {
        if (!best || j - i + 1 < best.length) best = s.slice(i, j + 1)
        break
      }
    }
  }
  return best
}

/**
 * Approach 2 — sliding window, validity rechecked each step.  O(n*a) time,
 * O(a) space.
 *
 * The observation that kills the outer loop: once a window covers t, shrinking
 * from the left is the only way to improve it, and a window that has stopped
 * covering t can only be repaired by extending right. So one left pointer and
 * one right pointer, each moving forward only, visit every candidate worth
 * looking at.
 *
 * Still scans the whole need map to answer "is this valid?", which is the last
 * thing left to remove.
 */
function minWindowScan(s, t) {
  if (!t.length || s.length < t.length) return ''
  const need = new Map()
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1)

  const have = new Map()
  const covered = () => {
    for (const [c, n] of need) if ((have.get(c) ?? 0) < n) return false
    return true
  }

  let l = 0, best = ''
  for (let r = 0; r < s.length; r++) {
    have.set(s[r], (have.get(s[r]) ?? 0) + 1)
    while (covered()) {
      if (!best || r - l + 1 < best.length) best = s.slice(l, r + 1)
      have.set(s[l], have.get(s[l]) - 1)
      l++
    }
  }
  return best
}

/**
 * Approach 3 — sliding window with a satisfied counter.  O(n + m) time, O(a)
 * space.  ** optimal **
 *
 * Validity does not have to be recomputed, because it changes by at most one
 * character per move. Track how many distinct characters have their full quota
 * met; the window is valid exactly when that equals the number of distinct
 * characters in t. Each move adjusts the counter in O(1).
 *
 * The bug to avoid is `>=` in those two tests. Bump satisfied only on the move
 * that takes a count from "one short" to "exactly met" — with `>=`, a window
 * over 'AAAA' needing one A would count A four times and never be valid again
 * after the first removal.
 */
function minWindow(s, t) {
  if (!t.length || s.length < t.length) return ''
  const need = new Map()
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1)

  const have = new Map()
  const required = need.size
  let satisfied = 0
  let l = 0, bestStart = 0, bestLen = Infinity

  for (let r = 0; r < s.length; r++) {
    const added = s[r]
    have.set(added, (have.get(added) ?? 0) + 1)
    if (need.has(added) && have.get(added) === need.get(added)) satisfied++

    while (satisfied === required) {
      if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestStart = l }
      const removed = s[l]
      have.set(removed, have.get(removed) - 1)
      if (need.has(removed) && have.get(removed) < need.get(removed)) satisfied--
      l++
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen)
}

module.exports = { minWindow, minWindowBrute, minWindowScan }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')
  for (const fn of [minWindow, minWindowBrute, minWindowScan]) {
    eq(fn('ADOBECODEBANC', 'ABC'), 'BANC', `${fn.name} worked example`)
    eq(fn('a', 'a'), 'a', `${fn.name} single character`)
    eq(fn('a', 'aa'), '', `${fn.name} duplicates are counted, not deduped`)
    eq(fn('aa', 'aa'), 'aa', `${fn.name} exact duplicates`)
    eq(fn('', 'a'), '', `${fn.name} empty haystack`)
    eq(fn('ab', ''), '', `${fn.name} empty needle`)
    eq(fn('bba', 'ab'), 'ba', `${fn.name} shrink past a useless left edge`)
    eq(fn('abc', 'd'), '', `${fn.name} no window`)
    eq(fn('aaflslflsldkalskaaa', 'aaa'), 'aaa', `${fn.name} tail beats the head`)
  }
  report('minimum-window-substring')
}
