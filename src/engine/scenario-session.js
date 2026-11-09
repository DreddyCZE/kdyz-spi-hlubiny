import {startCombat,combatTurn,enemies} from './combat.js';
import {selectScenarioInvestigator,activateScenarioAbility,investigatorById} from './scenario-investigators.js';
// Opt-in P1 adapter. Legacy engine and its save format remain unchanged.
import {newState,transition as legacyTransition,currentCard,selectedChoice,evaluate,attributes} from './game.js';
import {initialScenarioState,advanceClock,availableEndings,chooseEnding} from './scenario.js';
import {deduce} from './investigation.js';
import {initialPuzzleState,puzzleView,attemptPuzzle,revealPuzzleHint,validatePuzzle} from './puzzle.js';
import {initialCompanionState,validateCompanion,companionAvailable,recruitCompanion,dismissCompanion,useCompanionAbility,companionView} from './companion.js';
export function newScenarioSession(def,data){
  const game=newState(data);
  game.ap=def.rules.apPerRound;
  return {schemaVersion:1,investigatorId:null,abilityUsed:false,game,scenario:{...initialScenarioState(def),puzzles:{},companion:initialCompanionState()}};
}
const tiers=['criticalFailure','failure','partialSuccess','success','greatSuccess','criticalSuccess'];
const diceValid=d=>Array.isArray(d)&&d.length===2&&d.every(n=>Number.isInteger(n)&&n>=1&&n<=6);
const score=(dice,test)=>evaluate(...dice,attributes[test.attribute]+(test.modifier||0),test.difficulty);
function autoDeductions(game,def,data){
  if(def.rules.deductionMode!=='automatic'||game.ended)return game;
  const next=deduce(game,data.investigation);
  if(next===game)return game;
  return {...next,revision:game.revision+1,log:next.log.slice(0,100)};
}
export function scenarioSessionTransition(session,action,def,data){
  if(!session||session.schemaVersion!==1||session.scenario.scenarioId!==def.id||session.scenario.scenarioVersion!==def.version)return session;
  if(session.scenario.endingId)return session;
  if(session.scenario.combat?.status==='active'&&!['combatTurn'].includes(action.type))return session;
  if(action.type==='selectInvestigator')return action.revision===session.game.revision?selectScenarioInvestigator(session,action.investigatorId):session;
  if(action.type==='useInvestigatorAbility')return action.revision===session.game.revision&&session.scenario.combat?.status!=='active'?activateScenarioAbility(session):session;
  const game=session.game,sc=session.scenario;
  const hero=investigatorById[session.investigatorId];
  const scenarioRules={...def.rules,scenarioClock:true,...(hero?{statLimits:{hp:hero.hp,san:hero.san}}:{})};
  const pending=sc.pendingTest||null;
  if(action.type==='startCombat'){
    const enemy=enemies.find(e=>e.id===action.enemyId);
    if(action.revision!==game.revision||!enemy||game.ended||game.round>def.rules.maxRounds||sc.combat?.status==='active'||sc.encounteredEnemyIds?.includes(enemy.id)||game.ap<1||pending||!({'location-2':'enemy-fog-hound','location-4':'enemy-hollow-orderly','location-6':'enemy-bell-keeper'}[game.locationId]===enemy.id))return session;
    return {...session,game:{...game,ap:game.ap-1,revision:game.revision+1},scenario:{...sc,combat:startCombat(enemy.id),encounteredEnemyIds:[...(sc.encounteredEnemyIds||[]),enemy.id]}};
  }
  if(action.type==='combatTurn'){
    if(action.revision!==game.revision||game.ended||game.round>def.rules.maxRounds||sc.combat?.status!=='active'||!diceValid(action.dice))return session;
    let result;
    try{result=combatTurn(sc.combat,action.move,action.dice,sc.equipment?.includes('bw-revolver')?1:0);}catch{return session;}
    const next={...game,revision:game.revision+1,hp:Math.max(0,game.hp-result.playerDamage),san:Math.max(0,game.san-result.playerSanLoss)};
    next.ended=next.hp===0||next.san===0||next.threat===10;
    next.log=[enemies.find(e=>e.id===result.enemyId).name+': '+(result.status==='defeated'?'poražen':result.status==='escaped'?'únik':'souboj pokračuje'),...game.log].slice(0,100);
    return {...session,game:next,scenario:{...sc,combat:result}};
  }
  if(action.type==='useEquipment'){
    if(action.revision!==game.revision||game.ended||pending||game.round>def.rules.maxRounds||sc.combat?.status==='active'||!sc.equipment?.includes(action.itemId))return session;
    const next={...game,revision:game.revision+1};
    if(action.itemId==='bw-bandage'){if(game.hp>= (investigatorById[session.investigatorId]?.hp||6))return session;next.hp=Math.min(investigatorById[session.investigatorId]?.hp||6,game.hp+2);}
    else if(action.itemId==='bw-laudanum'){if(game.san>=(investigatorById[session.investigatorId]?.san||8))return session;next.san=Math.min(investigatorById[session.investigatorId]?.san||8,game.san+2);}
    else if(action.itemId==='bw-salt'){next.threat=Math.max(0,game.threat-1);}
    else return session;
    return {...session,game:next,scenario:{...sc,equipment:sc.equipment.filter(id=>id!==action.itemId)}};
  }
  if(pending&&!['rerollTest','acceptTest'].includes(action.type))return session;

  if(action.type==='deduce'&&def.rules.deductionMode==='automatic')return session;
  // D3 companion transitions are revision guarded and never consume AP.
  if(['recruitCompanion','dismissCompanion','useCompanionAbility'].includes(action.type)){
    if(action.revision!==game.revision||game.ended||game.round>def.rules.maxRounds)return session;
    const state=sc.companion||initialCompanionState();
    const definitions=(data.companions||[]).filter(d=>!validateCompanion(d).length);
    const active=definitions.find(d=>d.id===state.activeId);
    let next=null;
    if(action.type==='recruitCompanion'){
      const candidate=definitions.find(d=>d.id===action.companionId);
      if(candidate)next=recruitCompanion(candidate,state,game);
    }else if(action.type==='dismissCompanion')next=dismissCompanion(state);
    else if(active)next=useCompanionAbility(active,state,action.abilityId,action.trigger,game.round);
    if(!next)return session;
    const ability=action.type==='useCompanionAbility'?active?.abilities.find(a=>a.id===action.abilityId):null;
    const discovered=ability?.discoveryFlagId&&!game.flags[ability.discoveryFlagId];
    const nextLog=ability?[ability.name+': '+ability.text,...game.log].slice(0,100):game.log;
    const nextFlags=discovered?{...game.flags,[ability.discoveryFlagId]:true}:game.flags;
    return {...session,game:{...game,revision:game.revision+1,flags:nextFlags,log:nextLog},scenario:{...sc,companion:next}};
  }
  // Optional puzzle subsystem: old sessions and scenarios without puzzles stay valid.
  if(['attemptPuzzle','revealPuzzleHint'].includes(action.type)){
    if(action.revision!==game.revision||game.ended||game.round>def.rules.maxRounds||!Array.isArray(data.puzzles))return session;
    const p=data.puzzles.find(p=>p.id===action.puzzleId);
    if(!p||validatePuzzle(p).length||p.locationId!==game.locationId)return session;
    const previous=sc.puzzles?.[p.id]||initialPuzzleState();
    if(action.type==='revealPuzzleHint'){
      const next=revealPuzzleHint(p,previous,action.hintId,game);
      if(!next)return session;
      return {...session,game:{...game,revision:game.revision+1},scenario:{...sc,puzzles:{...sc.puzzles,[p.id]:next}}};
    }
    const result=attemptPuzzle(p,previous,action.answer);
    if(!result)return session;
    const nextGame=structuredClone(game);
    for(const effect of result.effects){
      if(effect.type==='setFlag')nextGame.flags[effect.id]=effect.value;
      else if(effect.type==='modifyThreat')nextGame.threat=Math.max(0,Math.min(10,nextGame.threat+effect.amount));
      else return session;
    }
    nextGame.revision=game.revision+1;
    nextGame.ended=nextGame.ended||nextGame.threat>=10;
    return {...session,game:nextGame,scenario:{...sc,puzzles:{...sc.puzzles,[p.id]:result.state}}};
  }
  if(['startTest','rerollTest','acceptTest'].includes(action.type)){
    if(action.revision!==game.revision)return session;
    if(action.type==='startTest'){
      if(pending||game.ended||!diceValid(action.dice))return session;
      const card=currentCard(game,data),choice=selectedChoice(game,card);
      if(!card||!choice?.test||!choice.available||action.cardId!==card.id||action.choiceId!==choice.id)return session;
      return {...session,scenario:{...sc,pendingTest:{cardId:card.id,choiceId:choice.id,revision:game.revision,firstDice:[...action.dice],secondDice:null}}};
    }
    if(!pending||pending.revision!==game.revision)return session;
    const card=currentCard(game,data),choice=card?.choices.find(o=>o.id===pending.choiceId);
    if(!choice?.test||card.id!==pending.cardId||!choice.available)return session;
    if(action.type==='rerollTest'){
      if(pending.secondDice||game.san<2||!diceValid(action.dice))return session;
      return {...session,game:{...game,san:game.san-1},scenario:{...sc,pendingTest:{...pending,secondDice:[...action.dice]}}};
    }
    const first=score(pending.firstDice,choice.test);
    const second=pending.secondDice?score(pending.secondDice,choice.test):null;
    const winner=second&&tiers.indexOf(second.key)>tiers.indexOf(first.key)?pending.secondDice:pending.firstDice;
    const nextGame=legacyTransition(game,{type:'resolve',revision:game.revision,cardId:pending.cardId,choiceId:pending.choiceId,dice:winner},data,scenarioRules);
    if(nextGame===game)return session;
    return {...session,game:autoDeductions(nextGame,def,data),scenario:{...sc,pendingTest:null}};
  }
  if(action.type==='finishScenario'){
    if(!Number.isSafeInteger(action.revision)||action.revision!==game.revision)return session;
    if(game.ended||game.round>def.rules.maxRounds||(def.finaleLocationId&&game.locationId!==def.finaleLocationId))return session;
    const ending=chooseEnding(def,game,sc,action.endingId);
    return ending===sc?session:{...session,scenario:ending};
  }
  // The legacy endRound increments ritual and hardcodes seven rounds; bypass it here.
  if(action.type==='endRound'){
    if(action.revision!==game.revision||game.ended||game.round>def.rules.maxRounds)return session;
    const nextRound=game.round+1;
    const nextGame=game.round===def.rules.maxRounds
      ? {...game,round:nextRound,ap:0,revision:game.revision+1,log:['Čas vypršel.',...game.log].slice(0,100)}
      : legacyTransition(game,action,data,scenarioRules);
    if(nextGame===game)return session;
    let nextSc=sc;
    // Seven tolls, triggered once each at scenario-specific milestones.
    for(const clock of def.clocks){
      const milestone=clock.milestones?.find(m=>m.round===nextRound);
      if(milestone&&nextSc.clocks[clock.id]<milestone.value){
        nextSc=advanceClock(def,nextSc,clock.id,milestone.value-nextSc.clocks[clock.id],'scheduled-'+clock.id+'-'+nextRound);
      }
    }
    const defeat=availableEndings(def,nextGame,nextSc).find(e=>e.kind==='defeat');
    if(defeat)nextSc=chooseEnding(def,nextGame,nextSc,defeat.id);
    return {...session,game:nextGame,scenario:nextSc};
  }
  if(action.type==='resolve'&&currentCard(game,data)?.choices.some(c=>c.id===action.choiceId&&c.test))return session;
  const nextGame=legacyTransition(game,action,data,scenarioRules);
  if(nextGame===game)return session;
  // HP/SAN/threat remain lethal; the scenario clock replaces legacy ritual defeat.
  return {...session,game:autoDeductions(nextGame,def,data)};
}
export function scenarioSessionView(session,def,data={}){
  return {scenarioId:def.id,title:def.title,round:session.game.round,ap:session.game.ap,investigatorId:session.investigatorId===undefined?'legacy':session.investigatorId,investigator:investigatorById[session.investigatorId]||null,abilityUsed:session.abilityUsed===true,
    clocks:def.clocks.map(c=>({id:c.id,label:c.label,current:session.scenario.clocks[c.id],max:c.max})),
    ending:session.scenario.endingId?def.endings.find(e=>e.id===session.scenario.endingId):null,
    pendingTest:session.scenario.pendingTest||null,
    equipment:session.scenario.equipment||[],combat:session.scenario.combat||null,encounteredEnemyIds:session.scenario.encounteredEnemyIds||[],
    companion:(Array.isArray(data.companions)?data.companions:[]).filter(d=>!validateCompanion(d).length).map(d=>({id:d.id,name:d.name,kind:d.kind,recruitable:!session.scenario.companion?.activeId&&companionAvailable(d,session.game),active:companionView(d,session.scenario.companion||initialCompanionState(),session.game.round)})),
    puzzles:(Array.isArray(data.puzzles)?data.puzzles:[]).filter(p=>!validatePuzzle(p).length&&p.locationId===session.game.locationId).map(p=>puzzleView(p,session.scenario.puzzles?.[p.id],session.game)),
    availableEndings:session.game.ended||session.game.round>def.rules.maxRounds||session.scenario.pendingTest||(def.finaleLocationId&&session.game.locationId!==def.finaleLocationId)?[]:availableEndings(def,session.game,session.scenario).filter(e=>e.kind!=='defeat').map(e=>({id:e.id,title:e.title,kind:e.kind})),
    canAct:session.investigatorId!==null&&session.scenario.combat?.status!=='active'&&!session.game.ended&&!session.scenario.endingId&&session.game.round<=def.rules.maxRounds};
}
