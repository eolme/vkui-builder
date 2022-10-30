const ECMAImportExport = () =>
  /^\s*((?:import|export)\s+(?:type)?\s*(?:(?:\*\s+as\s*\w+|{[\S\s]+?}|\w+?)\s+from)?\s*)(["'])(\S+?)\2;/gm;

const ECMAModuleExtension = () =>
  /(\.d)?\.m?(t|j)s$/;

const styleExtension = () =>
  /\.css$/;

const styleModuleExtension = () =>
  /\.module(\.css)$/;

const styleClass = () =>
  /(\.)(-?[A-Z_a-z]+[\w-]*)(\s*)/g;

const globalPseudo = () =>
  /:global\(([\S\s]+?)\)/g;

const rootPseudo = () =>
  /:root/g;

const mediaPseudo = () =>
  /@media \((--[\w-]+)\)/g;

const importNames = () =>
  /{\s*(\w+)(?:,\s*(\w+))?\s*}/gm;

const commonExports = () =>
  /(?:module\.)?exports\s*=\s*(\w+)?({[\S\s]+?})?\s*;?/gm;

const commonImports = () =>
  /(?:var|let|const)\s+(\w+|{[\S\s]+?})?\s*=\s*require\(([\S\s]+?)\)((?:\.\w+)+)?\s*;?/gm;

module.exports = {
  ECMAImportExport,

  ECMAModuleExtension,
  styleExtension,
  styleModuleExtension,

  commonExports,
  commonImports,

  styleClass,

  globalPseudo,
  rootPseudo,
  mediaPseudo,

  importNames
};
