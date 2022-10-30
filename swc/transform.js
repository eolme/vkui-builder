const regex = require('./regex');
const utils = require('./utils');

/**
 * @param {string} code
 * @returns {string}
 */
const moduleExports = (code) => {
  return code.replace(regex.commonExports(), (_, namedExport, objectExports) => {
    if (namedExport) {
      return `export { ${namedExport}, ${namedExport} as default };\n\n`;
    }

    if (objectExports) {
      const name = utils.random('exports');

      const syntheticDefine = `var ${name} = ${objectExports};`;
      const syntheticObjectExports = `export ${objectExports};`;
      const syntheticDefaultExport = `export { ${name} as default };`;

      return `${syntheticDefine}\n${syntheticObjectExports}\n${syntheticDefaultExport}\n`;
    }

    return '';
  });
};

/**
 * @param {string} code
 * @returns {string}
 */
const moduleImports = (code) => {
  return code.replace(regex.commonImports(), (_, imports, moduleName, deep) => {
    if (imports) {
      const name = utils.random('imports');

      const syntheticImport = `import * as ${name} from ${moduleName};`;
      const syntheticDefine = `var ${imports} = (${name}.default || ${name})${deep};`;

      return `${syntheticImport}\n${syntheticDefine}\n`;
    }

    return '';
  });
};

/**
 * @param {string} code
 * @returns {string}
 */
const moduleImportsExports = (code) => moduleExports(moduleImports(code));

module.exports = {
  moduleExports,
  moduleImports,
  moduleImportsExports
};
