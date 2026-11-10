import { newState, evaluate, attributes, isEnded, currentCard, deck, meetsConditions } from './game.js';
import { content } from './content.js';
import { rewards } from '../data/catalog.js';
import { isRecord } from './schema.js';
import { rememberEvidence } from './investigation.js';
export const SAVE_KEY='hlubiny-v4';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const uniqueIDs=(a,allowed)=>Array.isArray(a)&&a.length<=allowed.length&&new Set(a).size===a.length&&a.every(id=>allowed.includes(id));
export function validState(s,data=content,rules={}){
  const catalog=data.refs;
  if(!isRecord(s)||s.version!==4||Object.keys(s).sort().join()!==Object.keys(newState(data)).sort().join())return false;
  if(!Number.isSafeInteger(s.revision)||s.revision<0||!catalog.locations.includes(s.locationId))return false;
  for(const [k,max] of Object.entries({round:7,ap:3,hp:6,san:8,threat:10,ritual:8}))if(!Number.isInteger(s[k])||s[k]<(k==='round'?1:0)||s[k]>max)return false;
  if(typeof s.ended!=='boolean'||s.ended!==isEnded(s))return false;
  if(!uniqueIDs(s.inventory,catalog.items)||!uniqueIDs(s.evidence,catalog.evidence)||!uniqueIDs(s.unlockedLocations,catalog.locations)||!s.unlockedLocations.includes(s.locationId))return false;
  if(!uniqueIDs(s.knowledge,catalog.knowledge)||!uniqueIDs(s.unlockedCards,data.refs.cards)||!uniqueIDs(s.unlockedChoices,data.refs.choices))return false;
  if(!isRecord(s.deductions)||!Object.entries(s.deductions).every(([id,count])=>{
    const d=data.investigation.deductions.find(d=>d.id===id);
    const grants={addKnowledge:'knowledge',unlockCard:'unlockedCards',unlockChoice:'unlockedChoices',unlockLocation:'unlockedLocations'};
    return d&&Number.isSafeInteger(count)&&count>=1&&count<=s.revision&&(d.repeatable||count===1)&&d.effects.every(e=>!grants[e.type]||s[grants[e.type]].includes(e.id));
  }))return false;
  // A composite's information is durable in v3, not inferred only while carried.
  if(s.inventory.some(id=>(data.investigation.itemEvidence[id]||[]).some(e=>!s.evidence.includes(e))))return false;
  if(!isRecord(s.flags)||!Object.entries(s.flags).every(([id,v])=>catalog.flags.includes(id)&&(typeof v==='boolean'||typeof v==='string'&&v.length<1000||Number.isFinite(v))))return false;
  if(!Array.isArray(s.log)||s.log.length>100||!s.log.every(t=>typeof t==='string'&&t.length<2000))return false;
  if(!isRecord(s.cursors)||!Object.entries(s.cursors).every(([id,n])=>catalog.locations.includes(id)&&Number.isInteger(n)&&n>=0&&n<=deck({...s,locationId:id},data).length))return false;
  if(!isRecord(s.drawnCards)||!Object.entries(s.drawnCards).every(([locationId,id])=>catalog.locations.includes(locationId)&&Object.hasOwn(data.byId,id)&&data.byId[id].locationId===locationId))return false;
  // Unresolved cards cannot be injected through a save before their gates open.
  // Completed cards stay pinned even when their effects change those gates.
  if(Object.values(s.drawnCards).some(id=>!Object.hasOwn(s.resolved||{},id)&&!meetsConditions(s,data.byId[id].conditions,data)))return false;
  if(!isRecord(s.resolved))return false;
  for(const [id,r] of Object.entries(s.resolved)){
    const c=Object.hasOwn(data.byId,id)?data.byId[id]:null;
    if(!c||!isRecord(r)||Object.keys(r).filter(k=>k!=='testBonus').sort().join()!=='cardId,choiceId,dice,key,revision,total'||r.cardId!==id||!Number.isSafeInteger(r.revision)||r.revision<1||r.revision>s.revision)return false;
    const o=c.choices.find(o=>o.id===r.choiceId);if(!o)return false;
    if(o.test){
      if(r.testBonus!==undefined&&(!Number.isSafeInteger(r.testBonus)||r.testBonus!==1||rules.testBonuses?.[o.test.attribute]!==r.testBonus))return false;
      if(!Array.isArray(r.dice)||r.dice.length!==2)return false;
      try{const expected=evaluate(...r.dice,attributes[o.test.attribute]+(o.test.modifier||0)+(r.testBonus||0),o.test.difficulty);if(r.key!==expected.key||r.total!==expected.total)return false;}catch{return false;}
    }else if(r.testBonus!==undefined||r.key!=='success'||r.dice!==null||r.total!==null)return false;
  }
  const card=currentCard(s,data);
  if(s.choiceId!==null&&(!card||!data.byId[card.id].choices.some(o=>o.id===s.choiceId)))return false;
  return s.result===null?!Boolean(card&&s.resolved[card.id]):Boolean(card&&same(s.result,s.resolved[card.id]));
}
// M1 keys remain untouched. Validate all converted values before using a migrated state.
export function migrateV1(old){
  if(!isRecord(old)||old.version!==1||!Number.isInteger(old.place)||old.place<0||old.place>6||!isRecord(old.indices)||!isRecord(old.resolved)||!Array.isArray(old.inventory)||!Number.isInteger(old.choice))return null;
  const s=newState();
  for(const k of ['round','ap','hp','san','threat','ritual','ended','log'])s[k]=old[k];
  s.locationId=`location-${old.place}`;
  for(const [place,n] of Object.entries(old.indices)){
    if(!/^[0-6]$/.test(place)||!Number.isInteger(n)||n<0||n>content.cards.filter(c=>c.locationId===`location-${place}`&&c.id!=='harbor-note').length)return null;
    s.cursors[`location-${place}`]=n;
  }
  for(const name of old.inventory){const r=rewards.find(r=>r.name===name);if(!r)return null;const list=r.kind==='item'?s.inventory:s.evidence;if(!list.includes(r.id))list.push(r.id);}
  for(const [id,r] of Object.entries(old.resolved)){
    const c=Object.hasOwn(content.byId,id)?content.byId[id]:null;if(!c||!isRecord(r)||r.cardId!==id||!Number.isInteger(r.choice)||!c.choices[r.choice]||!Array.isArray(r.dice)||r.dice.length!==2)return null;
    const o=c.choices[r.choice];let evaluated;
    try{evaluated=evaluate(...r.dice,attributes[o.test.attribute],o.test.difficulty);}catch{return null;}
    const index={criticalSuccess:0,greatSuccess:0,success:1,partialSuccess:2,failure:3,criticalFailure:4}[evaluated.key];
    if(r.index!==index||r.total!==evaluated.total)return null;
    s.resolved[id]={...evaluated,cardId:id,choiceId:o.id,revision:++s.revision};
  }
  restoreLegacyDraws(s);const c=currentCard(s);if(old.choice<0||old.choice>1)return null;
  s.choiceId=c?.choices[old.choice]?.id||null;
  if(old.result!==null){if(!c||!same(old.result,old.resolved[c.id]))return null;s.result=s.resolved[c.id];}
  rememberEvidence(s,content.investigation.itemEvidence);
  return validState(s)?s:null;
}
export function migrateV2(old,data=content){
  const added=['drawnCards','knowledge','deductions','unlockedCards','unlockedChoices'];
  if(!isRecord(old)||old.version!==2||!Array.isArray(old.inventory)||!Array.isArray(old.evidence)||Object.keys(old).sort().join()!==Object.keys(newState(data)).filter(k=>!added.includes(k)).sort().join())return null;
  const s=rememberEvidence({...newState(data),...structuredClone(old),version:4},data.investigation.itemEvidence);
  restoreLegacyDraws(s,data);return validState(s,data)?s:null;
}
// Preserve cards already exposed by v1-v3, including results pinned after changed conditions.
function restoreLegacyDraws(s,data=content){
  for(const locationId of data.refs.locations){
    if(locationId!==s.locationId&&!Object.hasOwn(s.cursors,locationId)&&!data.cards.some(c=>c.locationId===locationId&&Object.hasOwn(s.resolved,c.id)))continue;
    const local={...s,locationId},cards=deck(local,data),cursor=s.cursors[locationId]||0;
    const pinned=locationId===s.locationId&&s.result&&data.byId[s.result.cardId];
    const c=pinned||cards.slice(0,cursor).find(c=>s.unlockedCards.includes(c.id)&&!Object.hasOwn(s.resolved,c.id)&&meetsConditions(local,c.conditions,data))
      ||cards.slice(cursor).find(c=>meetsConditions(local,c.conditions,data));
    if(c){s.drawnCards[locationId]=c.id;if(c.repeatable&&!pinned)delete s.resolved[c.id];}
  }
  const current=s.drawnCards[s.locationId];if(current&&s.resolved[current])s.result=s.resolved[current];
}
export function migrateV3(old,data=content){
  if(!isRecord(old)||old.version!==3||Object.keys(old).sort().join()!==Object.keys(newState(data)).filter(k=>k!=='drawnCards').sort().join())return null;
  const s={...structuredClone(old),version:4,drawnCards:{}};
  try{restoreLegacyDraws(s,data);return validState(s,data)?s:null;}catch{return null;}
}
export function load(storage,data=content){
  try{
    const raw=storage.getItem(SAVE_KEY);
    if(raw!==null){if(raw.length>100000)return newState(data);const s=JSON.parse(raw);return validState(s,data)?s:newState(data);}
    const v3=storage.getItem('hlubiny-v3');
    if(v3!==null)return v3.length<=100000?migrateV3(JSON.parse(v3),data)||newState(data):newState(data);
    const previous=storage.getItem('hlubiny-v2');
    if(previous!==null)return previous.length<=100000?migrateV2(JSON.parse(previous),data)||newState(data):newState(data);
    const legacy=storage.getItem('hlubiny-v1');
    const migrated=legacy&&legacy.length<=100000?migrateV1(JSON.parse(legacy)):null;
    return validState(migrated,data)?migrated:newState(data);
  }catch{return newState(data);}
}
export function save(storage,s,data=content){try{if(!validState(s,data))return false;storage.setItem(SAVE_KEY,JSON.stringify(s));return true;}catch{return false;}}
