const git = require('../prepare/git');
const child = require('child_process');
const isCI = require('is-ci');
const cross = require('cross-spawn');

const js = require.resolve('./build-js');
const css = require.resolve('./build-css');
const info = require.resolve('./rewrite-info');

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
  const dirPath = await git.fetchMaster();

  process.chdir(dirPath);

  await Promise.all([
    run(js),
    run(css),
    run(info)
  ]);

  console.log('Success!');
  console.log('Result:', dirPath);

  if (isCI) {
    console.log('CI/CD detected.');
    cross.sync('yarn', ['publish', '--non-interactive', '--access=public'], { stdio: 'inherit' });
  }
})();
