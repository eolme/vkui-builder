const postcss = require('postcss');
const esbuild = require('esbuild');
const utils = require('./utils');
const path = require('path');

const importPlugin = require('postcss-import');
const customPropertiesPlugin = require('postcss-custom-properties');
const autoprefixerPlugin = require('autoprefixer');
const selectorPlugin = require('postcss-modules');

const plugins = require('./plugins');

const defaultSchemePath = path.resolve(process.cwd(), './src/styles/bright_light.css');
const propertiesPaths = [
  path.join(process.cwd(), './src/styles/bright_light.css'),
  path.join(process.cwd(), './src/styles/constants.css'),
  path.join(process.cwd(), './src/styles/animations.css')
];

const postcssPlugin = () => {
  const processor = postcss.default([
    importPlugin(),
    customPropertiesPlugin({
      importFrom: propertiesPaths,
      preserve: true
    }),
    plugins.scopeRootPlugin({
      customPropRoot: '.vkui__root,.vkui__portal-root',
      except: defaultSchemePath
    }),
    autoprefixerPlugin(),
    selectorPlugin({
      generateScopedName: (name) => name.startsWith('vkui') || name === 'mount' ? name : `vkui${name}`,
      getJSON() {
        // Noop
      }
    })
  ]);

  return {
    name: 'postcssPlugin',
    setup(build) {
      build.onLoad({ filter: /.css$/ }, async (file) => {
        const raw = await utils.input(file.path);
        const contents = await processor.process(raw, { from: file.path });

        return {
          contents: contents.css,
          loader: 'css'
        };
      });
    }
  };
};

const callbackPlugin = (cb) => ({
  name: 'callbackPlugin',
  setup(build) {
    build.onEnd(cb);
  }
});

const buildFromEntry = async (entryPoints) => {
  return new Promise((resolve) => {
    esbuild.build({
      entryPoints,
      sourcemap: false,
      bundle: true,
      write: true,
      outdir: './dist/',
      resolveExtensions: ['.css'],
      minify: true,
      loader: {
        '.woff': 'file',
        '.woff2': 'file'
      },
      plugins: [
        postcssPlugin(),
        callbackPlugin(resolve)
      ]
    });
  });
};

module.exports = {
  buildFromEntry
};
