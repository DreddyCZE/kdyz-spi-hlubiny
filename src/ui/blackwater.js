import {saveBlackwater,loadBlackwater,clearBlackwater} from '../engine/blackwater-storage.js';
import {newBlackwaterGame,blackwaterTransition,publicBlackwater,blackwaterContent} from '../engine/blackwater.js';
import {investigators,investigatorById} from '../data/blackwater-investigators.js';
import {blackwaterItemById} from '../data/blackwater-items.js';
import {enemies as enemyDefinitions} from '../engine/combat.js';
import {rollDice,labels} from '../engine/game.js';
import {blackwaterMap} from '../data/map.js';
import {blackwaterRoutes} from '../engine/blackwater-map.js';
import {locations} from '../data/locations.js';
import {mythEvents} from '../engine/myth.js';
import {imageForCard,storyArt} from '../data/story-art.js';
import {rewards} from '../data/catalog.js';
const $=id=>document.getElementById(id);
let storage;try{storage=window.localStorage;}catch{/* Private browsing may block storage. */}
let state=loadBlackwater(storage)||newBlackwaterGame(),rolling=false,journalOpen=false,rollTimer=null,battleRolling=false,pendingReward=null;
const enemyName=id=>enemyDefinitions.find(e=>e.id===id)?.name||id;
const investigatorFlavor={detective:'V Blackwateru se pohřešovaní nikdy neztrácejí beze stopy. Jen někdo musí mít odvahu hledat tam, kde ostatní zavírají dveře.',occultist:'V zakázaných knihách už četla o zvonech, které znějí pod hladinou. Teď poprvé slyší jeden na vlastní uši.',sailor:'Příliv zná lépe než vlastní dlaň. Ale této noci se moře vrací s něčím, co nikdy nemělo vyplout.'};
const investigatorGlyph={detective:'⌕',occultist:'✧',sailor:'⚓'};
const itemGlyph={ 'bw-bandage':'✚','bw-laudanum':'⚗','bw-salt':'✧','bw-revolver':'⌁','bw-bell-key':'⚿','bw-cylinder':'♫','bw-tide-page':'▤'};
const locationGlyph={'location-0':'⚓','location-1':'⌂','location-2':'▤','location-3':'✚','location-4':'✝','location-5':'✦','location-6':'◆'};

const mythGlyphs={'myth-bell':'♢','myth-fog':'≋','myth-knock':'⌂','myth-hound':'♧','myth-lantern':'✧','myth-orderly':'✚'};
function mythEffectText(event){return event.effects.map(effect=>effect.type==='modifyRitual'?'Rituál +'+effect.amount:effect.type==='modifyThreat'?'Hrozba +'+effect.amount:effect.type==='spawnEnemy'?'Nový nepřítel: '+enemyName(effect.enemyId):'Událost').join(' · ');}
function showMythCard(event,index){
 $('mythGlyph').textContent=mythGlyphs[event.id]||'✦';
 $('mythCardNumber').textContent='UDÁLOST '+index+' / FÁZE MÝTU';
 $('mythCardTitle').textContent=event.title;
 $('mythCardText').textContent=event.text;
 $('mythCardEffect').textContent='ÚČINEK: '+mythEffectText(event);
 $('mythDialog').showModal();
}
function showMythHistory(){
 const ids=state.myth.history;
 $('mythHistoryCards').replaceChildren(...ids.map((id,index)=>{
  const event=mythEvents.find(item=>item.id===id);
  if(!event)return document.createTextNode('');
  const card=document.createElement('article');card.className='myth-discard-card';
  const symbol=document.createElement('span');symbol.className='myth-discard-glyph';symbol.textContent=mythGlyphs[id]||'✦';
  const heading=document.createElement('h3');heading.textContent=(index+1)+'. '+event.title;
  const story=document.createElement('p');story.textContent=event.text;
  const effect=document.createElement('small');effect.textContent=mythEffectText(event);
  card.append(symbol,heading,story,effect);return card;
 }));
 if(!ids.length)$('mythHistoryCards').textContent='Zatím nebyla odhalena žádná karta mýtu.';
 $('mythHistoryDialog').showModal();
}
const locationArrival={
 'location-0':'Slaná voda naráží do prázdných mol. Lana vržou v nárazech větru, ačkoli žádná loď neodplouvá. Pod prkny cosi třikrát udeří do pilířů. Pak přístav znovu ztichne.',
 'location-1':'Úzké ulice starého města jsou prázdné. Za zataženými závěsy se mihne světlo, které vzápětí zhasne. Z dálky se ozve zvon, ale nikdo nedokáže určit, odkud přichází.',
 'location-2':'Vysoká okna knihovny odrážejí zataženou oblohu. Mezi regály voní prach a mokrý papír. Na čtenářském stole leží rozevřený svazek, jako by od něj někdo právě odešel.',
 'location-3':'Za železnou branou ústavu se ozývají kroky, které nepatří žádnému viditelnému člověku. V jednom okně se objeví bledá tvář. Když vzhlédneš podruhé, zůstává jen prázdné sklo.',
 'location-4':'Hřbitovní brána se otevírá s táhlým skřípěním. Na některých náhrobcích jsou čerstvé květiny, přestože se sem obyvatelé po setmění neodvažují. Zem pod nohama je podivně teplá.',
 'location-5':'Maják se tyčí nad černou vodou. Jeho paprsek přejíždí po hladině, ačkoli přívod elektřiny byl před lety odpojen. Z vrcholu schodiště se ozývá pomalé, pravidelné klepání.',
 'location-6':'Příliv na okamžik ustoupí a odhalí vstup do jeskyní. Skály jsou hladké jako vyleštěný kámen. Z temnoty vane vzduch páchnoucí solí a něčím mnohem starším než samotné město.'
};
function showTransition(kind,title,description,symbol,artUrl=null){
 const dialog=$('transitionDialog');
 $('transitionKicker').textContent=kind;$('transitionTitle').textContent=title;
 $('transitionText').textContent=description;$('transitionSymbol').textContent=symbol;
 $('transitionArtwork').style.backgroundImage=artUrl?'linear-gradient(0deg,#08171499,#08171410),url("'+artUrl+'")':'none';
 dialog.dataset.kind=kind;
 if(!dialog.open)dialog.showModal();
}
const monsterFlavor={
 'enemy-drowned-sailor':'Z promočeného kabátu odkapává mořská voda. Muž před tebou nemá dech, přesto ze rtů uniká melodie potopeného zvonu.',
 'enemy-fog-hound':'Z mlhy se vynoří zvíře bez stínu. Jeho tlapy nevydávají zvuk a mezi zuby se zachytává šedé světlo.',
 'enemy-hollow-orderly':'Bílý plášť je potřísněný solí. Ošetřovatel stojí nepřirozeně strnule a zpod obvazů se ozývá škrábání.',
 'enemy-bell-keeper':'Tam, kde by měla být tvář, je jen hladká tma. Každý jeho krok provází úder zvonu, který nikdo jiný neslyší.'
};
function renderBattle(){
 const combat=state.combat,dialog=$('battleDialog');
 if(!combat){if(dialog.open)dialog.close();return;}
 const investigator=investigatorById[state.investigatorId],enemy=enemyDefinitions.find(e=>e.id===combat.enemyId);
 $('battleTitle').textContent=combat.status==='active'?'Tváří v tvář temnotě':'Střetnutí skončilo';
 $('battleFlavor').textContent=monsterFlavor[combat.enemyId]||'Něco se vynořilo ze stínů.';
 $('battleInvestigatorArt').textContent=investigatorGlyph[investigator.id];
 $('battleInvestigatorName').textContent=investigator.name;
 $('battleInvestigatorStats').textContent='♥ '+state.game.hp+'/'+investigator.hp+' · ◈ '+state.game.san+'/'+investigator.san;
 $('battleMonsterArt').textContent=combat.enemyId==='enemy-fog-hound'?'♧':combat.enemyId==='enemy-bell-keeper'?'♢':'◆';
 $('battleMonsterName').textContent=enemy?.name||combat.enemyId;
 $('battleMonsterStats').textContent='♥ '+combat.enemyHp+' · Obrana '+enemy?.defense+' · Výměna '+combat.exchange+'/3';
 $('battleMonsterArt').dataset.damage=String(Math.max(0,(enemy?.hp||0)-combat.enemyHp));
 $('battleInvestigatorArt').dataset.damage=String(Math.max(0,investigator.hp-state.game.hp));
 $('battleMonsterArt').classList.toggle('wounded',Boolean(combat.playerDamage||combat.playerSanLoss));
 $('battleMonsterArt').style.backgroundImage='linear-gradient(0deg,#3e1614cc,#130d10aa),url("'+storyArt.byLocationId[state.game.locationId]+'")';
 $('battleInvestigatorArt').style.backgroundImage='linear-gradient(0deg,#123b2ac0,#122a28aa),url("'+storyArt.byLocationId[state.game.locationId]+'")';
 const report=combat.roll;
 const battleNarration={
  'enemy-drowned-sailor':{attack:'Námořník se zapotácí, voda se rozstříkne po prknech a pod kabátem zapraskají kosti.',escape:'Ustupuješ mezi mokré trámy. Za zády stále slyšíš jeho těžké, neexistující kroky.'},
  'enemy-fog-hound':{attack:'Tvor vycení zuby. Mlžné tělo se na okamžik roztrhne a zase spojí.',escape:'Proklouzneš mezi stíny, zatímco jeho tlapy škrábou po kamenech.'},
  'enemy-hollow-orderly':{attack:'Pod bílým pláštěm cosi zaskřípe. Obvazy se napnou, jako by pod nimi bylo víc než jedno tělo.',escape:'Zabouchneš za sebou dveře. Na druhé straně zůstane škrábání nehtů.'},
  'enemy-bell-keeper':{attack:'Každý zásah rozezní dutý tón. Ze stínů se sype prach a vzduch se zachvěje.',escape:'Zvuk zvonu tě pronásleduje ještě dlouho poté, co postava zmizí ve tmě.'}
 };
 const battleActionText=report?(combat.status==='defeated'?'Nepřítel se rozpadá do stínů. Střetnutí je vyhráno.':combat.status==='escaped'?'Podařilo se ti uniknout. Hrozba však nezmizela.':(battleNarration[combat.enemyId]?.[combat.lastMove||'attack']||battleNarration['enemy-drowned-sailor'].attack)):'';

 $('battleReport').textContent=battleRolling?'Kostky se kutálejí…':report?('Hod '+combat.dice.join(' + ')+' · '+labels[report.key]+' · Ztráta zdraví '+combat.playerDamage+' · Ztráta příčetnosti '+combat.playerSanLoss):'Rozhodni se, zda budeš bojovat, nebo se pokusíš uniknout.';
 $('battleReport').classList.toggle('battle-rolling',battleRolling);
 $('battleReport').dataset.result=report?.key||'';
 $('battleReport').title=battleActionText;
 $('battleDice').replaceChildren(...(battleRolling?['?','?']:combat.dice||[]).map(value=>{const die=document.createElement('span');die.className='battle-die'+(battleRolling?' spinning':'');die.textContent=value;return die;}));
 const makeToken=(symbol,cls,title)=>{const token=document.createElement('span');token.className='damage-token '+cls;token.textContent=symbol;token.title=title;return token;};
 $('battleMonsterWounds').replaceChildren(...Array.from({length:Math.max(0,(enemy?.hp||0)-combat.enemyHp)},()=>makeToken('✕','monster-wound','Zranění nepřítele')));
 $('battleInvestigatorWounds').replaceChildren(...Array.from({length:Math.max(0,investigator.hp-state.game.hp)},()=>makeToken('♥','investigator-damage','Ztracené zdraví')));
 $('battleTokens').textContent=battleActionText;

 $('battleItems').replaceChildren(...state.game.inventory.filter(id=>blackwaterItemById[id]?.kind==='consumable').map(id=>button((itemGlyph[id]||'✦')+' '+blackwaterItemById[id].name+' · '+blackwaterItemById[id].description,()=>send('useItem',{itemId:id}),id!=='bw-salt'&&combat.status==='active','battle-item')));
 if(!$('battleItems').children.length)$('battleItems').textContent='Žádné použitelné předměty.';
 $('battleActions').replaceChildren(...(combat.status==='active'?[
  button('⚔ Zaútočit · hod 2 kostkami',()=>rollCombat('attack'),battleRolling),
  button('➤ Pokusit se utéct · hod 2 kostkami',()=>rollCombat('escape'),battleRolling)
 ]:[button('Pokračovat →',()=>send('closeCombat'))]));
 if(!dialog.open)dialog.showModal();
}
function rollCombat(move){
 if(battleRolling||!state.combat||state.combat.status!=='active')return;
 battleRolling=true;renderBattle();
 const dice=rollDice(),delay=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:850;
 const finish=()=>{battleRolling=false;send('combatTurn',{move,dice});};
 if(!delay){finish();return;}
 let ticks=0;
 const timer=window.setInterval(()=>{
  if(!$('battleDialog').open){window.clearInterval(timer);battleRolling=false;return;}
  $('battleDice').replaceChildren(...[0,1].map(()=>{const el=document.createElement('span');el.className='battle-die spinning';el.textContent=1+Math.floor(Math.random()*6);return el;}));
  if(++ticks>=12){window.clearInterval(timer);window.setTimeout(finish,90);}
 },65);
}
function showRewardEffect(previous){
 const freshEvidence=state.game.evidence.filter(id=>!previous.evidence.includes(id));
 const freshKnowledge=state.game.knowledge.filter(id=>!previous.knowledge.includes(id));
 const gained=[...freshEvidence,...freshKnowledge];
 if(!gained.length)return;
 const names=gained.map(id=>rewards.find(item=>item.id===id)?.name||id);
 $('rewardTitle').textContent=freshEvidence.length?'Nová stopa nalezena':'Nový poznatek';
 $('rewardText').textContent=names.join(' · ');
 $('rewardDialog').showModal();
}
function showOutcome(){
 const result=publicBlackwater(state).result;
 if(!result)return;
 $('outcomeTitle').textContent=labels[result.key]||'Výsledek';
 $('outcomeStory').textContent=result.text;
 $('outcomeDice').textContent=result.dice?'🎲 '+result.dice.join(' + ')+' = '+result.total:'Rozhodnutí bylo vyhodnoceno bez hodu.';
 $('outcomeArt').textContent=['criticalSuccess','greatSuccess','success'].includes(result.key)?'✦':result.key==='partialSuccess'?'◈':'☠';
 $('outcomeDialog').dataset.outcome=result.key;
 if(!$('outcomeDialog').open)$('outcomeDialog').showModal();
}
function button(label,action,disabled=false,cls=''){const b=document.createElement('button');b.textContent=label;b.disabled=disabled;b.className=cls;b.onclick=action;return b;}
function send(type,rest={}){
 if(rolling)return false;
 const next=blackwaterTransition(state,{type,revision:state.revision,...rest});
 if(next===state){$('message').textContent='Akce nyní není dostupná.';return false;}
 const previousMythCount=state.myth.history.length;
 const previousLocation=state.game.locationId;
 state=next;saveBlackwater(storage,state);$('message').textContent='';render();
 if(type==='move'&&state.game.locationId!==previousLocation){const place=locations.find(loc=>loc.id===state.game.locationId);if(place)showTransition('NOVÁ LOKACE',place.name,locationArrival[place.id]||place.description,locationGlyph[place.id]||'✦',storyArt.byLocationId[place.id]);}
 if(['startCombat','combatTurn','closeCombat','useItem'].includes(type))renderBattle();
 if(type==='endRound'&&state.myth.history.length>previousMythCount){const event=mythEvents.find(e=>e.id===state.myth.history.at(-1));if(event)showMythCard(event,state.myth.history.length);}
 return true;
}
function resolveCard(card,choice){
 if(rolling)return;
 const dice=choice.test?rollDice():null;
 const previous={evidence:[...state.game.evidence],knowledge:[...state.game.knowledge]};
 const next=blackwaterTransition(state,{type:'resolve',revision:state.revision,cardId:card.id,choiceId:choice.id,...(dice?{dice}:{})});
 if(next===state){$('message').textContent='Rozhodnutí nelze provést.';return;}
 state=next;saveBlackwater(storage,state);
 if(!dice){render();showOutcome();pendingReward=previous;return;}
 rolling=true;render();
 const diceBox=$('dice');diceBox.hidden=false;diceBox.classList.add('rolling');
 $('result').textContent='Osud rozhoduje…';$('die1').textContent='?';$('die2').textContent='?';
 const delay=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:1050;
 if(delay){let ticks=0;rollTimer=window.setInterval(()=>{ticks++;$('die1').textContent=String(1+Math.floor(Math.random()*6));$('die2').textContent=String(1+Math.floor(Math.random()*6));$('diceTotal').textContent='Kostky se kutálejí…';if(ticks>15){window.clearInterval(rollTimer);rollTimer=null;}},65);}
 window.setTimeout(()=>{if(rollTimer){window.clearInterval(rollTimer);rollTimer=null;}rolling=false;render();showOutcome();pendingReward=previous;},delay);
}
function render(){
 const view=publicBlackwater(state);
 $('setup').hidden=Boolean(state.investigatorId);$('game').hidden=!state.investigatorId;
 $('investigators').replaceChildren(...investigators.map(i=>{const card=button('',()=>send('selectInvestigator',{investigatorId:i.id}),false,'investigator-card');const portrait=document.createElement('span');portrait.className='selection-portrait';portrait.textContent=investigatorGlyph[i.id];const name=document.createElement('strong');name.textContent=i.name;const role=document.createElement('span');role.className='selection-role';role.textContent=i.role;const flavor=document.createElement('em');flavor.textContent=investigatorFlavor[i.id];const stats=document.createElement('span');stats.className='selection-stats';stats.textContent='♥ '+i.hp+'    ◈ '+i.san;const ability=document.createElement('small');ability.textContent=i.ability;card.append(portrait,name,role,flavor,stats,ability);return card;}));
 if(!state.investigatorId){$('quickStats').replaceChildren();$('message').textContent='';return;}
 const investigator=investigatorById[state.investigatorId];
 $('investigatorName').textContent=investigator.name;$('investigatorRole').textContent=investigator.role+' · '+investigator.ability;
 const stats=[['Kolo',view.round+'/7'],['Akční body',view.ap],['Zdraví',view.hp+'/'+investigator.hp],['Příčetnost',view.san+'/'+investigator.san],['Hrozba',view.threat+'/10'],['Rituál',view.ritual+'/8']];
 $('quickStats').replaceChildren(...[['♥',view.hp+'/'+investigator.hp,'Zdraví'],['◈',view.san+'/'+investigator.san,'Příčetnost'],['⚡',view.ap,'Akční body'],['◷',view.round+'/7','Kolo'],['☠',view.threat,'Hrozba'],['✧',view.ritual,'Rituál']].map(([symbol,value,label])=>{const el=document.createElement('span');el.className='quick-stat';el.title=label;el.textContent=symbol+' '+value;return el;}));
 $('characterTitle').textContent=investigator.name;
 $('characterFlavor').textContent=investigatorFlavor[investigator.id];
 $('characterGlyph').textContent=investigatorGlyph[investigator.id];
 $('miniPortrait').textContent=investigatorGlyph[investigator.id];
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
 const enemyOffsets={};const tokens=view.myth.enemies.map(e=>{const index=enemyOffsets[e.locationId]||0;enemyOffsets[e.locationId]=index+1;const token=document.createElement('span');token.className='map-token enemy-token';token.textContent='◆';token.title=enemyName(e.enemyId)+' · '+(locations.find(l=>l.id===e.locationId)?.name||'');token.style.left=(blackwaterMap.points[e.locationId].x+5+(index%3)*3)+'%';token.style.top=(blackwaterMap.points[e.locationId].y-5+Math.floor(index/3)*4)+'%';return token;});
 const playerToken=document.createElement('span');playerToken.className='map-token investigator-token';playerToken.textContent=investigatorGlyph[investigator.id];playerToken.title=investigator.name;playerToken.style.left=(blackwaterMap.points[view.locationId].x-5)+'%';playerToken.style.top=(blackwaterMap.points[view.locationId].y-5)+'%';
 $('locations').replaceChildren(svg,...pins,...tokens,playerToken);
 $('locations').setAttribute('aria-description','Lokace s jasným okrajem jsou dostupné za jeden akční bod. Žeton označuje aktuální polohu vyšetřovatele.');
 const place=locations.find(l=>l.id===view.locationId);$('place').textContent=place.name;$('description').textContent=place.description;
 $('enemies').replaceChildren(...view.myth.enemies.filter(e=>e.locationId===view.locationId).map(e=>button('⚔ '+enemyName(e.enemyId),()=>send('startCombat',{enemyId:e.enemyId}),rolling||view.ended||Boolean(state.combat)||view.ap<1)));
 if(!$('enemies').children.length)$('enemies').textContent='Zatím klid. Jen mlha se pohybuje.';
 $('items').replaceChildren(...view.inventory.map(id=>{const item=blackwaterItemById[id];const b=button('',()=>send('useItem',{itemId:id}),rolling||view.ended||item?.kind!=='consumable','item-card');const art=document.createElement('span');art.className='item-art';art.textContent=itemGlyph[id]||'✦';const title=document.createElement('strong');title.textContent=item?.name||id;const desc=document.createElement('small');desc.textContent=item?.description||'';b.append(art,title,desc);b.title=(item?.name||id)+': '+(item?.description||'');return b;}));
 if(!view.inventory.length)$('items').textContent='Prázdný inventář.';
 $('ability').disabled=rolling||view.abilityUsed||view.ended||state.combat?.status==='active';
 $('ability').textContent=view.abilityUsed?'Schopnost vyčerpána':'✦ Použít schopnost';
 $('deckName').textContent=view.exploration.name;
 $('deckCount').textContent='Zbývá '+view.exploration.available+' karet';
 $('deckHint').textContent=view.ended?'Vyšetřování skončilo. Přečti si epilog.':view.exploration.available===0?'Balíček je vyčerpaný. Pokračuj na jiné lokaci nebo ukonči kolo.':view.ap===0?'Nemáš akční body. Ukonči kolo.':'';
 $('draw').disabled=rolling||view.ended||Boolean(view.card)||!view.exploration.canDraw||state.combat?.status==='active';
 const card=view.card;
 $('story').classList.toggle('unrevealed',!card);
 $('story').hidden=Boolean(view.ended);
 $('story').classList.toggle('deck-empty',!card&&view.exploration.available===0);
 $('ending').hidden=!view.ended;
 if(view.ended){
  const reason=view.hp===0?'Ztracený v temnotě':view.san===0?'Šepot pod hladinou':view.ritual>=8?'Zvon se probudil':view.threat>=10?'Město pohltila mlha':'Hlubiny odpoví';
  const cause=view.hp===0?'Tělo vyšetřovatele už neuneslo poslední střetnutí.':view.san===0?'Poslední zvuk zvonu zlomil jeho mysl.':view.ritual>=8?'Rituál byl dokončen. Z hlubin zazněl hlas, který neměl nikdy promluvit.':view.threat>=10?'Nebezpečí překročilo poslední hranici a Blackwater zmizel v přílivu.':'Noc skončila dřív, než se podařilo tajemství zastavit.';
  $('endingTitle').textContent=reason;
  $('endingText').textContent=cause+' Za '+view.round+' kol jsi shromáždil '+state.game.evidence.length+' stop a '+state.game.knowledge.length+' poznatků. Přístav ztichl, ale na moři stále někdo počítá údery zvonu.';
 }

 $('cardBack').hidden=Boolean(card);
 $('cardTitle').textContent=card?.title||'Co ukrývá mlha?';
 $('cardText').textContent=card?.description||'Otoč kartu a vstup do příběhu. Následky rozhodnutí se odhalí teprve po vyhodnocení.';
 $('cardType').textContent=card?({encounter:'SETKÁNÍ',event:'UDÁLOST',item:'PŘEDMĚT',evidence:'DŮKAZ'}[card.type]||'PŘÍBĚH'):'NEODHALENÁ KARTA';
 $('storyArt').style.backgroundImage='linear-gradient(0deg,#1a2828,#0000 75%),url("'+new URL(imageForCard(card),document.baseURI).href+'")';
 $('choices').replaceChildren(...(card?.choices||[]).map(choice=>button(choice.label+' · '+choice.apCost+' AP'+(choice.test?' · '+choice.test.attribute+' / '+choice.test.difficulty:''),()=>resolveCard(card,choice),rolling||!choice.available||Boolean(view.result)||state.combat?.status==='active')));
 const result=view.result;
 $('story').dataset.phase=rolling?'rolling':result?'resolved':card?'decision':'concealed';
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
 $('mythHistoryCount').textContent=state.myth.history.length;
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
 if(view.ended)$('message').textContent='';
}
$('transitionContinue').onclick=()=>$('transitionDialog').close();
$('outcomeContinue').onclick=()=>{$('outcomeDialog').close();if(pendingReward){const previous=pendingReward;pendingReward=null;showRewardEffect(previous);}};
$('rewardContinue').onclick=()=>$('rewardDialog').close();

$('mythConfirm').onclick=()=>$('mythDialog').close();
$('mythHistoryOpen').onclick=showMythHistory;
$('mythHistoryClose').onclick=()=>$('mythHistoryDialog').close();
$('mythHistoryDialog').onclick=e=>{if(e.target===$('mythHistoryDialog'))$('mythHistoryDialog').close();};
$('investigatorOpen').onclick=()=>$('investigatorDialog').showModal();
$('investigatorClose').onclick=()=>$('investigatorDialog').close();
$('investigatorDialog').onclick=e=>{if(e.target===$('investigatorDialog'))$('investigatorDialog').close();};
$('journalToggle').onclick=()=>{journalOpen=!journalOpen;render();};
$('combatClose').onclick=()=>send('closeCombat');
$('endingJournal').onclick=()=>{journalOpen=true;render();document.querySelector('.side-panel').scrollIntoView({behavior:'smooth',block:'center'});};
$('endingRestart').onclick=()=> $('reset').click();
$('reset').onclick=()=>{if(!window.confirm('Začít novou hru? Současný postup se smaže.'))return;clearBlackwater(storage);state=newBlackwaterGame();rolling=false;if(rollTimer){window.clearInterval(rollTimer);rollTimer=null;}render();};
$('draw').onclick=()=>send('draw');$('next').onclick=()=>send('next');$('endRound').onclick=()=>send('endRound');$('ability').onclick=()=>send('useAbility');render();
