const postcss = require('postcss');
const esbuild = require('esbuild');
const utils = require('./utils');

const selectorPlugin = require('postcss-modules');
const resolvePlugin = require('postcss-url');
const importPlugin = require('postcss-import');

const scopePlugin = utils.requireLocal(utils.resolveRemote('tasks/postcss-scope-root'));
const restructurePlugin = utils.requireLocal(utils.resolveRemote('tasks/postcss-restructure-variable'));

const postcssPlugin = () => ({
  name: 'postcssPlugin',
  setup(build) {
    const processor = postcss.default([
      resolvePlugin({
        url: 'copy',
        basePath: utils.resolveRemote('src/fonts/'),
        assetsPath: utils.resolveRemote('dist/assets/'),
        useHash: true
      }),
      importPlugin({
        filter: (file) => file.includes('@vkontakte/vkui-tokens'),
        addModulesDirectories: [
          utils.resolveLocal('node_modules'),
          utils.resolveRemote('node_modules')
        ]
      }),
      scopePlugin({
        customPropRoot: '.vkui__root,.vkui__portal-root'
      }),
      restructurePlugin(
        [
          './node_modules/@vkontakte/vkui-tokens/themes/vkBase/cssVars/declarations/onlyVariables.css',
          './node_modules/@vkontakte/vkui-tokens/themes/vkBase/cssVars/declarations/onlyVariablesLocal.css',
          './node_modules/@vkontakte/vkui-tokens/themes/vkBaseDark/cssVars/declarations/onlyVariablesLocal.css',
          './node_modules/@vkontakte/vkui-tokens/themes/vkIOS/cssVars/declarations/onlyVariablesLocal.css',
          './node_modules/@vkontakte/vkui-tokens/themes/vkIOSDark/cssVars/declarations/onlyVariablesLocal.css',
          './node_modules/@vkontakte/vkui-tokens/themes/vkCom/cssVars/declarations/onlyVariablesLocal.css',
          './node_modules/@vkontakte/vkui-tokens/themes/vkComDark/cssVars/declarations/onlyVariablesLocal.css'
        ].map((variables) => utils.resolveLocal(variables))
      ),
      selectorPlugin({
        generateScopedName: (name) => name.startsWith('vkui') || name === 'mount' ? name : `vkui${name}`,
        getJSON() {
          // Noop
        }
      })
    ]);

    build.onLoad({ filter: /\.css$/ }, async (file) => {
      let raw = await utils.input(file.path);

      if (file.path.endsWith('themes.css')) {
        raw = utils.stripRelativeNodeModules(raw);
        raw = utils.stripThemes(raw);
      }

      if (file.path.endsWith('components.css')) {
        raw = utils.stripCommonImports(raw);
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
    bundle: true,
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
