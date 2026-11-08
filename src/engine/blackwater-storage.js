// Scenario-specific local save. Never reuse or migrate legacy v4 save keys.
const KEY='ksh-blackwater-v1';
export function saveBlackwater(storage,state){
 try{if(!storage)return false;storage.setItem(KEY,JSON.stringify(state));return true;}catch{return false;}
}
export function loadBlackwater(storage){
 try{
  if(!storage)return null;
  const value=JSON.parse(storage.getItem(KEY));
  if(!value||value.scenario!=='blackwater'||value.version!==1||!Number.isSafeInteger(value.revision)||value.revision<0)return null;
  if(!value.game||value.game.version!==4||!Array.isArray(value.game.inventory)||!value.myth||!Array.isArray(value.myth.enemies)||!Array.isArray(value.myth.history))return null;
  if(!Array.isArray(value.game.log)||typeof value.game.locationId!=='string'||!Number.isInteger(value.game.round))return null;
  return value;
 }catch{return null;}
}
export function clearBlackwater(storage){try{storage?.removeItem(KEY);return true;}catch{return false;}}
