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

const base = {
  babelrc: false,
  babelrcRoots: false,
  configFile: false,
  browserslistConfigFile: false,
  sourceMaps: false,
  inputSourceMap: false,
  sourceType: 'module',
  comments: false
};

const targets = {
  android: '4.4',
  ios: '9'
};

const config = {
  assumptions,
  targets,

  ast: false,
  code: true,
  compact: true,
  minified: true
};

const buildESM = async (code, ast) => {
  return babel.transformFromAstAsync(ast, code, Object.assign({}, base, config, {
    presets: [
      [babelPresetEnv, {
        targets,

        modules: false,
        useBuiltIns: false,
        corejs: false,
        bugfixes: true, // auto-fix
        loose: true // генерирует более быстрый код
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
  }));
};

const buildCJS = async (code, ast) => {
  return babel.transformFromAstAsync(ast, code, Object.assign({}, base, config, {
    presets: [
      [babelPresetEnv, {
        targets,

        modules: 'cjs',
        useBuiltIns: false,
        corejs: false,
        bugfixes: true, // auto-fix
        loose: true // генерирует более быстрый код
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
  }));
};

const parseCode = async (code) => {
  return babel.parseAsync(code, Object.assign({}, base, {
    ast: true,
    code: false
  }));
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
