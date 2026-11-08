import {newBlackwaterGame,blackwaterTransition,publicBlackwater,blackwaterContent} from '../engine/blackwater.js';
import {investigators,investigatorById} from '../data/blackwater-investigators.js';
import {blackwaterItemById} from '../data/blackwater-items.js';
import {enemies as enemyDefinitions} from '../engine/combat.js';
import {rollDice,selectedChoice} from '../engine/game.js';
const $=id=>document.getElementById(id);
let state=newBlackwaterGame();
const enemyName=id=>enemyDefinitions.find(e=>e.id===id)?.name||id;
function button(label,action,disabled=false){
 const b=document.createElement('button');b.textContent=label;b.disabled=disabled;b.addEventListener('click',action);return b;
}
function send(type,rest={}){
 const next=blackwaterTransition(state,{type,revision:state.revision,...rest});
 if(next===state){$('message').textContent='Akce nyní není dostupná.';return;}
 state=next;$('message').textContent='';render();
}
function render(){
 const view=publicBlackwater(state),game=state.game;
 $('setup').hidden=Boolean(state.investigatorId);
 $('game').hidden=!state.investigatorId;
 $('investigators').replaceChildren(...investigators.map(i=>button(i.name+' — '+i.role+' · '+i.ability,()=>send('selectInvestigator',{investigatorId:i.id}))));
 if(!state.investigatorId)return;
 $('stats').textContent=`${investigatorById[state.investigatorId].name} · Kolo ${view.round}/7 · AP ${view.ap} · Zdraví ${view.hp} · Příčetnost ${view.san} · Hrozba ${view.threat} · Rituál ${view.ritual}`;
 $('locations').replaceChildren(...Object.values(blackwaterContent.locationsById).map(loc=>button(loc.name+(loc.id===view.locationId?' ●':''),()=>send('move',{locationId:loc.id}),view.ended||loc.id===view.locationId||view.ap<1||state.combat?.status==='active')));
 const place=blackwaterContent.locationsById[view.locationId];
 $('place').textContent=place.name;$('description').textContent=place.description;
 $('enemies').replaceChildren(...view.myth.enemies.filter(e=>e.locationId===view.locationId).map(e=>button('Střetnutí: '+enemyName(e.enemyId),()=>send('startCombat',{enemyId:e.enemyId}),view.ended||Boolean(state.combat)||view.ap<1)));
 if(!$('enemies').children.length)$('enemies').textContent='Zatím klid.';
 $('items').replaceChildren(...view.inventory.map(id=>button(blackwaterItemById[id]?.name||id,()=>send('useItem',{itemId:id}),view.ended)));
 $('ability').disabled=view.abilityUsed||view.ended||state.combat?.status==='active';
 $('draw').disabled=view.ended||Boolean(view.card)||!view.exploration.canDraw||state.combat?.status==='active';
 const card=view.card;
 $('story').replaceChildren();
 if(card){const title=document.createElement('h3');title.textContent=card.title;const p=document.createElement('p');p.textContent=card.description;$('story').append(title,p);}
 $('choices').replaceChildren(...(card?.choices||[]).map(choice=>button(choice.label+' · '+choice.apCost+' AP',()=>send('resolve',{cardId:card.id,choiceId:choice.id,...(choice.test?{dice:rollDice()}:{})}),!choice.available||Boolean(view.result)||state.combat?.status==='active')));
 $('result').textContent=view.result?view.result.text:'Výsledek rozhodnutí zůstává skrytý až do vyhodnocení.';
 $('next').disabled=!view.result||view.ended;
 $('combat').replaceChildren();
 if(view.combat){
  const info=document.createElement('p');info.textContent=enemyName(view.combat.enemyId)+' · HP '+view.combat.enemyHp+' · '+view.combat.status;$('combat').append(info);
  if(view.combat.status==='active'){
   $('combat').append(button('🎲 Zaútočit',()=>send('combatTurn',{move:'attack',dice:rollDice()})),button('🎲 Utéct',()=>send('combatTurn',{move:'escape',dice:rollDice()})));
  }else $('combat').append(button('Ukončit střetnutí',()=>send('closeCombat')));
 }
 $('myth').textContent=view.myth.lastEvent?view.myth.lastEvent.title+': '+view.myth.lastEvent.text:'Zatím žádná událost.';
 $('endRound').disabled=view.ended||view.round>=7||state.combat?.status==='active';
 if(view.ended)$('message').textContent='Scénář skončil. Temnota zvítězila.';
}
$('draw').onclick=()=>send('draw');
$('next').onclick=()=>send('next');
$('endRound').onclick=()=>send('endRound');
$('ability').onclick=()=>send('useAbility');
render();
