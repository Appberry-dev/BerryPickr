import fs from 'node:fs/promises';
import path from 'node:path';

const files = [
  ['src/styles/base.css', 'dist/styles/base.css'],
  ['src/styles/skin-template.css', 'dist/styles/skin-template.css']
];

for (const [source, destination] of files) {
  const targetDir = path.dirname(destination);
  await fs.mkdir(targetDir, { recursive: true });
  await fs.copyFile(source, destination);
}
