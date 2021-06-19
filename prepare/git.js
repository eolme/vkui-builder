const https = require('https');
const stream = require('fs');
const fs = require('fs').promises;
const unzip = require('extract-zip');
const path = require('path');
const os = require('os');

const GIT_ENDPOINT = 'https://codeload.github.com/VKCOM/VKUI/zip/refs/heads/master';
const GIT_NAME = 'VKUI-master';

const unpackFile = async (filePath, dirPath) => {
  return unzip(filePath, { dir: dirPath });
};

const downloadFile = async (url, dirPath) => {
  return new Promise((resolve) => {
    const fileURL = new URL(decodeURI(url));
    const fileName = path.basename(fileURL.pathname);
    const filePath = path.resolve(dirPath, fileName);
    const file = stream.createWriteStream(filePath);
    const request = https.get(fileURL, (response) => response.pipe(file));
    file.on('finish', () => {
      resolve(filePath);
    });
    request.end();
  });
};

const createTemp = async () => {
  return fs.mkdtemp(path.join(os.tmpdir(), 'vkui'));
};

const fetchMaster = async () => {
  const dirPath = await createTemp();
  const filePath = await downloadFile(GIT_ENDPOINT, dirPath);
  await unpackFile(filePath, dirPath);
  const unpackPath = path.resolve(dirPath, GIT_NAME);
  return unpackPath;
};

module.exports = {
  fetchMaster
};
