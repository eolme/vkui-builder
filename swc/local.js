const fs = require('./fs');

/**
 * @param {string} file
 * @returns {string}
 */
const _resolve = (file) => require.resolve(fs.path.resolve(process.cwd(), file));

/**
 * @param {string} file
 * @returns {any}
 */
const _require = (file) =>
  // eslint-disable-next-line global-require
  require(_resolve(file));

module.exports = {
  resolve: _resolve,
  require: _require
};
