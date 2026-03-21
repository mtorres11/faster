/**
 * Copies web app assets into www/ for Capacitor.
 * Run from project root: node scripts/copy-www.js
 * Does not copy index.backup.html.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const wwwDir = path.join(root, 'www');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDirSync(s, d);
    else fs.copyFileSync(s, d);
  }
}

// After src/ reorg: app is built from src/app.ts -> dist/app.js. Must run "npm run build" first.
const distApp = path.join(root, 'dist', 'app.js');
if (!fs.existsSync(distApp)) {
  console.error('Error: dist/app.js not found. Run "npm run build" (or "npm run copy-web") first.');
  process.exit(1);
}

fs.mkdirSync(wwwDir, { recursive: true });
fs.copyFileSync(path.join(root, 'index.html'), path.join(wwwDir, 'index.html'));
copyDirSync(path.join(root, 'theme'), path.join(wwwDir, 'theme'));
copyDirSync(path.join(root, 'lang'), path.join(wwwDir, 'lang'));
fs.mkdirSync(path.join(wwwDir, 'scripts'), { recursive: true });
fs.copyFileSync(distApp, path.join(wwwDir, 'scripts', 'app.js'));

console.log('Copied index.html, theme/, lang/, dist/app.js -> www/scripts/');
