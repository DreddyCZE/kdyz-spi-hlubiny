import { cards as migrated } from '../data/cards.js';
import { exampleCard } from '../data/example-card.js';
import { blackwaterM4Cards } from '../data/blackwater-m4.js';
import { additionalBlackwaterCards } from '../data/blackwater-extra.js';
import { explorationDecks } from '../data/decks.js';
import { locations } from '../data/locations.js';
import { rewards, flags } from '../data/catalog.js';
import { assertCards } from './schema.js';
import { investigationDefinitions } from '../data/investigation.js';
import { blackwaterPuzzles } from '../data/blackwater-puzzles.js';
import { createInvestigation } from './investigation.js';
export const catalog = {items:rewards.filter(r=>r.kind==='item').map(r=>r.id),evidence:investigationDefinitions.evidence.map(e=>e.id),knowledge:investigationDefinitions.knowledge.map(k=>k.id),deductions:investigationDefinitions.deductions.map(d=>d.id),locations:locations.map(l=>l.id),flags};
// Composite items can provide existing evidence without rewriting historical saves.
for(const [i,reward] of rewards.entries()){
  if(reward.evidenceIds!==undefined&&(reward.kind!=='item'||!Array.isArray(reward.evidenceIds)||new Set(reward.evidenceIds).size!==reward.evidenceIds.length||!reward.evidenceIds.every(id=>catalog.evidence.includes(id)))){
    throw new Error(`rewards[${i}].evidenceIds: očekáváno pole unikátních existujících ID důkazů u předmětu`);
  }
}
export const itemEvidence=Object.freeze(Object.fromEntries(rewards.filter(r=>r.kind==='item').map(r=>[r.id,Object.freeze([...(r.evidenceIds||[])])])));
export const rewardNames=Object.fromEntries([...rewards,{id:'harbor-note-copy',name:'Opis poznámky'}].map(r=>[r.id,r.name]));
const freeze=x=>{Object.freeze(x);for(const v of Object.values(x))if(v&&typeof v==='object'&&!Object.isFrozen(v))freeze(v);return x;};
export function createContent(cards, investigation = investigationDefinitions, overrides = {}){
  const {itemEvidence:composites=itemEvidence,locationMetadata=Object.hasOwn(overrides,'locations')?[]:locations,...externalRefs}=overrides;
  const refs={...catalog,...externalRefs,evidence:investigation.evidence?.map(e=>e.id)||[],knowledge:investigation.knowledge?.map(k=>k.id)||[],deductions:investigation.deductions?.map(d=>d.id)||[],cards:cards.map(c=>c.id),choices:cards.flatMap(c=>c.choices.map(o=>o.id))};
  const model=createInvestigation(investigation,refs,composites);
  assertCards(cards,refs);
  if(!Array.isArray(locationMetadata))throw new Error('locationMetadata: očekáváno pole lokací');
  const locationsById=Object.fromEntries(refs.locations.map(id=>[id,{id,name:id}])),seen=new Set();
  locationMetadata.forEach((location,i)=>{
    if(!location||!refs.locations.includes(location.id)||seen.has(location.id)||typeof location.name!=='string'||!location.name.trim())throw new Error(`locationMetadata[${i}]: očekáváno unikátní existující ID lokace a neprázdný název`);
    seen.add(location.id);locationsById[location.id]={id:location.id,name:location.name};
  });
  const decksByLocation=Object.fromEntries(refs.locations.map(id=>[id,{locationId:id,name:locationsById[id].name+' · balíček',description:'Příběhy, setkání a stopy této lokace.'}]));
  for(const meta of Object.hasOwn(overrides,'locations')?[]:explorationDecks)if(decksByLocation[meta.locationId])decksByLocation[meta.locationId]={...meta};
  const definitions=freeze(structuredClone(cards));
  return Object.freeze({decksByLocation:freeze(decksByLocation),cards:definitions,byId:Object.freeze(Object.fromEntries(definitions.map(c=>[c.id,c]))),investigation:model,refs:freeze(structuredClone(refs)),locationsById:freeze(locationsById)});
}
export const content=createContent([...migrated,exampleCard]);
// Opt-in Blackwater content; legacy default decks must remain unchanged.
export const blackwaterContent=Object.freeze({...createContent([...migrated,exampleCard,...blackwaterM4Cards,...additionalBlackwaterCards]),puzzles:blackwaterPuzzles});
