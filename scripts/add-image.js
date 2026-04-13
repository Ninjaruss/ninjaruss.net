#!/usr/bin/env node
/**
 * add-image — quickly add an image to the site
 *
 * Usage:
 *   node scripts/add-image.js <source-path> <type> [output-name]
 *
 * Types:
 *   emblem    → public/images/emblems/   (outputs frontmatter snippet)
 *   media     → public/images/media/     (outputs markdown + frontmatter)
 *   showcase  → public/images/showcase/  (outputs markdown snippet)
 *   notes     → public/images/notes/     (outputs markdown snippet)
 *
 * Examples:
 *   node scripts/add-image.js ~/Downloads/my-art.jpg media
 *   node scripts/add-image.js ~/Downloads/icon.svg emblem persona-eye
 */

import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { basename, extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

const TYPES = {
  emblem:   'public/images/emblems',
  media:    'public/images/media',
  showcase: 'public/images/showcase',
  notes:    'public/images/notes',
};

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-_]/g, '')
    .replace(/-+/g, '-');
}

const [,, src, type, customName] = process.argv;

if (!src || !type) {
  console.error('Usage: node scripts/add-image.js <source-path> <type> [output-name]');
  console.error('Types: emblem | media | showcase | notes');
  process.exit(1);
}

if (!TYPES[type]) {
  console.error(`Unknown type "${type}". Use: ${Object.keys(TYPES).join(' | ')}`);
  process.exit(1);
}

const srcPath = resolve(src.replace(/^~/, process.env.HOME));

if (!existsSync(srcPath)) {
  console.error(`Source file not found: ${srcPath}`);
  process.exit(1);
}

const ext = extname(basename(srcPath));
const baseName = customName
  ? slugify(customName) + ext
  : slugify(basename(srcPath));

const destDir = join(ROOT, TYPES[type]);
mkdirSync(destDir, { recursive: true });

const destPath = join(destDir, baseName);
copyFileSync(srcPath, destPath);

const publicPath = `/${TYPES[type].replace('public/', '')}/${baseName}`;

console.log('\nCopied to:', destPath.replace(ROOT + '/', ''));
console.log('\n--- Snippet ---');

if (type === 'emblem') {
  console.log(`emblem: '${publicPath}'`);
} else {
  console.log(`![${baseName.replace(ext, '')}](${publicPath})`);
  if (type === 'media') {
    console.log(`\n# Also usable as frontmatter image:`);
    console.log(`image: '${publicPath}'`);
  }
}
console.log('---------------\n');
