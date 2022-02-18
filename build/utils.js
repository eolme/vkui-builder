const fs = require('fs').promises;
const path = require('path');
const cross = require('cross-spawn');
const { Buffer } = require('buffer');

const fsParams = { encoding: 'utf8' };
const fsCreatePrams = { recursive: true };

const output = async (filePath, fileText) => {
  await fs.mkdir(path.dirname(filePath), fsCreatePrams);
  await fs.writeFile(filePath, fileText, fsParams);
};

const outputAll = async (filePath, esm, cjs) => {
  const nodePath = filePath.replace('/dist/', '/dist/node/');

  return Promise.all([
    output(filePath, esm),
    output(nodePath, cjs)
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

const createResolve = (dir) => (name) => {
  return require.resolve(name, {
    paths: [
      dir
    ]
  });
};

const isJSX = (filePath) => {
  return path.extname(filePath).endsWith('x');
};

const stripStyleImport = (text) => {
  return text.replace(/^(import|require)[\s\w-{"'()*,./\\}]+?\.css.*$/gm, '');
};

const stripRelativeNodeModules = (text) => {
  return text.replace(/(?:\.+\/+)+node_modules\/?/g, '');
};

const markPure = (text) => {
  return text.replace(/(?:console\.(?:log|warn|error)|warn|warnOnce)\(/g, '/*#__PURE__*/$&');
};

const syncPromise = () => {
  let resolve;
  let reject;

  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return {
    promise,
    resolve,
    reject
  };
};

const BLANK = (() => { /* Undefined */ })();

const spawn = async (command, args, options) => {
  const sync = syncPromise();
  const proc = cross(command, args, options);

  let length = 0;
  const result = [];

  proc.stdout.on('data', (chunk) => {
    const buffer = Buffer.from(chunk);

    length += buffer.length;
    result.push(buffer);
  });

  proc.on('error', sync.reject);
  proc.on('exit', (code, signal) => {
    if (code !== 0) {
      sync.reject(new Error(signal || code));
    } else {
      sync.resolve(Buffer.concat(result, length).toString('utf8'));
    }
  });

  return sync.promise;
};

module.exports = {
  BLANK,
  spawn,
  input,
  output,
  outputAll,
  resolveRuntime,
  createResolve,
  isJSX,
  stripStyleImport,
  stripRelativeNodeModules,
  markPure,
  syncPromise
};
