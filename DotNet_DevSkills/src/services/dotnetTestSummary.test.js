import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTestSummary } from './dotnetTestSummary.js';

test('parseTestSummary extracts passed and failed counts from dotnet test output', () => {
  const output = `Passed!  - Failed: 0, Passed: 3, Skipped: 0, Total: 3, Duration: 1 s`;
  const summary = parseTestSummary(output);

  assert.deepEqual(summary, {
    total: 3,
    passed: 3,
    failed: 0,
    skipped: 0,
    duration: '1 s'
  });
});
