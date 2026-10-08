import fs from 'fs';
import path from 'path';

// 1. Ensure dist exists
const distDir = path.resolve('dist');
if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist. Run vite build first.');
  process.exit(1);
}

// 2. Backup dev index.html if not already backed up
const devIndexPath = path.resolve('index.dev.html');
const rootIndexPath = path.resolve('index.html');

if (!fs.existsSync(devIndexPath)) {
  const content = fs.readFileSync(rootIndexPath, 'utf-8');
  if (content.includes('/src/main.tsx')) {
    fs.writeFileSync(devIndexPath, content);
    console.log('Saved index.dev.html backup.');
  }
}

// 3. Copy dist files to root for GitHub Pages (main /root)
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    for (const file of files) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const files = fs.readdirSync(distDir);
for (const file of files) {
  copyRecursive(path.join(distDir, file), path.resolve(file));
  console.log(`Copied ${file} to root.`);
}

console.log('Successfully prepared root directory for GitHub Pages (main /root)!');
