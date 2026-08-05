import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const root = path.resolve(currentDirectory, '..');

const required = [
  'public/index.html',
  'public/styles.css',
  'public/app.js',
  'public/admin.html',
  'public/admin.js',
  'server.mjs',
  'server/router.mjs',
  'vercel.json',
];

for (const file of required) {
  await fs.access(path.join(root, file));
}

const dist = path.join(root, 'dist');

await fs.rm(dist, {
  recursive: true,
  force: true,
});

await fs.cp(path.join(root, 'public'), dist, {
  recursive: true,
});

console.log(`Static assets copied to ${dist}`);