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
        utils.optimizeRender
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

const createConfig = (entryPoints, platform) => ({
  entryPoints,
  bundle: false,
  write: false,
  outdir: platform === 'node' ? './dist/node/' : './dist/',
  format: platform === 'node' ? 'cjs' : 'esm',
  target: platform === 'node' ? 'node12' : 'es2018',
  platform: platform === 'node' ? 'node' : 'neutral',
  sourcemap: 'external',
  resolveExtensions: ['.tsx', '.jsx', '.ts', '.js'],
  minifySyntax: true,
  minifyWhitespace: true,
  jsxFactory: 'h',
  jsxFragment: 'React.Fragment',
  plugins: [
    buildPlugin()
  ]
});

const build = async (entryPoints, platform) => {
  const result = await esbuild.build(createConfig(entryPoints, platform));

  return Promise.all(
    result.outputFiles.map(async (file) => {
      const pure = utils.markPure(file.text);

      return utils.output(file.path, pure);
    })
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
