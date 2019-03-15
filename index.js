const child_process = require('child_process');
const fs = require('fs');
const semver = require('semver');

const TAG_REGEX = /\d+-(\w+)/;

function main() {
  const [, , command] = process.argv;
  getPackageVersion((name, version) => {
    const versionArray = version.split('.');
    if (command === 'tag') {
      console.log(guessTag(versionArray) || 'latest');
      return;
    }
    getNextVersion(name, versionArray, (next) => {
      if (command === 'peek') {
        console.log(next);
        return;
      }
      if (next !== version) {
        console.log('incrementing version');
        setVersion(next);
      } else {
        console.log('current version is accurate');
        console.log(`v${version}`);
      }
    });
  });
}

function getPackageVersion(callback) {
  fs.readFile('./package.json', 'utf8', (error, data) => {
    if (error) {
      process.stderr.write(`error reading package.json: ${error.stack}\n`);
      process.exit(1);
    }
    const json = JSON.parse(data);
    if (!(json.publishConfig && json.publishConfig.registry)) {
      process.stderr.write('missing publishConfig.registry in package.json\n');
      process.exit(2);
    }
    callback(json.name, json.version);
  });
}

/**
 * ['3.2.1', '1.5.7', '2.9.3'] => ['3', '2', '1']
 */
function latestVersion(versions) {
  const [latest] = versions.slice(0).sort((a, b) => semver.rcompare(a, b));
  return latest && latest.split(/[\.-]/);
}

function iterateVersion(versions, prefix) {
  if (!guessTag(prefix)) {
    // exclude tagged versions if we're on "latest"
    versions = versions.filter(v => !TAG_REGEX.test(v));
  }
  const latest = latestVersion(versions.filter(v => v.startsWith(prefix)));
  if (latest) {
    const current = parseInt(latest.slice(-1), 10);
    if (!isNaN(current)) {
      return `${prefix}.${current + 1}`;
    }
  }
  return `${prefix}.0`;
}

function getNextVersion(name, version, callback) {
  const prefix = version.slice(0, -1).join('.');
  child_process.exec(`npm view ${name} versions --json`, (error, stdout, stderr) => {
    if (error) {
      process.stderr.write(`could not get latest package version from NPM: ${error.stack}\n`);
    }
    if (stdout) {
      const versions = JSON.parse(stdout);
      if (versions instanceof Array) {
        return callback(iterateVersion(versions, prefix));
      }
    }
    return callback(`${prefix}.0`); // probably a 404: initialize it!
  });
}

function setVersion(version) {
  child_process.exec(`npm version --no-git-tag-version ${version}`, (error, stdout, stderr) => {
    if (error) {
      process.stderr.write(`could not set version: ${error.stack}\n`);
      process.exit(5);
    }
    if (stderr) {
      process.stderr.write(stderr);
      process.exit(6);
    }
    process.stdout.write(stdout);
  });
}

function guessTag(version) {
  if (typeof version === 'string') {
    version = version.split('.');
  }
  for (const v of version) {
    const [, tag] = v.match(TAG_REGEX) || [];
    if (tag) {
      return tag;
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  guessTag,
  latestVersion,
  iterateVersion,
  main
};
