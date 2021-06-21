const babel = require('@babel/core');

const babelPresetEnv = require.resolve('@babel/preset-env');
const babelPluginRuntime = require.resolve('@babel/plugin-transform-runtime');

const assumptions = {
  arrayLikeIsIterable: true,
  constantReexports: false,
  constantSuper: true,
  enumerableModuleMeta: false,
  ignoreFunctionLength: true,
  ignoreToPrimitiveHint: true,
  iterableIsArray: true,
  mutableTemplateObject: true,
  noClassCalls: true,
  noDocumentAll: true,
  noNewArrows: true,
  objectRestNoSymbols: true,
  privateFieldsAsProperties: true,
  pureGetters: false,
  setClassMethods: true,
  setComputedProperties: true,
  setPublicClassFields: true,
  setSpreadProperties: true,
  skipForOfIteratorClosing: true,
  superIsCallableConstructor: true
};

const buildESM = async (code, ast) => {
  return babel.transformFromAstAsync(ast, code, {
    ast: false,
    babelrc: false,
    configFile: false,
    assumptions,
    presets: [
      [babelPresetEnv, {
        modules: false,
        useBuiltIns: false,
        corejs: false,
        bugfixes: true, // auto-fix
        loose: true, // генерирует более быстрый код
        targets: 'defaults' // возможно нужно поменять на точные версии браузеров
      }]
    ],
    plugins: [
      [babelPluginRuntime, {
        regenerator: false,
        corejs: false,
        helpers: true,
        useESModules: true
      }]
    ]
  });
};

const buildCJS = async (code, ast) => {
  return babel.transformFromAstAsync(ast, code, {
    ast: false,
    babelrc: false,
    configFile: false,
    assumptions,
    presets: [
      [babelPresetEnv, {
        modules: 'cjs',
        useBuiltIns: false,
        corejs: false,
        bugfixes: true, // auto-fix
        loose: true, // генерирует более быстрый код
        targets: 'defaults' // возможно нужно поменять на точные версии браузеров
      }]
    ],
    plugins: [
      [babelPluginRuntime, {
        regenerator: false,
        corejs: false,
        helpers: true,
        useESModules: false
      }]
    ]
  });
};

const parseCode = async (code) => {
  return babel.parseAsync(code, {
    ast: true,
    babelrc: false,
    configFile: false
  });
};

const buildFromCode = async (code) => {
  const ast = await parseCode(code);
  return Promise.all([
    buildESM(code, ast),
    buildCJS(code, ast)
  ]);
};

module.exports = {
  parseCode,
  buildFromCode
};
