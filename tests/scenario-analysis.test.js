import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {assessRoutes,analyzeClueFallbacks} from '../src/engine/scenario-analysis.js';
test('AP model reveals tight deep route and impossible overspend',()=>{
 const routes=assessRoutes(def,[
  {name:'rychlý',moves:6,choices:11,combat:3},
  {name:'standardní',moves:8,choices:14,combat:5,rest:1,preparation:1},
  {name:'důkladný',moves:10,choices:16,combat:7,rest:1,preparation:1},
  {name:'přetížený',moves:12,choices:18,combat:9}
 ]);
 assert.deepEqual(routes.map(r=>r.remaining),[16,7,1,-3]);
 assert.deepEqual(routes.map(r=>r.withinBudget),[true,true,true,false]);
});
test('clue paths require at least two reachable independent sources',()=>{
 const edges={harbor:['street','institute'],street:['archive'],archive:['cemetery'],institute:['lighthouse'],cemetery:['caves'],lighthouse:['caves']};
 const clues=[{id:'voice',sources:['institute','lighthouse']},{id:'name',sources:['archive','cemetery']},{id:'body',sources:['caves','sealed-tunnel']}];
 const a=analyzeClueFallbacks(clues,edges,['harbor']);
 assert.deepEqual(a.map(x=>x.hasFallback),[true,true,false]);
});
