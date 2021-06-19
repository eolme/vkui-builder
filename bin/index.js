const git = require('../prepare/git');
const child = require('child_process');
const isCI = require('is-ci');

const js = require.resolve('./build-js');
const css = require.resolve('./build-css');
const info = require.resolve('./rewrite-info');

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  throw reason;
});

const run = async (modulePath) => {
  return new Promise((resolve) => {
    const proc = child.fork(modulePath, { stdio: 'inherit' });
    proc.on('exit', resolve);
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
    child.spawnSync('yarn publish --non-interactive --access=public', { stdio: 'inherit' });
  }
})();
