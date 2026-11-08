import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {content} from '../src/engine/content.js';
import {newScenarioSession,scenarioSessionTransition} from '../src/engine/scenario-session.js';
const step=(s,a)=>scenarioSessionTransition(s,{...a,revision:s.game.revision},def,content);
test('automatic deduction triggers on valid game transition without extra AP',()=>{
 let s=newScenarioSession(def,content);
 s={...s,game:{...s.game,evidence:['reward-2','reward-5']}};
 const next=step(s,{type:'move',locationId:'location-1'});
 assert.equal(next.game.ap,s.game.ap-1);
 assert.ok(next.game.knowledge.includes('blackwater-lighthouse-connection'));
 assert.equal(next.game.deductions['blackwater-follow-the-route'],1);
 assert.equal(next.game.revision,s.game.revision+2);
});
test('automatic deduction is idempotent and manual command is disabled',()=>{
 let s=newScenarioSession(def,content);
 s={...s,game:{...s.game,evidence:['reward-2','reward-5']}};
 assert.strictEqual(step(s,{type:'deduce'}),s);
 s=step(s,{type:'move',locationId:'location-1'});
 const next=step(s,{type:'move',locationId:'location-2'});
 assert.equal(next.game.deductions['blackwater-follow-the-route'],1);
});
test('manual deduction mode remains available in other scenarios',()=>{
 const manual={...def,id:'manual-example',rules:{...def.rules,deductionMode:'manual'}};
 let s=newScenarioSession(manual,content);
 s={...s,game:{...s.game,evidence:['reward-2','reward-5']}};
 const next=scenarioSessionTransition(s,{type:'deduce',revision:s.game.revision},manual,content);
 assert.ok(next.game.knowledge.includes('blackwater-lighthouse-connection'));
});
