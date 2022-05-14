const esbuild = require('esbuild');
const utils = require('./utils');

const buildPlugin = () => ({
  name: 'buildPlugin',
  setup(build) {
    build.onLoad({ filter: /\.(js|ts)x?$/ }, async (args) => {
      const raw = await utils.input(args.path);

      const code = utils.chain(raw, [
        utils.stripStyleImport,
        utils.stripPolyfills,
        utils.optimizeClassNames,
        utils.optimizeRender,
        utils.optimizeEnum,
        utils.markPure
      ]);

      if (utils.isJSX(args.path)) {
        const runtime = utils.resolveRuntime(args.path);

        return {
          contents: `import { h, Fragment } from "${runtime}";\r\n${code}`,
          loader: 'tsx'
        };
      }

      return {
        contents: code,
        loader: 'ts'
      };
    });
  }
});

/**
 * @returns {import('esbuild').BuildOptions}
 */
const createConfig = (entryPoints, platform) => ({
  entryPoints,
  write: false,
  minify: false,
  bundle: false,
  splitting: false,
  treeShaking: false,
  outdir: platform === 'node' ? './dist/node/' : './dist/',
  format: platform === 'node' ? 'cjs' : 'esm',
  target: ['node12', 'es2018'],
  platform: 'neutral',
  sourcemap: 'external',
  resolveExtensions: ['.tsx', '.jsx', '.ts', '.js'],
  jsx: 'transform',
  jsxFactory: 'h',
  jsxFragment: 'Fragment',
  legalComments: 'inline',
  ignoreAnnotations: false,
  plugins: [
    buildPlugin()
  ]
});

const build = async (entryPoints, platform) => {
  const result = await esbuild.build(createConfig(entryPoints, platform));

  return Promise.all(
    result.outputFiles.map(async (file) => utils.output(file.path, file.text))
  );
};

const buildFromEntry = async (entryPoints) => {
  return Promise.all([
    build(entryPoints, 'browser'),
    build(entryPoints, 'node')
  ]);
};

module.exports = {
  buildFromEntry
};
