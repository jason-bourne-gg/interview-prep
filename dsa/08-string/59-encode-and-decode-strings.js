'use strict'
/**
 * ENCODE AND DECODE STRINGS
 *
 * Design two functions. encode takes a list of strings and returns one string;
 * decode takes that string back to the original list. The pair has to survive
 * any payload at all — the strings may contain whatever character you chose as
 * your separator, may be empty, and the list itself may be empty.
 *
 *   ['neet', 'code']   ->  '4#neet4#code'   ->  ['neet', 'code']
 *   ['a#b', '', 'c']   ->  '3#a#b0#1#c'     ->  ['a#b', '', 'c']
 *
 * The lesson is framing. A separator alone cannot work, because nothing stops
 * the payload containing it — the decoder has no way to tell a real separator
 * from data. You either escape the separator so it can never appear raw, or
 * prefix each string with its length so the decoder is told how far to read
 * before it reads anything.
 *
 * Pattern: design (length-prefix framing)
 */

/**
 * Approach 1 — join on a separator.  O(n) time, O(n) space.  BROKEN, on purpose.
 *
 * The first idea everyone has, and the reason the problem exists. Two distinct
 * failures, both unfixable by choosing a rarer separator:
 *   - a payload containing '#' is split into pieces that were never separate
 *   - [] and [''] both encode to '', so the decoder cannot tell them apart
 *
 * "I will pick a character that never appears" is not an answer. The input is
 * arbitrary, so no such character exists.
 */
function encodeDelim(strs) {
  return strs.join('#')
}

function decodeDelim(s) {
  return s === '' ? [] : s.split('#')
}

/**
 * Approach 2 — escape the separator.  O(n) time, O(n) space.
 *
 * Make the separator impossible in the payload rather than hoping it is absent:
 * double every backslash, then put a backslash in front of every '#'. Now a raw
 * '#' is always a real boundary.
 *
 * Order matters in both directions. Escaping backslashes FIRST means the
 * backslash added in front of '#' is not itself escaped afterwards; get it the
 * other way round and '\#' in the payload decodes wrongly.
 *
 * Terminating each string with '#' rather than joining with it fixes the
 * empty-list ambiguity: [] is '', [''] is '#'.
 *
 * Correct, but there is fiddly character-by-character work at both ends, and
 * every reviewer has to re-derive the escaping order.
 */
function encodeEscape(strs) {
  const out = []
  for (const word of strs) {
    out.push(word.replace(/\\/g, '\\\\').replace(/#/g, '\\#'))
    out.push('#')
  }
  return out.join('')
}

function decodeEscape(s) {
  const out = []
  let cur = []                            // array, not string: += in a loop is O(n^2) worst case
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\') {
      cur.push(s[i + 1])                  // escaped: take the next character literally
      i++
    } else if (s[i] === '#') {
      out.push(cur.join(''))
      cur = []
    } else {
      cur.push(s[i])
    }
  }
  return out
}

/**
 * Approach 3 — length prefix.  O(n) time, O(n) space.  ** optimal **
 *
 * Write each string as its length, a '#', then the string itself. The decoder
 * reads digits up to the first '#', gets a number, and then copies exactly that
 * many characters without looking at them.
 *
 * That last part is the insight: the payload is never scanned for structure, so
 * its content cannot lie. A '#' inside the payload is simply one of the
 * characters the length already accounted for, and the next '#' the decoder
 * looks for is the one it deliberately jumps to. Empty strings and an empty list
 * come out right with no special case.
 *
 * s.length is UTF-16 code units and slice counts the same units, so the two
 * agree and emoji round-trip correctly. Do not swap in [...w].length for the
 * prefix while leaving slice as it is — the counts would disagree by one per
 * astral character and every following string would be misread.
 */
function encode(strs) {
  const out = []
  for (const word of strs) out.push(`${word.length}#${word}`)
  return out.join('')
}

function decode(s) {
  const out = []
  let i = 0
  while (i < s.length) {
    const hash = s.indexOf('#', i)                  // always the length terminator
    const len = Number(s.slice(i, hash))
    out.push(s.slice(hash + 1, hash + 1 + len))
    i = hash + 1 + len
  }
  return out
}

module.exports = { encode, decode, encodeEscape, decodeEscape, encodeDelim, decodeDelim }

if (require.main === module) {
  const { eq, report } = require('../_lib/test')

  for (const [enc, dec] of [[encode, decode], [encodeEscape, decodeEscape]]) {
    const round = xs => dec(enc(xs))
    const name = enc.name
    eq(round(['neet', 'code']), ['neet', 'code'], `${name} worked example`)
    eq(round([]), [], `${name} empty list`)
    eq(round(['']), [''], `${name} list holding one empty string`)
    eq(round(['', '']), ['', ''], `${name} two empty strings stay two`)
    eq(round(['a']), ['a'], `${name} single character`)
    eq(round(['a#b', '', 'c']), ['a#b', '', 'c'], `${name} payload contains the separator`)
    eq(round(['#', '##', '3#x']), ['#', '##', '3#x'], `${name} payload imitates the framing`)
    eq(round(['a\\b', '\\', '\\#']), ['a\\b', '\\', '\\#'], `${name} payload contains backslashes`)
    eq(round(['x', 'x']), ['x', 'x'], `${name} duplicates stay separate`)
    eq(round(['\u{1F44D}', 'a\u{1F44D}b']), ['\u{1F44D}', 'a\u{1F44D}b'], `${name} astral characters`)
  }

  // The broken approach, pinned so the failure is on the record rather than in a
  // comment. Both of these SHOULD be round trips and are not.
  eq(decodeDelim(encodeDelim(['a#b', 'c'])), ['a', 'b', 'c'],
    'encodeDelim loses the boundary when the payload contains the separator')
  eq(decodeDelim(encodeDelim([''])), [],
    'encodeDelim cannot distinguish [] from the list holding one empty string')

  report('encode-and-decode-strings')
}
