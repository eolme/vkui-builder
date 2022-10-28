const git = require('../prepare/git');
const child = require('child_process');
const isCI = require('is-ci');
const cross = require('cross-spawn');

const build = require.resolve('../build');
const info = require.resolve('../prepare/info');
const json = require.resolve('../prepare/json');

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const run = async (modulePath) => {
  return new Promise((resolve, reject) => {
    const proc = child.fork(modulePath, { stdio: 'inherit' });

    proc.on('error', reject);
    proc.on('exit', (code, signal) => {
      if (code !== 0) {
        reject(new Error(signal || code));
      } else {
        resolve();
      }
    });
  });
};

(async () => {
  const version = process.argv[2];

  if (!version || !/v5\.\d+\.\d+\S*/.test(version)) {
    console.error('Invalid version:', JSON.stringify(version));
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(2);
  }

  const dirPath = await git.fetchVersion(process.argv[2]);

  process.chdir(dirPath);

  await Promise.all([
    run(build),
    run(info)
  ]).then(async () => run(json));

  console.log('Success!');
  console.log('Result:', dirPath);

  if (isCI) {
    console.log('CI/CD detected.');
    cross.sync('npm', ['publish', '--access=public'], { stdio: 'inherit' });
  }
})();
