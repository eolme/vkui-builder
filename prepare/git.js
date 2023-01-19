const https = require('https');
const unzip = require('extract-zip');
const os = require('os');

const fs = require('../swc/fs');

const archive = (version) => `VKUI-${version.slice(1)}`;
const link = (version) => `https://codeload.github.com/VKCOM/VKUI/zip/refs/tags/${version}`;

const unpackFile = async (filePath, dirPath) => {
  return unzip(filePath, { dir: dirPath });
};

const downloadFile = async (url, dirPath) => {
  return new Promise((resolve) => {
    const fileURL = new URL(decodeURI(url));
    const fileName = fs.path.basename(fileURL.pathname);
    const filePath = fs.path.resolve(dirPath, fileName);
    const file = fs.sync.createWriteStream(filePath);
    const request = https.get(fileURL, (response) => response.pipe(file));

    file.on('finish', () => {
      resolve(filePath);
    });

    request.end();
  });
};

const createTemp = async () => {
  return fs.native.mkdtemp(fs.path.join(os.tmpdir(), 'vkui'));
};

const fetchVersion = async (version) => {
  console.log(fetchVersion.name);
  console.time(fetchVersion.name);

  const dirPath = await createTemp();
  const filePath = await downloadFile(link(version), dirPath);

  await unpackFile(filePath, dirPath);

  console.timeEnd(fetchVersion.name);

  return fs.path.resolve(dirPath, archive(version), 'packages/vkui');
};

module.exports = {
  fetchVersion
};
