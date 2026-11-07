import { presentation } from '../data/presentation.js';
import { applyPresentation } from './presentation.js';
import { renderMap } from './map.js';
import { attributes,labels,newState,currentCard,selectedChoice,visibleResult,transition,rollDice,investigationView } from '../engine/game.js';
import { rewardNames } from '../engine/content.js';
import { load,save } from '../engine/storage.js';
import { createJournal } from './journal.js';
const { map: blackwaterMap, locations } = presentation;
applyPresentation(document.documentElement, presentation);
const $=id=>document.getElementById(id);
let storage;try{storage=window.localStorage;}catch{/* unavailable storage is handled below */}
let state=load(storage),rolling=false,timer;
function button(text,handler,disabled=false,className=''){
  const b=document.createElement('button');b.textContent=text;b.onclick=handler;b.disabled=disabled;b.className=className;return b;
}
function persist(){ $('saveStatus').textContent=save(storage,state)?'':'Ukládání není dostupné. Hra pokračuje pouze v této záložce.'; }
function dispatch(action){if(rolling)return;state=transition(state,action);persist();render();}
function render(){
  const focused=document.activeElement;
  const choiceFocus=focused?.dataset.choiceId;
  const mapFocus=focused?.dataset.locationId;
  for(const k of ['round','threat','ritual','ap','hp','san'])$(k).textContent=state[k];
  $('heroStats').textContent=`Eleanor Whitmore · Výzkumnice · HP ${state.hp}/6 · SAN ${state.san}/8 · ${Object.entries(attributes).map(([k,v])=>`${k} ${v}`).join(' · ')}`;
  const investigation=investigationView(state);
  $('inventory').textContent=[...state.inventory.map(id=>rewardNames[id]),...investigation.evidence.filter(e=>!e.carriedBy.length).map(e=>e.name)].join(' · ')||'Zatím nic.';
  journal.render(investigation,rolling||state.ended);
  const loc=locations.find(l=>l.id===state.locationId),card=currentCard(state),choice=selectedChoice(state,card);
  const result=visibleResult(state);
  $('placeTitle').textContent=loc.name;$('placeDesc').textContent=loc.description;
  $('mapTitle').textContent=blackwaterMap.name;
  renderMap($('places'),locations,blackwaterMap,state,rolling,id=>dispatch({type:'move',locationId:id}));
  $('cardArt').classList.toggle('empty',!card);
  $('cardTag').textContent=({encounter:'Setkání',event:'Událost',item:'Předmět',evidence:'Důkaz'}[card?.type]||'Průzkum').toUpperCase()+' · '+loc.name.toUpperCase();
  $('cardTitle').textContent=card?.title||'Žádná dostupná karta';
  $('cardStory').textContent=card?.description||'Zdejší balíček je vyčerpaný nebo zbývající karty zatím nesplňují podmínky. Vydej se jinam nebo pokračuj do dalšího kola.';
  $('challenge').textContent=choice?`${choice.apCost} AP · `+(choice.test?`Test ${choice.test.attribute} · obtížnost ${choice.test.difficulty} · modifikátor ${choice.test.modifier||0}`:'Rozhodnutí bez testu'):'';
  $('choices').replaceChildren(...(card?.choices||[]).map(o=>{
    const b=button(`${o.label} · ${o.apCost} AP${o.test?' · '+o.test.attribute:' · bez testu'}${o.unavailableReason?' · '+o.unavailableReason:''}`,()=>dispatch({type:'choose',choiceId:o.id}),rolling||!o.available,'choice'+(o.id===choice?.id?' active':''));
    b.dataset.choiceId=o.id; b.setAttribute('aria-pressed',String(o.id===choice?.id));return b;
  }));
  // Preview communicates the six possible tiers, never their hidden text or effects.
  const preview=$('outcomes');
  preview.hidden=!choice?.test||Boolean(result)||rolling;
  preview.replaceChildren();
  if(!preview.hidden){
    const heading=document.createElement('p');heading.className='outcome-heading';heading.textContent='Možné následky · odhalí je až hod';
    preview.append(heading);
    for(const tier of ['criticalSuccess','greatSuccess','success','partialSuccess','failure','criticalFailure']){
      const slot=document.createElement('span');slot.className='outcome-slot';
      slot.textContent='▒▒▒▒▒▒▒▒▒▒';slot.setAttribute('aria-label','Skrytý následek');
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
  $('roll').disabled=rolling||state.ended||!choice?.available;
  $('next').disabled=rolling||state.ended||!result;
  $('endRound').disabled=rolling||state.ended;
  $('gameStatus').textContent=state.ended?'Konec scénáře: temnota zvítězila. Začni novou hru.':'';
  $('log').replaceChildren(...(rolling?[]:state.log).map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));
  if(choiceFocus){const target=[...$('choices').children].find(b=>b.dataset.choiceId===choiceFocus);if(target&&!target.disabled)target.focus();}
  if(mapFocus){$('cardTitle').focus({preventScroll:true});}
}
const status=document.createElement('p');status.id='gameStatus';status.setAttribute('role','status');$('cardTitle').before(status);
const journal=createJournal($('history'),()=>dispatch({type:'deduce',revision:state.revision}));
$('roll').onclick=()=>{
  if(rolling||$('roll').disabled)return;
  const card=currentCard(state),choice=selectedChoice(state,card);
  const next=transition(state,{type:'resolve',revision:state.revision,cardId:card.id,choiceId:choice.id,...(choice.test?{dice:rollDice()}:{})});
  if(next===state)return;state=next;persist();
  if(!choice.test){render();return;}
  rolling=true;for(const id of ['die1','die2'])$(id).classList.add('rolling');render();
  timer=setTimeout(()=>{rolling=false;for(const id of ['die1','die2'])$(id).classList.remove('rolling');render();},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:900);
};
$('next').onclick=()=>dispatch({type:'next'});
$('endRound').onclick=()=>dispatch({type:'endRound'});
$('reset').onclick=()=>{
  if(!confirm('Opravdu začít novou hru?'))return;
  clearTimeout(timer);rolling=false;for(const id of ['die1','die2'])$(id).classList.remove('rolling');
  state=newState();persist();render();
};
render();

const details=$('details');
for(const opener of document.querySelectorAll('[data-panel]')){
  opener.setAttribute('aria-haspopup','dialog');opener.setAttribute('aria-controls','details');
  opener.onclick=()=>{
    for(const panel of details.querySelectorAll('.detail-panel'))panel.hidden=panel.id!==opener.dataset.panel;
    details.showModal();
    if(opener.dataset.focus){const target=$(opener.dataset.focus);target.tabIndex=-1;target.focus();}
  };
}
$('closeDetails').onclick=()=>details.close();
