const esbuild = require('esbuild');
const utils = require('./utils');

const buildPlugin = () => ({
  name: 'buildPlugin',
  setup(build) {
    build.onLoad({ filter: /\.(js|ts|tsx)$/ }, async (args) => {
      const raw = await utils.input(args.path);

      const code = utils.stripStyleImport(raw);

      if (utils.isJSX(args.path)) {
        const runtime = utils.resolveRuntime(args.path);

        return {
          contents: `import{createScopedElement}from"${runtime}";${code}`,
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
      bundle: false,
      write: false,
      outdir: './dist/esnext',
      format: 'esm',

      // Esnext не всегда генерирует валидный код
      target: 'es2020',
      resolveExtensions: ['.tsx', '.ts', '.js'],
      minifySyntax: true,
      minifyWhitespace: true,
      jsxFactory: 'createScopedElement',
      jsxFragment: 'createScopedElement.Fragment',
      plugins: [
        buildPlugin(),
        callbackPlugin(resolve)
      ]
    });
  });
};

module.exports = {
  buildFromEntry
};
