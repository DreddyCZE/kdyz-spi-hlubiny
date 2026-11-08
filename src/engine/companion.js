// D3: pure optional companion rules. No AP, inventory or implicit puzzle solution.
const id=/^[a-z0-9][a-z0-9-]*$/;
const validId=x=>typeof x==='string'&&id.test(x);
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const unique=a=>new Set(a).size===a.length;
export function validateCompanion(def){
 const errors=[],fail=(path,message)=>errors.push(path+': '+message);
 if(!record(def))return ['companion: expected object'];
 for(const key of Object.keys(def))if(!['id','name','kind','availability','abilities'].includes(key))fail(key,'unknown field');
 if(!validId(def.id))fail('id','invalid');
 if(typeof def.name!=='string'||!def.name.trim())fail('name','required');
 if(!['human','animal'].includes(def.kind))fail('kind','human or animal required');
 if(!record(def.availability))fail('availability','required');
 else{
  for(const key of Object.keys(def.availability))if(!['locationId','evidenceId','flagId'].includes(key))fail('availability.'+key,'unknown field');
  for(const [key,value] of Object.entries(def.availability))if(!validId(value))fail('availability.'+key,'invalid ID');
 }
 if(!Array.isArray(def.abilities)||def.abilities.length>2||!unique((def.abilities||[]).map(a=>a?.id)))fail('abilities','at most two unique abilities');
 let active=0,passive=0;
 for(const [i,a] of (Array.isArray(def.abilities)?def.abilities:[]).entries()){
  if(!record(a)){fail('abilities['+i+']','expected object');continue;}
  for(const key of Object.keys(a))if(!['id','name','type','trigger','uses','text','discoveryFlagId'].includes(key))fail('abilities['+i+'].'+key,'unknown field');
  if(!validId(a.id)||typeof a.name!=='string'||!a.name.trim()||typeof a.text!=='string'||!a.text.trim())fail('abilities['+i+']','invalid identity or text');
  if(a.type==='active')active++;else if(a.type==='passive')passive++;else fail('abilities['+i+'].type','invalid');
  if(!['exploration','investigation','danger'].includes(a.trigger))fail('abilities['+i+'].trigger','invalid');
  if(a.uses!==(a.type==='active'?'oncePerRound':'passive'))fail('abilities['+i+'].uses','invalid');
  if(a.discoveryFlagId!==undefined&&(a.type!=='active'||!validId(a.discoveryFlagId)))fail('abilities['+i+'].discoveryFlagId','active ability requires valid flag');
 }
 if(active>1||passive>1)fail('abilities','at most one active and one passive');
 return errors;
}
export function createCompanion(def){
 const errors=validateCompanion(def);
 if(errors.length)throw new Error('Invalid companion:\n'+errors.join('\n'));
 return structuredClone(def);
}
export const initialCompanionState=()=>({activeId:null,usedRoundByAbility:{}});
export function companionAvailable(def,game){
 const a=def.availability;
 return (!a.locationId||a.locationId===game.locationId)&&(!a.evidenceId||game.evidence?.includes(a.evidenceId))&&(!a.flagId||game.flags?.[a.flagId]===true);
}
export function recruitCompanion(def,state,game){
 if(state.activeId||!companionAvailable(def,game))return null;
 return {...state,activeId:def.id,usedRoundByAbility:{}};
}
export function dismissCompanion(state){
 if(!state.activeId)return null;
 return initialCompanionState();
}
export function companionView(def,state,round){
 if(state.activeId!==def.id)return null;
 return {id:def.id,name:def.name,kind:def.kind,abilities:def.abilities.map(a=>({id:a.id,name:a.name,type:a.type,trigger:a.trigger,text:a.type==='passive'||state.usedRoundByAbility[a.id]!==undefined?a.text:null,available:a.type==='passive'||state.usedRoundByAbility[a.id]!==round}))};
}
export function useCompanionAbility(def,state,abilityId,trigger,round){
 if(state.activeId!==def.id||!Number.isSafeInteger(round)||round<1)return null;
 const ability=def.abilities.find(a=>a.id===abilityId);
 if(!ability||ability.type!=='active'||ability.trigger!==trigger||state.usedRoundByAbility[abilityId]===round)return null;
 return {...state,usedRoundByAbility:{...state.usedRoundByAbility,[abilityId]:round}};
}
