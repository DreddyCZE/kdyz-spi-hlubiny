// Scenario-only investigators. Base attributes and legacy saves are unchanged.
export const investigators=Object.freeze([
 {id:'detective',name:'Detektiv',role:'Pátrání',hp:6,san:8,startingItems:['bw-bandage','bw-salt'],ability:'Jednou za scénář může získat 1 dodatečný akční bod.'},
 {id:'occultist',name:'Okultistka',role:'Rituály',hp:5,san:9,startingItems:['bw-salt','bw-laudanum'],ability:'Jednou za scénář může snížit postup rituálu o 1.'},
 {id:'sailor',name:'Námořník',role:'Přežití',hp:7,san:7,startingItems:['bw-bandage','bw-revolver'],ability:'Jednou za scénář může obnovit 2 zdraví.'},
]);
export const investigatorById=Object.freeze(Object.fromEntries(investigators.map(i=>[i.id,i])));
export function selectInvestigator(state,id){
 const investigator=investigatorById[id];
 if(!investigator||state.revision!==0||state.game.round!==1||state.game.revision!==0)return state;
 const game=structuredClone(state.game);
 game.hp=investigator.hp;game.san=investigator.san;
 game.inventory=[...investigator.startingItems];
 return {...state,revision:state.revision+1,investigatorId:id,abilityUsed:false,game};
}
export function useInvestigatorAbility(state){
 const investigator=investigatorById[state.investigatorId];
 if(!investigator||state.abilityUsed||state.game.ended||state.combat?.status==='active')return state;
 const game=structuredClone(state.game);
 if(investigator.id==='detective')game.ap=Math.min(4,game.ap+1);
 if(investigator.id==='occultist')game.ritual=Math.max(0,game.ritual-1);
 if(investigator.id==='sailor'){
   if(game.hp>=investigator.hp)return state;
   game.hp=Math.min(investigator.hp,game.hp+2);
 }
 game.revision++;
 return {...state,revision:state.revision+1,game,abilityUsed:true};
}
