const tsc = require('typescript');
const utils = require('./utils');

const emit = async (entryPoints) => {
  tsc.createProgram(entryPoints, {
    target: 'esnext',
    declaration: true,
    emitDeclarationOnly: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    isolatedModules: true,
    baseUrl: 'src',
    outDir: './dist/esnext'
  }).emit(undefined, (filePath, code) => {
    utils.outputAll(filePath, code, code, code);
  }, undefined, true);
};

module.exports = {
  emit
};
