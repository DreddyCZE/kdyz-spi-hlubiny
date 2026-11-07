import { newState, evaluate, attributes, isEnded, currentCard, deck } from './game.js';
import { content, catalog } from './content.js';
import { rewards } from '../data/catalog.js';
import { isRecord } from './schema.js';
export const SAVE_KEY='hlubiny-v2';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const uniqueIDs=(a,allowed)=>Array.isArray(a)&&a.length<=allowed.length&&new Set(a).size===a.length&&a.every(id=>allowed.includes(id));
export function validState(s){
  if(!isRecord(s)||s.version!==2||Object.keys(s).sort().join()!==Object.keys(newState()).sort().join())return false;
  if(!Number.isSafeInteger(s.revision)||s.revision<0||!catalog.locations.includes(s.locationId))return false;
  for(const [k,max] of Object.entries({round:7,ap:3,hp:6,san:8,threat:10,ritual:8}))if(!Number.isInteger(s[k])||s[k]<(k==='round'?1:0)||s[k]>max)return false;
  if(typeof s.ended!=='boolean'||s.ended!==isEnded(s))return false;
  if(!uniqueIDs(s.inventory,catalog.items)||!uniqueIDs(s.evidence,catalog.evidence)||!uniqueIDs(s.unlockedLocations,catalog.locations)||!s.unlockedLocations.includes(s.locationId))return false;
  if(!isRecord(s.flags)||!Object.entries(s.flags).every(([id,v])=>catalog.flags.includes(id)&&(typeof v==='boolean'||typeof v==='string'&&v.length<1000||Number.isFinite(v))))return false;
  if(!Array.isArray(s.log)||s.log.length>100||!s.log.every(t=>typeof t==='string'&&t.length<2000))return false;
  if(!isRecord(s.cursors)||!Object.entries(s.cursors).every(([id,n])=>catalog.locations.includes(id)&&Number.isInteger(n)&&n>=0&&n<=deck({...s,locationId:id}).length))return false;
  if(!isRecord(s.resolved))return false;
  for(const [id,r] of Object.entries(s.resolved)){
    const c=Object.hasOwn(content.byId,id)?content.byId[id]:null;
    if(!c||!isRecord(r)||Object.keys(r).sort().join()!=='cardId,choiceId,dice,key,revision,total'||r.cardId!==id||!Number.isSafeInteger(r.revision)||r.revision<1||r.revision>s.revision)return false;
    const o=c.choices.find(o=>o.id===r.choiceId);if(!o)return false;
    if(o.test){
      if(!Array.isArray(r.dice)||r.dice.length!==2)return false;
      try{const expected=evaluate(...r.dice,attributes[o.test.attribute]+(o.test.modifier||0),o.test.difficulty);if(r.key!==expected.key||r.total!==expected.total)return false;}catch{return false;}
    }else if(r.key!=='success'||r.dice!==null||r.total!==null)return false;
  }
  const card=currentCard(s);
  if(s.choiceId!==null&&!card?.choices.some(o=>o.id===s.choiceId))return false;
  return s.result===null||Boolean(card&&same(s.result,s.resolved[card.id]));
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
  const c=currentCard(s);if(old.choice<0||old.choice>1)return null;
  s.choiceId=c?.choices[old.choice]?.id||null;
  if(old.result!==null){if(!c||!same(old.result,old.resolved[c.id]))return null;s.result=s.resolved[c.id];}
  return validState(s)?s:null;
}
export function load(storage){
  try{
    const raw=storage.getItem(SAVE_KEY);
    if(raw!==null){if(raw.length>100000)return newState();const s=JSON.parse(raw);return validState(s)?s:newState();}
    const legacy=storage.getItem('hlubiny-v1');
    return legacy&&legacy.length<=100000?migrateV1(JSON.parse(legacy))||newState():newState();
  }catch{return newState();}
}
export function save(storage,s){try{if(!validState(s))return false;storage.setItem(SAVE_KEY,JSON.stringify(s));return true;}catch{return false;}}
