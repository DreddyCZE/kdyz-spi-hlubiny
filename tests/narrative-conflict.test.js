import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterContent as data,content} from '../src/engine/content.js';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {blackwaterConflictCards} from '../src/data/blackwater-conflicts.js';
import {newScenarioSession,scenarioSessionTransition as transition} from '../src/engine/scenario-session.js';
import {currentCard,visibleResult} from '../src/engine/game.js';
import {saveScenarioSession,loadScenarioSession,validScenarioSession} from '../src/engine/scenario-storage.js';

const card=blackwaterConflictCards[0];
for(const choice of card.choices)for(const dice of [[6,6],[4,4],[3,3],[2,2],[1,2],[1,1]]){
 test(`${choice.id}: ${dice.join('+')} resolves once, survives reload and permits continuation`,()=>{
  let s=newScenarioSession(def,data);
  // Isolated encounter fixture; the separate journey test checks actual deck access.
  s.game.drawnCards[card.locationId]=card.id;
  const act=a=>{const before=s;s=transition(s,{...a,revision:s.game.revision},def,data);assert.notStrictEqual(s,before);assert.ok(validScenarioSession(s,def,data));};
  assert.ok(!JSON.stringify(currentCard(s.game,data)).includes('outcomes'));
  act({type:'choose',choiceId:choice.id});
  const before=structuredClone(s.game);
  act({type:'startTest',cardId:card.id,choiceId:choice.id,dice});
  assert.deepEqual(s.game,before);assert.equal(visibleResult(s.game,data),null);
  const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
  assert.ok(saveScenarioSession(storage,s,def,data));assert.deepEqual(loadScenarioSession(storage,def,data),s);
  act({type:'acceptTest'});
  const result=visibleResult(s.game,data),effects=choice.outcomes[result.key].effects;
  assert.equal(s.game.ap,before.ap-choice.apCost);
  for(const stat of ['hp','san','threat']){
   const delta=effects.filter(e=>e.type==='modifyStat'&&e.stat===stat||e.type==='modifyThreat'&&stat==='threat').reduce((n,e)=>n+e.amount,0);
   assert.equal(s.game[stat],before[stat]+delta);
  }
  assert.equal(s.game.flags['dockside-approach'],choice.id.replace('bw-dockside-',''));
  assert.strictEqual(transition(s,{type:'acceptTest',revision:s.game.revision},def,data),s);
  assert.strictEqual(transition(s,{type:'resolve',cardId:card.id,choiceId:choice.id,dice,revision:s.game.revision},def,data),s);
  assert.ok(saveScenarioSession(storage,s,def,data));s=loadScenarioSession(storage,def,data);
  assert.equal(visibleResult(s.game,data).text,result.text);
  act({type:'next'});act({type:'move',locationId:'location-1'});act({type:'draw'});
  assert.ok(currentCard(s.game,data));assert.equal(s.game.ended,false);
 });
}

test('conflict is reachable through actual deck draws and absent from legacy content',()=>{
 assert.equal(content.byId[card.id],undefined);
 let s=newScenarioSession(def,data);
 for(let i=0;i<data.cards.length;i++){
  const act=a=>{s=transition(s,{...a,revision:s.game.revision},def,data);};
  act({type:'draw'});const view=currentCard(s.game,data);assert.ok(view);
  if(view.id===card.id){assert.equal(view.choices.length,4);return;}
  const choice=[...view.choices].sort((a,b)=>a.apCost-b.apCost)[0];
  if(s.game.ap<choice.apCost)act({type:'endRound'});
  act({type:'choose',choiceId:choice.id});
  if(choice.test){act({type:'startTest',cardId:view.id,choiceId:choice.id,dice:[6,6]});act({type:'acceptTest'});}
  else act({type:'resolve',cardId:view.id,choiceId:choice.id});
  act({type:'next'});
 }
 assert.fail('Conflict unreachable');
});
