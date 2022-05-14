const postcss = require('postcss');
const esbuild = require('esbuild');
const utils = require('./utils');
const path = require('path');

const selectorPlugin = require('postcss-modules');
const resolvePlugin = require('postcss-url');

const plugins = require('./plugins');

const basePath = path.resolve(process.cwd());
const resolveBase = utils.createResolve(basePath);

const exceptPaths = [
  resolveBase('./src/styles/bright_light.css')
];

const postcssPlugin = () => ({
  name: 'postcssPlugin',
  setup(build) {
    const processor = postcss.default([
      resolvePlugin({
        url: 'copy',
        basePath: path.resolve(basePath, 'src/fonts'),
        assetsPath: path.resolve(basePath, 'dist/assets'),
        useHash: true
      }),
      plugins.scopeRootPlugin({
        customPropRoot: '.vkui__root,.vkui__portal-root',
        except: exceptPaths
      }),
      selectorPlugin({
        generateScopedName: (name) => name.startsWith('vkui') || name === 'mount' ? name : `vkui${name}`,
        getJSON() {
          // Noop
        }
      })
    ]);

    build.onLoad({ filter: /\.css$/ }, async (file) => {
      let raw = await utils.input(file.path);

      // Hack
      if (raw.includes('node_modules')) {
        raw = utils.stripRelativeNodeModules(raw);

        await utils.output(file.path, raw);
      }

      const contents = await processor.process(raw, { from: file.path });

      return {
        contents: contents.css,
        loader: 'css'
      };
    });
  }
});

const buildFromEntry = async (entryPoints) => {
  return esbuild.build({
    entryPoints,
    sourcemap: 'external',
    bundle: false,
    write: true,
    allowOverwrite: true,
    outdir: './dist/',
    assetNames: './assets/[name]',
    resolveExtensions: [
      '.css',
      '.woff',
      '.woff2'
    ],
    minify: true,
    loader: {
      '.woff': 'file',
      '.woff2': 'file'
    },
    plugins: [
      postcssPlugin()
    ]
  });
};

module.exports = {
  buildFromEntry
};
