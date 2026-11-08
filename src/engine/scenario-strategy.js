// Reusable heuristic: seek missing evidence that advances an ending's knowledge/flag prerequisites.
// It only reads scenario definitions and evidence-source indexes; no story-specific IDs.
import {auditEvidenceSources} from './scenario-reachability.js';
export function createEvidenceStrategy(def,data){
 const sources=auditEvidenceSources(data);
 const goals=new Set();
 for(const ending of def.endings.filter(e=>e.kind!=='defeat'))for(const c of ending.conditions){
  if(c.type==='hasEvidence')goals.add(c.id);
 }
 const deductionByOutput=new Map();
 for(const d of data.investigation.deductions)for(const e of d.effects){
  if(['addKnowledge','setFlag'].includes(e.type))deductionByOutput.set(e.id,d);
 }
 function addDependencies(id,visited=new Set()){
  if(visited.has(id))return;
  visited.add(id);
  const d=deductionByOutput.get(id);
  if(!d)return;
  const walk=c=>{
   if(c.type==='hasEvidence')goals.add(c.id);
   if(c.type==='hasKnowledge'||c.type==='flagEquals')addDependencies(c.id,visited);
   for(const child of c.conditions||[])walk(child);
   if(c.condition)walk(c.condition);
  };
  walk(d.conditions);
 }
 for(const ending of def.endings.filter(e=>e.kind!=='defeat'))for(const c of ending.conditions){
  if(c.type==='hasKnowledge'||c.type==='flagEquals')addDependencies(c.id);
  if(c.type==='minKnowledgeCount')for(const id of c.ids)addDependencies(id);
 }
 const cardGoals=new Map();
 for(const id of goals)for(const source of sources[id]||[]){
  if(!cardGoals.has(source.cardId))cardGoals.set(source.cardId,new Set());
  cardGoals.get(source.cardId).add(id);
 }
 const missing=(ids,g)=>[...ids].filter(id=>!g.evidence.includes(id));
 return {
  goals:[...goals],
  chooseLocation(locations,g){
   if(!locations.length)return null;
   const ranked=locations.map(id=>({
    id,score:data.cards.filter(c=>c.locationId===id&&!Object.hasOwn(g.resolved,c.id)).reduce((n,c)=>n+(cardGoals.has(c.id)?missing(cardGoals.get(c.id),g).length:0),0)
   })).sort((a,b)=>b.score-a.score);
   if(ranked[0].score>0)return ranked[0].id;
   return def.finaleLocationId&&locations.includes(def.finaleLocationId)?def.finaleLocationId:locations[0];
  },
  chooseChoice(choices,g,card){
   const needed=cardGoals.get(card.id);
   if(!needed)return choices[0];
   return [...choices].sort((a,b)=>{
    const score=c=>Object.values(data.byId[card.id].choices.find(x=>x.id===c.id).outcomes).reduce((n,o)=>n+(o.effects||[]).filter(e=>e.type==='addEvidence'&&needed.has(e.id)&&!g.evidence.includes(e.id)).length,0);
    return score(b)-score(a);
   })[0];
  }
 };
}
