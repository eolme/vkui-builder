const path = require('path');
const cross = require('cross-spawn');
const { Buffer } = require('buffer');

const fs = require('./fs');

const resolveLocal = (file) => path.resolve(__dirname, '..', file);
const resolveRemote = (file) => path.resolve(process.cwd(), file);

const stripStyleImport = (text) => {
  return text.replace(/^\s*import\s*["']\S+\.css["'];?$/gm, '');
};

const stripPolyfills = (text) => {
  return text.replace(/^\s*import\s*["']\S*(?:@babel|core-js|polyfill)\S*["'];?$/gm, '');
};

const stripRelativeNodeModules = (text) => {
  return text.replace(/(?:\.+\/+)+node_modules\/?/g, '');
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

const createStylesEntry = async () => {
  return fs.write(
    resolveRemote('src/vkui.css'),
    `@import ${[
      '"./fonts/fonts.css"',
      '"./styles/themes.css"',
      '"./styles/constants.css"',
      '"./styles/animations.css"',
      '"./styles/common.css"'
    ].join(';@import')};`
  );
};

module.exports = {
  BLANK,
  spawn,
  resolveLocal,
  resolveRemote,
  stripStyleImport,
  stripRelativeNodeModules,
  stripPolyfills,
  optimizeClassNames,
  optimizeEnum,
  createStylesEntry,
  syncPromise
};
