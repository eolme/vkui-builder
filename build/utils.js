const fs = require('fs').promises;
const path = require('path');

const fsParams = { encoding: 'utf8' };
const fsCreatePrams = { recursive: true };

const output = async (filePath, fileText) => {
  await fs.mkdir(path.dirname(filePath), fsCreatePrams);
  await fs.writeFile(filePath, fileText, fsParams);
};

const outputAll = async (filePath, esm, es5, cjs) => {
  const esmPath = filePath;
  const es5Path = filePath.replace('/esnext/', '/');
  const cjsPath = filePath.replace('/esnext/', '/cjs/');

  return Promise.all([
    output(esmPath, esm),
    output(es5Path, es5),
    output(cjsPath, cjs)
  ]);
};

const input = async (filePath) => {
  return fs.readFile(filePath, fsParams);
};

const runtimePath = path.resolve(process.cwd(), './src/lib/jsxRuntime');
const resolveRuntime = (filePath) => {
  const relative = path.relative(path.dirname(filePath), runtimePath);

  return relative.startsWith('.') ? relative : `./${relative}`;
};

const isJSX = (filePath) => {
  return path.extname(filePath).endsWith('x');
};

const stripStyleImport = (text) => {
  return text.replace(/^(import|require)[\s\w-{"'()*,./\\}]+?\.css.*$/gm, '');
};

const markPure = (text) => {
  return text.replace(/(?:console\.(?:log|warn|error)|warn|warnOnce)\(/g, '/*#__PURE__*/$&');
};

const isPure = (text) => {
  return text.includes('__PURE__');
};

module.exports = {
  input,
  output,
  outputAll,
  resolveRuntime,
  isJSX,
  stripStyleImport,
  markPure,
  isPure
};
