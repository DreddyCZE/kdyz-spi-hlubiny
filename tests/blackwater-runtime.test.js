import test from 'node:test';
import assert from 'node:assert/strict';
import {newBlackwaterGame,blackwaterTransition,publicBlackwater} from '../src/engine/blackwater.js';
import {newState} from '../src/engine/game.js';

test('scenario starts isolated from legacy game and reveals no future cards or myth events',()=>{
  const legacy=newState();
  const s=newBlackwaterGame();
  assert.equal(s.game.version,4);
  assert.equal(legacy.round,1);
  assert.equal(publicBlackwater(s).myth.lastEvent,undefined);
  assert.equal(publicBlackwater(s).card,null);
  assert.ok(!JSON.stringify(publicBlackwater(s)).includes('První úder'));
});
test('scenario turn ends once and myth modifies ritual in same atomic transition',()=>{
  const s=newBlackwaterGame();
  const next=blackwaterTransition(s,{type:'endRound',revision:0});
  assert.equal(s.game.round,1);
  assert.equal(next.game.round,2);
  assert.equal(next.game.ritual,3);
  assert.equal(next.myth.history.length,1);
  assert.equal(publicBlackwater(next).myth.lastEvent.title,'První úder');
  assert.equal(blackwaterTransition(next,{type:'endRound',revision:0}),next);
});
test('exploration and encounter effects carry forward into myth phase',()=>{
  let s=newBlackwaterGame();
  s=blackwaterTransition(s,{type:'draw',revision:s.revision});
  assert.equal(publicBlackwater(s).card.id,'bw-00-01');
  const gameRevision=s.game.revision;
  s=blackwaterTransition(s,{type:'resolve',revision:gameRevision,cardId:'bw-00-01',choiceId:'bw-00-01-listen',dice:[4,4]});
  assert.ok(s.game.evidence.includes('reward-5'));
  const previous=s.game.ritual;
  s=blackwaterTransition(s,{type:'endRound',revision:s.revision});
  assert.equal(s.game.ritual,previous+2);
  assert.ok(s.game.evidence.includes('reward-5'));
});
test('enemy appears on map in second myth phase without exposing future events',()=>{
  let s=newBlackwaterGame();
  s=blackwaterTransition(s,{type:'endRound',revision:s.revision});
  assert.equal(publicBlackwater(s).myth.enemies.length,0);
  s=blackwaterTransition(s,{type:'endRound',revision:s.revision});
  assert.equal(publicBlackwater(s).myth.enemies[0].enemyId,'enemy-drowned-sailor');
});
