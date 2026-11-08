// Presentation only: consume investigationView(state) and the existing public log.
// Never import scenario definitions, evaluate conditions or persist tab selection.
const sections = [
  ['evidence', 'Důkazy', 'Zatím nemáš zaznamenané důkazy. Prozkoumej Blackwater a zaznamenej první stopu.'],
  ['knowledge', 'Znalosti', 'Zatím nemáš odvozené znalosti. Získané důkazy můžeš propojit výslovným vyhodnocením.'],
  ['deductions', 'Dedukce', 'Zatím nebyla vytvořena žádná dedukce. Dostupná propojení se objeví, až získáš potřebné důkazy.'],
  ['chronicle', 'Kronika', 'Kronika je zatím prázdná. Zde budou zaznamenány uskutečněné události.'],
];
const text = value => typeof value === 'string' ? value : '';
const entry = value => ({ name: text(value.name), description: text(value.description), source: text(value.source) });

// An allow-list prevents accidental rendering of extra fields, even in a richer view.
export function journalModel(view, log = []) {
  return {
    evidence: view.evidence.map(entry),
    knowledge: view.knowledge.map(entry),
    deductions: view.deductions.map(value => ({ ...entry(value), count: value.count })),
    available: view.available.map(entry),
    chronicle: [...log].reverse().map(text),
  };
}

export function createJournal(anchor, onDeduce) {
  const doc = anchor.ownerDocument;
  const make = (tag, className, content) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };
  const section = make('section', 'journal detail-panel');
  section.hidden = true; section.id = 'investigation-journal';
  section.setAttribute('aria-labelledby', 'journal-title');
  const eyebrow = make('p', 'journal-eyebrow', 'BLACKWATER · OSOBNÍ ZÁPISKY');
  const heading = make('h2', '', 'Vyšetřovací deník'); heading.id = 'journal-title';
  const introduction = make('p', 'journal-intro', 'Nalezené stopy, ověřené souvislosti a události tvého vyšetřování.');
  const tabs = make('div', 'journal-tabs'); tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Sekce deníku');
  const panels = new Map(), buttons = new Map();
  let selected = 'evidence';
  function select(key, focus = false) {
    if (!panels.has(key)) return;
    selected = key;
    for (const [id, panel] of panels) {
      panel.hidden = id !== key;
      const tab = buttons.get(id);
      tab.setAttribute('aria-selected', String(id === key)); tab.tabIndex = id === key ? 0 : -1;
    }
    if (focus) buttons.get(key).focus();
  }
  for (const [key, label] of sections) {
    const tab = make('button', 'journal-tab'); tab.type = 'button'; tab.id = 'journal-tab-' + key;
    tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', 'journal-panel-' + key);
    tab.onclick = () => select(key);
    tab.onkeydown = event => {
      const index = sections.findIndex(([id]) => id === key);
      const next = { ArrowRight: (index + 1) % sections.length, ArrowLeft: (index + sections.length - 1) % sections.length, Home: 0, End: sections.length - 1 }[event.key];
      if (next !== undefined) { event.preventDefault(); select(sections[next][0], true); }
    };
    buttons.set(key, tab); tabs.append(tab);
    const panel = make('div', 'journal-panel'); panel.id = 'journal-panel-' + key; panel.tabIndex = 0;
    panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', tab.id);
    panel.append(make('h3', '', label));
    const list = make('div', 'journal-list'); list.id = 'journal-' + key; list.tabIndex = -1;
    panel.append(list); panels.set(key, panel);
  }
  const availableHeading = make('h4', '', 'Připravená propojení');
  const available = make('div', 'journal-list'); available.id = 'journal-available';
  panels.get('deductions').append(availableHeading, available);
  const footer = make('div', 'journal-footer');
  const button = make('button', 'primary', 'Vyhodnotit důkazy'); button.id = 'deduce'; button.type = 'button'; button.onclick = onDeduce;
  const message = make('p', 'journal-status'); message.id = 'journal-status'; message.setAttribute('role', 'status');
  footer.append(button, message);
  section.append(eyebrow, heading, introduction, tabs, ...panels.values(), footer); anchor.after(section);
  select(selected);

  function list(target, entries, empty, status) {
    target.replaceChildren();
    for (const value of entries) {
      const note = make('article', 'journal-entry');
      const paragraph = make('p'); paragraph.append(make('strong', '', value.name), make('span', '', value.description));
      note.append(paragraph);
      if (value.source) note.append(make('span', 'journal-meta', 'Zdroj: ' + value.source));
      if (status) note.append(make('span', 'journal-meta', status(value)));
      target.append(note);
    }
    if (!entries.length) target.append(make('p', 'journal-empty', empty));
  }
  return {
    select,
    render(view, disabled, log = [], automatic = false) {
      const model = journalModel(view, log);
      for (const [key, label, empty] of sections) {
        const target = panels.get(key).querySelector('#journal-' + key);
        buttons.get(key).textContent = label + ' · ' + model[key].length;
        if (key === 'chronicle') {
          target.replaceChildren();
          if (!model.chronicle.length) target.append(make('p', 'journal-empty', empty));
          else {
            const timeline = make('ol', 'journal-timeline');
            for (const value of model.chronicle) timeline.append(make('li', '', value));
            target.append(timeline);
          }
        } else list(target, model[key], empty, key === 'deductions' ? value => 'Vyhodnoceno' + (value.count > 1 ? ' · ' + value.count + '×' : '') : null);
      }
      list(available, model.available, 'Žádné další propojení nyní nesplňuje požadavky.', () => 'Požadavky splněny · čeká na vyhodnocení');
      button.hidden = automatic;
      availableHeading.hidden = automatic;
      available.hidden = automatic;
      button.disabled = automatic || disabled || !model.available.length;
      message.textContent = automatic ? 'Deník automaticky propojuje získané důkazy. Není potřeba nic potvrzovat.' : disabled ? 'Vyhodnocení je nyní pozastavené. Získané záznamy můžeš prohlížet.' : model.available.length ? 'Důkazy lze propojit. Vyhodnocení je zdarma.' : 'Deník se doplňuje pouze o získané informace. Prohlížení je zdarma.';
    },
  };
}
