// Opt-in P1 adapter. Legacy engine and its save format remain unchanged.
import {newState,transition as legacyTransition} from './game.js';
import {initialScenarioState,advanceClock,availableEndings,chooseEnding} from './scenario.js';
export function newScenarioSession(def,data){
  const game=newState(data);
  game.ap=def.rules.apPerRound;
  return {schemaVersion:1,game,scenario:initialScenarioState(def)};
}
export function scenarioSessionTransition(session,action,def,data){
  if(!session||session.schemaVersion!==1||session.scenario.scenarioId!==def.id||session.scenario.scenarioVersion!==def.version)return session;
  if(session.scenario.endingId)return session;
  const game=session.game,sc=session.scenario;
  if(action.type==='finishScenario'){
    if(!Number.isSafeInteger(action.revision)||action.revision!==game.revision)return session;
    const ending=chooseEnding(def,game,sc,action.endingId);
    return ending===sc?session:{...session,scenario:ending};
  }
  // The legacy endRound increments ritual and hardcodes seven rounds; bypass it here.
  if(action.type==='endRound'){
    if(action.revision!==game.revision||game.ended||game.round>def.rules.maxRounds)return session;
    const nextRound=game.round+1;
    const nextGame={...game,round:nextRound,ap:nextRound<=def.rules.maxRounds?def.rules.apPerRound:0,revision:game.revision+1,
      log:['Nové kolo.',...game.log].slice(0,100)};
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
  const nextGame=legacyTransition(game,action,data);
  if(nextGame===game)return session;
  // Until the full engine migration, legacy HP/SAN/threat/ritual defeat remains authoritative.
  // Never silently convert a legacy defeat to a scenario victory.
  return {...session,game:nextGame};
}
export function scenarioSessionView(session,def){
  return {scenarioId:def.id,title:def.title,round:session.game.round,ap:session.game.ap,
    clocks:def.clocks.map(c=>({id:c.id,label:c.label,current:session.scenario.clocks[c.id],max:c.max})),
    ending:session.scenario.endingId?def.endings.find(e=>e.id===session.scenario.endingId):null,
    canAct:!session.game.ended&&!session.scenario.endingId&&session.game.round<=def.rules.maxRounds};
}
