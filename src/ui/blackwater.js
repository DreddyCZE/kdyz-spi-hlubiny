import {newBlackwaterGame,blackwaterTransition,publicBlackwater,blackwaterContent} from '../engine/blackwater.js';
import {investigators,investigatorById} from '../data/blackwater-investigators.js';
import {blackwaterItemById} from '../data/blackwater-items.js';
import {enemies as enemyDefinitions} from '../engine/combat.js';
import {rollDice,labels} from '../engine/game.js';
import {blackwaterMap} from '../data/map.js';
import {locations} from '../data/locations.js';
import {imageForCard} from '../data/story-art.js';
const $=id=>document.getElementById(id);
let state=newBlackwaterGame(),rolling=false;
const enemyName=id=>enemyDefinitions.find(e=>e.id===id)?.name||id;
function button(label,action,disabled=false,cls=''){const b=document.createElement('button');b.textContent=label;b.disabled=disabled;b.className=cls;b.onclick=action;return b;}
function send(type,rest={}){
 if(rolling)return false;
 const next=blackwaterTransition(state,{type,revision:state.revision,...rest});
 if(next===state){$('message').textContent='Akce nyní není dostupná.';return false;}
 state=next;$('message').textContent='';render();return true;
}
function resolveCard(card,choice){
 if(rolling)return;
 const dice=choice.test?rollDice():null;
 const next=blackwaterTransition(state,{type:'resolve',revision:state.revision,cardId:card.id,choiceId:choice.id,...(dice?{dice}:{})});
 if(next===state){$('message').textContent='Rozhodnutí nelze provést.';return;}
 state=next;
 if(!dice){render();return;}
 rolling=true;render();
 const diceBox=$('dice');diceBox.hidden=false;diceBox.classList.add('rolling');
 $('result').textContent='Osud rozhoduje…';$('die1').textContent='?';$('die2').textContent='?';
 const delay=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:850;
 window.setTimeout(()=>{rolling=false;render();},delay);
}
function render(){
 const view=publicBlackwater(state);
 $('setup').hidden=Boolean(state.investigatorId);$('game').hidden=!state.investigatorId;
 $('investigators').replaceChildren(...investigators.map(i=>button(i.name+' · '+i.role+' · '+i.ability,()=>send('selectInvestigator',{investigatorId:i.id}),false,'investigator-card')));
 if(!state.investigatorId)return;
 const investigator=investigatorById[state.investigatorId];
 $('investigatorName').textContent=investigator.name;$('investigatorRole').textContent=investigator.role+' · '+investigator.ability;
 const stats=[['Kolo',view.round+'/7'],['Akční body',view.ap],['Zdraví',view.hp+'/'+investigator.hp],['Příčetnost',view.san+'/'+investigator.san],['Hrozba',view.threat+'/10'],['Rituál',view.ritual+'/8']];
 $('stats').replaceChildren(...stats.map(([name,value])=>{const el=document.createElement('div');el.className='stat';const label=document.createElement('span');label.textContent=name;const strong=document.createElement('strong');strong.textContent=value;el.append(label,strong);return el;}));
 $('locations').replaceChildren(...locations.map(loc=>{
  const current=loc.id===view.locationId,enemyCount=view.myth.enemies.filter(e=>e.locationId===loc.id).length;
  const b=button((current?'◉ ':'')+loc.name+(enemyCount?' ◆'+enemyCount:''),()=>send('move',{locationId:loc.id}),rolling||view.ended||current||view.ap<1||state.combat?.status==='active','map-point'+(current?' active':'')+(enemyCount?' enemy':''));
  b.style.left=blackwaterMap.points[loc.id].x+'%';b.style.top=blackwaterMap.points[loc.id].y+'%';
  if(current)b.setAttribute('aria-current','location');return b;
 }));
 const place=locations.find(l=>l.id===view.locationId);$('place').textContent=place.name;$('description').textContent=place.description;
 $('enemies').replaceChildren(...view.myth.enemies.filter(e=>e.locationId===view.locationId).map(e=>button('⚔ '+enemyName(e.enemyId),()=>send('startCombat',{enemyId:e.enemyId}),rolling||view.ended||Boolean(state.combat)||view.ap<1)));
 if(!$('enemies').children.length)$('enemies').textContent='Zatím klid. Jen mlha se pohybuje.';
 $('items').replaceChildren(...view.inventory.map(id=>button('▱ '+(blackwaterItemById[id]?.name||id),()=>send('useItem',{itemId:id}),rolling||view.ended)));
 if(!view.inventory.length)$('items').textContent='Prázdný inventář.';
 $('ability').disabled=rolling||view.abilityUsed||view.ended||state.combat?.status==='active';
 $('ability').textContent=view.abilityUsed?'Schopnost vyčerpána':'✦ Použít schopnost';
 $('deckName').textContent=view.exploration.name;
 $('deckCount').textContent='Zbývá '+view.exploration.available+' karet';
 $('draw').disabled=rolling||view.ended||Boolean(view.card)||!view.exploration.canDraw||state.combat?.status==='active';
 const card=view.card;
 $('cardTitle').textContent=card?.title||'Co ukrývá mlha?';
 $('cardText').textContent=card?.description||'Otoč kartu a vstup do příběhu. Následky rozhodnutí se odhalí teprve po vyhodnocení.';
 $('cardType').textContent=card?({encounter:'SETKÁNÍ',event:'UDÁLOST',item:'PŘEDMĚT',evidence:'DŮKAZ'}[card.type]||'PŘÍBĚH'):'NEODHALENÁ KARTA';
 $('storyArt').style.backgroundImage='linear-gradient(0deg,#1a2828,#0000 75%),url("'+new URL(imageForCard(card),document.baseURI).href+'")';
 $('choices').replaceChildren(...(card?.choices||[]).map(choice=>button(choice.label+' · '+choice.apCost+' AP'+(choice.test?' · '+choice.test.attribute+' / '+choice.test.difficulty:''),()=>resolveCard(card,choice),rolling||!choice.available||Boolean(view.result)||state.combat?.status==='active')));
 const result=view.result;
 $('dice').hidden=!result||!result.dice;
 $('dice').classList.toggle('rolling',rolling);
 $('die1').textContent=rolling?'?':result?.dice?.[0]??'?';$('die2').textContent=rolling?'?':result?.dice?.[1]??'?';
 $('diceTotal').textContent=!rolling&&result?.dice?'Součet '+result.total:'';
 $('result').textContent=rolling?'Osud rozhoduje…':result?labels[result.key]+' — '+result.text:card?'Následky zůstávají skryté. Zvol postup a odhal svůj osud.':'Balíček čeká na první průzkum.';
 $('next').disabled=rolling||!result||view.ended;
 $('combat').replaceChildren();
 if(view.combat){
  const info=document.createElement('p');info.textContent=enemyName(view.combat.enemyId)+' · HP '+view.combat.enemyHp+' · '+view.combat.status;$('combat').append(info);
  if(view.combat.status==='active')$('combat').append(button('🎲 Útok',()=>send('combatTurn',{move:'attack',dice:rollDice()}),rolling),button('🎲 Útěk',()=>send('combatTurn',{move:'escape',dice:rollDice()}),rolling));
  else $('combat').append(button('Ukončit střetnutí',()=>send('closeCombat'),rolling));
 }else $('combat').textContent='Žádné aktivní střetnutí.';
 $('myth').textContent=view.myth.lastEvent?view.myth.lastEvent.title+' — '+view.myth.lastEvent.text:'Noc zatím mlčí.';
 $('endRound').disabled=rolling||view.ended||view.round>=7||state.combat?.status==='active';
 $('log').replaceChildren(...state.game.log.slice(0,12).map(entry=>{const p=document.createElement('p');p.textContent=entry;return p;}));
 if(view.ended)$('message').textContent='Scénář skončil. Temnota zvítězila.';
}
$('draw').onclick=()=>send('draw');$('next').onclick=()=>send('next');$('endRound').onclick=()=>send('endRound');$('ability').onclick=()=>send('useAbility');render();
