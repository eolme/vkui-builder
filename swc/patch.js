const regex = require('./regex');
const local = require('./local');
const { createResolve } = require('./resolve');

/**
 * @param {string} from
 * @param {string} code
 * @returns {string}
 */
const moduleImportsExports = (from, code) => {
  const resolve = createResolve(from);

  return code.replace(regex.ECMAImportExport(), (original, declaration, quote, file) => {
    if (!file.startsWith('.')) {
      return original;
    }

    if (file.endsWith('.module.css')) {
      return `${declaration}${quote}${file.replace(regex.styleModuleExtension(), '.styles.js')}${quote};`;
    }

    if (file.endsWith('.css')) {
      return '';
    }

    if (file.endsWith('classNames')) {
      return `${declaration.replace(regex.importNames(), (_, single, double) => {
        single = single ? `default as ${single}` : '';
        double = double ? `, default as ${double}` : '';

        return `{ ${single}${double} }`;
      })}${quote}clsx${quote};`;
    }

    if (file.endsWith('polyfills')) {
      return '';
    }

    return `${declaration}${quote}${resolve(file)}${quote};`;
  });
};

const media = (() => {
  let cached = null;

  return () => {
    if (cached === null) {
      const shared = local.require('shared.config.js');

      cached = shared.getCustomMedias().customMedia;
    }

    return cached;
  };
})();

/**
 * @param {string} code
 * @returns {string}
 */
const style = (code) => {
  return code
    .replace(regex.styleClass(), (original, dot, name, space) => {
      if (name.startsWith('vkui')) {
        return original;
      }

      return `${dot}vkui${name}${space}`;
    })
    .replace(regex.globalPseudo(), '$1')
    .replace(regex.rootPseudo(), '.vkui__root,.vkui__portal-root')
    .replace(regex.mediaPseudo(), (original, pseudo) => {
      return `@media ${media()[pseudo]}`;
    });
};

/**
 * @param {string} from
 * @param {string} code
 * @param {string} extension
 * @returns {string}
 */
const declarations = (from, code) => {
  const resolve = createResolve(from);

  return code.replace(regex.ECMAImportExport(), (original, declaration, quote, file) => {
    if (!file.startsWith('.')) {
      return original;
    }

    if (file.endsWith('.css')) {
      return '';
    }

    if (file.endsWith('polyfills')) {
      return '';
    }

    return `${declaration}${quote}${resolve(file)}${quote};`;
  });
};

module.exports = {
  style,
  declarations,
  moduleImportsExports
};
