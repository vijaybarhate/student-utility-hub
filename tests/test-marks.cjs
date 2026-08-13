// Plain Node test for src/lib/grading.ts (no test framework).
// Node 22+ can require() the .ts module directly via type stripping.
// Run: node tests/test-marks.cjs

const { gradeFor } = require('../src/lib/grading.ts');

let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log('PASS:', msg);
  } else {
    console.log('FAIL:', msg);
    failed += 1;
  }
}

// --- boundary cases (as specified in PLAN.md M5/M7) ------------------------
assert(gradeFor(90) === 'A+', 'gradeFor(90) === "A+"');
assert(gradeFor(95.5) === 'A+', 'gradeFor(95.5) === "A+" (above 90)');
assert(gradeFor(100) === 'A+', 'gradeFor(100) === "A+" (perfect)');
assert(gradeFor(89.9) === 'A', 'gradeFor(89.9) === "A" (just below A+)');

assert(gradeFor(79.9) === 'B+', 'gradeFor(79.9) === "B+" (boundary)');
assert(gradeFor(80) === 'A', 'gradeFor(80) === "A"');
assert(gradeFor(70) === 'B+', 'gradeFor(70) === "B+"');

assert(gradeFor(49.9) === 'F', 'gradeFor(49.9) === "F" (boundary)');
assert(gradeFor(50) === 'C', 'gradeFor(50) === "C"');
assert(gradeFor(0) === 'F', 'gradeFor(0) === "F"');

// --- interior cases ---------------------------------------------------------
assert(gradeFor(83) === 'A', 'gradeFor(83) === "A"');
assert(gradeFor(65) === 'B', 'gradeFor(65) === "B"');
assert(gradeFor(60) === 'B', 'gradeFor(60) === "B"');
assert(gradeFor(59) === 'C', 'gradeFor(59) === "C"');
assert(gradeFor(12.5) === 'F', 'gradeFor(12.5) === "F"');

// --- grade boundary sweep ---------------------------------------------------
const sweep = [99, 90, 89.99, 80, 79.99, 70, 69.99, 60, 59.99, 50, 49.99, 10];
const expected = ['A+', 'A+', 'A', 'A', 'B+', 'B+', 'B', 'B', 'C', 'C', 'F', 'F'];
sweep.forEach((p, i) => {
  assert(
    gradeFor(p) === expected[i],
    `gradeFor(${p}) === "${expected[i]}"`
  );
});

if (failed > 0) {
  console.error(`\n${failed} assertion(s) FAILED`);
  process.exit(1);
}
console.log('\nALL PASS — grading rules');
