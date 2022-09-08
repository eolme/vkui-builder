const fsSync = require('fs');
const fs = fsSync.promises;
const path = require('path');
const cross = require('cross-spawn');
const { Buffer } = require('buffer');

const fsParams = { encoding: 'utf8' };
const fsCreatePrams = { recursive: true };

const output = async (filePath, fileText) => {
  await fs.mkdir(path.dirname(filePath), fsCreatePrams);
  await fs.writeFile(filePath, fileText, fsParams);
};

const input = async (filePath) => {
  return fs.readFile(filePath, fsParams);
};

const runtimePath = path.resolve(process.cwd(), './src/lib/jsxRuntime.js');
const resolveRuntime = (filePath) => {
  const relative = path.relative(path.dirname(filePath), runtimePath);

  return relative.startsWith('.') ? relative : `./${relative}`;
};

const resolveLocal = (file) => path.resolve(__dirname, '..', file);
const resolveRemote = (file) => path.resolve(process.cwd(), file);

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

const stripThemes = (text) => {
  return text.replace(/@import\s["']\.\/(bright_light|space_gray|vkcom_light|vkcom_dark).+/g, '');
};

const markPure = (text) => {
  return text.replace(/(?:console\.(?:log|warn|error)|warn|warnOnce)\(/g, '/*@__PURE__*/$&');
};

const markModules = (text) => {
  return text.replace(/((?:import|export)[\S\s]+?["']\.[\w./\\-]+?)(["'];)/gm, '$1.js$2');
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
  if (_props !== null && _prop in _props) {
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

const optimizeEnumValues = (text) => {
  let last = 0;

  return text.replace(/("|')?(\w+)\1?(?:\s*=\s*)?([^\n,]+?)?(,|\n|$)/g, (_, quote, name, value, next) => {
    quote = quote || '"';
    value = value ? value.trim() : false;

    if (!value) {
      // Plain
      value = last;
      last += 1;

      return `${quote}${name}${quote}: ${value},${value}: ${quote}${name}${quote}${next}`;
    }

    if (/\d+/.test(value)) {
      // Numbers
      last = Number.parseInt(value, 10) + 1;

      return `${quote}${name}${quote}: ${value},${value}: ${quote}${name}${quote}${next}`;
    }

    // Strings
    return `${quote}${name}${quote}: ${value}${next}`;
  });
};

const optimizeEnum = (text) => {
  if (!text.includes('enum')) {
    return text;
  }

  return text.replace(/(?:const\s+)?enum\s+(\w+)\s*{([\S\s]+?)}/gm, (_, name, values) => `const ${name} = {${optimizeEnumValues(values)}} as const;`);
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
      console.error(command);
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

const createStylesEntry = async () => {
  return fs.writeFile(
    resolveRemote('src/vkui.css'),
    `@import ${[
      '"./fonts/fonts.css"',
      '"./styles/themes.css"',
      '"./styles/constants.css"',
      '"./styles/animations.css"',
      '"./styles/common.css"'
    ].join(';@import')};`,
    { encoding: 'utf8' }
  );
};

const requireLocal = (from) => {
  const full = require.resolve(from);
  const to = resolveLocal(`local/${path.basename(full)}`);

  // eslint-disable-next-line no-sync
  fsSync.mkdirSync(path.dirname(to), { recursive: true });
  // eslint-disable-next-line no-sync
  fsSync.copyFileSync(full, to);

  // eslint-disable-next-line global-require
  return require(to);
};

module.exports = {
  BLANK,
  chain,
  spawn,
  input,
  output,
  resolveRuntime,
  resolveLocal,
  resolveRemote,
  isJSX,
  stripStyleImport,
  stripRelativeNodeModules,
  stripThemes,
  stripPolyfills,
  optimizeClassNames,
  optimizeRender,
  optimizeEnum,
  createStylesEntry,
  markPure,
  markModules,
  syncPromise,
  requireLocal
};
