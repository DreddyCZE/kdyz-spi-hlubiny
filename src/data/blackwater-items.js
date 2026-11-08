// Blackwater-only inventory definitions; no changes to legacy catalog.
export const blackwaterItems=Object.freeze([
 {id:'bw-bandage',name:'Obvazy',kind:'consumable',description:'Obnoví 2 zdraví.',effect:{type:'heal',amount:2}},
 {id:'bw-laudanum',name:'Uklidňující tinktura',kind:'consumable',description:'Obnoví 2 příčetnosti.',effect:{type:'calm',amount:2}},
 {id:'bw-salt',name:'Posvěcená sůl',kind:'consumable',description:'Umožní zahnat protivníka a ukončit střetnutí.',effect:{type:'banish'}},
 {id:'bw-revolver',name:'Rezavý revolver',kind:'equipment',description:'Při útoku přidává +1 k součtu hodu. Funguje automaticky, pokud ji neseš.'},
 {id:'bw-bell-key',name:'Zvoníkův klíč',kind:'quest',description:'Odemkne zvláštní možnost u majáku.'},
 {id:'bw-cylinder',name:'Fonografický váleček',kind:'quest',description:'Zachycuje hlas zvonu.'},
 {id:'bw-tide-page',name:'Stránka z knihy přílivů',kind:'quest',description:'Popisuje čas rituálu.'},
]);
export const blackwaterItemById=Object.freeze(Object.fromEntries(blackwaterItems.map(i=>[i.id,i])));
export function startingInventory(){return ['bw-bandage','bw-salt'];}
export function useBlackwaterItem(state,id,limits={hp:6,san:8}){
 const item=blackwaterItemById[id];
 if(!item||item.kind!=='consumable'||!state.inventory.includes(id)||state.ended)return state;
 if(item.effect.type==='heal'&&state.hp>=limits.hp)return state;
 if(item.effect.type==='calm'&&state.san>=limits.san)return state;
 const next=structuredClone(state);
 if(item.effect.type==='heal')next.hp=Math.min(limits.hp,next.hp+item.effect.amount);
 else if(item.effect.type==='calm')next.san=Math.min(limits.san,next.san+item.effect.amount);
 else return state; // Banish is handled by the combat-aware scenario transition.
 next.inventory=next.inventory.filter(x=>x!==id);
 return next;
}
