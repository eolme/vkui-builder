const esbuild = require('esbuild');

const fs = require('./fs');
const constants = require('./const');

/**
 * Add `vkui` prefix
 *
 * @param {string} code
 * @returns {string}
 */
const modifyStyle = (code) => {
  return code
    .replace(constants.regexStyleClass(), (original, dot, name, space) => {
      if (name.startsWith('vkui')) {
        return original;
      }

      return `${dot}vkui${name}${space}`;
    })
    .replace(constants.regexGlobalPseudo(), '$1')
    .replace(constants.regexRootPseudo(), '.vkui');
};

/**
 * Collect classes with `vkui` prefix
 *
 * @param {string} code
 * @returns {string}
 */
const collectStyleClass = (code) => {
  const classes = {};

  code.replace(constants.regexStyleClass(), (original, dot, name) => {
    classes[name] = `vkui${name}`;
  });

  return JSON.stringify(classes);
};

/**
 * - remove css imports
 * - add extension to relative module imports
 *
 * @param {string} code
 * @param {string} extension
 * @returns {string}
 */
const modifyImports = (code, extension) => {
  return code.replace(constants.regexECMAImport(), (original, declaration, quote, file) => {
    if (!file.startsWith('.')) {
      return original;
    }

    if (file.endsWith('.module.css')) {
      return `${declaration}${quote}${file.replace(constants.regexStyleModuleExtension(), '.json')}${quote};`;
    }

    if (file.endsWith('.css')) {
      return '';
    }

    if (file.endsWith('classNames')) {
      return `${declaration.replace(constants.regexImportNames(), (_, single, double) => {
        single = single ? `default as ${single}` : '';
        double = double ? `, default as ${double}` : '';

        return `{ ${single}${double} }`;
      })}${quote}clsx${quote};`;
    }

    if (file.endsWith('polyfills')) {
      return '';
    }

    return `${declaration}${quote}${file.replace(constants.regexECMAModuleExtension(), '')}${extension}${quote};`;
  });
};

/**
 * Replace extension
 *
 * @param {string} file
 * @param {string} extension
 * @returns {string}
 */
const modifyExtension = (file, extension) => {
  return file.replace(constants.regexECMAModuleExtension(), extension);
};

/**
 * Module CSS to normal
 *
 * @param {string} file
 * @param {string} extension
 * @returns {string}
 */
const modifyModuleExtension = (file) => {
  return file.replace(constants.regexStyleModuleExtension(), '.css');
};

/**
 * CSS
 *
 * @returns {esbuild.Plugin}
 */
const pluginStyleModule = () => ({
  name: 'style-module',
  setup(build) {
    build.onLoad({
      filter: constants.regexStyleModuleExtension()
    }, async (args) =>
      fs.read(args.path).then(async (code) =>
        fs.single(
          args.path.replace('/src/', '/dist/').replace(constants.regexStyleModuleExtension(), '.json'),
          collectStyleClass(code)
        ).then(() => ({
          contents: modifyStyle(code),
          loader: 'css'
        }))));

    build.onLoad({
      filter: constants.regexStyleExtension()
    }, async (args) =>
      fs.read(args.path).then(async (code) => ({
        contents: modifyStyle(code),
        loader: 'css'
      })));
  }
});

/**
 * JS
 *
 * @param {string[]} entryPoints
 * @returns {Promise}
 */
const compile = async (entryPoints) => {
  const result = await esbuild.build({
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
    sourcemap: false,
    resolveExtensions: [
      '.tsx',
      '.jsx',
      '.ts',
      '.js',
      '.css'
    ],
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    legalComments: 'inline',
    ignoreAnnotations: false,
    plugins: [
      pluginStyleModule()
    ]
  });

  return Promise.all(result.outputFiles.map(async (output) => {
    if (output.path.endsWith('.css')) {
      return fs.single(modifyModuleExtension(output.path), output.text);
    }

    return fs.multi(output.path, [
      fs.dest(modifyExtension(output.path, '.js'), modifyImports(output.text, '.js')),
      fs.dest(modifyExtension(output.path, '.mjs'), modifyImports(output.text, '.mjs'))
    ]);
  }));
};

module.exports = {
  compile
};
