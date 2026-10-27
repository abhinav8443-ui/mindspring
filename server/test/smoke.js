import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/index.js';

test('Smoke test - Server exports valid Express application', () => {
  assert.ok(app);
  assert.equal(typeof app.listen, 'function');
});
