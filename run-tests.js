'use strict'
/**
 * Runs every solution file and reports which fail.
 *
 * Each file tests itself when executed directly, so this just executes them all
 * and collects the exit codes. A solution nobody ran is a solution with a bug
 * in it — this is how the repo stays honest.
 *
 *   node run-tests.js
 */
const { execFileSync } = require('child_process')
const { readdirSync, statSync } = require('fs')
const { join } = require('path')

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === '_lib') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (entry.endsWith('.js') && entry !== 'run-tests.js') out.push(full)
  }
  return out
}

const files = walk(join(__dirname, 'dsa')).sort()
let failed = 0

for (const file of files) {
  const name = file.replace(__dirname + '/', '')
  try {
    const out = execFileSync('node', [file], { encoding: 'utf8' }).trim()
    console.log(`  ✓ ${out || name}`)
  } catch (err) {
    failed++
    console.error(`  ✗ ${name}`)
    console.error((err.stdout || '') + (err.stderr || ''))
  }
}

console.log(`\n${files.length - failed}/${files.length} files passed`)
process.exit(failed ? 1 : 0)
