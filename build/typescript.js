const tsc = require('typescript');
const path = require('path');

const constants = require('./const');
const fs = require('./fs');

/**
 * - remove css imports
 * - add extension to relative module imports
 *
 * @param {string} code
 * @param {string} extension
 * @returns {string}
 */
const modifyImports = (code, extension) => {
  return code.replace(constants.regexImportRelative(), (_, declaration, quote, file) => {
    if (file.endsWith('.css')) {
      return '';
    }

    return `${declaration}${quote}${file.replace(constants.regexModuleExtension(), '')}${extension}${quote};`;
  });
};

/**
 * Replace extension
 *
 * @param {string} file
 * @param {string} extension
 * @returns {string}
 */
const modifyExtension = (file, extension) => {
  return file.replace(constants.regexModuleExtension(), extension);
};

/**
 * TS declarations
 *
 * @param {string[]} entryPoints
 * @returns {Promise}
 */
const declarations = async (entryPoints) => {
  const typesPath = path.resolve(__dirname, '../node_modules/@types');
  const basePath = process.cwd();
  const configPath = path.resolve(basePath, 'tsconfig.json');

  try {
    await fs.native.unlink(configPath);
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
      outDir: './dist',

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

  const tasks = [];

  tsc.createProgram({
    options: config.options,
    rootNames: config.fileNames,
    configFileParsingDiagnostics: config.errors
  }).emit(undefined, (file, code) => {
    tasks.push(fs.multi(file, [
      fs.dest(modifyExtension(file, '.d.ts'), modifyImports(code, '.js')),
      fs.dest(modifyExtension(file, '.d.mts'), modifyImports(code, '.mjs'))
    ]));
  }, undefined, true);

  return Promise.all(tasks);
};

module.exports = {
  declarations
};
