import {investigators,investigatorById} from '../data/blackwater-investigators.js';
export {investigators,investigatorById};
export function selectScenarioInvestigator(session,id){
 const hero=Object.hasOwn(investigatorById,id)?investigatorById[id]:null;
 if(!hero||session.investigatorId!==null||session.game.revision!==0||session.game.round!==1||session.scenario.endingId)return session;
 const game=structuredClone(session.game);
 game.hp=hero.hp;
 game.san=hero.san;
 // Illustrated-mode item IDs are not in the scenario catalog.
 game.revision++;
 return {...session,investigatorId:id,abilityUsed:false,game};
}
export function activateScenarioAbility(session){
 const hero=investigatorById[session.investigatorId],game=session.game;
 if(!hero||session.abilityUsed||game.ended||session.scenario.endingId||session.scenario.pendingTest)return session;
 const next={...game,revision:game.revision+1};
 if(hero.id==='detective')next.ap=Math.min(4,game.ap+1);
 else if(hero.id==='occultist'){
  const clockId=Object.keys(session.scenario.clocks)[0];
  if(!clockId||session.scenario.clocks[clockId]===0)return session;
  return {...session,game:{...next,log:[hero.name+': zvony na okamžik umlkly.',...game.log].slice(0,100)},scenario:{...session.scenario,clocks:{...session.scenario.clocks,[clockId]:session.scenario.clocks[clockId]-1}},abilityUsed:true};
 }
 else if(hero.id==='sailor'){
  if(game.hp>=hero.hp)return session;
  next.hp=Math.min(hero.hp,game.hp+2);
 }
 next.log=[hero.name+': jednorázová schopnost použita.',...game.log].slice(0,100);
 return {...session,game:next,abilityUsed:true};
}
