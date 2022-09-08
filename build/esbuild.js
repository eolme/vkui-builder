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
const createConfig = (entryPoints) => ({
  entryPoints,
  write: false,
  minify: false,
  bundle: false,
  splitting: false,
  treeShaking: false,
  outdir: './dist/',
  format: 'esm',
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

const buildFromEntry = async (entryPoints) => {
  const result = await esbuild.build(createConfig(entryPoints));

  return Promise.all(
    result.outputFiles.map(async (file) => utils.output(file.path, file.text))
  );
};

module.exports = {
  buildFromEntry
};
