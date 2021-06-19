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
      return '^' + version;
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

  pkg.sideEffects = pkg.sideEffects.filter((side) => side.includes('index.js'));
  pkg.sideEffects.push('./dist/esnext/lib/polyfills.js');

  pkg.peerDependencies = Object.assign({}, pkg.dependencies, pkg.peerDependencies);
  pkg.peerDependenciesMeta = {};
  await Promise.all(
    Object.keys(pkg.peerDependencies).map(async (dep) => {
      pkg.peerDependenciesMeta[dep] = { optional: false };
      pkg.peerDependencies[dep] = await matchLatestVersion(dep, pkg.peerDependencies[dep]);
    })
  );

  pkg.modern = './dist/esnext/index.js';
  pkg.jsnext = './dist/esnext/index.js';
  pkg.esnext = './dist/esnext/index.js';

  pkg.name = '@mntm/vkui';
  pkg.description = pkg.description + ' built with vkui-builder';

  pkg.dependencies = undefined;
  pkg.devDependencies = undefined;
  pkg.bin = undefined;
  pkg['size-limit'] = undefined;
  pkg.scripts = undefined;

  await writePackage(packagePath, pkg);
};

module.exports = {
  rewrite
};
