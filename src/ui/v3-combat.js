// Blackwater V3 presentation adapter: the scenario engine still owns every combat action.
import {enemies} from '../engine/combat.js';
import {blackwaterImage} from '../data/story-art.js';

const artUrl=(group,id)=>{
 const art=blackwaterImage(group,id);
 return art?new URL(art,document.baseURI).href:null;
};

export function mountV3Combat({story,storyDialog,locationActions}){
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
 const $=id=>battle.querySelector('#'+id);
 const originalClose=$('v3-battle-close');
 const returnToMap=()=>{if(battle.open)battle.close();if(storyDialog.open)storyDialog.close();};
 originalClose.addEventListener('click',returnToMap);
 battle.addEventListener('close',()=>{
   if(storyDialog.open)storyDialog.close();
   // The section is restored when combat has ended; unfinished encounters can be reopened.
   if(section&&!isActive()&&section.parentNode!==story)story.querySelector('#cardStory')?.before(section);
 });
 document.body.append(battle);
 const reopen=document.createElement('button');
 reopen.type='button';reopen.className='v3-combat-reopen';reopen.textContent='⚔ Pokračovat v souboji';
 reopen.hidden=true;
 reopen.onclick=()=>{if(!battle.open){battle.showModal();refresh();}};
 locationActions.prepend(reopen);
 let section=null,seenActive=false,lastEnemy=null,lastRoll='';
 const isActive=()=>Boolean(section?.firstElementChild?.textContent?.startsWith('Souboj:'));
 const setPicture=(node,path)=>{node.style.backgroundImage=path?'url("'+path+'")':'none';};
 function refresh(){
   if(!section)return;
   const active=isActive();
   const content=section.textContent||'';
   const enemy=enemies.find(e=>content.includes(e.name))||lastEnemy;
   if(active&&enemy)lastEnemy=enemy;
   const hpMatch=content.match(/HP\s+(\d+)\/(\d+)/);
   const roundMatch=content.match(/výměna\s+(\d+)\/(\d+)/);
   const finished=/Nepřítel byl poražen\.|Podařilo se uniknout\./.test(content);
   const summary=section.querySelector('[role="status"]')?.textContent||'';
   const showFight=active||(battle.open&&finished);
   reopen.hidden=!active;
   if(!showFight){
     if(battle.open)battle.close();
     if(section.parentNode!==story)story.querySelector('#cardStory')?.before(section);
     seenActive=false;
     lastEnemy=null;
     lastRoll='';
     return;
   }
   if(section.parentNode!==$('v3-battle-controls'))$('v3-battle-controls').append(section);
   if(active&&!battle.open&&!seenActive)battle.showModal();
   if(active)seenActive=true;
   $('v3-battle-title').textContent=active?'Tváří v tvář temnotě':'Výsledek střetnutí';
   $('v3-battle-hero').textContent=document.getElementById('investigatorName')?.textContent||'Vyšetřovatel';
   $('v3-battle-hp').textContent='Životy '+(document.getElementById('hp')?.textContent||'—')+' · Příčetnost '+(document.getElementById('san')?.textContent||'—');
   const heroPicture=getComputedStyle(document.getElementById('investigatorPortrait')).backgroundImage;
   $('v3-battle-hero-art').style.backgroundImage=heroPicture;
   $('v3-battle-enemy').textContent=enemy?.name||'Nepřítel';
   $('v3-battle-enemy-hp').textContent=hpMatch?'Životy '+hpMatch[1]+' / '+hpMatch[2]:finished?'Střetnutí skončilo':'';
   $('v3-battle-round').textContent=roundMatch?'Výměna '+roundMatch[1]+' / '+roundMatch[2]:finished?'Vyhodnoceno':'Střetnutí';
   const enemyArt=enemy?artUrl('monsters',enemy.id):null;
   setPicture($('v3-battle-enemy-art'),enemyArt);
   $('v3-battle-enemy-art').setAttribute('aria-label',enemy?.name||'Nepřítel');
   originalClose.textContent=finished?'Pokračovat ve vyšetřování →':'Zpět na mapu ✕';
   battle.classList.toggle('v3-battle-finished',finished);
   // The engine's result description remains below its own buttons, so no outcome is fabricated.
   if(summary!==lastRoll){
     lastRoll=summary;
     const dice=summary.match(/(?:^|·)\s*(\d+)\s*\+\s*(\d+)\s*·/);
     $('v3-battle-dice').replaceChildren(...(dice?[dice[1],dice[2]]:['?','?']).map(value=>{
       const tile=document.createElement('span');tile.className='v3-battle-die';
       tile.textContent=value;return tile;
     }));
   }
   if(finished&&summary)$('v3-battle-round').textContent='Střetnutí skončilo · '+summary;
 }
 function install(target){
   if(section)return;
   section=target;
   const changes=new MutationObserver(refresh);
   changes.observe(section,{subtree:true,childList:true,characterData:true});
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
