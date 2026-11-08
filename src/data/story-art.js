// Presentation-only art registry. Never consumed by rules or persisted game state.
// Original generated illustrations; see docs/STORY-CARDS.md for provenance.
export const storyArt = Object.freeze({
  fallback: './src/assets/blackwater-map.webp',
  byCardId: Object.freeze({
    '0-0': './src/assets/cards/lost-ship.webp',
    '0-1': './src/assets/cards/man-in-fog.webp',
  }),
  byLocationId: Object.freeze({}),
});
export function imageForCard(card, registry = storyArt) {
  if(registry===storyArt && card && Object.hasOwn(blackwaterArt.encounters,card.id))return blackwaterArt.encounters[card.id];
  return (card && registry.byCardId?.[card.id])
    || (card && registry.byLocationId?.[card.locationId])
    || registry.fallback;
}


// Blackwater presentation IDs only. No rules, conditions, rewards or save state.
const artwork = name => './src/assets/blackwater/' + name + '.webp';
export const blackwaterArt = Object.freeze({
  investigators: Object.freeze({ detective: artwork('detective'), occultist: artwork('occultist'), sailor: artwork('sailor') }),
  monsters: Object.freeze({
    'enemy-drowned-sailor': artwork('drowned'), 'enemy-fog-hound': artwork('fog-hound'),
    'enemy-hollow-orderly': artwork('hollow-orderly'), 'enemy-bell-keeper': artwork('bell-keeper'),
  }),
  locations: Object.freeze({
    'location-0': artwork('harbor'), 'location-1': artwork('old-town'), 'location-2': artwork('library'),
    'location-3': artwork('asylum'), 'location-4': artwork('cemetery'), 'location-5': artwork('lighthouse'), 'location-6': artwork('caves'),
  }),
  myths: Object.freeze({
    'myth-bell': artwork('myth-bell'), 'myth-fog': artwork('myth-fog'), 'myth-knock': artwork('myth-knock'),
    'myth-hound': artwork('myth-hound'), 'myth-lantern': artwork('myth-lantern'), 'myth-orderly': artwork('myth-orderly'),
  }),
  encounters: Object.freeze({
    'bw-00-01': artwork('bw-00-01'),
    'bw-00-02': artwork('bw-00-02'),
    'bw-01-01': artwork('bw-01-01'),
    'bw-01-02': artwork('bw-01-02'),
    'bw-02-01': artwork('bw-02-01'),
    'bw-02-02': artwork('bw-02-02'),
    'bw-03-01': artwork('bw-03-01'),
    'bw-03-02': artwork('bw-03-02'),
    'bw-04-01': artwork('bw-04-01'),
    'bw-04-02': artwork('bw-04-02'),
    'bw-05-01': artwork('bw-05-01'),
    'bw-05-02': artwork('bw-05-02'),
    'bw-06-01': artwork('bw-06-01'),
    'bw-06-02': artwork('bw-06-02'),
  }),
  results: Object.freeze({
    criticalSuccess: artwork('evidence'), greatSuccess: artwork('evidence'), success: artwork('evidence'),
    partialSuccess: artwork('result-cost'), failure: artwork('result-danger'), criticalFailure: artwork('result-danger'),
    evidence: artwork('evidence'),
  }),
  items: Object.freeze({
    'bw-bandage': artwork('bandage'), 'bw-laudanum': artwork('laudanum'), 'bw-salt': artwork('salt'),
    'bw-revolver': artwork('revolver'), 'bw-bell-key': artwork('bell-key'), 'bw-cylinder': artwork('cylinder'), 'bw-tide-page': artwork('tide-page'),
  }),
});
export function blackwaterImage(group, id) {
  const entries = blackwaterArt[group];
  return entries && Object.hasOwn(entries, id) ? entries[id] : null;
}
export const blackwaterAssetPaths = Object.freeze([...new Set(Object.values(blackwaterArt).flatMap(group => Object.values(group)))]);
