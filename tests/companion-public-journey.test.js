import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterContent as data} from '../src/engine/content.js';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {newScenarioSession,scenarioSessionTransition as transition,scenarioSessionView} from '../src/engine/scenario-session.js';
import {currentCard,visibleResult} from '../src/engine/game.js';
import {validScenarioSession,saveScenarioSession,loadScenarioSession} from '../src/engine/scenario-storage.js';

// Every journey below starts fresh and uses public actions, including all intervening cards.
function journey(selectIntervening){
 let s=newScenarioSession(def,data),ap=0;
 const trace=[];
 const act=a=>{const before=s;s=transition(s,{...a,revision:s.game.revision},def,data);assert.notStrictEqual(s,before,JSON.stringify(a));ap+=Math.max(0,before.game.ap-s.game.ap);trace.push({action:a.type,card:a.cardId,round:s.game.round,ap:s.game.ap});assert.ok(validScenarioSession(s,def,data));return s;};
 const afford=n=>{if(s.game.ap<n)act({type:'endRound'});assert.ok(s.game.round<=12);};
 const resolve=(choice,dice=[6,6])=>{
  afford(choice.apCost);const c=currentCard(s.game,data);assert.equal(visibleResult(s.game,data),null);
  assert.ok(!JSON.stringify(c).includes('outcomes'));
  if(choice.test){act({type:'choose',choiceId:choice.id});act({type:'startTest',cardId:c.id,choiceId:choice.id,dice});assert.equal(visibleResult(s.game,data),null);act({type:'acceptTest'});}
  else act({type:'resolve',cardId:c.id,choiceId:choice.id});
  assert.equal(visibleResult(s.game,data).choiceId,choice.id);act({type:'next'});
 };
 const seek=id=>{for(let i=0;i<40;i++){if(!currentCard(s.game,data))act({type:'draw'});const c=currentCard(s.game,data);if(c.id===id)return c;resolve(selectIntervening?.(c)||[...c.choices].sort((a,b)=>a.apCost-b.apCost)[0]);}assert.fail('unreachable '+id);};
 return {act,resolve,seek,move:id=>{afford(1);act({type:'move',locationId:id});},get s(){return s;},set s(v){s=v;},get ap(){return ap;},trace};
}
for(const dog of [true,false])test(`public journey ${dog?'with dog and reload':'without companion'} reaches cave within twelve rounds`,t=>{
 const j=journey();
 if(dog){
  j.move('location-1');j.act({type:'recruitCompanion',companionId:'blackwater-dog'});j.act({type:'useCompanionAbility',abilityId:'scent',trigger:'exploration'});
  j.resolve(j.seek('bw-dog-trail').choices.find(c=>c.id==='bw-dog-trail-mark'));
  const map=new Map(),db={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
  assert.ok(saveScenarioSession(db,j.s,def,data));const before=j.s;j.s=loadScenarioSession(db,def,data);assert.deepEqual(j.s,before);
  assert.equal(j.s.scenario.companion.activeId,'blackwater-dog');assert.equal(j.s.scenario.companion.usedRoundByAbility.scent,1);
 }
 j.move('location-5');
 const id=dog?'bw-lighthouse-dog-trail':'bw-lighthouse-salt';j.resolve(j.seek(id).choices[0]);assert.equal(j.s.game.flags['salt-route-known'],true);
 j.move('location-6');j.resolve(j.seek('bw-cave-service-route').choices.find(c=>c.id==='bw-cave-route-known'));
 assert.equal(j.s.game.flags['cave-service-route-used'],true);assert.ok(j.s.game.round<=12);assert.equal(j.s.game.ended,false);
 t.diagnostic(JSON.stringify({ap:j.ap,round:j.s.game.round,remainingBudget:36-j.ap}));
});
test('failed lighthouse and cave tests do not unlock route or block further investigation',()=>{
 const j=journey();j.move('location-5');j.resolve(j.seek('bw-lighthouse-salt').choices[0],[1,1]);assert.equal(j.s.game.flags['salt-route-known'],undefined);
 j.move('location-6');const c=j.seek('bw-cave-service-route');assert.deepEqual(c.choices.map(o=>o.id),['bw-cave-route-ordinary']);
 const before=j.s;assert.strictEqual(transition(before,{type:'resolve',revision:before.game.revision,cardId:c.id,choiceId:'bw-cave-route-known'},def,data),before);
 j.resolve(c.choices[0],[1,1]);assert.equal(j.s.game.flags['cave-service-route-used'],undefined);assert.equal(j.s.game.ended,false);
 j.move('location-2');j.act({type:'draw'});assert.ok(currentCard(j.s.game,data));assert.equal(j.s.game.ended,false);assert.equal(j.s.scenario.endingId,null);
});
test('ordinary cave path succeeds without dog or service knowledge',()=>{
 const j=journey();j.move('location-6');j.resolve(j.seek('bw-cave-service-route').choices.find(c=>c.id==='bw-cave-route-ordinary'));
 assert.equal(j.s.game.flags['cave-service-route-used'],true);assert.equal(j.s.game.flags['salt-route-known'],undefined);assert.equal(j.s.scenario.companion.activeId,null);
});
test('save injection cannot expose or resolve a locked card',()=>{
 // Deliberately corrupted fixture, not a gameplay walkthrough.
 const s=newScenarioSession(def,data);s.game.locationId='location-1';s.game.drawnCards['location-1']='bw-dog-trail';
 assert.equal(currentCard(s.game,data),null);assert.equal(validScenarioSession(s,def,data),false);
 assert.strictEqual(transition(s,{type:'resolve',revision:0,cardId:'bw-dog-trail',choiceId:'bw-dog-trail-mark'},def,data),s);
 const db={getItem:()=>JSON.stringify(s)};assert.deepEqual(loadScenarioSession(db,def,data),newScenarioSession(def,data));
 const cave=newScenarioSession(def,data);cave.game.locationId='location-6';cave.game.drawnCards['location-6']='bw-cave-service-route';cave.game.choiceId='bw-cave-route-known';
 assert.ok(validScenarioSession(cave,def,data)); // Stored selection is harmless; authorization is checked again.
 const loaded=loadScenarioSession({getItem:()=>JSON.stringify(cave)},def,data);
 assert.equal(currentCard(loaded.game,data).choices.some(o=>o.id==='bw-cave-route-known'),false);
 assert.strictEqual(transition(loaded,{type:'resolve',revision:0,cardId:'bw-cave-service-route',choiceId:'bw-cave-route-known'},def,data),loaded);
});

test('nested flag gates honor all, any and not without exposing hidden outcomes',()=>{
 const base=data.byId['bw-cave-service-route'];
 for(const [condition,flags,visible] of [
  [{type:'all',conditions:[{type:'flagEquals',id:'salt-route-known',value:true},{type:'minRound',round:2}]},{'salt-route-known':true},false],
  [{type:'any',conditions:[{type:'flagEquals',id:'salt-route-known',value:true},{type:'flagEquals',id:'dog-trail-recorded',value:true}]},{},false],
  [{type:'any',conditions:[{type:'flagEquals',id:'salt-route-known',value:true},{type:'flagEquals',id:'dog-trail-recorded',value:true}]},{'dog-trail-recorded':true},true],
  [{type:'not',condition:{type:'flagEquals',id:'salt-route-known',value:true}},{'salt-route-known':true},false],
  [{type:'not',condition:{type:'flagEquals',id:'salt-route-known',value:true}},{},true]
 ]){
  // Isolated condition fixture, not a gameplay walkthrough.
  const c={...base,choices:[{...base.choices[0],conditions:[condition]},base.choices[1]]};
  const custom={...data,byId:{...data.byId,[c.id]:c}};
  const s=newScenarioSession(def,custom);s.game.locationId=c.locationId;s.game.drawnCards[c.locationId]=c.id;s.game.flags=flags;
  const view=currentCard(s.game,custom);assert.equal(view.choices.some(o=>o.id==='bw-cave-route-known'),visible);
  assert.ok(!JSON.stringify(view).includes('effects'));assert.equal(visibleResult(s.game,custom),null);
  if(!visible)assert.strictEqual(transition(s,{type:'resolve',revision:0,cardId:c.id,choiceId:'bw-cave-route-known'},def,custom),s);
 }
});

test('optional dog detour still permits a real non-defeat ending inside the AP budget',t=>{
 const j=journey(c=>c.id==='bw-05-01'?c.choices.find(o=>o.id==='bw-05-01-alternate'):null);j.move('location-1');j.act({type:'recruitCompanion',companionId:'blackwater-dog'});j.act({type:'useCompanionAbility',abilityId:'scent',trigger:'exploration'});j.resolve(j.seek('bw-dog-trail').choices[0]);
 j.move('location-5');j.resolve(j.seek('bw-lighthouse-dog-trail').choices[0]);j.move('location-6');j.resolve(j.seek('bw-cave-service-route').choices[0]);
 for(const location of ['location-2','location-3','location-4']){
  j.move(location);j.act({type:'draw'});j.resolve(currentCard(j.s.game,data).choices[0]);
  if(location==='location-2')j.resolve(j.seek('bw-02-01').choices.find(o=>o.id==='bw-02-01-alternate'));
 }
 j.move('location-6');const endings=scenarioSessionView(j.s,def,data).availableEndings;
 assert.ok(endings.length>0,JSON.stringify({knowledge:j.s.game.knowledge,evidence:j.s.game.evidence,flags:j.s.game.flags,round:j.s.game.round}));
 j.act({type:'finishScenario',endingId:endings[0].id});assert.notEqual(j.s.scenario.endingId,'deep-answers');
 t.diagnostic(JSON.stringify({ending:j.s.scenario.endingId,round:j.s.game.round,ap:j.ap}));
});
