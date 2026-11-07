// Apply only documented visual tokens, never game state or scenario rules.
const themeTokens = new Set([
  '--color-surface', '--color-surface-raised', '--color-petrol', '--color-wine',
  '--color-paper', '--color-paper-light', '--color-paper-ink', '--color-brass',
  '--color-brass-light', '--color-frame', '--texture-wood', '--texture-paper',
]);
export function applyPresentation(root, presentation) {
  root.dataset.theme = presentation.id;
  for (const token of themeTokens) root.style.removeProperty(token);
  for (const [token, value] of Object.entries(presentation.theme || {})) {
    if (themeTokens.has(token)) root.style.setProperty(token, value);
  }
}
