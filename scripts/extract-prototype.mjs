// One-time extraction from the unchanged v0.3 reference; never used at runtime.
import { readFileSync, writeFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const html = readFileSync('public/legacy-prototype.html', 'utf8');
const literal = html.match(/const locations=([\s\S]*?);\s*const \$=/)[1];
const locations = runInNewContext(literal).map(([name, description, cards], place) => ({
  id: `location-${place}`, name, description,
  cards: cards.map(([title, story, difficulty, choices, texts, items], index) => ({
    id: `${place}-${index}`, title, story, difficulty,
    choices: choices.map(([label, attribute]) => ({ label, attribute })),
    outcomes: texts.map((text, i) => ({ text, item: items[i] || null, effects: {
      hp: -(Number(text.match(/(\d+) HP/)?.[1]) || 0),
      san: -(Number(text.match(/(\d+) SAN/)?.[1]) || 0),
      threat: text.includes('Hrozba +1') ? 1 : 0,
      ritual: text.includes('Rituál +1') ? 1 : 0,
    } })),
  })),
}));
writeFileSync('src/data/locations.js', '// Story content and explicit mechanical effects.\nexport const locations = ' + JSON.stringify(locations, null, 2) + ';\n');
writeFileSync('src/ui/styles.css', html.match(/<style>([\s\S]*?)<\/style>/)[1] + '\nbutton:focus-visible{outline:3px solid #dfbc80;outline-offset:3px}\n@media(prefers-reduced-motion:reduce){*{animation:none!important}}\n');
writeFileSync('index.html', html.replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="./src/ui/styles.css">').replace(/<script>[\s\S]*?<\/script>/, '<script type="module" src="./src/ui/app.js"></script>').replace('hratelný karetní prototyp 0.3', 'karetní vyšetřování').replace('id="log"', 'id="log" role="log" aria-live="polite"').replace('id="reveal"', 'id="reveal" role="status"').replace('id="sum"', 'id="sum" aria-live="polite"'));
