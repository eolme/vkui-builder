const swc = require('@swc/core');
const tsc = require('typescript');
const glob = require('fast-glob');

const fs = require('./fs');
const utils = require('./utils');
const options = require('./options');
const transform = require('./transform');
const patch = require('./patch');
const collect = require('./collect');

const entryBuild = async () => glob([
  './src/**/*.{ts,tsx,js,jsx,css}'
], {
  ignore: [
    './src/**/*.{e2e,test,spec,polyfills}.*',
    './src/**/{test,__tests__,testing}/**/*'
  ]
});

const build = async () => entryBuild().then(async (files) => {
  console.log(build.name);
  console.time(build.name);

  return Promise.all(files.map(async (file) => {
    if (utils.isModuleCSS(file)) {
      const code = await fs.read(file);
      const collected = collect.styleClass(code);
      const patched = patch.style(code);

      return fs.multi(utils.dest(file), [
        fs.dest(utils.moduleCSSToJS(file), collected),
        fs.dest(utils.moduleCSSToCSS(file), patched)
      ]);
    }

    if (utils.isCSS(file)) {
      const code = await fs.read(file);
      const patched = patch.style(code);

      return fs.single(utils.dest(file), patched);
    }

    return swc.transformFile(file, options.swc(file)).then(async (output) => {
      const transformed = utils.isJS(file) ? transform.moduleImportsExports(output.code) : output.code;
      const patched = patch.moduleImportsExports(file, transformed);

      return fs.single(utils.TSXToJS(file), patched);
    });
  })).then(() => {
    console.timeEnd(build.name);
  });
});

const entryDeclarations = async () => glob([
  './src/**/*.{ts,tsx}'
], {
  ignore: [
    './src/**/*.{e2e,test,spec,polyfills}.*',
    './src/**/{test,__tests__,testing}/**/*'
  ]
});

const declarations = async () => entryDeclarations().then(async (files) => {
  console.log(declarations.name);
  console.time(declarations.name);

  await fs.rm('tsconfig.json');

  const config = tsc.parseJsonConfigFileContent(options.typescript(files), tsc.sys, process.cwd());

  const tasks = [];

  tsc.createProgram({
    options: config.options,
    rootNames: config.fileNames,
    configFileParsingDiagnostics: config.errors
  }).emit(undefined, (file, code) => {
    const transformed = transform.constEnumToEnum(code);
    const patched = patch.declarations(file, transformed);

    tasks.push(fs.single(file, patched));
  }, undefined, true);

  return Promise.all(tasks).then(() => {
    console.timeEnd(declarations.name);
  });
});

const prepare = async () => {
  console.log(prepare.name);
  console.time(prepare.name);

  return Promise.all([
    fs.read('./src/styles/constants.css'),
    fs.read('./src/styles/common.css'),
    fs.read('./src/styles/animations.css')
  ]).then(async (contents) =>
    Promise.all([
      fs.single('./src/vkui.css', contents.join('\n')),
      fs.rm('./src/styles')
    ])).then(() => {
    console.timeEnd(prepare.name);
  });
};

module.exports = {
  build,
  declarations,
  prepare
};
