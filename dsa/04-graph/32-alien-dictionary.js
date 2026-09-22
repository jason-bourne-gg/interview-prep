'use strict'
/**
 * ALIEN DICTIONARY
 *
 * A language uses the lowercase English letters, but in an unknown alphabetical
 * order. You are handed a list of words from its dictionary, already sorted
 * under that unknown order. Recover the order: return a string containing every
 * distinct letter that appears in the words, arranged so the given list really
 * is sorted. Return "" if no order can explain the list. If several orders can,
 * return any of them.
 *
 *   ['wrt', 'wrf', 'er', 'ett', 'rftt']  ->  'wertf'
 *   ['z', 'x', 'z']                      ->  ''      (z before x and x before z)
 *
 * Two rules define dictionary order and both matter here. Comparing two words,
 * the first position where they differ decides which comes first. If there is
 * no such position, the shorter word comes first — so 'abc' before 'ab' is
 * impossible under ANY alphabet, and must return "".
 *
 * Pattern: Topological sort
 */

/**
 * Turn the word list into a letter graph.
 *
 * Only ADJACENT pairs of words carry information, and only their FIRST
 * differing letter does. words[0] < words[2] is implied by the two adjacent
 * comparisons, and the letters after the first difference say nothing at all —
 * 'wrt' before 'wrf' tells you t < f and nothing about w or r.
 *
 * Returns null when the list is impossible to sort (the prefix rule).
 */
function buildLetterGraph(words) {
  const graph = new Map()
  for (const w of words) for (const ch of w) if (!graph.has(ch)) graph.set(ch, new Set())

  for (let i = 1; i < words.length; i++) {
    const a = words[i - 1], b = words[i]
    const limit = Math.min(a.length, b.length)
    let j = 0
    while (j < limit && a[j] === b[j]) j++
    if (j === limit) {
      if (a.length > b.length) return null     // 'abc' then 'ab': no alphabet allows it
      continue                                 // b extends a, which is correctly sorted
    }
    graph.get(a[j]).add(b[j])
  }
  return graph
}

/**
 * Approach 1 — try every alphabet.  O(k! * L) time, O(k) space, k distinct letters.
 *
 * Enumerate permutations of the distinct letters and keep the first one under
 * which the word list is genuinely sorted. It answers the question directly,
 * with no graph at all, and at k = 26 it is 4e26 orderings.
 *
 * It is worth writing once because it makes the constraint concrete: the only
 * thing the word list ever says is "this letter comes before that letter". Once
 * you see that the checker is built entirely from pairwise before-relations, the
 * permutation search collapses into ordering a graph.
 */
function alienOrderBrute(words) {
  const letters = [...new Set(words.join(''))]

  const sortedUnder = order => {
    const rank = new Map(order.map((c, i) => [c, i]))
    for (let i = 1; i < words.length; i++) {
      const a = words[i - 1], b = words[i]
      const limit = Math.min(a.length, b.length)
      let j = 0
      while (j < limit && a[j] === b[j]) j++
      if (j === limit) { if (a.length > b.length) return false; continue }
      if (rank.get(a[j]) >= rank.get(b[j])) return false
    }
    return true
  }

  let answer = ''
  const permute = (chosen, rest) => {
    if (answer) return
    if (!rest.length) {
      if (sortedUnder(chosen)) answer = chosen.join('')
      return
    }
    for (let i = 0; i < rest.length; i++) {
      permute([...chosen, rest[i]], [...rest.slice(0, i), ...rest.slice(i + 1)])
      if (answer) return
    }
  }
  permute([], letters)
  return answer
}

/**
 * Approach 2 — DFS topological sort with three colours.  O(V + E) time, O(V + E) space.
 *
 * Depth-first from every letter. A letter is appended to the output only after
 * everything it must precede has already been appended, so the finish order is
 * the reverse of the answer.
 *
 * The three colours do double duty: grey (on the current path) detects the
 * contradiction, black (finished) stops the search from redoing work. A plain
 * two-state visited flag cannot tell "seen on this path" from "seen earlier",
 * and reports a cycle on any diamond.
 *
 * Depth is bounded by the alphabet, 26 letters, so the recursion ceiling that
 * threatens the other graph problems in this folder is not a concern here. On a
 * general graph with the same code it would be.
 */
function alienOrderDfs(words) {
  const graph = buildLetterGraph(words)
  if (!graph) return ''

  const colour = new Map([...graph.keys()].map(c => [c, 0]))
  const out = []

  function visit(ch) {
    if (colour.get(ch) === 1) return false     // back onto the current path
    if (colour.get(ch) === 2) return true
    colour.set(ch, 1)
    for (const next of graph.get(ch)) if (!visit(next)) return false
    colour.set(ch, 2)
    out.push(ch)                               // finished: everything after it is placed
    return true
  }

  for (const ch of graph.keys()) if (!visit(ch)) return ''
  return out.reverse().join('')
}

/**
 * Approach 3 — Kahn's algorithm.  O(V + E) time, O(V + E) space.  ** optimal **
 *
 * Count how many letters must come before each letter. Anything at zero can be
 * emitted now; emitting it releases its dependents. Same linear cost as the DFS
 * version, but it builds the answer forwards instead of reversing at the end,
 * and it has no recursion at all.
 *
 * Cycle detection falls out of the count rather than needing its own machinery:
 * a letter inside a contradiction never drops to zero, because something in the
 * cycle always still precedes it. Emitting fewer letters than exist means the
 * constraints contradict each other, so return "".
 *
 * The output is one valid order, not the only one: letters with no constraint
 * between them can appear in either sequence, and the problem accepts that.
 */
function alienOrder(words) {
  const graph = buildLetterGraph(words)
  if (!graph) return ''

  const indegree = new Map([...graph.keys()].map(c => [c, 0]))
  for (const [, nexts] of graph) for (const n of nexts) indegree.set(n, indegree.get(n) + 1)

  const queue = []
  for (const [ch, deg] of indegree) if (deg === 0) queue.push(ch)

  const out = []
  for (let i = 0; i < queue.length; i++) {
    const ch = queue[i]
    out.push(ch)
    for (const next of graph.get(ch)) {
      indegree.set(next, indegree.get(next) - 1)
      if (indegree.get(next) === 0) queue.push(next)
    }
  }
  return out.length === graph.size ? out.join('') : ''
}

module.exports = { alienOrder, alienOrderBrute, alienOrderDfs }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  /** An order is acceptable when it holds every letter once and really sorts the list. */
  const isValid = (words, order) => {
    const letters = new Set(words.join(''))
    if (order.length !== letters.size || new Set(order).size !== order.length) return false
    for (const ch of order) if (!letters.has(ch)) return false
    const rank = new Map([...order].map((c, i) => [c, i]))
    for (let i = 1; i < words.length; i++) {
      const a = words[i - 1], b = words[i]
      const limit = Math.min(a.length, b.length)
      let j = 0
      while (j < limit && a[j] === b[j]) j++
      if (j === limit) { if (a.length > b.length) return false; continue }
      if (rank.get(a[j]) >= rank.get(b[j])) return false
    }
    return true
  }

  for (const fn of [alienOrder, alienOrderBrute, alienOrderDfs]) {
    // This list pins every letter against the next, so the order is unique.
    eq(fn(['wrt', 'wrf', 'er', 'ett', 'rftt']), 'wertf', `${fn.name} worked example`)
    eq(fn(['z', 'x']), 'zx', `${fn.name} one constraint`)
    eq(fn(['z', 'x', 'z']), '', `${fn.name} contradiction`)

    // The prefix rule. A longer word can never precede its own prefix, and this
    // is the case that a pure graph build misses entirely: it produces no edges,
    // so without the explicit check it happily returns 'abc'.
    eq(fn(['abc', 'ab']), '', `${fn.name} longer word before its prefix`)
    eq(isValid(['ab', 'abc'], fn(['ab', 'abc'])), true, `${fn.name} prefix first is fine`)

    eq(fn([]), '', `${fn.name} no words`)
    eq(fn(['z']), 'z', `${fn.name} single letter`)
    eq(fn(['z', 'z']), 'z', `${fn.name} repeated word`)

    // Unconstrained letters: several orders are correct, so check validity, not
    // a fixed string.
    eq(isValid(['abc'], fn(['abc'])), true, `${fn.name} single word, any order of its letters`)
    eq(isValid(['ac', 'ab', 'zc', 'zb'], fn(['ac', 'ab', 'zc', 'zb'])), true, `${fn.name} partial order`)
    eq(isValid(['ab', 'adc'], fn(['ab', 'adc'])), true, `${fn.name} difference before the length runs out`)
  }
  report('alien-dictionary')
}
