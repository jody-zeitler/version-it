const assert = require('assert');
const versionit = require('./index');

const errors = [];

function test(label, assertion) {
  try {
    assertion();
    console.log(`PASSED: ${label}`);
  } catch (error) {
    console.error(`FAILED: ${label}`);
    errors.push(error);
  }
}

/**
 * latestVersion
 */

test('latestVersion - basic comparison', function () {
  assert.deepEqual(versionit.latestVersion(['3.2.1', '1.5.7', '2.2.1']), ['3', '2', '1']);
});

test('latestVersion - extended comparison', function () {
  assert.deepEqual(versionit.latestVersion(['2.2.3', '1.2.3', '1.2.4', '1.2.2', '2.2.2', '2.2.4', '3.1.2']), ['3', '1', '2']);
});

test('latestVersion - stable comparison', function () {
  assert.deepEqual(versionit.latestVersion(['2.2.3', '2.2.2', '2.2.4']), ['2', '2', '4']);
});

test('latestVersion - comparison with tags', function () {
  assert.deepEqual(versionit.latestVersion(['2.2.3', '3.5.1-alpha', '1.1.2-beta']), ['3', '5', '1', 'alpha']);
});

test('latestVersion - comparison with tags and increments', function () {
  assert.deepEqual(versionit.latestVersion(['2.2.3', '3.5.1-beta.1', '3.5.1-alpha.3', '3.5.1-beta.0']), ['3', '5', '1', 'beta', '1']);
});

/**
 * iterateVersion
 */

test('iterateVersion - initializes with no versions', function () {
  assert.deepEqual(versionit.iterateVersion([], '1.3'), '1.3.0');
});

test('iterateVersion - initializes with no matching versions', function () {
  assert.deepEqual(versionit.iterateVersion(['1.2.3', '1.2.4'], '1.3'), '1.3.0');
});

test('iterateVersion - increments latest matching version', function () {
  assert.deepEqual(versionit.iterateVersion(['1.2.3', '1.2.4'], '1.2'), '1.2.5');
});

test('iterateVersion - increments latest matching version with tag', function () {
  assert.deepEqual(versionit.iterateVersion(['1.2.3', '1.2.4', '1.3.0', '1.2.5-next.0', '1.3.1'], '1.2.5-next'), '1.2.5-next.1');
});

test('iterateVersion - excludes tagged versions when iterating a "latest" version', function () {
  assert.deepEqual(versionit.iterateVersion(['1.0.0', '1.0.1', '2.0.0-next.0', '2.0.0-next.1'], '2.0'), '2.0.0');
  assert.deepEqual(versionit.iterateVersion(['2.0.0-next.0', '2.0.0-next.1', '2.0.0'], '2.0'), '2.0.1');
});

/**
 * guessTag
 */

test('guessTag - returns the first tag from version atoms', function () {
  assert.equal(versionit.guessTag(['1', '2', '3-beta', '0']), 'beta');
});

test('guessTag - returns undefined if there is no tag found', function () {
  assert.equal(versionit.guessTag(['1', '2', '3', '0']), undefined);
});

errors.forEach(function (error) {
  console.error(error.stack);
});

if (errors.length) {
  process.exit(1);
}
