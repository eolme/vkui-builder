const git = require('../prepare/git');
const isCI = require('is-ci');
const cross = require('cross-spawn');

const swc = require('../swc');
const info = require('../prepare/info');
const json = require('../prepare/json');

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

(async function builder() {
  console.log(builder.name);
  console.time(builder.name);

  const version = process.argv[2];

  if (!version || !/v5\.\d+\.\d+\S*/.test(version)) {
    console.error('Invalid version:', JSON.stringify(version));
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(2);
  }

  const dirPath = await git.fetchVersion(process.argv[2]);

  process.chdir(dirPath);

  await swc.prepare();
  await Promise.all([
    swc.build(),
    swc.declarations()
  ]);
  await Promise.all([
    info.rewriteInfo(),
    json.rewritePackage(version)
  ]);

  console.timeEnd(builder.name);

  console.log('Success!');
  console.log('Result:', dirPath);

  if (isCI) {
    console.log('CI/CD detected.');

    (function publish() {
      console.log(publish.name);
      console.time(publish.name);

      cross.sync('npm', ['publish', '--access=public'], { stdio: 'inherit' });

      console.timeEnd(publish.name);
    })();
  }
})();
