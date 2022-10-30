const semver = require('semver');
const cross = require('cross-spawn');
const crypto = require('crypto');

const fs = require('../swc/fs');

const BLANK = undefined;

const run = async (command, args, options) => {
  return new Promise((resolve, reject) => {
    const proc = cross(command, args, options);

    let length = 0;
    const result = [];

    proc.stdout.on('data', (chunk) => {
      const buffer = Buffer.from(chunk);

      length += buffer.length;
      result.push(buffer);
    });

    proc.on('error', reject);
    proc.on('exit', (code, signal) => {
      if (code !== 0) {
        console.error(command);
        reject(new Error(signal || code));
      } else {
        resolve(Buffer.concat(result, length).toString('utf8'));
      }
    });
  });
};

const matchLatestVersion = async (dep, range) => {
  const major = range.split('||').map((version) => version.match(/\d+/)[0]);
  const max = `${Math.max.apply(Math, major)}.x.x`;

  const output = await run('npm', ['info', dep, 'versions', '--json'], { encoding: 'utf8' });
  const info = JSON.parse(output);

  for (let i = info.length; i--;) {
    const version = info[i];

    if (semver.satisfies(version, max)) {
      return `^${version}`;
    }
  }

  return '*';
};

const rewritePackage = async (version) => {
  console.log(rewritePackage.name);
  console.time(rewritePackage.name);

  const raw = await fs.read('package.json');
  const pkg = JSON.parse(raw);

  const parsed = semver.parse(version, true);

  const date = new Date();
  const year = date.getUTCFullYear().toString().padStart(4, '0');
  const month = date.getUTCMonth().toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');

  const hash = crypto
    .createHash('md4')
    .update(raw)
    .update(parsed.version)
    .update(Date.now().toString(32))
    .digest('hex')
    .slice(0, 8);

  pkg.version = `${parsed.version}-${year}${month}${day}-${hash}`;

  pkg.files = [
    './dist'
  ];

  pkg.sideEffects = [
    '*.css'
  ];

  // Add additional module
  pkg.dependencies.clsx = await matchLatestVersion('clsx', '1');

  pkg.peerDependencies = Object.assign({}, pkg.dependencies, pkg.peerDependencies);
  pkg.peerDependenciesMeta = {};
  await Promise.all(
    Object.keys(pkg.peerDependencies).map(async (dep) => {
      if (dep.includes('babel')) {
        pkg.peerDependencies[dep] = BLANK;

        return;
      }

      if (dep.includes('polyfill')) {
        pkg.peerDependencies[dep] = BLANK;

        return;
      }

      pkg.peerDependenciesMeta[dep] = { optional: false };
      pkg.peerDependencies[dep] = await matchLatestVersion(dep, pkg.peerDependencies[dep]);
    })
  );

  const entryMain = './dist/index.js';
  const typesMain = './dist/index.d.ts';

  pkg.type = 'module';

  // Remove high-priority
  pkg.browser = BLANK;

  // Remove pre-bundled
  pkg.umd = BLANK;
  pkg['umd:main'] = BLANK;
  pkg.unpkg = BLANK;
  pkg.jsdelivr = BLANK;

  // Remove non-standard
  pkg.jsnext = BLANK;
  pkg['jsnext:main'] = BLANK;
  pkg.esm = BLANK;
  pkg.esnext = BLANK;
  pkg.modern = BLANK;

  // Remove new resolve
  pkg.imports = BLANK;
  pkg.exports = BLANK;

  // Main
  pkg.main = entryMain;
  pkg.module = entryMain;

  // Types
  pkg.types = typesMain;
  pkg.typings = typesMain;

  pkg.name = '@mntm/vkui';
  pkg.description += ' built with @mntm/vkui-builder';

  pkg.repository = 'https://github.com/mntm-lib/vkui-builder';

  pkg.dependencies = BLANK;
  pkg.devDependencies = BLANK;
  pkg.resolutions = BLANK;

  pkg.bin = BLANK;
  pkg.scripts = BLANK;
  pkg.engines = BLANK;

  pkg['size-limit'] = BLANK;
  pkg['pre-commit'] = BLANK;
  pkg['lint-staged'] = BLANK;

  return fs.write('package.json', JSON.stringify(pkg)).then(() => {
    console.timeEnd(rewritePackage.name);
  });
};

module.exports = {
  rewritePackage
};
