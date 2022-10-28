const fs = require('fs').promises;
const path = require('path');

const fileParams = { encoding: 'utf8' };
const dirParams = { recursive: true };

/**
 * @param {string} file
 * @returns {Promise<string>}
 */
const read = async (file) => fs.readFile(file, fileParams);

/**
 * @param {string} file
 * @param {string} code
 * @returns {Promise}
 */
const write = async (file, code) => fs.writeFile(file, code, fileParams);

/**
 * @param {string} file
 * @returns {Promise}
 */
const ensure = async (file) => fs.mkdir(path.dirname(file), dirParams);

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

module.exports = {
  native: fs,
  path,

  read,
  write,
  ensure,

  single,
  multi,

  dest
};
