import { locations } from '../data/locations.js';
import { attributes, labels, newState, currentCard, transition, rollDice } from '../engine/game.js';
import { load, save } from '../engine/storage.js';
const $ = id => document.getElementById(id);
let storage;
try { storage = window.localStorage; } catch { /* Browser can deny storage access. */ }
let state = load(storage), rolling = false, timer;
function button(text, handler, disabled = false, className = '') {
  const b = document.createElement('button'); b.textContent = text; b.onclick = handler;
  b.disabled = disabled; b.className = className; return b;
}
function dispatch(action) {
  if (rolling) return;
  state = transition(state, action);
  const stored = save(storage, state); render();
  if (!stored) $('saveStatus').textContent = 'Ukládání není dostupné. Hra pokračuje pouze v této záložce.';
}
function render() {
  for (const key of ['round', 'threat', 'ritual', 'ap']) $(key).textContent = state[key];
  $('heroStats').textContent = `Eleanor Whitmore · Výzkumnice · HP ${state.hp}/6 · SAN ${state.san}/8 · ${Object.entries(attributes).map(([k,v]) => `${k} ${v}`).join(' · ')}`;
  $('inventory').textContent = state.inventory.join(' · ') || 'Zatím nic.';
  const location = locations[state.place], card = currentCard(state);
  const result = card && state.resolved[card.id];
  $('placeTitle').textContent = location.name; $('placeDesc').textContent = location.description;
  $('places').replaceChildren(...locations.map((loc, i) => button(loc.name + (i === state.place ? ' · zde' : ''), () => dispatch({ type: 'move', place: i }), rolling || state.ended || state.ap < 1 || i === state.place, i === state.place ? 'active' : '')));
  $('cardTag').textContent = 'PRŮZKUM · ' + location.name.toUpperCase();
  $('cardTitle').textContent = card?.title || 'Lokace je prozkoumána';
  $('cardStory').textContent = card?.story || 'Všechny zdejší karty byly vyřešeny. Vydej se do jiné lokace.';
  $('challenge').textContent = card ? 'Výzva · obtížnost ' + card.difficulty : '';
  $('choices').replaceChildren(...(card?.choices || []).map((o, i) => {
    const b = button(o.label + ' · ' + o.attribute, () => dispatch({ type: 'choose', choice: i }), rolling || state.ended || Boolean(result), 'choice' + (i === state.choice ? ' active' : ''));
    b.setAttribute('aria-pressed', String(i === state.choice)); return b;
  }));
  // Hidden consequences are not placed in the accessibility tree or revealed by selecting text.
  $('outcomes').replaceChildren();
  $('dicebox').classList.toggle('show', Boolean(result) || rolling);
  $('reveal').classList.toggle('show', Boolean(result));
  $('reveal').textContent = result ? labels[result.index] + ' — ' + card.outcomes[result.index].text : '';
  if (result) {
    $('die1').textContent = result.dice[0]; $('die2').textContent = result.dice[1];
    $('sum').textContent = `${result.dice.join(' + ')} + ${attributes[card.choices[result.choice].attribute]} = ${result.total} proti obtížnosti ${card.difficulty}`;
  } else if (!rolling) { $('die1').textContent = '?'; $('die2').textContent = '?'; $('sum').textContent = ''; }
  $('roll').disabled = rolling || state.ended || state.ap < 1 || !card || Boolean(result);
  $('next').disabled = rolling || state.ended || !result;
  $('endRound').disabled = rolling || state.ended;
  $('gameStatus').textContent = state.ended ? 'Konec scénáře: temnota zvítězila. Začni novou hru.' : '';
  $('log').replaceChildren(...state.log.map(text => { const p = document.createElement('p'); p.textContent = text; return p; }));
}
const status = document.createElement('p'); status.id = 'gameStatus'; status.setAttribute('role', 'status'); $('cardTitle').before(status);
const saveStatus = document.createElement('p'); saveStatus.id = 'saveStatus'; saveStatus.setAttribute('role', 'status'); $('inventory').after(saveStatus);
$('roll').onclick = () => {
  if ($('roll').disabled || rolling) return;
  // Resolve and persist atomically before the cosmetic animation. Reload cannot reroll a paid action.
  state = transition(state, { type: 'roll', dice: rollDice() });
  if (!save(storage, state)) saveStatus.textContent = 'Ukládání není dostupné. Hra pokračuje pouze v této záložce.';
  rolling = true;
  for (const id of ['die1', 'die2']) { $(id).textContent = '?'; $(id).classList.add('rolling'); }
  // Render locks controls, then conceal the already committed result until the reveal.
  render(); $('reveal').classList.remove('show'); $('sum').textContent = 'Kostky se kutálejí…';
  $('die1').textContent = '?'; $('die2').textContent = '?';
  timer = setTimeout(() => { rolling = false; for (const id of ['die1', 'die2']) $(id).classList.remove('rolling'); render(); }, 900);
};
$('next').onclick = () => dispatch({ type: 'next' });
$('endRound').onclick = () => dispatch({ type: 'endRound' });
$('reset').onclick = () => {
  if (!confirm('Opravdu začít novou hru?')) return;
  clearTimeout(timer); rolling = false;
  for (const id of ['die1', 'die2']) $(id).classList.remove('rolling');
  state = newState(); saveStatus.textContent = ''; dispatch({ type: 'reset' });
};
render();
