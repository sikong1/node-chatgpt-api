import { pathToFileURL } from 'url';
import { KeyvFile } from 'keyv-file';
import fs from 'fs';
const arg = process.argv.find(_arg => _arg.startsWith('--settings'));
const path = arg?.split('=')[1] ?? './settings.js';

let settings;
if (fs.existsSync(path)) { // 判断文件是否存在
  // get the full path
  const fullPath = fs.realpathSync(path); // 返回规范化的绝对路径
  settings = (await import(pathToFileURL(fullPath).toString())).default; // import()函数返回一个Promise对象
} else {
  if (arg) {
    console.error('Error: the file specified by the --settings parameter does not exist.');
  } else {
    console.error('Error: the settings.js file does not exist.');
  }
  process.exit(1);
}


if (settings.storageFilePath && !settings.cacheOptions.store) {
  // make the directory and file if they don't exist
  const dir = settings.storageFilePath.split('/').slice(0, -1).join('/');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(settings.storageFilePath)) {
    fs.writeFileSync(settings.storageFilePath, '');
  }

  settings.cacheOptions.store = new KeyvFile({ filename: settings.storageFilePath });
  fs.writeFileSync('./src/settings/index.js', `export default ${JSON.stringify(settings)}`);
  console.log('写入成功');
}