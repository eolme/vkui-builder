const postcss = require('postcss');
const esbuild = require('esbuild');
const utils = require('./utils');
const path = require('path');

const importPlugin = require('postcss-import');
const customPropertiesPlugin = require('postcss-custom-properties');
const selectorPlugin = require('postcss-modules');

const plugins = require('./plugins');

const selfPath = path.resolve(__dirname, '..');
const selfNodeModules = path.join(selfPath, 'node_modules');

const basePath = process.cwd();
const baseNodeModules = path.join(basePath, 'node_modules');

const resolveSelf = utils.createResolve(selfPath);
const resolveBase = utils.createResolve(basePath);

const propertiesPaths = [
  resolveSelf('@vkontakte/vkui-tokens/themes/vkBase/cssVars/declarations/onlyVariables.css'),
  resolveBase('./src/styles/bright_light.css'),
  resolveBase('./src/styles/constants.css'),
  resolveBase('./src/styles/animations.css')
];

const importPaths = [
  selfNodeModules,
  baseNodeModules
];

const exceptPaths = [
  resolveSelf('@vkontakte/vkui-tokens/themes/vkBase/cssVars/declarations/onlyVariables.css'),
  resolveBase('./src/styles/bright_light.css')
];

const postcssPlugin = () => ({
  name: 'postcssPlugin',
  setup(build) {
    const processor = postcss.default([
      importPlugin({
        addModulesDirectories: importPaths
      }),
      customPropertiesPlugin({
        importFrom: propertiesPaths,
        preserve: true
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

    build.onLoad({ filter: /.css$/ }, async (file) => {
      const raw = await utils.input(file.path);
      const pure = utils.stripRelativeNodeModules(raw);
      const contents = await processor.process(pure, { from: file.path });

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
    bundle: true,
    write: true,
    allowOverwrite: true,
    outdir: './dist/',
    assetNames: './assets/[name]',
    resolveExtensions: ['.css'],
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
