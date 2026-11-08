import test from 'node:test';
import assert from 'node:assert/strict';
import { blackwaterArt, blackwaterImage, blackwaterAssetPaths } from '../src/data/story-art.js';
import { blackwaterContent } from '../src/engine/blackwater.js';
import { investigators } from '../src/data/blackwater-investigators.js';
import { blackwaterItems } from '../src/data/blackwater-items.js';
import { enemies } from '../src/engine/combat.js';
import { mythEvents } from '../src/engine/myth.js';
import { locations } from '../src/data/locations.js';
import { outcomeKeys } from '../src/engine/schema.js';
import { checkBlackwaterAssets } from '../scripts/check-blackwater-assets.mjs';

test('all actual Blackwater object IDs have explicit raster illustrations', () => {
  for (const [group, objects] of [ ['investigators',investigators], ['monsters',enemies], ['locations',locations], ['myths',mythEvents], ['encounters',blackwaterContent.cards], ['items',blackwaterItems] ]) {
    assert.deepEqual(Object.keys(blackwaterArt[group]).sort(), objects.map(o => o.id).sort());
    for (const object of objects) assert.match(blackwaterImage(group, object.id), /\.webp$/);
    assert.equal(new Set(Object.values(blackwaterArt[group])).size, objects.length, group + ' must not recycle unrelated art');
  }
  for (const key of outcomeKeys) assert.ok(blackwaterImage('results', key));
  assert.equal(blackwaterImage('investigators', 'unknown'), null);
  assert.equal(blackwaterImage('monsters', 'constructor'), null);
  assert.equal(blackwaterImage('unknown', 'unknown'), null);
});

test('registry contains existing valid WebP files and excludes the full UI reference', async () => {
  assert.equal(await checkBlackwaterAssets(), blackwaterAssetPaths.length);
  assert.ok(blackwaterAssetPaths.length >= 40);
  assert.ok(!blackwaterAssetPaths.some(path => path.includes('reference') || path.endsWith('.svg')));
});
