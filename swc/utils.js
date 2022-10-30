const isCSS = (file) => file.endsWith('.css');
const isModuleCSS = (file) => file.endsWith('.module.css');

const isJS = (file) => file.endsWith('.js') || file.endsWith('.jsx');
const isJSX = (file) => file.endsWith('x');

const dest = (file) => file.replace('/src/', '/dist/');

const TSXToJS = (file) => dest(file)
  .replace('.tsx', '.jsx')
  .replace('.ts', '.js')
  .replace('.jsx', '.js');

const moduleCSSToJS = (file) => dest(file).replace('.module.css', '.styles.js');
const moduleCSSToCSS = (file) => dest(file).replace('.module.css', '.css');

const random = (prefix) => `${prefix}${Math.random().toString(32).slice(2, 6)}`;

module.exports = {
  isCSS,
  isModuleCSS,

  isJS,
  isJSX,

  dest,
  TSXToJS,

  moduleCSSToJS,
  moduleCSSToCSS,

  random
};
