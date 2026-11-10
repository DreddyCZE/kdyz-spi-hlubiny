// Blackwater V3: purely visual new-round recap. The engine remains the sole source of truth.
import {blackwaterImage} from '../data/story-art.js';

export function mountV3RoundTransition(){
 const endRound=document.getElementById('endRound');
 const round=document.getElementById('round'),threat=document.getElementById('threat'),ritual=document.getElementById('ritual');
 if(!endRound||!round||!threat||!ritual)return null;
 const dialog=document.createElement('dialog');
 dialog.id='v3-round-dialog';
 dialog.setAttribute('aria-label','Nové kolo vyšetřování');
 const artwork=document.createElement('div');artwork.className='v3-round-art';artwork.setAttribute('aria-hidden','true');
 const url=blackwaterImage('myths','myth-fog');
 if(url)artwork.style.backgroundImage='url("'+new URL(url,document.baseURI).href+'")';
 const content=document.createElement('div');content.className='v3-round-content';
 const kicker=document.createElement('p');kicker.className='v3-round-kicker';kicker.textContent='BLACKWATER · ČAS PLYNE';
 const title=document.createElement('h2');title.textContent='Nové kolo';
 const narrative=document.createElement('p');narrative.textContent='Noc postupuje a situace ve městě se mění. Tvůj příští krok může být rozhodující.';
 const counters=document.createElement('div');counters.className='v3-round-counters';
 const close=document.createElement('button');close.type='button';close.textContent='Pokračovat ve vyšetřování →';
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 content.append(kicker,title,narrative,counters,close);dialog.append(artwork,content);document.body.append(dialog);
 const read=()=>({round:Number.parseInt(round.textContent,10),threat:threat.textContent.trim(),ritual:ritual.textContent.trim()});
 function renderChange(label,before,after){
  const box=document.createElement('div');box.className='v3-round-counter';
  const caption=document.createElement('span');caption.textContent=label;
  const amount=document.createElement('strong');amount.textContent=after;
  const was=document.createElement('small');was.textContent=before===after?'Beze změny':'Předtím: '+before;
  box.append(caption,amount,was);return box;
 }
 endRound.addEventListener('click',()=>{
  const before=read();
  queueMicrotask(()=>{
   const after=read();
   if(!Number.isFinite(before.round)||!Number.isFinite(after.round)||after.round<=before.round)return;
   title.textContent='Kolo '+after.round;
   counters.replaceChildren(renderChange('Hrozba',before.threat,after.threat),renderChange('Rituál',before.ritual,after.ritual));
   if(!dialog.open)dialog.showModal();
  });
 },{capture:true});
 return dialog;
}
