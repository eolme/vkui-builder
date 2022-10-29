const regexECMAImport = () =>
  /^\s*(import\s+(?:type)?\s*(?:(?:\*\s+as\s*\w+|{[\S\s]+?}|\w+?)\s+from)?\s*)(["'])(\S+?)\2;/gm;

const regexECMAModuleExtension = () =>
  /(\.d)?\.m?(t|j)s$/;

const regexStyleExtension = () =>
  /\.css$/;

const regexStyleModuleExtension = () =>
  /\.module(\.css)$/;

const regexStyleClass = () =>
  /(\.)(-?[A-Z_a-z]+[\w-]*)(\s*)/g;

const regexGlobalPseudo = () =>
  /:global\(([\S\s]+?)\)/g;

const regexRootPseudo = () =>
  /:root/g;

const regexImportNames = () =>
  /{\s*(\w+)(?:,\s*(\w+))?\s*}/gm;

module.exports = {
  regexECMAImport,

  regexECMAModuleExtension,
  regexStyleExtension,
  regexStyleModuleExtension,

  regexStyleClass,
  regexGlobalPseudo,
  regexRootPseudo,

  regexImportNames
};
