import fs from 'fs';
import path from 'path';

const devIndexPath = path.resolve('index.dev.html');
const rootIndexPath = path.resolve('index.html');

if (fs.existsSync(devIndexPath)) {
  fs.copyFileSync(devIndexPath, rootIndexPath);
  console.log('Restored development index.html.');
}
