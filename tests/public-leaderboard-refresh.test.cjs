const test = require('node:test');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
test('Weekly public-source updates preserve valid snapshots on unchanged data and failures', () => {
  const result = spawnSync('python3', ['tests/public_leaderboard_refresh_test.py'], {encoding: 'utf8', timeout: 120000});
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
