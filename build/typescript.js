const tsc = require('typescript');
const utils = require('./utils');
const fs = require('fs').promises;
const path = require('path');

const emit = async (entryPoints) => {
  const typesPath = path.resolve(__dirname, '../node_modules/@types');
  const basePath = process.cwd();
  const configPath = path.resolve(basePath, 'tsconfig.json');

  try {
    await fs.unlink(configPath);
  } catch {
    // Suppress
  }

  const config = tsc.parseJsonConfigFileContent({
    compilerOptions: {
      // Speed up
      allowUnreachableCode: true,
      disableSizeLimit: true,
      importsNotUsedAsValues: 'preserve',
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      composite: true,
      jsx: 'preserve',
      target: 'esnext',
      module: 'esnext',
      lib: [
        'esnext',
        'dom'
      ],
      moduleResolution: 'node',

      // Modules
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      allowUmdGlobalAccess: true,
      isolatedModules: false,
      strict: false,

      noEmit: false,
      declaration: true,
      emitDeclarationOnly: true,

      baseUrl: './src',
      outDir: './dist/esnext',

      // Patch @types
      typeRoots: [
        typesPath
      ],
      paths: {
        '*': [
          `${typesPath}/*`,
          '*'
        ]
      }
    },

    files: entryPoints
  }, tsc.sys, basePath);

  tsc.createProgram({
    options: config.options,
    rootNames: config.fileNames,
    configFileParsingDiagnostics: config.errors
  }).emit(undefined, (filePath, code) => {
    utils.outputAll(filePath, code, code, code);
  }, undefined, true);
};

module.exports = {
  emit
};
