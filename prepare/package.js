const utils = require('../build/utils');
const path = require('path');
const semver = require('semver');

const readPackage = async (packagePath) => {
  return JSON.parse(await utils.input(packagePath));
};

const writePackage = async (packagePath, pkg) => {
  return utils.output(packagePath, JSON.stringify(pkg));
};

const matchLatestVersion = async (dep, range) => {
  const major = range.split('||').map((version) => version.match(/\d+/)[0]);
  const max = `${Math.max.apply(Math, major)}.x.x`;

  const output = await utils.spawn('yarn', ['info', dep, 'versions', '--json'], { encoding: 'utf8' });
  const info = JSON.parse(output);

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

  pkg.sideEffects = [
    '*.css'
  ];

  // Add additional module
  pkg.dependencies.clsx = '^1.1.1';

  pkg.peerDependencies = Object.assign({}, pkg.dependencies, pkg.peerDependencies);
  pkg.peerDependenciesMeta = {};
  await Promise.all(
    Object.keys(pkg.peerDependencies).map(async (dep) => {
      if (dep.includes('babel')) {
        pkg.peerDependencies[dep] = utils.BLANK;

        return;
      }

      pkg.peerDependenciesMeta[dep] = { optional: false };
      pkg.peerDependencies[dep] = await matchLatestVersion(dep, pkg.peerDependencies[dep]);
    })
  );

  const cjs = './dist/node/index.js';
  const esm = './dist/index.js';

  // Remove high-priority
  pkg.browser = utils.BLANK;

  // Remove pre-bundled
  pkg.umd = utils.BLANK;
  pkg['umd:main'] = utils.BLANK;
  pkg.unpkg = utils.BLANK;
  pkg.jsdelivr = utils.BLANK;

  // Remove non-standard
  pkg.jsnext = utils.BLANK;
  pkg['jsnext:main'] = utils.BLANK;
  pkg.esm = utils.BLANK;
  pkg.esnext = utils.BLANK;
  pkg.modern = utils.BLANK;

  // Remove new resolve
  pkg.imports = utils.BLANK;
  pkg.exports = utils.BLANK;

  // Target node12
  pkg.main = cjs;

  // Target es2017
  pkg.module = esm;

  // Ts
  pkg.typings = './dist/index.d.ts';

  pkg.name = '@mntm/vkui';
  pkg.description += ' built with @mntm/vkui-builder';

  pkg.dependencies = utils.BLANK;
  pkg.devDependencies = utils.BLANK;
  pkg.resolutions = utils.BLANK;

  pkg.bin = utils.BLANK;
  pkg.scripts = utils.BLANK;

  pkg['size-limit'] = utils.BLANK;
  pkg['pre-commit'] = utils.BLANK;
  pkg['lint-staged'] = utils.BLANK;

  await writePackage(packagePath, pkg);
};

module.exports = {
  rewrite
};
