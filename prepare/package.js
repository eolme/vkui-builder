const utils = require('../build/utils');
const path = require('path');
const semver = require('semver');
const cross = require('cross-spawn');

const readPackage = async (packagePath) => {
  return JSON.parse(await utils.input(packagePath));
};

const writePackage = async (packagePath, pkg) => {
  return utils.output(packagePath, JSON.stringify(pkg));
};

const matchLatestVersion = async (dep, range) => {
  const major = range.split('||').map((version) => version.match(/\d+/)[0]);
  const max = `${Math.max.apply(Math, major)}.x.x`;

  const output = cross.sync('yarn', ['info', dep, 'versions', '--json'], { encoding: 'utf8' });
  const info = JSON.parse(output.stdout);

  for (let i = info.data.length; i--;) {
    const version = info.data[i];

    if (semver.satisfies(version, max)) {
      return `^${version}`;
    }
  }

  return '*';
};

const rewrite = async () => {
  const packagePath = path.resolve(process.cwd(), 'package.json');

  const pkg = await readPackage(packagePath);

  pkg.files = [
    './dist'
  ];

  pkg.sideEffects = pkg.sideEffects.filter((side) => {
    // Entry
    if (side.includes('index')) {
      return false;
    }

    // Experimental
    if (side.includes('cssm')) {
      return false;
    }

    return true;
  });
  pkg.sideEffects.push('./dist/esnext/lib/polyfills.js');

  pkg.peerDependencies = Object.assign({}, pkg.dependencies, pkg.peerDependencies);
  pkg.peerDependenciesMeta = {};
  await Promise.all(
    Object.keys(pkg.peerDependencies).map(async (dep) => {
      pkg.peerDependenciesMeta[dep] = { optional: false };
      pkg.peerDependencies[dep] = await matchLatestVersion(dep, pkg.peerDependencies[dep]);
    })
  );

  const BLANK = undefined;

  const cjs = './dist/cjs/index.js';
  const esm = './dist/esnext/index.js';
  const cmn = './dist/index.js';

  // Remove high-priority
  pkg.browser = BLANK;

  // Remove pre-bundled
  pkg.umd = BLANK;
  pkg['umd:main'] = BLANK;
  pkg.unpkg = BLANK;
  pkg.jsdelivr = BLANK;

  // Remove new resolve
  pkg.imports = BLANK;
  pkg.exports = BLANK;

  // Es5+cjs
  pkg.main = cjs;

  // Es5+esm
  pkg.module = cmn;

  // Main esnext+esm
  pkg.jsnext = esm;
  pkg['jsnext:main'] = esm;

  // Other esnext+esm
  pkg.esm = esm;
  pkg.esnext = esm;
  pkg.modern = esm;

  // Ts
  pkg.typings = './dist/index.d.ts';

  pkg.name = '@mntm/vkui';
  pkg.description += ' built with @mntm/vkui-builder';

  pkg.dependencies = BLANK;
  pkg.devDependencies = BLANK;
  pkg.resolutions = BLANK;

  pkg.bin = BLANK;
  pkg.scripts = BLANK;

  pkg['size-limit'] = BLANK;
  pkg['pre-commit'] = BLANK;

  await writePackage(packagePath, pkg);
};

module.exports = {
  rewrite
};
