const postcss = require('postcss');
const esbuild = require('esbuild');
const utils = require('./utils');

const selectorPlugin = require('postcss-modules');
const importPlugin = require('postcss-import');

const restructurePlugin = utils.requireLocal(utils.resolveRemote('tasks/postcss-restructure-variable'));

const postcssPlugin = () => ({
  name: 'postcssPlugin',
  setup(build) {
    const processor = postcss.default([
      importPlugin({
        filter: (file) => file.includes('@vkontakte/vkui-tokens'),
        addModulesDirectories: [
          utils.resolveLocal('node_modules'),
          utils.resolveRemote('node_modules')
        ]
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
      '.css'
    ],
    minify: true,
    plugins: [
      postcssPlugin()
    ]
  });
};

module.exports = {
  buildFromEntry
};
