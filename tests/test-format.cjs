// Plain Node test for src/lib/format.ts (no test framework).
// Node 22+ can require() the .ts module directly via type stripping.
// Run: node tests/test-format.cjs

const { formatPercent, formatDays } = require('../src/lib/format.ts');

let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log('PASS:', msg);
  } else {
    console.log('FAIL:', msg);
    failed += 1;
  }
}

// --- formatPercent: fixed 1 decimal + trailing % --------------------------
assert(formatPercent(75) === '75.0%', 'formatPercent(75) === "75.0%"');
assert(formatPercent(75.0, 1) === '75.0%', 'formatPercent(75.0) === "75.0%"');
assert(formatPercent(74.96) === '75.0%', 'formatPercent(74.96) === "75.0%" (rounds up)');
assert(formatPercent(33.333) === '33.3%', 'formatPercent(33.333) === "33.3%"');
assert(formatPercent(100) === '100.0%', 'formatPercent(100) === "100.0%"');
assert(formatPercent(0) === '0.0%', 'formatPercent(0) === "0.0%"');
assert(formatPercent(49.9) === '49.9%', 'formatPercent(49.9) === "49.9%"');
assert(formatPercent(49.96) === '50.0%', 'formatPercent(49.96) === "50.0%" (rounds over the boundary)');

// --- formatPercent: custom decimals ----------------------------------------
assert(formatPercent(12.345, 2) === '12.35%', 'formatPercent(12.345, 2) === "12.35%"');
assert(formatPercent(50, 0) === '50%', 'formatPercent(50, 0) === "50%"');

// --- formatDays: 0 / 1 / 2 / >99 -------------------------------------------
assert(formatDays(0) === 'today', 'formatDays(0) === "today"');
assert(formatDays(-4) === 'today', 'formatDays(-4) === "today" (past)');
assert(formatDays(1) === '1 day', 'formatDays(1) === "1 day"');
assert(formatDays(2) === '2 days', 'formatDays(2) === "2 days"');
assert(formatDays(12) === '12 days', 'formatDays(12) === "12 days"');
assert(formatDays(99) === '99 days', 'formatDays(99) === "99 days"');
assert(formatDays(100) === '100 days', 'formatDays(100) === "100 days"');
assert(formatDays(365) === '365 days', 'formatDays(365) === "365 days"');

// --- formatDays: non-integer gaps are rounded ------------------------------
assert(formatDays(1.4) === '1 day', 'formatDays(1.4) === "1 day"');
assert(formatDays(2.6) === '3 days', 'formatDays(2.6) === "3 days"');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) FAILED`);
  process.exit(1);
}
console.log('\nALL PASS — format utilities');
