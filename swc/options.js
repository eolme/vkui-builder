const utils = require('./utils');
const fs = require('./fs');

/**
 * @returns {swc.Options}
 */
const swc = (file) => ({
  cwd: process.cwd(),
  caller: {
    name: 'vkui-builder'
  },
  filename: file,
  rootMode: 'root',
  envName: 'production',
  configFile: false,
  swcrc: false,
  sourceMaps: false,
  inputSourceMap: false,
  isModule: utils.isJS(file) ? 'unknown' : true,
  module: {
    type: 'es6',
    importInterop: 'none',
    preserveImportMeta: false,
    strict: false,
    strictMode: false,
    lazy: true
  },
  jsc: {
    loose: true,
    minify: {
      compress: {
        arrows: true,
        booleans: false,
        booleans_as_integers: false,
        collapse_vars: true,
        comparisons: true,
        directives: true,
        drop_console: true,
        evaluate: true,
        expression: false,
        hoist_funs: true,
        hoist_props: true,
        hoist_vars: false,
        if_return: true,
        inline: 2,
        join_vars: true,
        keep_infinity: true,
        loops: true,
        negate_iife: true,
        passes: 4,
        properties: true,
        pure_funcs: ['warn', 'warnOnce', 'useEffectDev'],
        pure_getters: false,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: 0,
        switches: true,
        top_retain: [],
        typeofs: false,
        unsafe: false,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unused: true
      },
      format: {
        webkit: true,
        beautify: true,
        comments: false,
        ascii_only: false
      },
      ecma: 2018,
      toplevel: true,
      module: true,
      mangle: false,
      safari10: true,
      sourceMap: false,
      inlineSourcesContent: false
    },
    externalHelpers: false,
    experimental: {
      keepImportAssertions: false
    },
    parser: utils.isJS(file) ?
      {
        syntax: 'ecmascript',
        jsx: utils.isJSX(file),
        decorators: false
      } :
      {
        syntax: 'typescript',
        tsx: utils.isJSX(file),
        decorators: false,
        dynamicImport: false
      },
    preserveAllComments: false,
    target: 'es2018',
    transform: {
      decoratorMetadata: false,
      legacyDecorator: false,
      react: {
        development: false,
        refresh: false,
        runtime: 'automatic',
        useBuiltins: true
      },
      treatConstEnumAsEnum: true,
      useDefineForClassFields: true,
      optimizer: {
        simplify: true,
        globals: {
          vars: {
            'process.env.NODE_ENV': '"production"',
            'process.env': '{NODE_ENV:"production"}',
            'globalThis': 'self',
            'window': 'self',
            'global': 'self'
          },
          envs: ['NODE_ENV']
        }
      }
    }
  }
});

const typesPath = fs.path.resolve(__dirname, '../node_modules/@types');
const typescript = (files) => ({
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

  files
});

module.exports = {
  swc,
  typescript
};
