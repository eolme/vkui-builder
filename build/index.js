const fg = require('fast-glob');

const typescript = require('./typescript');
const modules = require('./modules');

const entry = async () => fg([
  './src/**/*.{tsx,ts,jsx,js,css}'
], {
  ignore: [
    './src/**/*.{e2e,test,spec,polyfill}.{tsx,ts,jsx,js,css}',
    './src/**/{test,__tests__,testing}/**/*'
  ]
});

const build = async () => {
  const entryPoints = await entry();

  return Promise.all([
    modules.compile(entryPoints),
    typescript.declarations(entryPoints)
  ]);
};

build();
