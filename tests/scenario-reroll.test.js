import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {content} from '../src/engine/content.js';
import {newScenarioSession,scenarioSessionTransition} from '../src/engine/scenario-session.js';
import {saveScenarioSession,loadScenarioSession} from '../src/engine/scenario-storage.js';
import {currentCard} from '../src/engine/game.js';
const run=(s,action)=>scenarioSessionTransition(s,{...action,revision:s.game.revision},def,content);
function setup(){
 let s=newScenarioSession(def,content);
 s=run(s,{type:'draw'});
 const card=currentCard(s.game,content);
 const choice=card.choices.find(c=>c.test&&c.available);
 assert.ok(choice,'starting location must have a test choice');
 s=run(s,{type:'choose',choiceId:choice.id});
 return {s,card,choice};
}
test('first roll is pending: no AP or card effects are applied',()=>{
 const {s,card,choice}=setup();
 const next=run(s,{type:'startTest',cardId:card.id,choiceId:choice.id,dice:[1,1]});
 assert.equal(next.game.ap,s.game.ap);
 assert.equal(next.game.san,s.game.san);
 assert.equal(next.game.resolved[card.id],undefined);
 assert.deepEqual(next.scenario.pendingTest.firstDice,[1,1]);
 assert.strictEqual(run(next,{type:'endRound'}),next);
});
test('reroll charges SAN once and cannot be repeated',()=>{
 const {s,card,choice}=setup();
 const first=run(s,{type:'startTest',cardId:card.id,choiceId:choice.id,dice:[1,1]});
 const second=run(first,{type:'rerollTest',dice:[6,6]});
 assert.equal(second.game.san,first.game.san-1);
 assert.strictEqual(run(second,{type:'rerollTest',dice:[6,6]}),second);
 const done=run(second,{type:'acceptTest'});
 assert.equal(done.game.resolved[card.id].key,'criticalSuccess');
 assert.equal(done.scenario.pendingTest,null);
 assert.strictEqual(run(done,{type:'acceptTest'}),done);
});
test('better initial roll wins over weaker reroll',()=>{
 const {s,card,choice}=setup();
 const first=run(s,{type:'startTest',cardId:card.id,choiceId:choice.id,dice:[6,6]});
 const second=run(first,{type:'rerollTest',dice:[1,1]});
 const done=run(second,{type:'acceptTest'});
 assert.equal(done.game.resolved[card.id].key,'criticalSuccess');
});
test('pending test survives storage reload',()=>{
 const {s,card,choice}=setup();
 const pending=run(s,{type:'startTest',cardId:card.id,choiceId:choice.id,dice:[3,4]});
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 assert.equal(saveScenarioSession(storage,pending,def,content),true);
 const loaded=loadScenarioSession(storage,def,content);
 assert.deepEqual(loaded.scenario.pendingTest,pending.scenario.pendingTest);
});
