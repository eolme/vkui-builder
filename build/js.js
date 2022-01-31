const fg = require('fast-glob');

const utils = require('./utils');
const typescript = require('./typescript');
const esbuild = require('./esbuild');
const babel = require('./babel');

const entry = async () => fg([
  './src/**/*.{tsx,ts,js}'
], {
  ignore: [
    './src/**/*.{e2e,test,spec}.{tsx,ts,js}',
    './src/**/__tests__/**/*',
    './src/testing/**/*'
  ]
});

const buildSource = async (entryPoints) => {
  const esbuildResult = await esbuild.buildFromEntry(entryPoints);

  return Promise.all(
    esbuildResult.outputFiles.map(async (file) => {
      const pure = utils.markPure(file.text);

      const [es5, cjs] = await babel.buildFromCode(pure);

      return utils.outputAll(file.path, pure, es5.code, cjs.code);
    })
  );
};

const buildDeclarations = async (entryPoints) => {
  return typescript.emit(entryPoints);
};

const build = async () => {
  const entryPoints = await entry();

  return Promise.all([
    buildSource(entryPoints),
    buildDeclarations(entryPoints)
  ]);
};

module.exports = {
  build
};
