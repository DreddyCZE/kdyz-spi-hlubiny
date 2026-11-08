import { readFile } from 'node:fs/promises';
import { blackwaterAssetPaths } from '../src/data/story-art.js';

// Validate every runtime raster before copying/deploying; a green build cannot hide a missing file.
export async function checkBlackwaterAssets(root = new URL('../', import.meta.url)) {
  for (const path of blackwaterAssetPaths) {
    if (!/^\.\/src\/assets\/blackwater\/[a-z0-9-]+\.webp$/.test(path)) throw new Error('Neplatná cesta ilustrace: ' + path);
    const bytes = await readFile(new URL(path, root));
    if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') throw new Error('Neplatný WebP: ' + path);
  }
  return blackwaterAssetPaths.length;
}
