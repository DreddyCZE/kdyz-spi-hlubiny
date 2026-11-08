// Deterministic budget and reachability explorer for scenario design.
// This does NOT simulate the card engine, dice or tactical combat.
export function assessRoute(def,route){
 const errors=[];
 const costs=['moves','choices','combat','rest','preparation'];
 for(const k of costs)if(!Number.isSafeInteger(route[k]??0)||(route[k]??0)<0)errors.push(k+' must be nonnegative integer');
 const total=costs.reduce((n,k)=>n+(route[k]||0),0);
 const budget=def.rules.apPerRound*def.rules.maxRounds;
 const remaining=budget-total;
 const roundsNeeded=Math.ceil(total/def.rules.apPerRound);
 return {name:route.name,total,budget,remaining,roundsNeeded,withinBudget:errors.length===0&&total<=budget,errors};
}
export function assessRoutes(def,routes){return routes.map(r=>assessRoute(def,r));}
export function graphReachability(edges,starts){
 const seen=new Set(starts),queue=[...starts];
 while(queue.length){const id=queue.shift();for(const next of edges[id]||[])if(!seen.has(next)){seen.add(next);queue.push(next);}}
 return seen;
}
export function analyzeClueFallbacks(clues,edges,starts){
 const reachable=graphReachability(edges,starts);
 return clues.map(c=>({id:c.id,availableSources:c.sources.filter(s=>reachable.has(s)),hasFallback:c.sources.filter(s=>reachable.has(s)).length>=2}));
}
