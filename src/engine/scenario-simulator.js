// Deterministic, engine-level playthrough simulator. No UI, browser, or Blackwater assumptions.
import {newScenarioSession,scenarioSessionTransition,scenarioSessionView} from './scenario-session.js';
import {currentCard,explorationView} from './game.js';
export function seededDice(seed=1){
 let state=seed>>>0;
 const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 return ()=>[1+Math.floor(random()*6),1+Math.floor(random()*6)];
}
export function simulateScenario(def,data,{seed=1,maxActions=500,chooseLocation,chooseChoice,reroll=false}={}){
 if(!Number.isSafeInteger(maxActions)||maxActions<1||maxActions>100000)throw new RangeError('maxActions');
 const dice=seededDice(seed),trace=[];let session=newScenarioSession(def,data),attempts=0;
 const dispatch=action=>{
  const before=session;
  session=scenarioSessionTransition(session,{...action,revision:session.game.revision},def,data);
  if(session!==before)trace.push({type:action.type,round:session.game.round,ap:session.game.ap,locationId:session.game.locationId,endingId:session.scenario.endingId});
  return session!==before;
 };
 for(;attempts<maxActions;attempts++){
  const view=scenarioSessionView(session,def),game=session.game;
  if(view.ending||game.ended)break;
  if(view.availableEndings.length){
   const ending=view.availableEndings.find(e=>e.kind==='victory')||view.availableEndings[0];
   dispatch({type:'finishScenario',endingId:ending.id});continue;
  }
  if(game.round>def.rules.maxRounds)break;
  if(view.pendingTest){dispatch({type:'acceptTest'});continue;}
  const card=currentCard(game,data);
  if(card&&game.result){dispatch({type:'next'});continue;}
  if(game.ap===0){if(!dispatch({type:'endRound'}))break;continue;}
  if(card){
   const choices=card.choices.filter(c=>c.available);
   if(choices.length){
    const choice=chooseChoice?.(choices,game,card) || choices[0];
    if(!choices.some(c=>c.id===choice.id))throw new Error('Strategy chose unavailable choice');
    const selected=dispatch({type:'choose',choiceId:choice.id});
    if(choice.test){
     const started=dispatch({type:'startTest',cardId:card.id,choiceId:choice.id,dice:dice()});
     if(started){
      if(reroll&&session.scenario.pendingTest&&session.game.san>=2)dispatch({type:'rerollTest',dice:dice()});
      dispatch({type:'acceptTest'});
     }
     if(started)continue;
    }else if(dispatch({type:'resolve',cardId:card.id,choiceId:choice.id}))continue;
    // Failed action: do not repeatedly select the same blocked card.
    if(!selected&&!dispatch({type:'endRound'}))break;
    continue;
   }
  }
  if(game.ap>0&&!card&&explorationView(game,data).canDraw){dispatch({type:'draw'});continue;}
  const locations=def.locations.filter(id=>id!==game.locationId&&game.unlockedLocations.includes(id));
  const destination=game.ap>0&&(chooseLocation?.(locations,game,data)||locations.find(id=>data.cards.some(c=>c.locationId===id&&!Object.hasOwn(game.resolved,c.id))));
  if(destination&&locations.includes(destination)&&dispatch({type:'move',locationId:destination}))continue;
  if(!dispatch({type:'endRound'}))break;
 }
 return {seed,endingId:session.scenario.endingId,round:session.game.round,ap:session.game.ap,hp:session.game.hp,san:session.game.san,knowledge:[...session.game.knowledge],evidence:[...session.game.evidence],actions:trace.length,attempts,trace,exhausted:attempts>=maxActions&&!session.scenario.endingId&&!session.game.ended};
}
export function simulateBatch(def,data,{runs=100,seed=1,...options}={}){
 if(!Number.isSafeInteger(runs)||runs<1||runs>10000)throw new RangeError('runs');
 const outcomes={},samples=[];let exhausted=0;
 const knowledgeCounts={},endingRounds={},unfinishedReasons={};
 for(let i=0;i<runs;i++){
  const result=simulateScenario(def,data,{...options,seed:seed+i});
  const key=result.endingId||'unfinished';
  outcomes[key]=(outcomes[key]||0)+1;
  if(result.exhausted)exhausted++;
  for(const id of result.knowledge)knowledgeCounts[id]=(knowledgeCounts[id]||0)+1;
  if(result.endingId){
   const rounds=endingRounds[result.endingId]||(endingRounds[result.endingId]=[]);
   rounds.push(result.round);
  }else{
   const reason=result.exhausted?'action-limit':result.hp<=0?'hp':result.san<=0?'san':result.round>def.rules.maxRounds?'deadline':'other';
   unfinishedReasons[reason]=(unfinishedReasons[reason]||0)+1;
  }
  if(samples.length<5)samples.push({...result,trace:undefined});
 }
 const endingRoundStats=Object.fromEntries(Object.entries(endingRounds).map(([id,rounds])=>[id,{count:rounds.length,min:Math.min(...rounds),max:Math.max(...rounds),mean:Math.round(rounds.reduce((a,b)=>a+b,0)/rounds.length*100)/100}]));
 return {runs,seed,outcomes,exhausted,knowledgeCounts,endingRoundStats,unfinishedReasons,samples};
}
