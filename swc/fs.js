const sync = require('fs');
const native = sync.promises;
const path = require('path');

const fileParams = { encoding: 'utf8' };
const dirParams = { recursive: true };

/**
 * Read
 *
 * @param {string} file
 * @returns {Promise<string>}
 */
const read = async (file) => native.readFile(file, fileParams);

/**
 * Load
 *
 * @param {string} file
 * @returns {Promise<string>}
 */
const load = async (file) =>
  // eslint-disable-next-line no-sync
  sync.readFileSync(file, fileParams);

/**
 * Write
 *
 * @param {string} file
 * @param {string} code
 * @returns {Promise}
 */
const write = async (file, code) => native.writeFile(file, code, fileParams);

/**
 * @param {string} file
 * @returns {Promise}
 */
const ensure = async (file) => native.mkdir(path.dirname(file), dirParams);

/**
 * Write single file
 *
 * @param {string} file
 * @param {string} code
 * @returns {Promise}
 */
const single = async (file, code) => {
  await ensure(file);

  return write(file, code);
};

/**
 * Write multiple files
 *
 * @param {string} original
 * @param {[string, string][]} dest
 * @returns {Promise}
 */
const multi = async (original, dest) => {
  await ensure(original);

  return Promise.all(dest.map(async ([file, code]) => write(file, code)));
};

/**
 * Create destination
 *
 * @param {string} file
 * @param {string} code
 * @returns {[string, string]}
 */
const dest = (file, code) => [file, code];

/**
 * Recursive remove
 *
 * @param {*} file
 * @returns {Promise}
 */
const rm = async (file) => native.rm(file, dirParams);

module.exports = {
  native,
  sync,
  path,

  rm,

  read,
  load,
  write,
  ensure,

  single,
  multi,

  dest
};
