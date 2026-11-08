// Save-format detection is read-only. Different engines are never migrated into each other.
import {legacyContent as content} from './content.js';
import {SAVE_KEY,validState,migrateV1,migrateV2,migrateV3} from './storage.js';
import {BLACKWATER_SAVE_KEY,validBlackwaterSave} from './blackwater-storage.js';
import {activeScenarioPack} from '../data/scenario-registry.js';
import {scenarioSaveKey,validScenarioSession} from './scenario-storage.js';
const pack=activeScenarioPack;
export const saveFormats=[
 {id:'legacy',key:SAVE_KEY,name:'Původní hra',href:'./index.html?mode=legacy',maxLength:100000,valid:s=>validState(s,content)},
 {id:'blackwater',key:BLACKWATER_SAVE_KEY,name:'Ilustrovaný Blackwater',href:'./blackwater.html',valid:validBlackwaterSave},
 {id:'scenario',key:scenarioSaveKey(pack.scenario),name:'Nový scénář',href:'./index.html',valid:s=>validScenarioSession(s,pack.scenario,pack.content)},
 ...[migrateV1,migrateV2,migrateV3].map((migrate,i)=>({id:'legacy-v'+(i+1),key:'hlubiny-v'+(i+1),name:'Původní hra v'+(i+1),href:'./index.html?mode=legacy',maxLength:100000,valid:s=>Boolean(migrate(s))}))
];
export function inspectSave(storage,format){
 try{
  if(!storage)return {...format,status:'unavailable'};
  const raw=storage.getItem(format.key);
  if(raw===null)return {...format,status:'absent'};
  if(typeof raw!=='string'||raw.length>(format.maxLength||150000))return {...format,status:'invalid'};
  let valid=false;try{valid=format.valid(JSON.parse(raw));}catch{/* Unknown or corrupt data stay untouched. */}
  return {...format,status:valid?'valid':'invalid'};
 }catch{return {...format,status:'unavailable'};}
}
export const inspectSaves=storage=>saveFormats.map(format=>inspectSave(storage,format));
// Recheck before every write, including after another tab changes the save.
export function protectedSaveStorage(storage,key){
 const format=saveFormats.find(f=>f.key===key);
 const writable=()=>{if(!format||!['absent','valid'].includes(inspectSave(storage,format).status))throw new Error('Původní uložená data jsou chráněna před přepsáním.');};
 return {
  getItem:k=>storage?.getItem(k)??null,
  setItem(k,value){
   if(k!==key||!format||typeof value!=='string'||value.length>(format.maxLength||150000)||!format.valid(JSON.parse(value)))throw new Error('Wrong or invalid save format');
   writable();storage.setItem(k,value);
  },
  removeItem(k){if(k!==key)throw new Error('Wrong save namespace');writable();storage.removeItem(k);}
 };
}
