const fs = require('./fs');

const concatStyles = async () => {
  return Promise.all([
    fs.read('./src/styles/constants.css'),
    fs.read('./src/styles/common.css'),
    fs.read('./src/styles/animations.css')
  ]).then(async (contents) =>
    Promise.all([
      fs.single('./src/vkui.css', contents.join('\n')),
      fs.rm('./src/styles')
    ]));
};

module.exports = {
  concatStyles
};
