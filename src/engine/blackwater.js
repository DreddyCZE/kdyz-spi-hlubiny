// Opt-in Blackwater runtime. Legacy game state/save v4 is not modified.
import { blackwaterM4Cards } from '../data/blackwater-m4.js';
import { createContent } from './content.js';
import { newState, transition, currentCard, explorationView, visibleResult } from './game.js';
import { newMythState, mythPhase, publicMyth } from './myth.js';
import { startCombat, combatTurn } from './combat.js';
import { startingInventory, useBlackwaterItem } from '../data/blackwater-items.js';

export const blackwaterContent=createContent(blackwaterM4Cards);
export function newBlackwaterGame(){
  const game=newState(blackwaterContent);
  game.inventory=startingInventory();
  return {scenario:'blackwater',version:1,revision:0,game,myth:newMythState(),combat:null};
}
export function blackwaterTransition(state,action){
  if(state?.scenario!=='blackwater'||state.version!==1||action?.revision!==state.revision)return state;
  if(state.game.ended)return state;
  if(action.type==='useItem'){
    if(state.combat?.status==='active'){
      if(action.itemId!=='bw-salt'||!state.game.inventory.includes('bw-salt'))return state;
      const game=structuredClone(state.game);
      game.inventory=game.inventory.filter(id=>id!=='bw-salt');game.revision++;
      const combat={...state.combat,status:'banished'};
      const myth=structuredClone(state.myth);
      myth.enemies=myth.enemies.filter(e=>!(e.enemyId===combat.enemyId&&e.locationId===game.locationId));
      return {...state,revision:state.revision+1,game,myth,combat};
    }
    const game=useBlackwaterItem(state.game,action.itemId);
    if(game===state.game)return state;
    game.revision++;
    return {...state,revision:state.revision+1,game};
  }
  if(action.type==='startCombat'){
    if(state.combat||state.game.ap<1||state.game.result)return state;
    const enemy=state.myth.enemies.find(e=>e.enemyId===action.enemyId&&e.locationId===state.game.locationId);
    if(!enemy)return state;
    const game=structuredClone(state.game);game.ap--;game.revision++;
    return {...state,revision:state.revision+1,game,combat:startCombat(enemy.enemyId)};
  }
  if(action.type==='combatTurn'){
    if(!state.combat||state.combat.status!=='active')return state;
    let combat;
    try{combat=combatTurn(state.combat,action.move,action.dice);}catch{return state;}
    const game=structuredClone(state.game);
    game.hp=Math.max(0,game.hp-combat.playerDamage);
    game.san=Math.max(0,game.san-combat.playerSanLoss);
    game.ended=game.hp===0||game.san===0||game.threat>=10||game.ritual>=8;
    game.revision++;
    const myth=structuredClone(state.myth);
    if(combat.status==='defeated')myth.enemies=myth.enemies.filter(e=>!(e.enemyId===combat.enemyId&&e.locationId===game.locationId));
    game.log.unshift('Střetnutí: '+combat.enemyId+' — '+combat.status);
    return {...state,revision:state.revision+1,game,myth,combat};
  }
  if(action.type==='closeCombat'){
    if(!state.combat||state.combat.status==='active')return state;
    return {...state,revision:state.revision+1,combat:null};
  }
  if(state.combat?.status==='active')return state;
  if(action.type==='endRound'){
    if(state.game.round>=7)return state;
    const game=transition(state.game,{type:'endRound'},blackwaterContent);
    if(game===state.game)return state;
    // Base game advances ritual by one; myth adds the event-specific effect.
    const before={...state.myth,ritual:game.ritual,threat:game.threat,round:state.myth.round};
    const myth=mythPhase(before,before.history.length);
    game.ritual=myth.ritual;game.threat=myth.threat;
    game.ended=game.ended||game.ritual>=8||game.threat>=10;
    if(game.ended)game.log.unshift('Konec scénáře: temnota zvítězila.');
    if(myth.history.length>before.history.length){
      const event=publicMyth(myth).lastEvent;
      game.log.unshift('Mýtus: '+event.title);
    }
    return {...state,revision:state.revision+1,game,myth};
  }
  const game=transition(state.game,{...action,revision:state.game.revision},blackwaterContent);
  if(game===state.game)return state;
  return {...state,revision:state.revision+1,game};
}
export function publicBlackwater(state){
  if(state?.scenario!=='blackwater')throw new Error('Unknown scenario');
  const {game}=state;
  return {scenario:state.scenario,revision:state.revision,round:game.round,ap:game.ap,
    hp:game.hp,san:game.san,threat:game.threat,ritual:game.ritual,ended:game.ended,
    inventory:[...game.inventory],
    locationId:game.locationId,card:currentCard(game,blackwaterContent),
    exploration:explorationView(game,blackwaterContent),result:visibleResult(game,blackwaterContent),
    myth:publicMyth(state.myth),combat:state.combat?{...state.combat}:null};
}
