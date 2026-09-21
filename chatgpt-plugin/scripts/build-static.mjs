import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { previewHtml } from '../dist/src/preview.js';
import { widgetHtml } from '../dist/src/widget.js';

const output = new URL('../public/', import.meta.url);
await mkdir(output, { recursive: true });
await Promise.all([
  writeFile(new URL('index.html', output), previewHtml),
  writeFile(new URL('widget.html', output), widgetHtml),
  copyFile(new URL('../dist/src/domain.js', import.meta.url), new URL('domain.js', output)),
]);
console.log('Static demo built in public/ (browser-only state, no server required).');
