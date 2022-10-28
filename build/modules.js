const esbuild = require('esbuild');

const fs = require('./fs');
const constants = require('./const');

/**
 * Add `vkui` prefix
 *
 * @param {string} code
 * @returns {string}
 */
const modifyStyleClass = (code) => {
  return code.replace(constants.regexStyleClass(), (original, dot, name, space) => {
    if (name.startsWith('vkui')) {
      return original;
    }

    return `${dot}vkui${name}${space}`;
  });
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
  return code.replace(constants.regexImportRelative(), (_, declaration, quote, file) => {
    if (file.endsWith('.module.css')) {
      return `${declaration}${quote}${file.replace(constants.regexStyleModule(), '.json')}${quote};`;
    }

    if (file.endsWith('.css')) {
      return '';
    }

    return `${declaration}${quote}${file.replace(constants.regexModuleExtension(), '')}${extension}${quote};`;
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
  return file.replace(constants.regexModuleExtension(), extension);
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
      filter: constants.regexStyleModule()
    }, async (args) =>
      fs.read(args.path).then(async (code) =>
        fs.single(
          args.path.replace('/src/', '/dist/').replace(constants.regexStyleModule(), '.json'),
          collectStyleClass(code)
        ).then(() => ({
          contents: modifyStyleClass(code),
          loader: 'css'
        }))));
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
    return fs.multi(output.path, [
      fs.dest(modifyExtension(output.path, '.js'), modifyImports(output.text, '.js')),
      fs.dest(modifyExtension(output.path, '.mjs'), modifyImports(output.text, '.mjs'))
    ]);
  }));
};

module.exports = {
  compile
};
