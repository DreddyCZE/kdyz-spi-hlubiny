// Progressive enhancement only: the existing scenario engine owns all actions and saves.
const params=new URLSearchParams(location.search);
if(params.get('ui')==='v3'){
 document.body.classList.add('v3');
 // V3 branding only; the original document and game mode remain intact.
 const brand=document.querySelector('.top h1'),subtitle=document.querySelector('.top .edition');
 if(brand)brand.textContent='BLACKWATER';
 if(subtitle)subtitle.textContent='Zvony pod přílivem · Vyšetřovací příběh';
 const css=document.createElement('link');css.rel='stylesheet';css.href='./src/ui/v3-prototype.css';document.head.append(css);
 const layout=document.querySelector('.layout'),story=document.getElementById('storyPanel');
 const toolbar=document.createElement('section');toolbar.className='v3-toolbar';toolbar.setAttribute('aria-label','Ovládání prototypu');
 const heading=document.createElement('strong');heading.textContent='BLACKWATER V3 · Interaktivní mapa';
 const open=document.createElement('button');open.type='button';open.textContent='📜 Otevřít příběhovou kartu';
 const investigate=document.createElement('button');investigate.type='button';investigate.textContent='🔎 Prozkoumat lokaci';
 const journal=document.createElement('button');journal.type='button';journal.textContent='📖 Deník';
 const hint=document.createElement('p');hint.className='v3-help';hint.textContent='Vyber lokaci na mapě, otevři příběhovou kartu a pokračuj ve vyšetřování.';
 layout.before(toolbar);toolbar.append(heading,open,investigate,journal);toolbar.after(hint);
 const dialog=document.createElement('dialog');dialog.id='v3-story-dialog';dialog.setAttribute('aria-label','Příběhová karta');
 const top=document.createElement('div');top.className='v3-dialog-top';
 const title=document.createElement('strong');title.textContent='PŘÍBĚHOVÁ KARTA';
 const close=document.createElement('button');close.type='button';close.textContent='Zpět na mapu';
 top.append(title,close);dialog.append(top);document.body.append(dialog);
 const placeholder=document.createComment('Původní umístění příběhové karty');story.before(placeholder);
 dialog.append(story);
 const show=()=>{
   const place=document.getElementById('placeTitle')?.textContent?.trim();
   title.textContent='PŘÍBĚHOVÁ KARTA'+(place?' · '+place:'');
   if(!dialog.open)dialog.showModal();
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
 const equip=document.createElement('button');equip.type='button';equip.textContent='🎒 Vybavení';equip.onclick=()=>document.querySelector('[data-panel="inventory-panel"]')?.click();
 const ability=document.createElement('button');ability.type='button';ability.textContent='✦ Schopnosti';ability.onclick=()=>document.querySelector('[data-panel="investigator"]')?.click();
 const chooseSlot=document.createElement('div');chooseSlot.className='v3-investigator-setup';
 chooseSlot.setAttribute('aria-label','Začátek vyšetřování');
 hud.append(hudTitle,chooseSlot,portrait,heroName,role,vitals,equip,ability);
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
   if(choosing)heroName.textContent='Vyber si vyšetřovatele';
 };
 const setupObserver=new MutationObserver(syncOnboarding);
 setupObserver.observe(story,{childList:true,subtree:true});
 syncOnboarding();
 const locationHeading=document.createElement('h2');locationHeading.textContent='Aktuální lokace';
 const locationName=document.createElement('h3'),locationDescription=document.createElement('p');
 const actionLabel=document.createElement('h2');actionLabel.textContent='Dostupné akce';
 const locationActions=document.createElement('div');locationActions.className='v3-location-actions';
 const explore=document.createElement('button');explore.textContent='🔎 Prozkoumat · karta';explore.onclick=show;
 const clues=document.createElement('button');clues.textContent='⌕ Důkazy a dedukce';clues.onclick=()=>document.querySelector('[data-panel="investigation-journal"]')?.click();
 const rounds=document.createElement('button');rounds.textContent='◷ Ukončit kolo';rounds.onclick=()=>document.getElementById('endRound')?.click();
 locationActions.append(explore,clues,rounds);
 locationPanel.append(locationHeading,locationName,locationDescription,actionLabel,locationActions);
 // Reuse the existing live location illustration, description and contextual hint.
 // This avoids a duplicate location card under the map and keeps app.js as source of truth.
 const originalLocation=document.querySelector('.map-panel .hero');
 if(originalLocation){
   locationHeading.after(originalLocation);
   locationName.remove();
   locationDescription.remove();
 }
 const getText=id=>document.getElementById(id)?.textContent?.trim()||'—';
 const updateHud=()=>{
   heroName.textContent=getText('investigatorName');role.textContent=getText('investigatorRole');
   const source=document.getElementById('investigatorPortrait');
   if(source)portrait.style.backgroundImage=getComputedStyle(source).backgroundImage;
   vitals.replaceChildren(...[['♥','Životy','hp'],['◉','Příčetnost','san'],['◆','Akční body','ap']].map(([icon,label,id])=>{
     const item=document.createElement('div');item.className='v3-vital';
     const labelNode=document.createElement('span');labelNode.textContent=icon+' '+label;
     const value=document.createElement('strong');value.textContent=getText(id);
     item.append(labelNode,value);return item;
   }));
   locationName.textContent=getText('placeTitle');locationDescription.textContent=getText('placeDesc');
   rounds.disabled=document.getElementById('endRound')?.disabled||false;
   explore.disabled=false;
   syncOnboarding();
 };
 let pendingRefresh=false;
 const scheduleRefresh=()=>{if(pendingRefresh)return;pendingRefresh=true;queueMicrotask(()=>{pendingRefresh=false;updateHud();});};
 const sources=['round','hp','san','ap','placeTitle','placeDesc','investigatorName','investigatorRole','investigatorPortrait','endRound'];
 const observer=new MutationObserver(scheduleRefresh);
 for(const id of sources){const el=document.getElementById(id);if(el)observer.observe(el,{subtree:true,childList:true,characterData:true,attributes:id==='investigatorPortrait'||id==='endRound'});}
 updateHud();

 open.addEventListener('click',show);
 investigate.addEventListener('click',()=>{show();const draw=document.getElementById('draw');if(draw&&!draw.disabled)draw.focus();});
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 journal.addEventListener('click',()=>document.querySelector('[data-panel="investigation-journal"]')?.click());
 // Keep the map visible and functional; opening a card is a presentation-only operation.
 document.getElementById('places')?.addEventListener('click',event=>{
   const button=event.target.closest('button[data-location-id]');
   if(button&&!button.disabled){const name=button.textContent.replace(/[◇◉▣]/g,'').trim();title.textContent='PŘÍBĚHOVÁ KARTA · '+name;}
 });
}
