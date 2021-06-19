const fg = require('fast-glob');
const postcss = require('./postcss');

const entry = async () => fg([
  './src/**/*.css'
]);

const build = async () => {
  const entryPoints = await entry();

  await postcss.buildFromEntry(entryPoints);
};

module.exports = {
  build
};
