import test from 'node:test';
import assert from 'node:assert/strict';
import { enemies, startCombat, combatTurn } from '../src/engine/combat.js';

test('enemy registry has unique ids and valid values', () => {
  assert.equal(enemies.length,4);
  assert.equal(new Set(enemies.map(e=>e.id)).size,4);
  for(const enemy of enemies){assert.ok(enemy.hp>0);assert.ok(enemy.defense>=7);assert.ok(enemy.attack.amount>0);}
});
test('attack damages enemy and prevents reroll after victory',()=>{
  let s=startCombat('enemy-fog-hound');
  s=combatTurn(s,'attack',[6,6]);
  assert.equal(s.status,'defeated');
  assert.equal(s.enemyHp,0);
  assert.equal(combatTurn(s,'attack',[1,1]),s);
});
test('partial success trades damage; escape is possible',()=>{
  let s=startCombat('enemy-drowned-sailor');
  s=combatTurn(s,'attack',[2,3]);
  assert.equal(s.enemyHp,2);
  assert.equal(s.playerDamage,1);
  s=combatTurn(s,'escape',[5,4]);
  assert.equal(s.status,'escaped');
});
test('three exchanges guarantee escape rather than softlock',()=>{
  let s=startCombat('enemy-bell-keeper');
  for(let i=0;i<3;i++)s=combatTurn(s,'attack',[1,2]);
  assert.equal(s.status,'escaped');
  assert.equal(s.exchange,3);
});
test('invalid dice and actions do not mutate state',()=>{
  const s=startCombat('enemy-fog-hound');
  assert.throws(()=>combatTurn(s,'attack',[0,0]));
  assert.throws(()=>combatTurn(s,'negotiate',[6,6]));
  assert.equal(s.exchange,0);
});
