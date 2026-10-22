/**
 * Lumora Dental Studio — Production Build & Asset Validation Script
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('✨ Lumora Dental Studio: Running production build...');

// 1. Sync images between images/ and public/images/
const rootImages = path.join(ROOT_DIR, 'images');
const publicImages = path.join(ROOT_DIR, 'public', 'images');
copyDirRecursive(publicImages, rootImages);
copyDirRecursive(rootImages, publicImages);

// 2. Sync css and js to public
copyDirRecursive(path.join(ROOT_DIR, 'css'), path.join(ROOT_DIR, 'public', 'css'));
copyDirRecursive(path.join(ROOT_DIR, 'js'), path.join(ROOT_DIR, 'public', 'js'));

// 3. Sync favicon
const rootFavicon = path.join(ROOT_DIR, 'favicon.svg');
const publicFavicon = path.join(ROOT_DIR, 'public', 'favicon.svg');
if (fs.existsSync(rootFavicon) && !fs.existsSync(publicFavicon)) {
  fs.copyFileSync(rootFavicon, publicFavicon);
} else if (fs.existsSync(publicFavicon) && !fs.existsSync(rootFavicon)) {
  fs.copyFileSync(publicFavicon, rootFavicon);
}

// 4. Validate all HTML references
const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));
let totalImages = 0;
let missingAssets = 0;

for (const htmlFile of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT_DIR, htmlFile), 'utf-8');
  const imgMatches = [...content.matchAll(/src="([^"#?]+)"/g)];
  for (const match of imgMatches) {
    const src = match[1];
    if (src.startsWith('http') || src.startsWith('data:')) continue;
    totalImages++;
    const resolved = path.join(ROOT_DIR, src);
    if (!fs.existsSync(resolved) || fs.statSync(resolved).size === 0) {
      console.error(`❌ Missing asset in ${htmlFile}: ${src}`);
      missingAssets++;
    }
  }

  const cssMatches = [...content.matchAll(/href="([^"#?]+\.css)"/g)];
  for (const match of cssMatches) {
    const href = match[1];
    if (href.startsWith('http')) continue;
    const resolved = path.join(ROOT_DIR, href);
    if (!fs.existsSync(resolved)) {
      console.error(`❌ Missing stylesheet in ${htmlFile}: ${href}`);
      missingAssets++;
    }
  }
}

console.log(`✓ Verified ${htmlFiles.length} HTML pages.`);
console.log(`✓ Verified ${totalImages} image instances.`);

if (missingAssets > 0) {
  console.error(`❌ Build failed with ${missingAssets} missing assets.`);
  process.exit(1);
} else {
  console.log('✅ All assets verified successfully. Production build ready!');
}
