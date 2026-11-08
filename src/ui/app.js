import { activeScenarioPack } from '../data/scenario-registry.js';
import { reachableOutcomeKeys } from './story-card.js';
import { imageForCard } from '../data/story-art.js';
import { applyPresentation } from './presentation.js';
import { renderMap } from './map.js';
import { attributes,labels,currentCard,selectedChoice,visibleResult,rollDice,investigationView,explorationView } from '../engine/game.js';
import { rewardNames,legacyContent } from '../engine/content.js';
import {newState,transition as legacyTransition} from '../engine/game.js';
import {load as loadLegacy,save as saveLegacy,SAVE_KEY} from '../engine/storage.js';
import {protectedSaveStorage} from '../engine/save-compatibility.js';
import {mountSaveNotice} from './save-compatibility.js';
const legacyMode=new URLSearchParams(location.search).get('mode')==='legacy';
const modeNav=document.querySelector('.game-modes');
if(legacyMode&&modeNav){
  modeNav.querySelector('.game-modes-current')?.removeAttribute('aria-current');
  const current=modeNav.querySelector('a[href="./index.html?mode=legacy"]');
  if(current)current.setAttribute('aria-current','page');
}
const {scenario:activeScenario,presentation,investigatorName,clockDisplayId}=activeScenarioPack;
const content=legacyMode?legacyContent:activeScenarioPack.content;
import { newScenarioSession,scenarioSessionTransition as scenarioTransition,scenarioSessionView as scenarioView } from '../engine/scenario-session.js';
import { loadScenarioSession,saveScenarioSession,scenarioSaveKey } from '../engine/scenario-storage.js';
import { createJournal } from './journal.js';
const { map: scenarioMap, locations } = presentation;
applyPresentation(document.documentElement, presentation);
const $=id=>document.getElementById(id);
let storage;try{storage=window.localStorage;}catch{/* unavailable storage is handled below */}
mountSaveNotice(storage,legacyMode?'legacy':'scenario');
document.getElementById('roundLimit').textContent=legacyMode?'7':String(activeScenario.rules.maxRounds);
storage=protectedSaveStorage(storage,legacyMode?SAVE_KEY:scenarioSaveKey(activeScenario));
const freshSession=()=>legacyMode?{game:newState(content),scenario:{}}:newScenarioSession(activeScenario,content);
let session=legacyMode?{game:loadLegacy(storage,content),scenario:{}}:loadScenarioSession(storage,activeScenario,content),state=session.game,rolling=false,timer;
function scenarioSessionTransition(s,action,def,data){
 if(!legacyMode)return scenarioTransition(s,action,def,data);
 const next=legacyTransition(s.game,{...action,type:action.type==='startTest'?'resolve':action.type},data);
 return next===s.game?s:{...s,game:next};
}
function scenarioSessionView(s,def,data){
 return legacyMode?{canAct:!s.game.ended,pendingTest:null,ending:null,companion:[],puzzles:[],availableEndings:[],clocks:[{id:clockDisplayId,label:'Rituál',current:s.game.ritual,max:8}]}:scenarioView(s,def,data);
}
const puzzleDrafts=new Map();
function button(text,handler,disabled=false,className=''){
  const b=document.createElement('button');b.textContent=text;b.onclick=handler;b.disabled=disabled;b.className=className;return b;
}
function persist(){ $('saveStatus').textContent=(legacyMode?saveLegacy(storage,state,content):saveScenarioSession(storage,session,activeScenario,content))?'':'Ukládání není dostupné nebo jsou původní data chráněna. Hra pokračuje pouze v této záložce.'; }
function dispatch(action){if(rolling)return;session=scenarioSessionTransition(session,action,activeScenario,content);state=session.game;persist();render();}
function render(){
  const focused=document.activeElement;
  const choiceFocus=focused?.dataset.choiceId;
  const mapFocus=focused?.dataset.locationId;
  for(const k of ['round','threat','ap','hp','san'])$(k).textContent=state[k];
  const scene=scenarioSessionView(session,activeScenario,content);
  const pending=scene.pendingTest;
  const clock=scene.clocks.find(c=>c.id===clockDisplayId)||scene.clocks[0];
  $('ritual').textContent=clock?clock.current+' / '+clock.max:'—';
  $('clockLabel').textContent=clock?.label||'Scénářové hodiny';
  $('ritual').title=clock?.label||'Scénářové hodiny';
  $('heroStats').textContent=`${investigatorName} · Výzkumnice · HP ${state.hp}/6 · SAN ${state.san}/8 · ${Object.entries(attributes).map(([k,v])=>`${k} ${v}`).join(' · ')}`;
  const investigation=investigationView(state,content);
  $('inventory').textContent=[...state.inventory.map(id=>rewardNames[id]),...investigation.evidence.filter(e=>!e.carriedBy.length).map(e=>e.name)].join(' · ')||'Zatím nic.';
  journal.render(investigation,rolling||!scene.canAct,rolling?[]:state.log,!legacyMode&&activeScenario.rules.deductionMode==='automatic');
  const loc=locations.find(l=>l.id===state.locationId),card=currentCard(state,content),choice=selectedChoice(state,card);
  const result=visibleResult(state,content),deck=explorationView(state,content);
  $('deckName').textContent=deck.name;
  $('deckDescription').textContent=deck.description;
  $('deckCounts').textContent=`Dostupné: ${deck.available} · Odložené: ${deck.deferred} · Vyřešené: ${deck.consumed}`;
  $('draw').hidden=Boolean(card);$('draw').disabled=rolling||!!pending||!scene.canAct||!deck.canDraw;
  $('placeTitle').textContent=loc.name;$('placeDesc').textContent=loc.description;
  $('mapTitle').textContent=scenarioMap.name;
  renderMap($('places'),locations,scenarioMap,state,rolling||!!pending||!scene.canAct,id=>dispatch({type:'move',locationId:id}));
  $('cardArt').classList.toggle('empty',!card);
  $('cardArt').style.backgroundImage = `linear-gradient(180deg, #06141322 45%, #061413c9), url("${new URL(imageForCard(card), document.baseURI).href}")`;
  $('cardTag').textContent=({encounter:'Setkání',event:'Událost',item:'Předmět',evidence:'Důkaz'}[card?.type]||'Průzkum').toUpperCase()+' · '+loc.name.toUpperCase();
  $('cardTitle').textContent=card?.title||(deck.canDraw?'Neznámá karta čeká':'Žádná dostupná karta');
  $('cardStory').textContent=card?.description||(deck.canDraw?'Dobrat kartu je zdarma. AP zaplatíš až za zvolený postup.':'Zdejší balíček je vyčerpaný nebo zbývající karty zatím nesplňují podmínky. Vydej se jinam nebo pokračuj do dalšího kola.');
  $('challenge').textContent=choice?`${choice.apCost} AP · `+(choice.test?`Test ${choice.test.attribute} · obtížnost ${choice.test.difficulty} · modifikátor ${choice.test.modifier||0}`:'Rozhodnutí bez testu'):'';
  $('choices').replaceChildren(...(card?.choices||[]).map(o=>{
    const b=button(`${o.label} · ${o.apCost} AP${o.test?' · '+o.test.attribute:' · bez testu'}${o.unavailableReason?' · '+o.unavailableReason:''}`,()=>dispatch({type:'choose',choiceId:o.id}),rolling||!!pending||!scene.canAct||!o.available,'choice'+(o.id===choice?.id?' active':''));
    b.dataset.choiceId=o.id; b.setAttribute('aria-pressed',String(o.id===choice?.id));return b;
  }));
  // Only public test parameters determine the reachable tiers; no hidden definitions.
  const preview=$('outcomes');
  preview.hidden=!choice?.test||Boolean(result)||rolling||Boolean(pending);
  preview.replaceChildren();
  if(!preview.hidden){
    const heading=document.createElement('p');heading.className='outcome-heading';heading.textContent='Možné následky · odhalí je až hod';
    preview.append(heading);
    for(const tier of reachableOutcomeKeys(choice)){
      const slot=document.createElement('span');slot.className='outcome-slot';
      slot.textContent=labels[tier];slot.setAttribute('aria-label',labels[tier]+' · následek je skrytý');
      preview.append(slot);
    }
  }
  $('dicebox').classList.toggle('show',Boolean(result)||rolling);
  // While rolling, do not put the hidden result into the DOM at all.
  $('reveal').classList.toggle('show',Boolean(result)&&!rolling);
  $('reveal').textContent=result&&!rolling?labels[result.key]+' — '+result.text:'';
  if(rolling){$('die1').textContent='?';$('die2').textContent='?';$('sum').textContent='Kostky se kutálejí…';}
  else if(result){
    $('die1').textContent=result.dice?.[0]??'—';$('die2').textContent=result.dice?.[1]??'—';
    $('sum').textContent=result.test?`${result.dice.join(' + ')} + ${attributes[result.test.attribute]} + ${result.test.modifier||0} = ${result.total} proti obtížnosti ${result.test.difficulty}`:'Rozhodnutí bez hodu kostkami.';
  }else{$('die1').textContent='?';$('die2').textContent='?';$('sum').textContent='';}
  $('roll').textContent=choice?.test?'🎲 Hodit kostkami':'Provést rozhodnutí';
  $('roll').hidden=Boolean(pending);
  rerollControls.hidden=!pending;
  if(pending){
    const first=evaluatePending(pending.firstDice,choice?.test);
    const second=pending.secondDice?evaluatePending(pending.secondDice,choice?.test):null;
    rerollInfo.textContent='První hod: '+pending.firstDice.join(' + ')+' · '+labels[first.key]+(second?' | Přehod: '+pending.secondDice.join(' + ')+' · '+labels[second.key]:'')+'. Následky se odkryjí až po potvrzení.';
    rerollButton.disabled=!!second||state.san<2;
    rerollButton.hidden=!!second;
  }
  $('roll').disabled=rolling||!scene.canAct||!choice?.available;
  $('next').disabled=rolling||!!pending||!scene.canAct||!result;
  $('endRound').disabled=rolling||!!pending||!scene.canAct;
  companionActions.replaceChildren();
  for(const companion of scene.companion){
    if(!companion.active&&!companion.recruitable)continue;
    const section=document.createElement('section');section.className='puzzle-panel';
    const heading=document.createElement('h3');heading.textContent=companion.name;section.append(heading);
    if(companion.recruitable){
      const intro=document.createElement('p');intro.textContent='V mlze se objevil osamělý pes. Může tě doprovázet při vyšetřování.';section.append(intro);
      section.append(button('Přijmout společníka',()=>dispatch({type:'recruitCompanion',revision:state.revision,companionId:companion.id}),!scene.canAct||!!pending));
    }
    if(companion.active){
      const description=document.createElement('p');description.textContent='Doprovází tě · bez vlastních akčních bodů';section.append(description);
      for(const ability of companion.active.abilities){
        if(ability.type==='passive'){
          const info=document.createElement('p');info.textContent=ability.name+' · '+ability.text;section.append(info);
        }else{
          section.append(button(ability.available?'Použít: '+ability.name:ability.name+' · použito v tomto kole',()=>dispatch({type:'useCompanionAbility',revision:state.revision,abilityId:ability.id,trigger:ability.trigger}),!ability.available||!scene.canAct||!!pending));
          if(!ability.available){const info=document.createElement('p');info.textContent=ability.text;section.append(info);}
        }
      }
      section.append(button('Rozloučit se',()=>dispatch({type:'dismissCompanion',revision:state.revision}),!scene.canAct||!!pending));
    }
    companionActions.append(section);
  }
  // Accessible puzzle controls use the public projection, never private answers.
  puzzleActions.replaceChildren();
  for(const p of scene.puzzles){
    const section=document.createElement('section');section.className='puzzle-panel';
    const title=document.createElement('h3');title.textContent=p.title;section.append(title);
    const status=document.createElement('p');status.textContent=p.status==='solved'?'Vyřešeno':p.status==='blocked'?'Pokusy vyčerpány · hledej jinou cestu':'Hádanka · pokusy '+p.attempts;section.append(status);
    for(const clue of p.clues){const item=document.createElement('p');item.textContent=clue.text;section.append(item);}
    for(const hint of p.hints){const item=document.createElement('p');item.textContent='Nápověda: '+hint.text;section.append(item);}
    if(p.status==='open'&&scene.canAct&&!pending){
      const answer=[];
      if(p.type==='sequence'){
        const previous=puzzleDrafts.get(p.id);
        answer.push(...(Array.isArray(previous)&&previous.length===p.interaction.symbols.length&&previous.every(x=>p.interaction.symbols.includes(x))?previous:p.interaction.symbols));
        const controls=document.createElement('div');controls.className='puzzle-sequence';
        const draw=()=>{
          controls.replaceChildren(...answer.map((symbol,i)=>{
            const cell=document.createElement('div');cell.className='puzzle-symbol';
            const label=document.createElement('span');label.textContent=symbol;cell.append(label);
            const left=button('←',()=>{[answer[i-1],answer[i]]=[answer[i],answer[i-1]];puzzleDrafts.set(p.id,[...answer]);draw();},i===0);
            const right=button('→',()=>{[answer[i],answer[i+1]]=[answer[i+1],answer[i]];puzzleDrafts.set(p.id,[...answer]);draw();},i===answer.length-1);
            left.setAttribute('aria-label','Posunout '+symbol+' doleva');
            right.setAttribute('aria-label','Posunout '+symbol+' doprava');
            cell.append(left,right);return cell;
          }));
        };draw();section.append(controls);
      }else if(p.type==='deduction'){
        const select=document.createElement('select');
        select.setAttribute('aria-label','Vyber závěr');
        for(const option of p.interaction.options){const el=document.createElement('option');el.value=option;el.textContent=option;select.append(el);}
        const previous=puzzleDrafts.get(p.id);
        if(typeof previous==='string'&&p.interaction.options.includes(previous))select.value=previous;
        select.onchange=()=>puzzleDrafts.set(p.id,select.value);
        section.append(select);answer.push(select);
      }else if(p.type==='matching'||p.type==='mechanism'){
        const keys=p.type==='matching'?p.interaction.left:p.interaction.controls;
        const optionsFor=key=>p.type==='matching'?p.interaction.right:p.interaction.states[key];
        const previous=puzzleDrafts.get(p.id);
        const selections=new Map();
        for(const key of keys){
          const line=document.createElement('label');line.className='puzzle-match-row';
          const text=document.createElement('span');text.textContent=key;line.append(text);
          const select=document.createElement('select');select.setAttribute('aria-label','Nastavení: '+key);
          for(const value of optionsFor(key)){
            const option=document.createElement('option');option.value=value;option.textContent=value;select.append(option);
          }
          if(previous&&typeof previous==='object'&&!Array.isArray(previous)&&optionsFor(key).includes(previous[key]))select.value=previous[key];
          selections.set(key,select);
          select.onchange=()=>puzzleDrafts.set(p.id,Object.fromEntries([...selections].map(([k,v])=>[k,v.value])));
          line.append(select);section.append(line);
        }
        answer.push(selections);
      }
      section.append(button('Ověřit řešení',()=>{
        const response=p.type==='sequence'?[...answer]:p.type==='deduction'?answer[0].value:Object.fromEntries([...answer[0]].map(([k,v])=>[k,v.value]));
        dispatch({type:'attemptPuzzle',revision:state.revision,puzzleId:p.id,answer:response});
      }));
      for(const hint of p.availableHints){
        section.append(button('Zobrazit nápovědu',()=>dispatch({type:'revealPuzzleHint',revision:state.revision,puzzleId:p.id,hintId:hint.id})));
      }
    }
    if(p.status!=='open')puzzleDrafts.delete(p.id);
    puzzleActions.append(section);
  }
  finaleActions.replaceChildren(...scene.availableEndings.map(e=>button('Dokončit scénář: '+e.title,()=>dispatch({type:'finishScenario',revision:state.revision,endingId:e.id}),false,'primary')));
  $('gameStatus').textContent=scene.ending?'Konec scénáře: '+scene.ending.title+'.':state.ended?'Vyšetřovatel již nemůže pokračovat. Začni novou hru.':'';
  $('log').replaceChildren(...(rolling?[]:state.log).map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));
  if(choiceFocus){const target=[...$('choices').children].find(b=>b.dataset.choiceId===choiceFocus);if(target&&!target.disabled)target.focus();}
  if(mapFocus){$('cardTitle').focus({preventScroll:true});}
}
const evaluatePending=(dice,test)=>{
  if(!test)return {key:'failure'};
  const total=dice[0]+dice[1]+attributes[test.attribute]+(test.modifier||0),margin=total-test.difficulty;
  return {key:dice[0]===6&&dice[1]===6?'criticalSuccess':dice[0]===1&&dice[1]===1?'criticalFailure':margin>=3?'greatSuccess':margin>=0?'success':margin>=-2?'partialSuccess':'failure'};
};
const rerollControls=document.createElement('div');rerollControls.hidden=true;
const rerollInfo=document.createElement('p');rerollInfo.setAttribute('role','status');
const rerollButton=button('Sebrat odvahu · přehodit za 1 SAN',()=>dispatch({type:'rerollTest',revision:state.revision,dice:rollDice()}));
const acceptButton=button('Přijmout výsledek',()=>dispatch({type:'acceptTest',revision:state.revision}));
rerollControls.append(rerollInfo,rerollButton,acceptButton);
$('roll').after(rerollControls);
const status=document.createElement('p');status.id='gameStatus';status.setAttribute('role','status');$('cardTitle').before(status);
const companionActions=document.createElement('div');companionActions.id='scenario-companions';companionActions.className='scenario-feature';companionActions.setAttribute('aria-label','Společníci');$('cardStory').after(companionActions);
const puzzleActions=document.createElement('div');puzzleActions.id='scenario-puzzles';puzzleActions.className='scenario-feature';puzzleActions.setAttribute('aria-label','Hádanky v lokaci');$('cardStory').after(puzzleActions);
const finaleActions=document.createElement('div');finaleActions.id='scenario-finale-actions';finaleActions.setAttribute('aria-label','Možná zakončení scénáře');status.after(finaleActions);
const journal=createJournal($('history'),()=>dispatch({type:'deduce',revision:state.revision}));
$('roll').onclick=()=>{
  if(rolling||$('roll').disabled)return;
  const card=currentCard(state,content),choice=selectedChoice(state,card);
  const next=scenarioSessionTransition(session,{type:choice.test?'startTest':'resolve',revision:state.revision,cardId:card.id,choiceId:choice.id,...(choice.test?{dice:rollDice()}:{})},activeScenario,content);
  if(next===session)return;session=next;state=session.game;persist();
  if(!choice.test){render();return;}
  rolling=true;for(const id of ['die1','die2'])$(id).classList.add('rolling');render();
  timer=setTimeout(()=>{rolling=false;for(const id of ['die1','die2'])$(id).classList.remove('rolling');render();},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:900);
};
$('draw').onclick=()=>{dispatch({type:'draw',revision:state.revision});$('cardTitle').focus({preventScroll:true});};
$('next').onclick=()=>{dispatch({type:'next'});if(!$('draw').disabled)$('draw').focus({preventScroll:true});};
$('endRound').onclick=()=>dispatch({type:'endRound',revision:state.revision});
$('reset').onclick=()=>{
  if(!confirm('Opravdu začít novou hru?'))return;
  clearTimeout(timer);rolling=false;for(const id of ['die1','die2'])$(id).classList.remove('rolling');
  session=freshSession();state=session.game;puzzleDrafts.clear();persist();render();
};
render();

const details=$('details');
for(const opener of document.querySelectorAll('[data-panel]')){
  opener.setAttribute('aria-haspopup','dialog');opener.setAttribute('aria-controls','details');
  opener.onclick=()=>{
    for(const panel of details.querySelectorAll('.detail-panel'))panel.hidden=panel.id!==opener.dataset.panel;
    if(opener.dataset.panel==='investigation-journal')journal.select(({ 'journal-knowledge':'knowledge', 'journal-deductions':'deductions' })[opener.dataset.focus]||'evidence');
    details.showModal();
    if(opener.dataset.focus){const target=$(opener.dataset.focus);target.tabIndex=-1;target.focus();}
  };
}
$('closeDetails').onclick=()=>details.close();
