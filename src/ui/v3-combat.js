// Blackwater V3 presentation adapter: the scenario engine still owns every combat action.
import {enemies} from '../engine/combat.js';
import {blackwaterImage} from '../data/story-art.js';
import {openDialog} from './v3-dialog.js';

const artUrl=(group,id)=>{
 const art=blackwaterImage(group,id);
 return art?new URL(art,document.baseURI).href:null;
};

export function mountV3Combat({story,locationActions}){
 const battle=document.createElement('dialog');
 battle.id='v3-combat-dialog';
 battle.setAttribute('aria-label','Střetnutí ve Blackwateru');
 battle.innerHTML=`
 <div class="v3-battle-heading">
   <div><span class="v3-battle-eyebrow">⚔ STŘETNUTÍ</span><h2 id="v3-battle-title">Souboj</h2></div>
   <button type="button" id="v3-battle-close">Zpět na mapu ✕</button>
 </div>
 <div class="v3-battle-pair">
   <div class="v3-battle-actor"><div class="v3-battle-portrait" id="v3-battle-hero-art" role="img" aria-label="Vyšetřovatel"></div><h3 id="v3-battle-hero"></h3><p id="v3-battle-hp"></p></div>
   <div class="v3-battle-versus" aria-hidden="true">⚔</div>
   <div class="v3-battle-actor"><div class="v3-battle-portrait" id="v3-battle-enemy-art" role="img" aria-label="Nepřítel"></div><h3 id="v3-battle-enemy"></h3><p id="v3-battle-enemy-hp"></p></div>
 </div>
 <div class="v3-battle-rules"><span id="v3-battle-round"></span><span>Útok nebo únik · hod dvěma kostkami</span></div>
 <div class="v3-battle-dice-tray" aria-label="Výsledek posledního hodu">
  <span class="v3-battle-dice-title">POSLEDNÍ HOD</span>
  <div id="v3-battle-dice" aria-live="polite"><span class="v3-battle-die">?</span><span class="v3-battle-die">?</span></div>
 </div>
 <div id="v3-battle-controls"></div>`;
 const equipment=document.createElement('p');equipment.className='v3-battle-equipment';battle.append(equipment);
 const $=id=>battle.querySelector('#'+id);
 const originalClose=$('v3-battle-close');
 const returnToMap=()=>{if(battle.open)battle.close();};
 originalClose.addEventListener('click',returnToMap);
 battle.addEventListener('close',()=>{
   // The section is restored when combat has ended; unfinished encounters can be reopened.
   if(section&&!isActive()&&section.parentNode!==story)story.querySelector('#cardStory')?.before(section);
 });
 document.body.append(battle);
 const reopen=document.createElement('button');
 reopen.type='button';reopen.className='v3-combat-reopen';reopen.textContent='⚔ Pokračovat v souboji';
 reopen.hidden=true;
 reopen.onclick=()=>{openDialog(battle,reopen);refresh();};
 locationActions.prepend(reopen);
 let section=null,seenActive=false,lastRoll='';
 const combat=()=>JSON.parse(section?.dataset.combat||'null');
 const isActive=()=>combat()?.status==='active';
 const setPicture=(node,path)=>{node.style.backgroundImage=path?'url("'+path+'")':'none';};
 function refresh(){
   if(!section)return;
   const ended=document.body.classList.contains('v3-ended');
   const active=isActive()&&!ended;
   const current=combat();
   const enemy=enemies.find(e=>e.id===current?.enemyId);
   const finished=Boolean(current&&current.status!=='active');
   const summary=section.querySelector('[role="status"]')?.textContent||'';
   const showFight=!ended&&(active||(battle.open&&finished));
   reopen.hidden=!active;
   if(!showFight){
     if(battle.open)battle.close();
     if(section.parentNode!==story)story.querySelector('#cardStory')?.before(section);
     seenActive=false;
     lastRoll='';
     return;
   }
   if(section.parentNode!==$('v3-battle-controls'))$('v3-battle-controls').append(section);
   if(active&&!battle.open&&!seenActive)openDialog(battle,reopen);
   if(active)seenActive=true;
   $('v3-battle-title').textContent=active?'Tváří v tvář temnotě':'Výsledek střetnutí';
   $('v3-battle-hero').textContent=document.getElementById('investigatorName')?.textContent||'Vyšetřovatel';
   $('v3-battle-hp').textContent='Životy '+(document.getElementById('hp')?.textContent||'—')+' · Příčetnost '+(document.getElementById('san')?.textContent||'—');
   const heroPicture=getComputedStyle(document.getElementById('investigatorPortrait')).backgroundImage;
   $('v3-battle-hero-art').style.backgroundImage=heroPicture;
   const carried=[...document.querySelectorAll('#scenario-equipment [data-item-id]')];
   equipment.textContent=carried.map(item=>item.textContent).join(' · ')+(active?' · Spotřební předměty použij mezi střetnutími.':'');
   $('v3-battle-enemy').textContent=enemy?.name||'Nepřítel';
   $('v3-battle-enemy-hp').textContent=enemy?'Životy '+current.enemyHp+' / '+enemy.hp:'';
   $('v3-battle-round').textContent='Výměna '+current.exchange+' / 3';
   const enemyArt=enemy?artUrl('monsters',enemy.id):null;
   setPicture($('v3-battle-enemy-art'),enemyArt);
   $('v3-battle-enemy-art').setAttribute('aria-label',enemy?.name||'Nepřítel');
   originalClose.textContent=finished?'Pokračovat ve vyšetřování →':'Zpět na mapu ✕';
   battle.classList.toggle('v3-battle-finished',finished);
   // The engine's result description remains below its own buttons, so no outcome is fabricated.
   if(summary!==lastRoll){
     lastRoll=summary;
     $('v3-battle-dice').replaceChildren(...(current.dice||['?','?']).map(value=>{
       const tile=document.createElement('span');tile.className='v3-battle-die';
       tile.textContent=value;return tile;
     }));
   }
   if(finished)$('v3-battle-round').textContent=current.status==='defeated'?'Vítězství · protivník poražen':'Únik ze střetnutí';
 }
 function install(target){
   if(section)return;
   section=target;
   const changes=new MutationObserver(refresh);
   changes.observe(section,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-combat']});
   refresh();
 }
 const existing=story.querySelector('[aria-label="Taktický souboj"]');
 if(existing)install(existing);
 else {
   const setup=new MutationObserver(()=>{
     const target=story.querySelector('[aria-label="Taktický souboj"]');
     if(target){setup.disconnect();install(target);}
   });
   setup.observe(story,{subtree:true,childList:true});
 }
 return {dialog:battle,reopen};
}
