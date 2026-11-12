import {enemies} from '../engine/combat.js';
import {renderRules} from './rules.js';
import {createOnboarding} from './onboarding.js';
import {createTablePresentation} from './table.js';
import {investigators} from '../engine/scenario-investigators.js';
import { activeScenarioPack } from '../data/scenario-registry.js';
import { reachableOutcomeKeys } from './story-card.js';
import { imageForCard, blackwaterImage } from '../data/story-art.js';
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
renderRules($('rules-panel'),{legacy:legacyMode,rounds:legacyMode?7:activeScenario.rules.maxRounds,ap:legacyMode?3:activeScenario.rules.apPerRound,automaticDeductions:activeScenario.rules.deductionMode==='automatic'});
$('investigatorName').textContent=investigatorName;
// The original occultist illustration is atmospheric art, not a selectable class.
const portrait=blackwaterImage('investigators','occultist');
if(portrait)$('investigatorPortrait').style.backgroundImage=`url("${new URL(portrait,document.baseURI).href}")`;
let storage;try{storage=window.localStorage;}catch{/* unavailable storage is handled below */}
mountSaveNotice(storage,legacyMode?'legacy':'scenario');
const preferenceStorage=storage;
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
const equipmentActions=document.createElement('section');equipmentActions.className='scenario-feature';equipmentActions.setAttribute('aria-label','Výbava vyšetřovatele');$('fieldKit').append(equipmentActions);
const combatActions=document.createElement('section');combatActions.className='scenario-feature';combatActions.setAttribute('aria-label','Taktický souboj');$('cardStory').before(combatActions);
const investigatorSetup=document.createElement('section');investigatorSetup.className='scenario-feature';investigatorSetup.setAttribute('aria-label','Výběr vyšetřovatele');$('cardStory').before(investigatorSetup);
const onboarding=legacyMode?null:createOnboarding(investigatorSetup,preferenceStorage,session);
if(onboarding){const reopen=document.createElement('button');reopen.type='button';reopen.textContent='Průvodce hrou';reopen.onclick=()=>onboarding.reopen();document.querySelector('[data-panel="rules-panel"]').after(reopen);}
const investigatorAbility=document.createElement('section');investigatorAbility.className='scenario-feature';investigatorAbility.setAttribute('aria-label','Schopnost vyšetřovatele');$('fieldKit').append(investigatorAbility);
const currentAim=document.createElement('p');currentAim.className='current-aim';currentAim.setAttribute('aria-label','Aktuální směr pátrání');$('placeDesc').after(currentAim);
function button(text,handler,disabled=false,className=''){
  const b=document.createElement('button');b.textContent=text;b.onclick=handler;b.disabled=disabled;b.className=className;return b;
}
function persist(){ $('saveStatus').textContent=(legacyMode?saveLegacy(storage,state,content):saveScenarioSession(storage,session,activeScenario,content))?'':'Ukládání není dostupné nebo jsou původní data chráněna. Hra pokračuje pouze v této záložce.'; }
function dispatch(action){
  if(rolling)return;
  const next=scenarioSessionTransition(session,action,activeScenario,content);
  if(next===session)return;
  tablePresentation.clear();session=next;state=session.game;
  if(action.type==='endRound'&&!legacyMode&&!state.ended&&!session.scenario.endingId){
    const scene=scenarioSessionView(session,activeScenario,content);tablePresentation.showMyth(state.round,scene.clocks);
  }
  persist();render();
}
let combatBeforeRoll=null;
function animateAction(action){
  if(rolling)return;
  const next=scenarioSessionTransition(session,action,activeScenario,content);
  if(next===session)return;
  combatBeforeRoll=action.type==='combatTurn'?{combat:session.scenario.combat,hp:state.hp,san:state.san}:null;
  tablePresentation.clear();session=next;state=session.game;persist();rolling=true;render();
  timer=setTimeout(()=>{rolling=false;combatBeforeRoll=null;render();},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:900);
}
function render(){
  const focused=document.activeElement;
  const choiceFocus=focused?.dataset.choiceId;
  const mapFocus=focused?.dataset.locationId;
  const puzzleFocus=focused?.dataset.puzzleControl;
  for(const k of ['round','threat','ap','hp','san'])$(k).textContent=combatBeforeRoll&&['hp','san'].includes(k)?combatBeforeRoll[k]:state[k];
  const scene=scenarioSessionView(session,activeScenario,content);
  if(combatBeforeRoll)scene.combat=combatBeforeRoll.combat;
  if(rolling)scene.canAct=false;
  for(const id of ['die1','die2'])$(id).classList.toggle('rolling',rolling);
  currentAim.hidden=legacyMode;
  currentAim.textContent=scene.ending||state.ended?'Vyšetřování skončilo. Výsledek najdeš u příběhové karty.':scene.availableEndings.length?'V jeskyních se můžeš rozhodnout, jak vyšetřování uzavřeš.':state.evidence.length?'Porovnávej důkazy v deníku, prozkoumej další místa a připrav se na cestu do jeskyní.':'Začni v přístavu: dober kartu a získej první stopu po zmizelé posádce.';
  onboarding?.render(session,scene);
  investigatorSetup.hidden=legacyMode||scene.investigatorId!==null;
  investigatorSetup.replaceChildren();
  if(!investigatorSetup.hidden){for(const hero of investigators){investigatorSetup.append(button(`${hero.name} · HP ${hero.hp} / SAN ${hero.san} · ${hero.ability}`,()=>dispatch({type:'selectInvestigator',revision:state.revision,investigatorId:hero.id}),false,'investigator-card'));}}
  equipmentActions.replaceChildren();
  const equipmentNames={'bw-bandage':'Obvaz · obnovit 2 HP','bw-salt':'Sůl · snížit hrozbu','bw-laudanum':'Laudanum · obnovit 2 SAN','bw-revolver':'Revolver · +1 k útoku'};
  for(const id of scene.equipment||[]){equipmentActions.append(id==='bw-revolver'?document.createTextNode(equipmentNames[id]):button(equipmentNames[id],()=>dispatch({type:'useEquipment',revision:state.revision,itemId:id}),!scene.canAct||!!scene.pendingTest));}
  combatActions.replaceChildren();
  if(scene.combat?.status==='active'){
    const art=blackwaterImage('monsters',scene.combat.enemyId);
    if(art){const image=document.createElement('img');image.className='combat-portrait';image.src=art;image.alt=enemies.find(e=>e.id===scene.combat.enemyId).name;combatActions.append(image);}
  }
  if(scene.combat?.status==='active'){
    const enemy=enemies.find(e=>e.id===scene.combat.enemyId);
    const title=document.createElement('p');title.textContent='Souboj: '+enemy.name+' · HP '+scene.combat.enemyHp+'/'+enemy.hp+' · výměna '+scene.combat.exchange+'/3';combatActions.append(title);
    const cost=document.createElement('p');cost.textContent='Zahájení stálo 1 AP. Další výměny už AP nestojí. Útok i útěk mohou způsobit zranění; po třetí výměně následuje vynucený únik.';combatActions.append(cost);
    for(const move of ['attack','escape'])combatActions.append(button(move==='attack'?'🎲 Zaútočit':'🎲 Pokusit se uniknout',()=>animateAction({type:'combatTurn',revision:state.revision,move,dice:rollDice()}),rolling));
  }else{
    if(scene.combat){const text=document.createElement('p');text.textContent=scene.combat.status==='defeated'?'Nepřítel byl poražen.':'Podařilo se uniknout.';combatActions.append(text);}
      if(!legacyMode&&scene.canAct&&state.ap>=1){
      for(const encounter of scene.availableEncounters)combatActions.append(button('Střetnutí: '+encounter.name+' · 1 AP',()=>dispatch({type:'startCombat',revision:state.revision,enemyId:encounter.enemyId})));
    }
  }
  if(scene.combat&&(rolling||scene.combat.roll)){
    const dice=document.createElement('div');dice.className='combat-dice';dice.setAttribute('aria-label',rolling?'Kostky se kutálejí':'Kostky poslední výměny');
    for(const value of rolling?['?','?']:scene.combat.dice){const die=document.createElement('span');die.className='die'+(rolling?' rolling':'');die.textContent=value;dice.append(die);}
    combatActions.append(dice);
  }
  if(scene.combat?.roll&&!rolling){const last=document.createElement('p');last.setAttribute('role','status');last.textContent='Poslední výměna: '+(scene.combat.lastMove==='attack'?'útok':'útěk')+' · '+scene.combat.dice.join(' + ')+' · '+labels[scene.combat.roll.key];combatActions.append(last);}
  investigatorAbility.replaceChildren();
  if(scene.investigator){investigatorAbility.append(button(scene.abilityUsed?'Schopnost použita':'Použít schopnost: '+scene.investigator.ability,()=>dispatch({type:'useInvestigatorAbility',revision:state.revision}),scene.abilityUsed||!scene.canAct||!!scene.pendingTest));}
  if(scene.investigator?.passive){const p=document.createElement('p');p.textContent=scene.investigator.passive.name+': '+scene.investigator.passive.text+(scene.passiveUsed?' V tomto kole využito.':'');investigatorAbility.append(p);}
  $('investigatorName').textContent=scene.investigator?.name||investigatorName;
  $('investigatorRole').textContent=scene.investigator?scene.investigator.role+' · hlavní scénář':'Výzkumnice · hlavní scénář';
  const selectedPortrait=blackwaterImage('investigators',scene.investigator?.id||'occultist');
  $('investigatorPortrait').style.backgroundImage=selectedPortrait?`url("${new URL(selectedPortrait,document.baseURI).href}")`:'';
  $('investigatorPortrait').setAttribute('aria-label',scene.investigator?'Portrét: '+scene.investigator.name:'Atmosférická ilustrace vyšetřovatelky');
  const pending=scene.pendingTest;
  const clock=scene.clocks.find(c=>c.id===clockDisplayId)||scene.clocks[0];
  $('ritual').textContent=clock?clock.current+' / '+clock.max:'—';
  $('clockLabel').textContent=clock?.label||'Scénářové hodiny';
  $('ritual').title=clock?.label||'Scénářové hodiny';
  $('heroStats').textContent=`HP ${state.hp}/${scene.investigator?.hp||6} · SAN ${state.san}/${scene.investigator?.san||8} · ${Object.entries(attributes).map(([k,v])=>`${k} ${v}`).join(' · ')}`;
  const investigation=investigationView(state,content);
  $('inventory').textContent=[...state.inventory.map(id=>rewardNames[id]),...investigation.evidence.filter(e=>!e.carriedBy.length).map(e=>e.name)].join(' · ')||'Zatím nic.';
  journal.render(investigation,rolling||!scene.canAct,rolling?[]:state.log,!legacyMode&&activeScenario.rules.deductionMode==='automatic');
  const loc=locations.find(l=>l.id===state.locationId),card=currentCard(state,content),choice=selectedChoice(state,card);
  const result=visibleResult(state,content),deck=explorationView(state,content);
  tablePresentation.render({scene,cardId:card?.id,locationId:state.locationId,legacy:legacyMode,rolling});
  $('deckName').textContent=deck.name;
  $('deckDescription').textContent=deck.description;
  $('deckCounts').textContent=`Dostupné: ${deck.available} · Odložené: ${deck.deferred} · Vyřešené: ${deck.consumed}`;
  $('draw').hidden=Boolean(card);$('draw').disabled=rolling||!!pending||!scene.canAct||!deck.canDraw;
  $('placeTitle').textContent=loc.name;$('placeDesc').textContent=loc.description;
  const locationArt=blackwaterImage('locations',loc.id);
  const hero=$('placeTitle').closest('.hero');
  hero.classList.toggle('has-location-art',Boolean(locationArt));
  hero.style.setProperty('--location-art',locationArt?`url("${new URL(locationArt,document.baseURI).href}")`:'none');
  $('mapTitle').textContent=scenarioMap.name;
  renderMap($('places'),locations,scenarioMap,state,rolling||!!pending||!scene.canAct,id=>dispatch({type:'move',locationId:id}));
  $('cardArt').classList.toggle('empty',!card);
  $('cardArt').style.backgroundImage = `linear-gradient(180deg, #06141322 45%, #061413c9), url("${new URL(imageForCard(card||{locationId:loc.id}), document.baseURI).href}")`;
  $('cardTag').textContent=(scene.combat?.status==='active'?'Souboj':({encounter:'Setkání',event:'Událost',item:'Předmět',evidence:'Důkaz'}[card?.type]||'Průzkum')).toUpperCase()+' · '+loc.name.toUpperCase();
  $('cardTitle').textContent=scene.combat?.status==='active'?'Souboj · '+enemies.find(e=>e.id===scene.combat.enemyId).name:card?.title||(deck.canDraw?'Neznámá karta čeká':'Žádná dostupná karta');
  $('cardStory').textContent=card?.description||(deck.canDraw?'Dobrat kartu je zdarma. AP zaplatíš až za zvolený postup.':'Zdejší balíček je vyčerpaný nebo zbývající karty zatím nesplňují podmínky. Vydej se jinam nebo pokračuj do dalšího kola.');
  const testBonus=choice?.test?(scene.testBonuses?.[choice.test.attribute]||0):0;
  $('challenge').textContent=choice?`${choice.apCost} AP · `+(choice.test?`Test ${choice.test.attribute} · obtížnost ${choice.test.difficulty} · modifikátor ${choice.test.modifier||0}${testBonus?' · postava +'+testBonus:''}`:'Rozhodnutí bez testu'):'';
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
    for(const tier of reachableOutcomeKeys({...choice,test:{...choice.test,modifier:(choice.test.modifier||0)+testBonus}})){
      const slot=document.createElement('span');slot.className='outcome-slot';
      slot.textContent=labels[tier];slot.setAttribute('aria-label',labels[tier]+' · následek je skrytý');
      preview.append(slot);
    }
  }
  $('dicebox').classList.toggle('show',!combatBeforeRoll&&(Boolean(result)||rolling||Boolean(pending)));
  // While rolling, do not put the hidden result into the DOM at all.
  $('reveal').classList.toggle('show',Boolean(result)&&!rolling);
  $('reveal').textContent=result&&!rolling?labels[result.key]+' — '+result.text:'';
  if(result&&!rolling)$('reveal').dataset.outcome=result.key;else delete $('reveal').dataset.outcome;
  if(rolling){$('die1').textContent='?';$('die2').textContent='?';$('sum').textContent='Kostky se kutálejí…';}
  else if(pending){
    const dice=pending.secondDice||pending.firstDice;
    $('die1').textContent=dice[0];$('die2').textContent=dice[1];
    $('sum').textContent=(pending.secondDice?'Přehod':'První hod')+' · '+labels[evaluatePending(dice,choice?.test,testBonus).key]+' · potvrď výsledek níže.';
  }else if(result){
    $('die1').textContent=result.dice?.[0]??'—';$('die2').textContent=result.dice?.[1]??'—';
    $('sum').textContent=result.test?`${result.dice.join(' + ')} + ${attributes[result.test.attribute]} + ${result.test.modifier||0}${result.testBonus?' + '+result.testBonus+' (postava)':''} = ${result.total} proti obtížnosti ${result.test.difficulty}`:'Rozhodnutí bez hodu kostkami.';
  }else{$('die1').textContent='?';$('die2').textContent='?';$('sum').textContent='';}
  $('roll').textContent=choice?.test?'🎲 Hodit kostkami':'Provést rozhodnutí';
  $('roll').hidden=Boolean(pending);
  rerollControls.hidden=!pending;
  if(pending){
    const first=evaluatePending(pending.firstDice,choice?.test,testBonus);
    const second=pending.secondDice?evaluatePending(pending.secondDice,choice?.test,testBonus):null;
    rerollInfo.textContent=rolling?'Kostky se kutálejí…':'První hod: '+pending.firstDice.join(' + ')+' · '+labels[first.key]+(second?' | Přehod: '+pending.secondDice.join(' + ')+' · '+labels[second.key]:'')+'. Následky se odkryjí až po potvrzení.';
    rerollButton.textContent='Sebrat odvahu · přehodit za '+scene.rerollCost+' SAN';
    rerollButton.disabled=rolling||!!second||state.san<=scene.rerollCost;
    acceptButton.disabled=rolling;
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
    const section=document.createElement('section');section.className='puzzle-panel';section.dataset.puzzleId=p.id;
    const title=document.createElement('h3');title.textContent=p.title;section.append(title);
    const status=document.createElement('p');status.textContent=p.status==='solved'?'Vyřešeno':p.status==='bypassed'?'Náhradní cesta dokončena':p.status==='blocked'?'Pokusy vyčerpány · hledej jinou cestu':'Hádanka · pokusy '+p.attempts;section.append(status);
    for(const text of [p.description,p.riskText,p.resultText,p.status==='open'&&!p.canAttempt?'Chybí podklady pro ověření řešení. Vrať se pro uvedené důkazy.':''].filter(Boolean)){const note=document.createElement('p');note.textContent=text;section.append(note);}
    for(const clue of p.clues){const item=document.createElement('p');item.textContent=clue.text;section.append(item);}
    for(const hint of p.hints){const item=document.createElement('p');item.textContent='Nápověda: '+hint.text;section.append(item);}
    if(p.fallback&&scene.canAct&&!pending)section.append(button(p.fallback.text+' · '+p.fallback.apCost+' AP',()=>dispatch({type:'usePuzzleFallback',revision:state.revision,puzzleId:p.id}),state.ap<p.fallback.apCost));
    if(p.status==='open'&&p.canAttempt&&scene.canAct&&!pending){
      const answer=[];
      if(p.type==='sequence'){
        const previous=p.draft??puzzleDrafts.get(p.id);
        answer.push(...(Array.isArray(previous)&&previous.length===p.interaction.symbols.length&&previous.every(x=>p.interaction.symbols.includes(x))?previous:p.interaction.symbols));
        const controls=document.createElement('div');controls.className='puzzle-sequence';
        const draw=()=>{
          controls.replaceChildren(...answer.map((symbol,i)=>{
            const cell=document.createElement('div');cell.className='puzzle-symbol';
            const label=document.createElement('span');label.textContent=symbol;cell.append(label);
            const left=button('←',()=>{[answer[i-1],answer[i]]=[answer[i],answer[i-1]];puzzleDrafts.set(p.id,[...answer]);dispatch({type:'setPuzzleDraft',revision:state.revision,puzzleId:p.id,answer:[...answer]});},i===0);
            const right=button('→',()=>{[answer[i],answer[i+1]]=[answer[i+1],answer[i]];puzzleDrafts.set(p.id,[...answer]);dispatch({type:'setPuzzleDraft',revision:state.revision,puzzleId:p.id,answer:[...answer]});},i===answer.length-1);
            left.setAttribute('aria-label','Posunout '+symbol+' doleva');
            right.setAttribute('aria-label','Posunout '+symbol+' doprava');
            left.dataset.puzzleControl=p.id+'-'+symbol+'-left';right.dataset.puzzleControl=p.id+'-'+symbol+'-right';
            cell.append(left,right);return cell;
          }));
        };draw();section.append(controls);
      }else if(p.type==='deduction'){
        const select=document.createElement('select');
        select.setAttribute('aria-label','Vyber závěr');
        for(const option of p.interaction.options){const el=document.createElement('option');el.value=option;el.textContent=p.labels[option]||option;select.append(el);}
        const previous=p.draft??puzzleDrafts.get(p.id);
        if(typeof previous==='string'&&p.interaction.options.includes(previous))select.value=previous;
        select.dataset.puzzleControl=p.id+'-conclusion';
        select.onchange=()=>dispatch({type:'setPuzzleDraft',revision:state.revision,puzzleId:p.id,answer:select.value});
        section.append(select);answer.push(select);
      }else if(p.type==='matching'||p.type==='mechanism'){
        const keys=p.type==='matching'?p.interaction.left:p.interaction.controls;
        const optionsFor=key=>p.type==='matching'?p.interaction.right:p.interaction.states[key];
        const previous=p.draft??puzzleDrafts.get(p.id);
        const selections=new Map();
        for(const key of keys){
          const line=document.createElement('label');line.className='puzzle-match-row';
          const text=document.createElement('span');text.textContent=p.labels[key]||key;line.append(text);
          const select=document.createElement('select');select.setAttribute('aria-label','Nastavení: '+(p.labels[key]||key));
          for(const value of optionsFor(key)){
            const option=document.createElement('option');option.value=value;option.textContent=p.labels[value]||value;select.append(option);
          }
          if(previous&&typeof previous==='object'&&!Array.isArray(previous)&&optionsFor(key).includes(previous[key]))select.value=previous[key];
          selections.set(key,select);
          select.dataset.puzzleControl=p.id+'-'+key;
          select.onchange=()=>dispatch({type:'setPuzzleDraft',revision:state.revision,puzzleId:p.id,answer:Object.fromEntries([...selections].map(([k,v])=>[k,v.value]))});
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
  finaleActions.replaceChildren(...scene.availableEndings.map(e=>{const section=document.createElement('section');const prompt=document.createElement('p');prompt.textContent=e.prompt||'';section.append(prompt,button('Dokončit scénář: '+e.title,()=>dispatch({type:'finishScenario',revision:state.revision,endingId:e.id}),false,'primary'));return section;}));
  for(const text of scene.epilogue||[]){const paragraph=document.createElement('p');paragraph.textContent=text;finaleActions.append(paragraph);}
  $('gameStatus').textContent=scene.ending?'Konec scénáře: '+scene.ending.title+'.':state.ended?'Vyšetřovatel již nemůže pokračovat. Začni novou hru.':'';
  $('log').replaceChildren(...(rolling?[]:state.log).map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));
  if(choiceFocus){const target=[...$('choices').children].find(b=>b.dataset.choiceId===choiceFocus);if(target&&!target.disabled)target.focus();}
  if(mapFocus){$('cardTitle').focus({preventScroll:true});}
  if(puzzleFocus){const target=[...puzzleActions.querySelectorAll('[data-puzzle-control]')].find(el=>el.dataset.puzzleControl===puzzleFocus);(target?.disabled?target.parentElement.querySelector('button:not(:disabled)'):target)?.focus();}
}
const evaluatePending=(dice,test,bonus=0)=>{
  if(!test)return {key:'failure'};
  const total=dice[0]+dice[1]+attributes[test.attribute]+(test.modifier||0)+bonus,margin=total-test.difficulty;
  return {key:dice[0]===6&&dice[1]===6?'criticalSuccess':dice[0]===1&&dice[1]===1?'criticalFailure':margin>=3?'greatSuccess':margin>=0?'success':margin>=-2?'partialSuccess':'failure'};
};
const rerollControls=document.createElement('div');rerollControls.hidden=true;
const rerollInfo=document.createElement('p');rerollInfo.setAttribute('role','status');
const rerollButton=button('Sebrat odvahu · přehodit za 1 SAN',()=>animateAction({type:'rerollTest',revision:state.revision,dice:rollDice()}));
const acceptButton=button('Přijmout výsledek',()=>dispatch({type:'acceptTest',revision:state.revision}));
rerollControls.append(rerollInfo,rerollButton,acceptButton);
$('roll').after(rerollControls);
const status=document.createElement('p');status.id='gameStatus';status.setAttribute('role','status');$('cardTitle').before(status);
const companionActions=document.createElement('div');companionActions.id='scenario-companions';companionActions.className='scenario-feature';companionActions.setAttribute('aria-label','Společníci');$('cardStory').after(companionActions);
const puzzleActions=document.createElement('div');puzzleActions.id='scenario-puzzles';puzzleActions.className='scenario-feature';puzzleActions.setAttribute('aria-label','Hádanky v lokaci');$('cardStory').after(puzzleActions);
const finaleActions=document.createElement('div');finaleActions.id='scenario-finale-actions';finaleActions.setAttribute('aria-label','Možná zakončení scénáře');status.after(finaleActions);
const journal=createJournal($('history'),()=>dispatch({type:'deduce',revision:state.revision}));
const tablePresentation=createTablePresentation();
$('roll').onclick=()=>{
  if(rolling||$('roll').disabled)return;
  const card=currentCard(state,content),choice=selectedChoice(state,card);
  const action={type:choice.test?'startTest':'resolve',revision:state.revision,cardId:card.id,choiceId:choice.id,...(choice.test?{dice:rollDice()}:{})};
  if(choice.test)animateAction(action);else dispatch(action);
};
$('draw').onclick=()=>{dispatch({type:'draw',revision:state.revision});$('cardTitle').focus({preventScroll:true});};
$('next').onclick=()=>{dispatch({type:'next'});if(!$('draw').disabled)$('draw').focus({preventScroll:true});};
$('endRound').onclick=()=>dispatch({type:'endRound',revision:state.revision});
$('reset').onclick=()=>{
  if(!confirm('Opravdu začít novou hru?'))return;
  clearTimeout(timer);rolling=false;combatBeforeRoll=null;tablePresentation.clear();for(const id of ['die1','die2'])$(id).classList.remove('rolling');
  session=freshSession();state=session.game;puzzleDrafts.clear();onboarding?.restart();persist();render();
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
