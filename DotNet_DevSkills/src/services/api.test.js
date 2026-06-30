import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeJudge0Payload } from './api.js';

test('normalizeJudge0Payload does not fabricate test results for plain execution output', () => {
  const result = normalizeJudge0Payload({
    stdout: 'Hello from Judge0',
    status: { id: 3, description: 'Accepted' }
  });

  assert.equal(result.success, true);
  assert.equal(result.output, 'Hello from Judge0');
  assert.deepEqual(result.testSummary, {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: null
  });
});
