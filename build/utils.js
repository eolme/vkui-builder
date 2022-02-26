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
  return text.replace(/^\s*import\s*["']\S+\.css["'];?$/gm, '');
};

const stripPolyfills = (text) => {
  return text.replace(/^\s*import\s*["']\S*(?:@babel|core-js|polyfill)\S*["'];?$/gm, '');
};

const stripRelativeNodeModules = (text) => {
  return text.replace(/(?:\.+\/+)+node_modules\/?/g, '');
};

const markPure = (text) => {
  return text.replace(/(?:console\.(?:log|warn|error)|warn|warnOnce)\(/g, '/*@__PURE__*/$&');
};

const optimizeClassNames = (text) => {
  if (!text.includes('classNames')) {
    return text;
  }

  return text.replace(/^\s*import\s*{\s*(\w+)(?:,\s*(\w+))?\s*}\s*from\s*(["'])\S*classNames\S*["'];?$/gm, ($0, $1, $2, $3) => {
    const multi = $2 ? `, default as ${$2}` : '';

    return `import { default as ${$1}${multi} } from ${$3}clsx${$3}`;
  });
};

const optimizeRender = (text) => {
  if (!text.includes('createScopedElement')) {
    return text;
  }

  return `
${text}

const _uppercase = /(^|\\s)([A-Z])/g;
const _prefix = (str) => str.replace(_uppercase, '$1vkui$2');
const _prop = 'vkuiClass';
let _prefixed = '';
let _name = '';
let _class = '';
let _next = null;
let _props = null;
export function h() {
  _props = arguments[1];
  if (props !== null && _prop in _props) {
    _class = _props.className;
    _prefixed = _prefix(_props[_prop]);
    _props.className =
      _class !== null && _class !== undefined ?
      _prefixed + ' ' + _class :
      _prefixed;
    _next = {};
    for (_name in _props) {
      if (_name !== _prop) {
        _next[_name] = _props[_name];
      }
    }
    arguments[1] = _next;
  }
  return React.createElement.apply(null, arguments);
}
export const Fragment = React.Fragment;
`;
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

const chain = (start, callbacks) => {
  callbacks.forEach((fn) => {
    start = fn(start);
  });

  return start;
};

module.exports = {
  BLANK,
  chain,
  spawn,
  input,
  output,
  outputAll,
  resolveRuntime,
  createResolve,
  isJSX,
  stripStyleImport,
  stripRelativeNodeModules,
  stripPolyfills,
  optimizeClassNames,
  optimizeRender,
  markPure,
  syncPromise
};
