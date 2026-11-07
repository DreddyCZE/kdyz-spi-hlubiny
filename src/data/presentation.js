// Scenario presentation only. Rules and saved state do not consume this configuration.
import { blackwaterMap } from './map.js';
import { locations } from './locations.js';
export const presentation = {
  id: 'blackwater',
  map: blackwaterMap,
  locations,
  theme: {
    '--color-surface': '#142622',
    '--color-surface-raised': '#233b33',
    '--color-petrol': '#274c4b',
    '--color-wine': '#5c302e',
  },
};
