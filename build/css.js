const fg = require('fast-glob');
const postcss = require('./postcss');
const utils = require('./utils');

const entry = async () => fg([
  './src/**/*.css'
]);

const build = async () => {
  await utils.concatStyles();

  const entryPoints = await entry();

  await postcss.buildFromEntry(entryPoints);
};

module.exports = {
  build
};
