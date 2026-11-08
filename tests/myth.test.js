import test from 'node:test';
import assert from 'node:assert/strict';
import {mythEvents,newMythState,mythPhase,publicMyth} from '../src/engine/myth.js';

test('myth events have unique stable ids and narrative',()=>{
  assert.equal(new Set(mythEvents.map(e=>e.id)).size,mythEvents.length);
  for(const event of mythEvents){assert.ok(event.title);assert.ok(event.text);}
});
test('no future myth events leak through public view',()=>{
  const state=newMythState();
  assert.equal(publicMyth(state).lastEvent,undefined);
  assert.ok(!JSON.stringify(publicMyth(state)).includes('Mlžná stěna'));
  const next=mythPhase(state,0);
  assert.equal(publicMyth(next).lastEvent.title,'První úder');
  assert.ok(!JSON.stringify(publicMyth(next)).includes('Mlžná stěna'));
});
test('revision guard prevents duplicate draw and enemy spawning is unique',()=>{
  const initial=newMythState();
  const one=mythPhase(initial,0);
  assert.equal(mythPhase(one,0),one);
  const two=mythPhase(one,1);
  assert.equal(two.enemies.length,1);
  assert.equal(two.enemies[0].locationId,'location-0');
  let state=two;
  for(let i=2;i<7;i++)state=mythPhase(state,i);
  assert.equal(state.enemies.filter(e=>e.enemyId==='enemy-drowned-sailor').length,1);
});
test('myth phase does not mutate input and clamps ritual and threat',()=>{
  const s=newMythState();
  const n=mythPhase(s,0);
  assert.equal(s.round,1);
  assert.equal(s.ritual,1);
  assert.equal(n.ritual,2);
});
