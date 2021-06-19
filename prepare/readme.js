const utils = require('../build/utils');
const path = require('path');

const rewrite = async () => {
  const readmePath = path.resolve(process.cwd(), 'README.md');

  await utils.output(readmePath, `# @mntm/vkui\n\n[VKUI](https://npm.im/@vkontakte/vkui) собранный с помощью [vkui-builder](https://npm.im/vkui-builder)`);
};

module.exports = {
  rewrite
};
