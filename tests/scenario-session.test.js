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
 s={...s,game:{...s.game,locationId:'location-6',knowledge:['knowledge-voice','knowledge-name','knowledge-body'],flags:{'signal-ready':true}}};
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

test('D3 companion actions are revision guarded, optional and do not consume AP',()=>{
 const companion={id:'dog',name:'Pes',kind:'animal',availability:{locationId:'location-0'},abilities:[{id:'scent',name:'Stopa',type:'active',trigger:'exploration',uses:'oncePerRound',text:'Pes zachytil pach.'}]};
 const data={...content,companions:[companion]};
 let session=newScenarioSession(def,data);
 const initialAp=session.game.ap;
 const before=scenarioSessionView(session,def,data);
 assert.equal(before.companion[0].recruitable,true);
 session=scenarioSessionTransition(session,{type:'recruitCompanion',companionId:'dog',revision:session.game.revision},def,data);
 assert.equal(session.scenario.companion.activeId,'dog');
 assert.equal(session.game.ap,initialAp);
 const stale=scenarioSessionTransition(session,{type:'dismissCompanion',revision:0},def,data);
 assert.strictEqual(stale,session);
 const used=scenarioSessionTransition(session,{type:'useCompanionAbility',abilityId:'scent',trigger:'exploration',revision:session.game.revision},def,data);
 assert.equal(used.scenario.companion.usedRoundByAbility.scent,1);
 assert.equal(used.game.ap,initialAp);
 assert.strictEqual(scenarioSessionTransition(used,{type:'useCompanionAbility',abilityId:'scent',trigger:'exploration',revision:used.game.revision},def,data),used);
 assert.equal(scenarioSessionView(used,def,data).companion[0].active.abilities[0].available,false);
 const later=scenarioSessionTransition(used,{type:'endRound',revision:used.game.revision},def,data);
 assert.equal(scenarioSessionView(later,def,data).companion[0].active.abilities[0].available,true);
 const dismissed=scenarioSessionTransition(later,{type:'dismissCompanion',revision:later.game.revision},def,data);
 assert.equal(dismissed.scenario.companion.activeId,null);
});
