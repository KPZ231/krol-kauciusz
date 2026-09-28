import assert from 'node:assert';

import {
  biedronkaShare,
  formatPLN,
  titleFor,
  totalItems,
  valueGrosze,
  volumeM3,
} from './deposits';

assert.strictEqual(totalItems({ plastic: 1, cans: 2, glass: 3 }), 6);

assert.strictEqual(valueGrosze({ plastic: 1, cans: 0, glass: 0 }), 50);
assert.strictEqual(valueGrosze({ plastic: 0, cans: 0, glass: 1 }), 100);
assert.strictEqual(valueGrosze({ plastic: 2, cans: 1, glass: 1 }), 250);

assert.ok(volumeM3({ plastic: 1, cans: 0, glass: 0 }) > 0);
assert.strictEqual(volumeM3({ plastic: 0, cans: 0, glass: 0 }), 0);

assert.ok(biedronkaShare(2800) === 1);
assert.ok(biedronkaShare(0) === 0);

assert.strictEqual(titleFor(0), 'Żółtodziób');
assert.strictEqual(titleFor(49), 'Żółtodziób');
assert.strictEqual(titleFor(50), 'Zbieracz');
assert.strictEqual(titleFor(5000), 'Król Kauciusz');
assert.strictEqual(titleFor(999999), 'Król Kauciusz');

assert.match(formatPLN(150), /1,50.*zł/);

console.log('deposits.check.ts: OK');
