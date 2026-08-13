// Plain Node test for src/lib/storage.ts (no test framework).
// Node 22+ can require() the .ts module directly via type stripping.
// Run: node tests/test-storage.cjs

const mem = new Map();

globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => {
    mem.set(k, String(v));
  },
  removeItem: (k) => {
    mem.delete(k);
  },
  clear: () => {
    mem.clear();
  },
  key: () => null,
  get length() {
    return mem.size;
  },
};

const { storageLoad, storageSave } = require('../src/lib/storage.ts');

let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log('PASS:', msg);
  } else {
    console.log('FAIL:', msg);
    failed += 1;
  }
}

// --- storageLoad: missing key -> fallback --------------------------------
assert(
  storageLoad('suh-test-missing', 'fallback') === 'fallback',
  'storageLoad returns fallback for a missing key'
);
assert(
  Array.isArray(storageLoad('suh-test-missing', [])) && storageLoad('suh-test-missing', []).length === 0,
  'storageLoad returns the fallback array for a missing key'
);

// --- storageLoad: corrupt JSON -> fallback --------------------------------
mem.set('suh-test-corrupt', '{not valid json!!');
assert(
  storageLoad('suh-test-corrupt', { fallback: true }) &&
    storageLoad('suh-test-corrupt', { fallback: true }).fallback === true,
  'storageLoad returns fallback for corrupt JSON'
);

mem.set('suh-test-corrupt2', '');
assert(
  storageLoad('suh-test-corrupt2', 'safe') === 'safe',
  'storageLoad returns fallback for empty stored value'
);

// --- storageSave / storageLoad round-trip ---------------------------------
const payload = { id: 'a1', name: 'Maths', date: '2026-12-01' };
storageSave('suh-test-roundtrip', payload);
assert(
  mem.get('suh-test-roundtrip') === JSON.stringify(payload),
  'storageSave stores the JSON-serialised value'
);
assert(
  JSON.stringify(storageLoad('suh-test-roundtrip', null)) === JSON.stringify(payload),
  'storageLoad round-trips an object payload'
);

const list = [1, 2, 3];
storageSave('suh-test-array', list);
assert(
  JSON.stringify(storageLoad('suh-test-array', [])) === JSON.stringify(list),
  'storageLoad round-trips an array payload'
);

storageSave('suh-test-primitive', 42);
assert(
  storageLoad('suh-test-primitive', 0) === 42,
  'storageLoad round-trips a primitive payload'
);

// --- storageLoad: existing key overrides fallback -------------------------
assert(
  storageLoad('suh-test-primitive', 999) === 42,
  'stored value wins over the fallback'
);

// --- cleanup ---------------------------------------------------------------
mem.clear();

if (failed > 0) {
  console.error(`\n${failed} assertion(s) FAILED`);
  process.exit(1);
}
console.log('\nALL PASS — storage utilities');
