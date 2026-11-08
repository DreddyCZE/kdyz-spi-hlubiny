// Isolated scenario myth phase. Legacy save v4 and endRound remain untouched.
// Events are public only after being drawn; no hidden future event projection.
export const mythEvents=Object.freeze([
  {id:'myth-bell',title:'První úder',text:'Zvon zazní pod hladinou. Příliv se zvedá.',effects:[{type:'modifyRitual',amount:1}]},
  {id:'myth-fog',title:'Mlžná stěna',text:'Ulice mizí v mlze. V přístavu se cosi pohybuje.',effects:[{type:'spawnEnemy',enemyId:'enemy-drowned-sailor',locationId:'location-0'}]},
  {id:'myth-knock',title:'Tři zaklepání',text:'Ze zavřeného domu se ozvou tři údery.',effects:[{type:'modifyThreat',amount:1}]},
  {id:'myth-hound',title:'Stopy v mlze',text:'Na dlažbě se objevují mokré otisky tlap.',effects:[{type:'spawnEnemy',enemyId:'enemy-fog-hound',locationId:'location-1'}]},
  {id:'myth-lantern',title:'Zhaslá lucerna',text:'Na okamžik zmizí světlo majáku.',effects:[{type:'modifyRitual',amount:1}]},
  {id:'myth-orderly',title:'Noční obchůzka',text:'V ústavu se otevřou dveře prázdného pokoje.',effects:[{type:'spawnEnemy',enemyId:'enemy-hollow-orderly',locationId:'location-3'}]},
]);
const clamp=(n,max)=>Math.max(0,Math.min(n,max));
export function newMythState(){return {cursor:0,history:[],enemies:[],threat:2,ritual:1,round:1};}
export function mythPhase(state,revision){
  if(!Number.isInteger(revision)||revision!==state.history.length||state.round>7)return state;
  const event=mythEvents[state.cursor%mythEvents.length];
  const next=structuredClone(state);
  for(const effect of event.effects){
    if(effect.type==='modifyRitual')next.ritual=clamp(next.ritual+effect.amount,8);
    else if(effect.type==='modifyThreat')next.threat=clamp(next.threat+effect.amount,10);
    else if(effect.type==='spawnEnemy'&&!next.enemies.some(e=>e.enemyId===effect.enemyId&&e.locationId===effect.locationId))
      next.enemies.push({enemyId:effect.enemyId,locationId:effect.locationId});
  }
  next.cursor++;next.history.push(event.id);next.round++;
  return next;
}
export function publicMyth(state){
  const last=state.history.at(-1);
  const event=mythEvents.find(e=>e.id===last);
  return {round:state.round,threat:state.threat,ritual:state.ritual,enemies:structuredClone(state.enemies),
    ...(event?{lastEvent:{id:event.id,title:event.title,text:event.text}}:{})};
}
