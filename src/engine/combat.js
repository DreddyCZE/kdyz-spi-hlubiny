// Isolated combat prototype. Not wired into default game state or save v4.
import { evaluate, rollDice } from './game.js';
import { attributes } from './schema.js';

export const enemies = Object.freeze([
  { id:'enemy-drowned-sailor', name:'Utopený námořník', hp:3, defense:8, attack:{stat:'hp',amount:1}, escapeDifficulty:8 },
  { id:'enemy-fog-hound', name:'Mlžný pes', hp:2, defense:9, attack:{stat:'hp',amount:1}, escapeDifficulty:8 },
  { id:'enemy-hollow-orderly', name:'Prázdný ošetřovatel', hp:3, defense:8, attack:{stat:'san',amount:1}, escapeDifficulty:9 },
  { id:'enemy-bell-keeper', name:'Zvoník bez tváře', hp:5, defense:10, attack:{stat:'san',amount:2}, escapeDifficulty:10 },
]);
export function startCombat(enemyId) {
  const enemy=enemies.find(e=>e.id===enemyId);
  if(!enemy) throw new Error('Unknown enemy');
  return {enemyId,enemyHp:enemy.hp,exchange:0,status:'active'};
}
export function combatTurn(state,action,dice) {
  if(state.status!=='active') return state;
  if(!['attack','escape'].includes(action)||!Array.isArray(dice)||dice.length!==2) throw new Error('Invalid combat action');
  const enemy=enemies.find(e=>e.id===state.enemyId);
  if(!enemy) throw new Error('Unknown enemy');
  const test=evaluate(...dice,action==='attack'?attributes['SÍ']:attributes['OB'],action==='attack'?enemy.defense:enemy.escapeDifficulty);
  const exchange=state.exchange+1;
  const result={...state,exchange,lastMove:action,roll:test,dice:[...dice],playerDamage:0,playerSanLoss:0};
  const damage=()=>{
    if(enemy.attack.stat==='hp')result.playerDamage+=enemy.attack.amount;
    else result.playerSanLoss+=enemy.attack.amount;
  };
  if(action==='attack'){
    if(['criticalSuccess','greatSuccess'].includes(test.key))result.enemyHp=Math.max(0,result.enemyHp-2);
    else if(['success','partialSuccess'].includes(test.key))result.enemyHp=Math.max(0,result.enemyHp-1);
    if(test.key==='partialSuccess'||test.key==='failure'||test.key==='criticalFailure')damage();
    if(result.enemyHp===0)result.status='defeated';
  }else{
    if(['criticalSuccess','greatSuccess','success','partialSuccess'].includes(test.key))result.status='escaped';
    if(test.key==='partialSuccess'||test.key==='failure'||test.key==='criticalFailure')damage();
  }
  if(result.status==='active'&&exchange>=3){result.status='escaped';damage();}
  return result;
}
