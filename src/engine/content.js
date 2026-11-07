import { cards as migrated } from '../data/cards.js';
import { exampleCard } from '../data/example-card.js';
import { locations } from '../data/locations.js';
import { rewards, flags } from '../data/catalog.js';
import { assertCards } from './schema.js';
export const catalog = {items:rewards.filter(r=>r.kind==='item').map(r=>r.id),evidence:[...rewards.filter(r=>r.kind==='evidence').map(r=>r.id),'harbor-note-copy'],locations:locations.map(l=>l.id),flags};
// Composite items can provide existing evidence without rewriting historical saves.
for(const [i,reward] of rewards.entries()){
  if(reward.evidenceIds!==undefined&&(reward.kind!=='item'||!Array.isArray(reward.evidenceIds)||new Set(reward.evidenceIds).size!==reward.evidenceIds.length||!reward.evidenceIds.every(id=>catalog.evidence.includes(id)))){
    throw new Error(`rewards[${i}].evidenceIds: očekáváno pole unikátních existujících ID důkazů u předmětu`);
  }
}
export const itemEvidence=Object.freeze(Object.fromEntries(rewards.filter(r=>r.kind==='item').map(r=>[r.id,Object.freeze([...(r.evidenceIds||[])])])));
export const rewardNames=Object.fromEntries([...rewards,{id:'harbor-note-copy',name:'Opis poznámky'}].map(r=>[r.id,r.name]));
const freeze=x=>{Object.freeze(x);for(const v of Object.values(x))if(v&&typeof v==='object'&&!Object.isFrozen(v))freeze(v);return x;};
export function createContent(cards){assertCards(cards,catalog);const definitions=freeze(structuredClone(cards));return Object.freeze({cards:definitions,byId:Object.freeze(Object.fromEntries(definitions.map(c=>[c.id,c])))});}
export const content=createContent([...migrated,exampleCard]);
