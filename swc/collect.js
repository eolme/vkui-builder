const regex = require('./regex');

/**
 * Collect classes with `vkui` prefix
 *
 * @param {string} code
 * @returns {string}
 */
const styleClass = (code) => {
  const classes = {};

  code.replace(regex.styleClass(), (original, dot, name) => {
    classes[name] = `vkui${name}`;
  });

  return `export default ${JSON.stringify(classes, null, 4)};`;
};

module.exports = {
  styleClass
};
