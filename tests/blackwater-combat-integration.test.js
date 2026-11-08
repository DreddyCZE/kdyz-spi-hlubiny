import test from 'node:test';
import assert from 'node:assert/strict';
import {newBlackwaterGame,blackwaterTransition,publicBlackwater} from '../src/engine/blackwater.js';
const act=(s,type,extra={})=>blackwaterTransition(s,{type,revision:s.revision,...extra});
test('Blackwater exposes a map enemy and resolves an encounter without duplicate rewards',()=>{
  let s=newBlackwaterGame();
  s=act(s,'endRound');s=act(s,'endRound');
  assert.equal(publicBlackwater(s).myth.enemies.length,1);
  s=act(s,'startCombat',{enemyId:'enemy-drowned-sailor'});
  assert.equal(s.combat.status,'active');
  assert.equal(s.game.ap,2);
  const revision=s.revision;
  assert.equal(blackwaterTransition(s,{type:'startCombat',revision,enemyId:'enemy-drowned-sailor'}),s);
  s=act(s,'combatTurn',{move:'attack',dice:[6,6]});
  s=act(s,'combatTurn',{move:'attack',dice:[6,6]});
  assert.equal(s.combat.status,'defeated');
  assert.equal(s.myth.enemies.length,0);
  const done=s;
  assert.equal(act(s,'combatTurn',{move:'attack',dice:[6,6]}),done);
  s=act(s,'closeCombat');
  assert.equal(s.combat,null);
});
test('failed combat causes damage and escaping keeps enemy on map',()=>{
  let s=newBlackwaterGame();
  s=act(s,'endRound');s=act(s,'endRound');
  s=act(s,'startCombat',{enemyId:'enemy-drowned-sailor'});
  s=act(s,'combatTurn',{move:'escape',dice:[1,1]});
  assert.equal(s.game.hp,5);
  s=act(s,'combatTurn',{move:'escape',dice:[6,6]});
  assert.equal(s.combat.status,'escaped');
  assert.equal(s.myth.enemies.length,1);
});
test('scenario revision translates to engine revision for draws after myth phase',()=>{
  let s=newBlackwaterGame();
  s=act(s,'endRound');
  s=act(s,'draw');
  assert.equal(publicBlackwater(s).card.id,'bw-00-01');
});
