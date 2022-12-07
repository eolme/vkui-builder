const fs = require('../swc/fs');

const readme = `# @mntm/vkui

[VKUI](https://npm.im/@vkontakte/vkui) built with [@mntm/vkui-builder](https://npm.im/@mntm/vkui-builder)


Documentation: https://vkcom.github.io/VKUI/

Changelog: https://github.com/VKCOM/VKUI/releases
`;

const rewriteInfo = async () => {
  console.log(rewriteInfo.name);
  console.time(rewriteInfo.name);

  return fs.write('README.md', readme).then(() => {
    console.timeEnd(rewriteInfo.name);
  });
};

module.exports = {
  rewriteInfo
};
