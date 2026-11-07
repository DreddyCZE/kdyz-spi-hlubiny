import test from 'node:test';
import assert from 'node:assert/strict';
import { imageForCard, storyArt } from '../src/data/story-art.js';

test('art registry prefers stable card ID, then location, then fallback', () => {
  const registry = { fallback: 'fallback.webp', byCardId: { '0-0': 'card.webp' }, byLocationId: { 'location-0': 'location.webp' } };
  assert.equal(imageForCard({ id: '0-0', locationId: 'location-0' }, registry), 'card.webp');
  assert.equal(imageForCard({ id: 'unknown', locationId: 'location-0' }, registry), 'location.webp');
  assert.equal(imageForCard({ id: 'unknown', locationId: 'unknown' }, registry), 'fallback.webp');
  assert.equal(imageForCard(null, registry), 'fallback.webp');
  assert.equal(imageForCard({ id: '0-0', locationId: 'location-0' }), './src/assets/cards/lost-ship.webp');
  assert.equal(imageForCard({ id: '0-1' }), './src/assets/cards/man-in-fog.webp');
});
