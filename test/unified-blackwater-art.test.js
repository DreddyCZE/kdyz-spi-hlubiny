import test from 'node:test';
import assert from 'node:assert/strict';
import { imageForCard, blackwaterImage, storyArt } from '../src/data/story-art.js';

test('scenario cards use original Blackwater location illustrations when no card art exists', () => {
  for (let n = 0; n < 7; n++) {
    const locationId = 'location-' + n;
    assert.equal(imageForCard({ id: 'scenario-unknown-' + n, locationId }), blackwaterImage('locations', locationId));
  }
});

test('card-specific art wins over location fallback', () => {
  assert.equal(imageForCard({ id: '0-0', locationId: 'location-0' }), storyArt.byCardId['0-0']);
});

test('unknown location uses fallback without leaking other scene artwork', () => {
  assert.equal(imageForCard({ id: 'unlisted', locationId: 'location-unknown' }), storyArt.fallback);
});

test('custom art registries remain independent from Blackwater assets', () => {
  const registry = { fallback: '/custom/fallback.webp', byCardId: {}, byLocationId: {} };
  assert.equal(imageForCard({ id: 'x', locationId: 'location-0' }, registry), registry.fallback);
});
