import {saveBlackwater,loadBlackwater,clearBlackwater} from '../engine/blackwater-storage.js';
import {newBlackwaterGame,blackwaterTransition,publicBlackwater,blackwaterContent} from '../engine/blackwater.js';
import {investigators,investigatorById} from '../data/blackwater-investigators.js';
import {blackwaterItemById} from '../data/blackwater-items.js';
import {enemies as enemyDefinitions} from '../engine/combat.js';
import {rollDice,labels} from '../engine/game.js';
import {blackwaterMap} from '../data/map.js';
import {blackwaterRoutes} from '../engine/blackwater-map.js';
import {locations} from '../data/locations.js';
import {imageForCard} from '../data/story-art.js';
import {rewards} from '../data/catalog.js';
const $=id=>document.getElementById(id);
let storage;try{storage=window.localStorage;}catch{/* Private browsing may block storage. */}
let state=loadBlackwater(storage)||newBlackwaterGame(),rolling=false,journalOpen=false;
const enemyName=id=>enemyDefinitions.find(e=>e.id===id)?.name||id;
const investigatorFlavor={detective:'V Blackwateru se pohřešovaní nikdy neztrácejí beze stopy. Jen někdo musí mít odvahu hledat tam, kde ostatní zavírají dveře.',occultist:'V zakázaných knihách už četla o zvonech, které znějí pod hladinou. Teď poprvé slyší jeden na vlastní uši.',sailor:'Příliv zná lépe než vlastní dlaň. Ale této noci se moře vrací s něčím, co nikdy nemělo vyplout.'};
const investigatorGlyph={detective:'⌕',occultist:'✧',sailor:'⚓'};
const itemGlyph={ 'bw-bandage':'✚','bw-laudanum':'⚗','bw-salt':'✧','bw-revolver':'⌁','bw-bell-key':'⚿','bw-cylinder':'♫','bw-tide-page':'▤'};
const locationGlyph={'location-0':'⚓','location-1':'⌂','location-2':'▤','location-3':'✚','location-4':'✝','location-5':'✦','location-6':'◆'};
function button(label,action,disabled=false,cls=''){const b=document.createElement('button');b.textContent=label;b.disabled=disabled;b.className=cls;b.onclick=action;return b;}
function send(type,rest={}){
 if(rolling)return false;
 const next=blackwaterTransition(state,{type,revision:state.revision,...rest});
 if(next===state){$('message').textContent='Akce nyní není dostupná.';return false;}
 state=next;saveBlackwater(storage,state);$('message').textContent='';render();return true;
}
function resolveCard(card,choice){
 if(rolling)return;
 const dice=choice.test?rollDice():null;
 const next=blackwaterTransition(state,{type:'resolve',revision:state.revision,cardId:card.id,choiceId:choice.id,...(dice?{dice}:{})});
 if(next===state){$('message').textContent='Rozhodnutí nelze provést.';return;}
 state=next;saveBlackwater(storage,state);
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
 $('quickStats').replaceChildren(...[['♥',view.hp+'/'+investigator.hp,'Zdraví'],['◈',view.san+'/'+investigator.san,'Příčetnost'],['⚡',view.ap,'Akční body'],['◷',view.round+'/7','Kolo'],['☠',view.threat,'Hrozba'],['✧',view.ritual,'Rituál']].map(([symbol,value,label])=>{const el=document.createElement('span');el.className='quick-stat';el.title=label;el.textContent=symbol+' '+value;return el;}));
 $('characterTitle').textContent=investigator.name;
 $('characterFlavor').textContent=investigatorFlavor[investigator.id];
 $('characterGlyph').textContent=investigatorGlyph[investigator.id];
 $('characterAbility').textContent=investigator.ability+(view.abilityUsed?' (Vyčerpána)':'');
 $('characterStats').textContent='♥ '+view.hp+'/'+investigator.hp+'   ◈ '+view.san+'/'+investigator.san+'   ⚡ '+view.ap;
 $('stats').replaceChildren(...stats.map(([name,value])=>{const el=document.createElement('div');el.className='stat';const label=document.createElement('span');label.textContent=name;const strong=document.createElement('strong');strong.textContent=value;el.append(label,strong);return el;}));
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.classList.add('map-routes');svg.setAttribute('aria-hidden','true');
 for(const [from,neighbors] of Object.entries(blackwaterRoutes))for(const to of neighbors){
  if(from>=to)continue;
  const line=document.createElementNS('http://www.w3.org/2000/svg','line');
  const a=blackwaterMap.points[from],b=blackwaterMap.points[to];
  line.setAttribute('x1',a.x);line.setAttribute('y1',a.y);line.setAttribute('x2',b.x);line.setAttribute('y2',b.y);
  if(from===view.locationId||to===view.locationId)line.classList.add('reachable-route');
  svg.append(line);
 }
 const pins=locations.map(loc=>{
  const current=loc.id===view.locationId,reachable=blackwaterRoutes[view.locationId]?.includes(loc.id),enemyCount=view.myth.enemies.filter(e=>e.locationId===loc.id).length;
  const b=button((current?'◉ ':reachable?'➤ ':'• ')+loc.name+(enemyCount?' ◆'+enemyCount:''),()=>send('move',{locationId:loc.id}),rolling||view.ended||current||!reachable||view.ap<1||state.combat?.status==='active','map-point'+(current?' active':'')+(reachable?' reachable':'')+(enemyCount?' enemy':''));
  b.style.left=blackwaterMap.points[loc.id].x+'%';b.style.top=blackwaterMap.points[loc.id].y+'%';
  b.title=current?'Aktuální poloha':reachable?'Přesun za 1 akční bod':'Není přímá cesta';
  b.dataset.symbol=locationGlyph[loc.id];
  if(current)b.setAttribute('aria-current','location');return b;
 });
 const tokens=view.myth.enemies.map((e,index)=>{const token=document.createElement('span');token.className='map-token enemy-token';token.textContent='◆';token.title=enemyName(e.enemyId)+' · '+(locations.find(l=>l.id===e.locationId)?.name||'');token.style.left=(blackwaterMap.points[e.locationId].x+5+index%2*2)+'%';token.style.top=(blackwaterMap.points[e.locationId].y-5)+'%';return token;});
 const playerToken=document.createElement('span');playerToken.className='map-token investigator-token';playerToken.textContent=investigatorGlyph[investigator.id];playerToken.title=investigator.name;playerToken.style.left=(blackwaterMap.points[view.locationId].x-5)+'%';playerToken.style.top=(blackwaterMap.points[view.locationId].y-5)+'%';
 $('locations').replaceChildren(svg,...pins,...tokens,playerToken);
 const place=locations.find(l=>l.id===view.locationId);$('place').textContent=place.name;$('description').textContent=place.description;
 $('enemies').replaceChildren(...view.myth.enemies.filter(e=>e.locationId===view.locationId).map(e=>button('⚔ '+enemyName(e.enemyId),()=>send('startCombat',{enemyId:e.enemyId}),rolling||view.ended||Boolean(state.combat)||view.ap<1)));
 if(!$('enemies').children.length)$('enemies').textContent='Zatím klid. Jen mlha se pohybuje.';
 $('items').replaceChildren(...view.inventory.map(id=>{const item=blackwaterItemById[id];const b=button('',()=>send('useItem',{itemId:id}),rolling||view.ended||item?.kind!=='consumable','item-card');const art=document.createElement('span');art.className='item-art';art.textContent=itemGlyph[id]||'✦';const title=document.createElement('strong');title.textContent=item?.name||id;const desc=document.createElement('small');desc.textContent=item?.description||'';b.append(art,title,desc);b.title=(item?.name||id)+': '+(item?.description||'');return b;}));
 if(!view.inventory.length)$('items').textContent='Prázdný inventář.';
 $('ability').disabled=rolling||view.abilityUsed||view.ended||state.combat?.status==='active';
 $('ability').textContent=view.abilityUsed?'Schopnost vyčerpána':'✦ Použít schopnost';
 $('deckName').textContent=view.exploration.name;
 $('deckCount').textContent='Zbývá '+view.exploration.available+' karet';
 $('deckHint').textContent=view.exploration.available===0?'Balíček je vyčerpaný. Pokračuj na jiné lokaci nebo ukonči kolo.':view.ap===0?'Nemáš akční body. Ukonči kolo.':'';
 $('draw').disabled=rolling||view.ended||Boolean(view.card)||!view.exploration.canDraw||state.combat?.status==='active';
 const card=view.card;
 $('story').classList.toggle('unrevealed',!card);
 $('cardBack').hidden=Boolean(card);
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
 const outcomeKeys=['criticalSuccess','greatSuccess','success','partialSuccess','failure','criticalFailure'];
 $('outcomes').replaceChildren(...(card?outcomeKeys.map(key=>{
  const slip=document.createElement('span');slip.className='outcome-slip'+(!rolling&&result?.key===key?' revealed':' sealed');
  slip.textContent=!rolling&&result?.key===key?labels[key]:'✦ ✦ ✦';
  slip.setAttribute('aria-label',!rolling&&result?.key===key?labels[key]:'Neodhalený výsledek');return slip;
 }):[]));
 $('result').hidden=!rolling&&!result;
 $('result').textContent=rolling?'Osud rozhoduje…':result?labels[result.key]+' — '+result.text:card?'Následky zůstávají skryté. Zvol postup a odhal svůj osud.':'Balíček čeká na první průzkum.';
 $('next').disabled=rolling||!result||view.ended;
 $('combatStage').hidden=!view.combat;
 $('combatClose').hidden=!view.combat||view.combat.status==='active';
 $('combat').replaceChildren();
 if(view.combat){
  const info=document.createElement('p');info.textContent=enemyName(view.combat.enemyId)+' · HP '+view.combat.enemyHp+' · '+view.combat.status;$('combat').append(info);
  if(view.combat.status==='active')$('combat').append(button('🎲 Útok',()=>send('combatTurn',{move:'attack',dice:rollDice()}),rolling),button('🎲 Útěk',()=>send('combatTurn',{move:'escape',dice:rollDice()}),rolling));
  else $('combat').append(button('Ukončit střetnutí',()=>send('closeCombat'),rolling));
 }else $('combat').textContent='Žádné aktivní střetnutí.';
 $('myth').textContent=view.myth.lastEvent?view.myth.lastEvent.title+' — '+view.myth.lastEvent.text:'Noc zatím mlčí.';
 $('endRound').disabled=rolling||view.ended||view.round>=7||state.combat?.status==='active';
 $('endRound').textContent=view.ap===0?'Pokračovat: fáze mýtu →':'Ukončit kolo ↗';
 $('journalToggle').setAttribute('aria-expanded',String(journalOpen));
 document.querySelector('.side-panel').classList.toggle('journal-open',journalOpen);
 const rewardName=id=>rewards.find(item=>item.id===id)?.name||id;
 const note=(id)=>{const p=document.createElement('p');p.className='journal-note';p.textContent='✧ '+rewardName(id);return p;};
 $('evidence').replaceChildren(...state.game.evidence.map(note));
 if(!state.game.evidence.length)$('evidence').textContent='Zatím žádné stopy.';
 $('knowledge').replaceChildren(...[...state.game.knowledge,...Object.keys(state.game.deductions).filter(id=>state.game.deductions[id])].map(note));
 if(!$('knowledge').children.length)$('knowledge').textContent='Dosud žádné závěry.';
 $('log').replaceChildren(...state.game.log.slice(0,12).map(entry=>{const p=document.createElement('p');p.textContent=entry;return p;}));
 if(view.ended)$('message').textContent='Scénář skončil. Temnota zvítězila.';
}
$('investigatorOpen').onclick=()=>$('investigatorDialog').showModal();
$('investigatorClose').onclick=()=>$('investigatorDialog').close();
$('investigatorDialog').onclick=e=>{if(e.target===$('investigatorDialog'))$('investigatorDialog').close();};
$('journalToggle').onclick=()=>{journalOpen=!journalOpen;render();};
$('combatClose').onclick=()=>send('closeCombat');
$('reset').onclick=()=>{if(!window.confirm('Začít novou hru? Současný postup se smaže.'))return;clearBlackwater(storage);state=newBlackwaterGame();rolling=false;render();};
$('draw').onclick=()=>send('draw');$('next').onclick=()=>send('next');$('endRound').onclick=()=>send('endRound');$('ability').onclick=()=>send('useAbility');render();
