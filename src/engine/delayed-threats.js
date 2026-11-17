// Pure scheduled location threats. Definitions and narrative belong to the scenario.
export function advanceThreats(game,scenario,def){
  const states={...(scenario.delayedThreats||{})};
  let next=game;
  for(const event of def.delayedThreats||[]){
    if(states[event.id]==='pending'&&game.round>event.dueRound){
      const hit=game.locationId===event.locationId;
      states[event.id]=hit?'hit':'avoided';
      next={...next,log:[hit?event.hitText:event.avoidedText,...next.log].slice(0,100)};
      if(hit){
        next[event.effect.stat]=Math.max(0,next[event.effect.stat]+event.effect.amount);
        next.ended=next.ended||next.hp===0||next.san===0;
      }
    }
    if(states[event.id]===undefined&&game.round===event.startRound){
      states[event.id]='pending';
      next={...next,log:[event.warningText,...next.log].slice(0,100)};
    }
  }
  return {game:next,scenario:{...scenario,delayedThreats:states}};
}
export function threatView(scenario,def){
  return (def.delayedThreats||[]).filter(e=>Object.hasOwn(scenario.delayedThreats||{},e.id)).map(e=>({
    id:e.id,title:e.title,locationId:e.locationId,dueRound:e.dueRound,
    status:scenario.delayedThreats[e.id],text:scenario.delayedThreats[e.id]==='pending'?e.warningText:scenario.delayedThreats[e.id]==='hit'?e.hitText:e.avoidedText,
  }));
}
export function validThreatState(scenario,game,def){
  if(scenario.delayedThreats===undefined)return true; // Additive v1 field; no retroactive events on load.
  const states=scenario.delayedThreats;
  if(!states||typeof states!=='object'||Array.isArray(states))return false;
  return Object.entries(states).every(([id,status])=>{
    const event=(def.delayedThreats||[]).find(e=>e.id===id);
    return event&&['pending','hit','avoided'].includes(status)&&game.round>=event.startRound&&
      (status==='pending'?game.round<=event.dueRound:game.round>event.dueRound);
  });
}
