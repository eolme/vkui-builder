const fg = require('fast-glob');

const entry = async () => fg([
  './src/vkui.css',
  './src/components/**/*.css'
]);

const postcss = require('./postcss');
const utils = require('./utils');

const build = async () => {
  await utils.createStylesEntry();

  const entryPoints = await entry();

  return postcss.buildFromEntry(entryPoints);
};

module.exports = {
  build
};
