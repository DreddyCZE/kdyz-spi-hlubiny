import test from 'node:test';
import assert from 'node:assert/strict';
import {createCompanion,validateCompanion,initialCompanionState,companionAvailable,recruitCompanion,dismissCompanion,companionView,useCompanionAbility} from '../src/engine/companion.js';
const dog={id:'dog',name:'Toulavý pes',kind:'animal',availability:{locationId:'location-1',evidenceId:'reward-10'},abilities:[{id:'scent',name:'Stopování',type:'active',trigger:'exploration',uses:'oncePerRound',text:'Pes zachytí neobvyklý pach.'},{id:'warning',name:'Varování',type:'passive',trigger:'danger',uses:'passive',text:'Pes zpozorní.'}]};
test('companion schema validates limits and clones definitions',()=>{
 assert.deepEqual(validateCompanion(dog),[]);
 const copy=createCompanion(dog);copy.name='Změna';assert.equal(dog.name,'Toulavý pes');
 assert.ok(validateCompanion({...dog,abilities:[...dog.abilities,dog.abilities[0]]}).length);
 assert.ok(validateCompanion({...dog,abilities:[{...dog.abilities[0],uses:'unlimited'}]}).length);
});
test('recruitment requires conditions and only one active companion',()=>{
 const s=initialCompanionState();
 assert.equal(companionAvailable(dog,{locationId:'location-1',evidence:[]}),false);
 assert.equal(recruitCompanion(dog,s,{locationId:'location-1',evidence:[]}),null);
 const active=recruitCompanion(dog,s,{locationId:'location-1',evidence:['reward-10']});
 assert.equal(active.activeId,'dog');
 assert.equal(recruitCompanion(dog,active,{locationId:'location-1',evidence:['reward-10']}),null);
 assert.equal(dismissCompanion(active).activeId,null);
 assert.equal(dismissCompanion(s),null);
});
test('active abilities can be used once per round, passive ability has no action',()=>{
 const active=recruitCompanion(dog,initialCompanionState(),{locationId:'location-1',evidence:['reward-10']});
 assert.equal(companionView(dog,active,1).abilities[0].text,null);
 assert.equal(useCompanionAbility(dog,active,'scent','danger',1),null);
 assert.equal(useCompanionAbility(dog,active,'warning','danger',1),null);
 const used=useCompanionAbility(dog,active,'scent','exploration',1);
 assert.equal(useCompanionAbility(dog,used,'scent','exploration',1),null);
 assert.equal(companionView(dog,used,1).abilities[0].available,false);
 assert.equal(companionView(dog,used,1).abilities[0].text,dog.abilities[0].text);
 assert.equal(companionView(dog,used,2).abilities[0].available,true);
 assert.ok(useCompanionAbility(dog,used,'scent','exploration',2));
 assert.equal(companionView(dog,used,1).abilities[1].available,true);
 assert.equal(companionView(dog,initialCompanionState(),1),null);
 assert.deepEqual(active.usedRoundByAbility,{});
});
