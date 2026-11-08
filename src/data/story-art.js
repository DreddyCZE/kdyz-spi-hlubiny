// Presentation-only art registry. Never consumed by rules or persisted game state.
// Original generated illustrations; see docs/STORY-CARDS.md for provenance.
export const storyArt = Object.freeze({
  fallback: './src/assets/blackwater-map.webp',
  byCardId: Object.freeze({
    '0-0': './src/assets/cards/lost-ship.webp',
    '0-1': './src/assets/cards/man-in-fog.webp',
    'bw-00-01': './src/assets/cards/lost-ship.webp',
  }),
  byLocationId: Object.freeze({
    'location-0':'./src/assets/cards/lost-ship.webp',
    'location-1':'./src/assets/cards/man-in-fog.webp',
    'location-2':'./src/assets/cards/man-in-fog.webp',
    'location-3':'./src/assets/cards/man-in-fog.webp',
    'location-4':'./src/assets/cards/man-in-fog.webp',
    'location-5':'./src/assets/cards/lost-ship.webp',
    'location-6':'./src/assets/cards/lost-ship.webp',
  }),
});
export function imageForCard(card, registry = storyArt) {
  return (card && registry.byCardId?.[card.id])
    || (card && registry.byLocationId?.[card.locationId])
    || registry.fallback;
}
