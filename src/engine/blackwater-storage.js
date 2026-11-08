// Scenario-specific local save. Never reuse or migrate legacy v4 save keys.
import {blackwaterContent} from './blackwater.js';
import {validState} from './storage.js';
import {blackwaterItems} from '../data/blackwater-items.js';
import {investigatorById} from '../data/blackwater-investigators.js';
import {enemies} from './combat.js';
import {mythEvents} from './myth.js';
export const BLACKWATER_SAVE_KEY='ksh-blackwater-v1';
const KEY=BLACKWATER_SAVE_KEY;
const integer=(n,max,min=0)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
export function validBlackwaterSave(value){
 try{
  if(!value||value.scenario!=='blackwater'||value.version!==1||!integer(value.revision,Number.MAX_SAFE_INTEGER))return false;
  const g=value.game,m=value.myth,hero=investigatorById[value.investigatorId];
  if(value.investigatorId!==undefined&&!Object.hasOwn(investigatorById,value.investigatorId)||value.abilityUsed!==undefined&&typeof value.abilityUsed!=='boolean')return false;
  if(!g||!integer(g.hp,hero?.hp||6)||!integer(g.san,hero?.san||8)||!integer(g.ap,4))return false;
  const data={...blackwaterContent,refs:{...blackwaterContent.refs,items:[...blackwaterContent.refs.items,...blackwaterItems.map(i=>i.id)]}};
  if(!validState({...g,hp:Math.min(g.hp,6),san:Math.min(g.san,8),ap:Math.min(g.ap,3)},data))return false;
  if(!m||!integer(m.cursor,7)||!integer(m.round,8,1)||!integer(m.threat,10)||!integer(m.ritual,8)||!Array.isArray(m.history)||m.history.length!==m.cursor||m.history.some(id=>!mythEvents.some(e=>e.id===id)))return false;
  if(!Array.isArray(m.enemies)||m.enemies.length>28||m.enemies.some(e=>!e||!enemies.some(d=>d.id===e.enemyId)||!data.refs.locations.includes(e.locationId)))return false;
  if(value.combat!==null){
   const c=value.combat,enemy=enemies.find(e=>e.id===c?.enemyId);
   if(!enemy||!integer(c.enemyHp,enemy.hp)||!integer(c.exchange,3)||!['active','escaped','defeated','banished'].includes(c.status))return false;
   if(c.dice!==undefined&&(!Array.isArray(c.dice)||c.dice.length!==2||c.dice.some(n=>!integer(n,6,1))))return false;
  }
  return true;
 }catch{return false;}
}
export function saveBlackwater(storage,state){
 try{if(!storage||!validBlackwaterSave(state))return false;storage.setItem(KEY,JSON.stringify(state));return true;}catch{return false;}
}
export function loadBlackwater(storage){
 try{
  if(!storage)return null;
  const raw=storage.getItem(KEY);if(!raw||raw.length>150000)return null;
  const value=JSON.parse(raw);
  if(!validBlackwaterSave(value))return null;
  return value;
 }catch{return null;}
}
export function clearBlackwater(storage){try{storage?.removeItem(KEY);return true;}catch{return false;}}
