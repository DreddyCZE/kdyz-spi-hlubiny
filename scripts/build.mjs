import { cp, mkdir, rm } from 'node:fs/promises';
// Validate definitions before publishing any build output.
import '../src/engine/content.js';
import { checkBlackwaterAssets } from './check-blackwater-assets.mjs';
await checkBlackwaterAssets();
// Fixed output directory inside this repository; never derive deletion paths from input.
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'blackwater.html', 'src', 'public']) await cp(file, `dist/${file}`, { recursive: true });
console.log('Static site built in dist/ (relative URLs support GitHub project Pages).');
