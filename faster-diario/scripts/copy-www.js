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

// After modular src/: tsc emits dist/shell/main.js + dist/core/... (ES modules). Must run "npm run build" first.
const distDir = path.join(root, 'dist');
const distMain = path.join(distDir, 'shell', 'main.js');
if (!fs.existsSync(distMain)) {
  console.error('Error: dist/shell/main.js not found. Run "npm run build" (or "npm run copy-web") first.');
  process.exit(1);
}

fs.mkdirSync(wwwDir, { recursive: true });
fs.copyFileSync(path.join(root, 'index.html'), path.join(wwwDir, 'index.html'));
copyDirSync(path.join(root, 'theme'), path.join(wwwDir, 'theme'));
copyDirSync(path.join(root, 'lang'), path.join(wwwDir, 'lang'));
const dataDir = path.join(root, 'data');
const wwwData = path.join(wwwDir, 'data');
if (fs.existsSync(dataDir)) {
  copyDirSync(dataDir, wwwData);
}
const scriptsWww = path.join(wwwDir, 'scripts');
fs.mkdirSync(scriptsWww, { recursive: true });
// Copy entire dist tree so relative imports (./core/...) resolve under scripts/
copyDirSync(distDir, scriptsWww);

console.log('Copied index.html, theme/, lang/, data/, dist/* -> www/scripts/');
