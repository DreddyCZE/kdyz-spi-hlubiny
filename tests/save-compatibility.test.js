import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectSaves,saveFormats,protectedSaveStorage} from '../src/engine/save-compatibility.js';
import {newState,transition} from '../src/engine/game.js';
import {load,save} from '../src/engine/storage.js';
import {newBlackwaterGame,blackwaterTransition} from '../src/engine/blackwater.js';
import {validBlackwaterSave,saveBlackwater,loadBlackwater} from '../src/engine/blackwater-storage.js';
import {activeScenarioPack as pack} from '../src/data/scenario-registry.js';
import {newScenarioSession} from '../src/engine/scenario-session.js';
import {saveScenarioSession} from '../src/engine/scenario-storage.js';
const keys=saveFormats.slice(0,3).map(f=>f.key);
const values=[newState(),newBlackwaterGame(),newScenarioSession(pack.scenario,pack.content)];
function store(){const map=new Map();return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};}
for(const selected of [[],[0],[1],[2],[0,1,2]])test('save detection is read-only: '+JSON.stringify(selected),()=>{
 const db=store();for(const i of selected)db.setItem(keys[i],JSON.stringify(values[i]));const before=[...db.map];
 assert.deepEqual(inspectSaves(db).slice(0,3).map(s=>s.status),keys.map((_,i)=>selected.includes(i)?'valid':'absent'));assert.deepEqual([...db.map],before);
 const protectedScenario=protectedSaveStorage(db,keys[2]);assert.ok(saveScenarioSession(protectedScenario,values[2],pack.scenario,pack.content));
 for(const i of [0,1])assert.equal(db.getItem(keys[i]),selected.includes(i)?JSON.stringify(values[i]):null);
});
for(const bad of ['{broken','null','{}','',JSON.stringify(values[0])])test('unknown scenario data are never overwritten: '+bad.slice(0,20),()=>{
 const db=store();db.setItem(keys[2],bad);assert.equal(inspectSaves(db)[2].status,'invalid');
 assert.equal(saveScenarioSession(protectedSaveStorage(db,keys[2]),values[2],pack.scenario,pack.content),false);assert.equal(db.getItem(keys[2]),bad);
});
test('legacy continuation writes only its own key and preserves other formats',()=>{
 const db=store();values.forEach((s,i)=>db.setItem(keys[i],JSON.stringify(s)));const guarded=protectedSaveStorage(db,keys[0]);
 const next=transition(load(guarded),{type:'endRound'});assert.equal(next.round,2);assert.equal(next.ritual,2);assert.ok(save(guarded,next));
 assert.deepEqual(load(guarded),next);for(const i of [1,2])assert.equal(db.getItem(keys[i]),JSON.stringify(values[i]));
});
test('a different tab introducing corrupt data is protected at write time',()=>{
 const db=store(),guarded=protectedSaveStorage(db,keys[0]);db.setItem(keys[0],'invalid');assert.equal(save(guarded,newState()),false);assert.throws(()=>guarded.removeItem(keys[0]));assert.equal(db.getItem(keys[0]),'invalid');assert.throws(()=>guarded.setItem(keys[2],'{}'));
});
test('unavailable storage fails safely',()=>{
 const db={getItem(){throw Error('denied');}};assert.ok(inspectSaves(db).every(s=>s.status==='unavailable'));assert.equal(save(protectedSaveStorage(db,keys[0]),newState()),false);
});
test('illustrated saves retain every investigator, ability, myth and combat progression',()=>{
 for(const id of ['detective','occultist','sailor']){
  let s=blackwaterTransition(newBlackwaterGame(),{type:'selectInvestigator',investigatorId:id,revision:0});
  const db=store();for(let i=0;i<3;i++){
   assert.equal(validBlackwaterSave(s),true);assert.ok(saveBlackwater(protectedSaveStorage(db,keys[1]),s));assert.deepEqual(loadBlackwater(db),s);
   s=blackwaterTransition(s,{type:'endRound',revision:s.revision});
  }
 }
 for(const patch of [{game:{}},{myth:{enemies:[null]}},{combat:{enemyId:'missing'}}])assert.equal(validBlackwaterSave({...values[1],...patch}),false);
});

for(const version of [2,3])test('existing legacy v'+version+' migration preserves its original key',()=>{
 const db=store(),old={...newState(),version};delete old.drawnCards;
 if(version===2)for(const key of ['knowledge','deductions','unlockedCards','unlockedChoices'])delete old[key];
 const key='hlubiny-v'+version,raw=JSON.stringify(old);db.setItem(key,raw);
 assert.equal(inspectSaves(db).find(s=>s.key===key).status,'valid');
 const guarded=protectedSaveStorage(db,keys[0]),loaded=load(guarded);assert.equal(loaded.version,4);assert.ok(save(guarded,loaded));assert.equal(db.getItem(key),raw);
});

test('detection honors the original loader size limit before authorizing a write',()=>{
 const db=store(),large={...newState(),log:Array.from({length:60},()=> 'x'.repeat(1900))},raw=JSON.stringify(large);assert.ok(raw.length>100000&&raw.length<150000);
 db.setItem(keys[0],raw);assert.equal(inspectSaves(db)[0].status,'invalid');assert.equal(save(protectedSaveStorage(db,keys[0]),newState()),false);assert.equal(db.getItem(keys[0]),raw);
});

test('resuming legacy v4 does not introduce scenario knowledge or deductions',async()=>{
 const {legacyContent}=await import('../src/engine/content.js');
 assert.deepEqual(legacyContent.refs.knowledge,['blackwater-lighthouse-connection']);assert.deepEqual(legacyContent.investigation.deductions.map(d=>d.id),['blackwater-follow-the-route']);assert.deepEqual(legacyContent.refs.flags,['harbor-note-read']);
});
