const fs = require('./fs');
const regex = require('./regex');
const utils = require('./utils');

/**
 * @param {string} to
 * @returns {boolean}
 */
const dir = utils.memoize((to) => {
  try {
    // eslint-disable-next-line no-sync
    const stat = fs.sync.lstatSync(to);

    return stat.isDirectory();
  } catch {
    // LstatSync throws an error if path doesn't exist
    return false;
  }
});

const createResolve = utils.memoize((from) => {
  from = fs.path.resolve(fs.path.dirname(from));

  /**
   * @param {string} file
   * @returns {string}
   */
  return (file) => {
    let to = fs.path.resolve(from, file);

    if (dir(to)) {
      to = fs.path.join(to, 'index.js');
    } else {
      to = `${to.replace(regex.ECMAModuleExtension(), '')}.js`;
    }

    const relative = fs.path.relative(from, to);

    return relative.startsWith('.') ? relative : `./${relative}`;
  };
});

module.exports = {
  createResolve
};
