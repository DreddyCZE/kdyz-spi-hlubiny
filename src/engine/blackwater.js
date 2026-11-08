// Opt-in Blackwater runtime. Legacy game state/save v4 is not modified.
import { blackwaterM4Cards } from '../data/blackwater-m4.js';
import { createContent } from './content.js';
import { newState, transition, currentCard, explorationView, visibleResult } from './game.js';
import { newMythState, mythPhase, publicMyth } from './myth.js';

export const blackwaterContent=createContent(blackwaterM4Cards);
export function newBlackwaterGame(){
  return {scenario:'blackwater',version:1,revision:0,game:newState(blackwaterContent),myth:newMythState()};
}
export function blackwaterTransition(state,action){
  if(state?.scenario!=='blackwater'||state.version!==1||action?.revision!==state.revision)return state;
  if(state.game.ended)return state;
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
  const game=transition(state.game,action,blackwaterContent);
  if(game===state.game)return state;
  return {...state,revision:state.revision+1,game};
}
export function publicBlackwater(state){
  if(state?.scenario!=='blackwater')throw new Error('Unknown scenario');
  const {game}=state;
  return {scenario:state.scenario,revision:state.revision,round:game.round,ap:game.ap,
    hp:game.hp,san:game.san,threat:game.threat,ritual:game.ritual,ended:game.ended,
    locationId:game.locationId,card:currentCard(game,blackwaterContent),
    exploration:explorationView(game,blackwaterContent),result:visibleResult(game,blackwaterContent),
    myth:publicMyth(state.myth)};
}
