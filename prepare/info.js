const fs = require('../build/fs');

const readme = `# @mntm/vkui

[VKUI](https://npm.im/@vkontakte/vkui) built with [@mntm/vkui-builder](https://npm.im/@mntm/vkui-builder)


Documentation: https://vkcom.github.io/VKUI/

Changelog: https://github.com/VKCOM/VKUI/releases
`;

const rewrite = async () => {
  const readmePath = fs.path.resolve(process.cwd(), 'README.md');

  return fs.write(readmePath, readme);
};

rewrite();
