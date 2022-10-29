const semver = require('semver');

const utils = require('../build/utils');
const fs = require('../build/fs');

const readPackage = async (packagePath) => {
  return JSON.parse(await fs.read(packagePath));
};

const writePackage = async (packagePath, pkg) => {
  return fs.write(packagePath, JSON.stringify(pkg));
};

const matchLatestVersion = async (dep, range) => {
  const major = range.split('||').map((version) => version.match(/\d+/)[0]);
  const max = `${Math.max.apply(Math, major)}.x.x`;

  const output = await utils.spawn('npm', ['info', dep, 'versions', '--json'], { encoding: 'utf8' });
  const info = JSON.parse(output);

  for (let i = info.length; i--;) {
    const version = info[i];

    if (semver.satisfies(version, max)) {
      return `^${version}`;
    }
  }

  return '*';
};

const rewrite = async () => {
  const packagePath = utils.resolveRemote('package.json');

  const pkg = await readPackage(packagePath);

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
        pkg.peerDependencies[dep] = utils.BLANK;

        return;
      }

      if (dep.includes('polyfill')) {
        pkg.peerDependencies[dep] = utils.BLANK;

        return;
      }

      pkg.peerDependenciesMeta[dep] = { optional: false };
      pkg.peerDependencies[dep] = await matchLatestVersion(dep, pkg.peerDependencies[dep]);
    })
  );

  const entryMain = './dist/index.js';
  const entryModule = './dist/index.mjs';

  const typesMain = './dist/index.d.ts';

  pkg.type = 'module';

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

  // Main
  pkg.main = entryMain;
  pkg.types = typesMain;

  // Module
  pkg.module = entryModule;

  pkg.name = '@mntm/vkui';
  pkg.description += ' built with @mntm/vkui-builder';

  pkg.repository = 'https://github.com/mntm-lib/vkui-builder';

  pkg.dependencies = utils.BLANK;
  pkg.devDependencies = utils.BLANK;
  pkg.resolutions = utils.BLANK;

  pkg.bin = utils.BLANK;
  pkg.scripts = utils.BLANK;
  pkg.engines = utils.BLANK;

  pkg['size-limit'] = utils.BLANK;
  pkg['pre-commit'] = utils.BLANK;
  pkg['lint-staged'] = utils.BLANK;

  return writePackage(packagePath, pkg);
};

rewrite();
