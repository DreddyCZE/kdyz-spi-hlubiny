// Presentation-only art registry. Never consumed by rules or persisted game state.
// Add optimized WebP paths here when approved illustrations are available.
export const storyArt = Object.freeze({
  fallback: './src/assets/blackwater-map.webp',
  byCardId: Object.freeze({
    // '0-0': './src/assets/cards/lost-ship.webp',
  }),
  byLocationId: Object.freeze({}),
});
export function imageForCard(card, registry = storyArt) {
  return (card && registry.byCardId?.[card.id])
    || (card && registry.byLocationId?.[card.locationId])
    || registry.fallback;
}
