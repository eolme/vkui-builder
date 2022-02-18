const fg = require('fast-glob');

const typescript = require('./typescript');
const esbuild = require('./esbuild');

const entry = async () => fg([
  './src/**/*.{tsx,ts,js}'
], {
  ignore: [
    './src/**/*.{e2e,test,spec,polyfill}.{tsx,ts,js}',
    './src/**/__tests__/**/*',
    './src/testing/**/*'
  ]
});

const buildDeclarations = async (entryPoints) => {
  return typescript.emit(entryPoints);
};

const build = async () => {
  const entryPoints = await entry();

  return Promise.all([
    esbuild.buildFromEntry(entryPoints),
    buildDeclarations(entryPoints)
  ]);
};

module.exports = {
  build
};
