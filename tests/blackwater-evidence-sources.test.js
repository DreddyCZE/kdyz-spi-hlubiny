import test from 'node:test';
import assert from 'node:assert/strict';
import {content} from '../src/engine/content.js';
import {auditDeductionSources} from '../src/engine/scenario-reachability.js';
const finaleEvidence=['reward-7','reward-9','reward-10','reward-11','reward-12','reward-14','reward-16'];
test('every Blackwater finale evidence has at least one real card award',()=>{
 const audit=auditDeductionSources(content);
 const missing=finaleEvidence.filter(id=>!audit.sources[id]?.length);
 assert.deepEqual(missing,[],'missing actual card outcomes for '+missing.join(', '));
});
test('audit lists card IDs and location for each evidence source',()=>{
 const audit=auditDeductionSources(content);
 for(const id of finaleEvidence)for(const source of audit.sources[id]){
  assert.ok(content.byId[source.cardId]);
  assert.ok(content.refs.locations.includes(source.locationId));
 }
 assert.ok(audit.deductions.some(d=>d.id==='blackwater-voice-route'));
});
