// Static, scenario-agnostic evidence reachability audit.
// A source is counted only when an actual card outcome awards evidence (directly or via an item).
export function auditEvidenceSources(data){
 const sources=new Map(data.refs.evidence.map(id=>[id,[]]));
 for(const card of data.cards)for(const choice of card.choices)for(const [tier,outcome] of Object.entries(choice.outcomes)){
  for(const effect of outcome.effects||[]){
   const ids=effect.type==='addEvidence'?[effect.id]:effect.type==='addItem'?(data.investigation.itemEvidence[effect.id]||[]):[];
   for(const id of ids)if(sources.has(id))sources.get(id).push({cardId:card.id,locationId:card.locationId,choiceId:choice.id,tier});
  }
 }
 return Object.fromEntries([...sources].map(([id,records])=>[id,records]));
}
export function auditDeductionSources(data){
 const sources=auditEvidenceSources(data);
 const unavailable=data.refs.evidence.filter(id=>sources[id].length===0);
 const deductions=data.investigation.order.map(id=>{const d=data.investigation.deductions.find(x=>x.id===id);
  const needed=new Set();
  function visit(c){if(c.type==='hasEvidence')needed.add(c.id);for(const child of c.conditions||[])visit(child);if(c.condition)visit(c.condition);}
  visit(d.conditions);
  return {id:d.id,evidence:[...needed].map(id=>({id,sourceCount:new Set((sources[id]||[]).map(s=>s.cardId)).size}))};
 });
 return {sources,unavailable,deductions};
}
