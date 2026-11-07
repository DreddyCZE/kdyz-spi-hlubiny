import { cp, mkdir, rm } from 'node:fs/promises';
// Fixed output directory inside this repository; never derive deletion paths from input.
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'src', 'public']) await cp(file, `dist/${file}`, { recursive: true });
console.log('Static site built in dist/ (relative URLs support GitHub project Pages).');
