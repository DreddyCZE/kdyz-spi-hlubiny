import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {content} from '../src/engine/content.js';
import {newScenarioSession,scenarioSessionTransition,scenarioSessionView} from '../src/engine/scenario-session.js';
const step=(s,a)=>scenarioSessionTransition(s,{...a,revision:s.game.revision},def,content);
test('opt-in session starts independently from legacy',()=>{
 const s=newScenarioSession(def,content);
 assert.equal(s.game.round,1);assert.equal(s.game.ap,3);assert.equal(s.scenario.clocks['tide-bells'],1);
 assert.equal(scenarioSessionView(s,def).ending,null);
});
test('rounds advance to twelve without legacy ritual tick',()=>{
 let s=newScenarioSession(def,content);
 for(let i=1;i<=12;i++){
  s=step(s,{type:'endRound'});
  assert.equal(s.game.round,i+1);
  assert.equal(s.game.ritual,1);
  assert.equal(s.scenario.clocks['tide-bells'],Math.min(7,1+Math.floor(i/2)));
 }
 assert.equal(s.scenario.endingId,'deep-answers');
 assert.equal(scenarioSessionView(s,def).canAct,false);
 assert.strictEqual(step(s,{type:'endRound'}),s);
});
test('stale revisions cannot replay a round or clock',()=>{
 const s=newScenarioSession(def,content);
 const next=step(s,{type:'endRound'});
 assert.strictEqual(scenarioSessionTransition(next,{type:'endRound',revision:s.game.revision},def,content),next);
});
test('ending is explicit and cannot be chosen without prerequisites',()=>{
 let s=newScenarioSession(def,content);
 assert.strictEqual(step(s,{type:'finishScenario',endingId:'quiet-sea'}),s);
 s={...s,game:{...s.game,knowledge:['knowledge-voice','knowledge-name','knowledge-body'],flags:{'signal-ready':true}}};
 const done=step(s,{type:'finishScenario',endingId:'quiet-sea'});
 assert.equal(done.scenario.endingId,'quiet-sea');
 assert.strictEqual(step(done,{type:'endRound'}),done);
});
test('second scenario can use a different schedule without hardcoded Blackwater',()=>{
 const other={...def,id:'other-story',clocks:[{id:'countdown',label:'Hodiny',max:3,initial:0,milestones:[{round:2,value:1}]}],endings:[]};
 let s=newScenarioSession(other,content);
 s=scenarioSessionTransition(s,{type:'endRound',revision:s.game.revision},other,content);
 assert.equal(s.scenario.clocks.countdown,1);
});
