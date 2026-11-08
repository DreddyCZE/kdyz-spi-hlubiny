// P1: pure, data-driven scenario contract. No legacy runtime mutation.
const idPattern=/^[a-z0-9][a-z0-9-]*$/;
const isId=v=>typeof v==='string'&&idPattern.test(v);
const unique=a=>new Set(a).size===a.length;
export const endingKinds=Object.freeze(['victory','costlyVictory','sacrifice','defeat']);
export const supportedModules=Object.freeze(['scenario-clock','conditional-events']);
export const conditionTypes=Object.freeze(['hasKnowledge','hasEvidence','flagEquals','clockAtLeast','clockBelow','minKnowledgeCount']);
export function validateScenario(def){
  const errors=[],err=(p,m)=>errors.push(p+': '+m);
  if(!def||typeof def!=='object'||Array.isArray(def))return ['scenario: expected object'];
  for(const k of Object.keys(def))if(!['id','version','title','rules','modules','locations','clocks','endings','finaleLocationId'].includes(k))err(k,'unknown field');
  if(!isId(def.id))err('id','invalid ID');
  if(!Number.isSafeInteger(def.version)||def.version<1)err('version','positive integer required');
  if(typeof def.title!=='string'||!def.title.trim())err('title','nonempty title required');
  const rules=def.rules||{};
  if(def.finaleLocationId!==undefined&&(!isId(def.finaleLocationId)||!def.locations?.includes(def.finaleLocationId)))err('finaleLocationId','must refer to a scenario location');
  if(!Number.isSafeInteger(rules.apPerRound)||rules.apPerRound<1||rules.apPerRound>10)err('rules.apPerRound','expected 1..10');
  if(!Number.isSafeInteger(rules.maxRounds)||rules.maxRounds<1||rules.maxRounds>100)err('rules.maxRounds','expected 1..100');
  if(!['manual','automatic'].includes(rules.deductionMode))err('rules.deductionMode','manual or automatic required');
  if(!Array.isArray(def.modules)||!unique(def.modules)||def.modules.some(x=>!supportedModules.includes(x)))err('modules','unsupported or duplicate module');
  if(!Array.isArray(def.locations)||!def.locations.length||!unique(def.locations)||def.locations.some(x=>!isId(x)))err('locations','unique IDs required');
  if(!Array.isArray(def.clocks)||!unique(def.clocks.map(c=>c.id)))err('clocks','unique clocks required');
  for(const [i,c] of (def.clocks||[]).entries()){
    if(!isId(c.id))err('clocks['+i+'].id','invalid ID');
    if(!Number.isSafeInteger(c.max)||c.max<1)err('clocks['+i+'].max','positive integer required');
    if(!Number.isSafeInteger(c.initial)||c.initial<0||c.initial>c.max)err('clocks['+i+'].initial','out of range');
    if(typeof c.label!=='string'||!c.label.trim())err('clocks['+i+'].label','required');
    if(c.milestones!==undefined&&(!Array.isArray(c.milestones)||!unique(c.milestones.map(m=>m.round))||c.milestones.some(m=>!Number.isSafeInteger(m.round)||m.round<2||m.round>rules.maxRounds+1||!Number.isSafeInteger(m.value)||m.value<c.initial||m.value>c.max)))err('clocks['+i+'].milestones','invalid milestones');
  }
  if((def.clocks||[]).length&&!def.modules?.includes('scenario-clock'))err('modules','scenario-clock required for clocks');
  if(!Array.isArray(def.endings)||!def.endings.length||!unique(def.endings.map(e=>e.id)))err('endings','unique endings required');
  const clockIds=(def.clocks||[]).map(c=>c.id);
  for(const [i,e] of (def.endings||[]).entries()){
    if(!isId(e.id))err('endings['+i+'].id','invalid ID');
    if(!endingKinds.includes(e.kind))err('endings['+i+'].kind','invalid kind');
    if(typeof e.title!=='string'||!e.title.trim())err('endings['+i+'].title','required');
    if(!Array.isArray(e.conditions))err('endings['+i+'].conditions','array required');
    for(const [j,c] of (e.conditions||[]).entries()){
      const p='endings['+i+'].conditions['+j+']';
      if(!conditionTypes.includes(c.type)||(c.type!=='minKnowledgeCount'&&!isId(c.id)))err(p,'invalid condition');
      if(['clockAtLeast','clockBelow'].includes(c.type)&&(!clockIds.includes(c.id)||!Number.isSafeInteger(c.value)))err(p,'invalid clock threshold');
      if(c.type==='minKnowledgeCount'&&(!Array.isArray(c.ids)||!c.ids.length||!unique(c.ids)||c.ids.some(id=>!isId(id))||!Number.isSafeInteger(c.value)||c.value<1||c.value>c.ids.length))err(p,'invalid knowledge threshold');
      if(c.type==='flagEquals'&&!['boolean','number','string'].includes(typeof c.value))err(p,'scalar expected');
    }
  }
  return errors;
}
export function createScenario(def){
  const errors=validateScenario(def);
  if(errors.length)throw new Error('Invalid scenario:\n'+errors.join('\n'));
  return deepFreeze(structuredClone(def));
}
function deepFreeze(v){if(v&&typeof v==='object'){for(const child of Object.values(v))deepFreeze(child);Object.freeze(v);}return v;}
export function initialScenarioState(def){
  return {schemaVersion:1,scenarioId:def.id,scenarioVersion:def.version,clocks:Object.fromEntries(def.clocks.map(c=>[c.id,c.initial])),eventLedger:[],endingId:null};
}
export function conditionSatisfied(c,state,scenario){
  switch(c.type){
    case 'hasKnowledge':return (state.knowledge||[]).includes(c.id);
    case 'minKnowledgeCount':return c.ids.filter(id=>(state.knowledge||[]).includes(id)).length>=c.value;
    case 'hasEvidence':return (state.evidence||[]).includes(c.id);
    case 'flagEquals':return state.flags?.[c.id]===c.value;
    case 'clockAtLeast':return (scenario.clocks[c.id]??-1)>=c.value;
    case 'clockBelow':return (scenario.clocks[c.id]??Infinity)<c.value;
    default:return false;
  }
}
export function availableEndings(def,game,scenario){
  if(scenario.scenarioId!==def.id||scenario.endingId)return [];
  return def.endings.filter(e=>e.conditions.every(c=>conditionSatisfied(c,game,scenario)));
}
export function chooseEnding(def,game,scenario,id){
  if(scenario.endingId||!availableEndings(def,game,scenario).some(e=>e.id===id))return scenario;
  return {...scenario,endingId:id};
}
export function advanceClock(def,scenario,id,amount,eventId){
  const c=def.clocks.find(c=>c.id===id);
  if(!c||scenario.endingId||!Number.isSafeInteger(amount)||!isId(eventId)||scenario.eventLedger.includes(eventId))return scenario;
  return {...scenario,clocks:{...scenario.clocks,[id]:Math.max(0,Math.min(c.max,scenario.clocks[id]+amount))},eventLedger:[...scenario.eventLedger,eventId]};
}
