const regexImport = () =>
  /^(import\s+(?:type\s+|\*\s+as\s+\S+)?(?:\S+|{[\S\s]+?})\s+from\s+)(["'])(\S+)\2;?$/gm;

const regexImportRelative = () =>
  /^(import\s+(?:type\s+|\*\s+as\s+\S+)?(?:\S+|{[\S\s]+?})\s+from\s+)(["'])(\.+\/\S+)\2;?$/gm;

const regexModuleExtension = () =>
  /(\.d)?\.m?(t|j)s$/;

const regexStyleClass = () =>
  /(\.)(-?[A-Z_a-z]+[\w-]*)(\s*)/g;

const regexStyle = () =>
  /\.css$/;

const regexStyleModule = () =>
  /\.module(\.css)$/;

module.exports = {
  regexImport,
  regexImportRelative,

  regexModuleExtension,

  regexStyle,
  regexStyleClass,
  regexStyleModule
};
