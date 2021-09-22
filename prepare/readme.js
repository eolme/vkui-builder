const utils = require('../build/utils');
const path = require('path');

const readme = `# @mntm/vkui

[VKUI](https://npm.im/@vkontakte/vkui) built with [@mntm/vkui-builder](https://npm.im/@mntm/vkui-builder)

Documentation: https://vkcom.github.io/VKUI/
Changelog: https://github.com/VKCOM/VKUI/releases
`;

const rewrite = async () => {
  const readmePath = path.resolve(process.cwd(), 'README.md');

  await utils.output(readmePath, readme);
};

module.exports = {
  rewrite
};
