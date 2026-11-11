import {mountV3Combat} from './v3-combat.js';
import {mountV3RoundTransition} from './v3-round.js';
import {mountV3Investigation} from './v3-investigation.js';
import {openDialog,rememberDialogFocus} from './v3-dialog.js';
// Progressive enhancement only: the existing scenario engine owns all actions and saves.
const params=new URLSearchParams(location.search);
if(params.get('ui')==='v3'){
 document.body.classList.add('v3');
 // In this mode the story lives in a closed dialog; keyboard skip must target the map.
 const skip=document.querySelector('a.skip');
 if(skip){skip.href='#places';skip.textContent='Přejít na mapu';}
 // V3 branding only; the original document and game mode remain intact.
 const brand=document.querySelector('.top h1'),subtitle=document.querySelector('.top .edition');
 if(brand)brand.textContent='BLACKWATER';
 if(subtitle)subtitle.textContent='Zvony pod přílivem · Vyšetřovací příběh';
 const css=document.createElement('link');css.rel='stylesheet';css.href='./src/ui/v3-prototype.css';document.head.append(css);
 const layout=document.querySelector('.layout'),story=document.getElementById('storyPanel');
 // Board-first experience: no duplicate global action toolbar.

 const dialog=document.createElement('dialog');dialog.id='v3-story-dialog';dialog.setAttribute('aria-label','Příběhová karta');
 const top=document.createElement('div');top.className='v3-dialog-top';
 const title=document.createElement('strong');title.textContent='PŘÍBĚHOVÁ KARTA';
 const close=document.createElement('button');close.type='button';close.textContent='Zpět na mapu';
 top.append(title,close);dialog.append(top);document.body.append(dialog);
 dialog.append(story);
 const cardTag=document.getElementById('cardTag');
 const updateStoryKind=()=>{
   const kind=cardTag?.dataset.cardType||'exploration';
   dialog.dataset.storyType=kind;
   const labels={event:'KARTA UDÁLOSTI',encounter:'KARTA SETKÁNÍ',evidence:'NALEZENÝ DŮKAZ',item:'NALEZENÝ PŘEDMĚT',exploration:'PŘÍBĚHOVÁ KARTA'};
   const place=document.getElementById('placeTitle')?.textContent?.trim();
   title.textContent=labels[kind]+(place?' · '+place:'');
 };
 if(cardTag)new MutationObserver(updateStoryKind).observe(cardTag,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-card-type']});
 updateStoryKind();
 const show=()=>{
   updateStoryKind();
   openDialog(dialog,explore);
 };
 // Read-only HUD: mirrors the existing engine-rendered DOM rather than duplicating rules.
 const hud=document.createElement('aside');hud.className='v3-hud';hud.setAttribute('aria-label','Přehled vyšetřovatele');
 const locationPanel=document.createElement('aside');locationPanel.className='v3-location-panel';locationPanel.setAttribute('aria-label','Aktuální lokace a akce');
 layout.classList.add('v3-board');layout.prepend(hud);layout.append(locationPanel);
 const hudTitle=document.createElement('h2');hudTitle.textContent='Vyšetřovatel';
 const portrait=document.createElement('div');portrait.className='v3-hud-portrait';
 const heroName=document.createElement('h3');
 const role=document.createElement('p');role.className='v3-small';
 const vitals=document.createElement('div');vitals.className='v3-vitals';
 const openDetails=(id,opener)=>{rememberDialogFocus(document.getElementById('details'),opener);document.querySelector('[data-panel="'+id+'"]')?.click();};
 const equip=document.createElement('button');equip.type='button';equip.textContent='🎒 Vybavení';equip.onclick=()=>openDetails('inventory-panel',equip);
 const ability=document.createElement('button');ability.type='button';ability.textContent='✦ Schopnosti';ability.onclick=()=>openDetails('investigator',ability);
 const chooseSlot=document.createElement('div');chooseSlot.className='v3-investigator-setup';
 chooseSlot.setAttribute('aria-label','Začátek vyšetřování');
 hud.append(hudTitle,heroName,chooseSlot,portrait,role,vitals,equip,ability);
 const introSlot=document.createElement('section');introSlot.className='v3-intro-slot';introSlot.setAttribute('aria-label','Úvod do Blackwateru');
 layout.before(introSlot);
 // The existing engine mounts its investigator chooser and prologue inside the story card.
 // Move the actual DOM nodes into visible V3 onboarding slots (no copied controls or rules).
 const syncOnboarding=()=>{
   const chooser=chooseSlot.querySelector('[aria-label="Výběr vyšetřovatele"]')||story.querySelector('[aria-label="Výběr vyšetřovatele"]');
   const introduction=introSlot.querySelector('.onboarding')||story.querySelector('.onboarding');
   if(chooser&&!chooseSlot.contains(chooser))chooseSlot.append(chooser);
   if(introduction&&!introSlot.contains(introduction))introSlot.append(introduction);
   const choosing=Boolean(chooser&&!chooser.hidden);
   hud.classList.toggle('v3-choosing',choosing);
   document.body.classList.toggle('v3-selecting',choosing);
   if(choosing)heroName.textContent='Vyber si vyšetřovatele';
   return choosing;
 };
 const setupObserver=new MutationObserver(syncOnboarding);
 setupObserver.observe(story,{childList:true,subtree:true});
 syncOnboarding();
 const locationHeading=document.createElement('h2');locationHeading.textContent='Aktuální lokace';
 const actionLabel=document.createElement('h2');actionLabel.textContent='Dostupné akce';
 const locationActions=document.createElement('div');locationActions.className='v3-location-actions';
 const explore=document.createElement('button');explore.textContent='🔎 Prozkoumat · karta';explore.onclick=show;
 const clues=document.createElement('button');clues.textContent='⌕ Důkazy a dedukce';clues.onclick=()=>openDetails('investigation-journal',clues);
 const rounds=document.createElement('button');rounds.textContent='◷ Ukončit kolo';rounds.onclick=()=>document.getElementById('endRound')?.click();
 locationActions.append(explore,clues,rounds);
 locationPanel.append(locationHeading,actionLabel,locationActions);
 mountV3Combat({story,locationActions});
 mountV3RoundTransition();
 // The journal is inserted by app.js; wait until all deferred modules finish.
 if(document.readyState==='complete')mountV3Investigation();
 else document.addEventListener('DOMContentLoaded',mountV3Investigation,{once:true});
 // Reuse the existing live location illustration, description and contextual hint.
 // This avoids a duplicate location card under the map and keeps app.js as source of truth.
 const originalLocation=document.querySelector('.map-panel .hero');
 document.getElementById('placeTitle').tabIndex=-1;
 document.getElementById('places').tabIndex=-1;
 const exploredLegend=document.createElement('span');exploredLegend.textContent='✓ Prozkoumaná';document.querySelector('.map-caption').append(exploredLegend);
 if(originalLocation){
   locationHeading.after(originalLocation);
 }
 const getText=id=>document.getElementById(id)?.textContent?.trim()||'—';
 const updateHud=()=>{
   heroName.textContent=getText('investigatorName');role.textContent=getText('investigatorRole');
   const source=document.getElementById('investigatorPortrait');
   if(source)portrait.style.backgroundImage=getComputedStyle(source).backgroundImage;
   vitals.replaceChildren(...[['♥','Životy','hp'],['◉','Příčetnost','san'],['◆','Akční body','ap']].map(([icon,label,id])=>{
     const item=document.createElement('div');item.className='v3-vital';
     const labelNode=document.createElement('span');labelNode.textContent=icon+' '+label;
     const value=document.createElement('strong');const maximum=document.getElementById(id)?.dataset.max;value.textContent=getText(id)+(maximum?' / '+maximum:'');
     item.append(labelNode,value);return item;
   }));
   rounds.disabled=document.getElementById('endRound')?.disabled||false;
   explore.disabled=syncOnboarding();
 };
 let pendingRefresh=false;
 const scheduleRefresh=()=>{if(pendingRefresh)return;pendingRefresh=true;queueMicrotask(()=>{pendingRefresh=false;updateHud();});};
 const sources=['round','hp','san','ap','placeTitle','placeDesc','investigatorName','investigatorRole','investigatorPortrait','endRound'];
 const observer=new MutationObserver(scheduleRefresh);
 for(const id of sources){const el=document.getElementById(id);if(el)observer.observe(el,{subtree:true,childList:true,characterData:true,attributes:id==='investigatorPortrait'||id==='endRound'});}
 updateHud();

 // Action feedback uses only publicly rendered values, and is never stored in saves.
 const changes=document.createElement('div');changes.className='v3-changes';changes.setAttribute('role','status');changes.setAttribute('aria-label','Změny po akci');
 document.getElementById('reveal').after(changes);
 const reveal=document.getElementById('reveal');
 new MutationObserver(()=>{if(dialog.open&&reveal.dataset.outcome)document.getElementById('dicebox').scrollIntoView({block:'end'});}).observe(reveal,{attributes:true,attributeFilter:['data-outcome']});
 let previous=null,ended=false;
 document.addEventListener('blackwater:render',({detail:view})=>{
   explore.disabled=view.choosing;
   explore.textContent=view.ended?'Zobrazit závěr vyšetřování':'🔎 Prozkoumat · karta';
   document.body.classList.toggle('v3-ended',view.ended);
   if(previous&&!view.choosing){
     const delta=[['hp','HP'],['san','SAN'],['ap','AP'],['threat','Hrozba'],['evidence','Důkazy'],['knowledge','Znalosti']]
       .filter(([key])=>view[key]!==previous[key])
       .map(([key,label])=>{const n=view[key]-previous[key];const token=document.createElement('span');token.textContent=label+' '+(n>0?'+':'')+n;token.dataset.change=String(n);return token;});
     if(delta.length)changes.replaceChildren(...delta);
   }
   if(view.ended&&!ended){show();dialog.dataset.ended='true';}
   if(!view.ended)delete dialog.dataset.ended;
   ended=view.ended;previous=view;
 });

 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
}
