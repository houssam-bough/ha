import { readFile, writeFile } from 'node:fs/promises';

// The GitHub ZIP includes public/cours. Keep a ready-to-open HTML at its root.
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
if (!html.includes('./cours/')) throw new Error('Course asset paths are missing from the build.');
await writeFile(
  new URL('../Ouvrir-SIMUL8.html', import.meta.url),
  html.replaceAll('./cours/', './public/cours/'),
);
console.log('Ouvrir-SIMUL8.html ready for the GitHub download.');
