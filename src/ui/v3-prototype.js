// Progressive enhancement only: the existing scenario engine owns all actions and saves.
const params=new URLSearchParams(location.search);
if(params.get('ui')==='v3'){
 document.body.classList.add('v3');
 const css=document.createElement('link');css.rel='stylesheet';css.href='./src/ui/v3-prototype.css';document.head.append(css);
 const layout=document.querySelector('.layout'),story=document.getElementById('storyPanel');
 const toolbar=document.createElement('section');toolbar.className='v3-toolbar';toolbar.setAttribute('aria-label','Ovládání prototypu');
 const heading=document.createElement('strong');heading.textContent='BLACKWATER V3 · Interaktivní mapa';
 const open=document.createElement('button');open.type='button';open.textContent='📜 Otevřít příběhovou kartu';
 const investigate=document.createElement('button');investigate.type='button';investigate.textContent='🔎 Prozkoumat lokaci';
 const journal=document.createElement('button');journal.type='button';journal.textContent='📖 Deník';
 const hint=document.createElement('p');hint.className='v3-help';hint.textContent='Kliknutím na lokaci se přesuneš podle pravidel hry. Příběhová karta používá původní scénářový engine a ukládání.';
 layout.before(toolbar);toolbar.append(heading,open,investigate,journal);toolbar.after(hint);
 const dialog=document.createElement('dialog');dialog.id='v3-story-dialog';dialog.setAttribute('aria-label','Příběhová karta');
 const top=document.createElement('div');top.className='v3-dialog-top';
 const title=document.createElement('strong');title.textContent='PŘÍBĚHOVÁ KARTA';
 const close=document.createElement('button');close.type='button';close.textContent='Zpět na mapu';
 top.append(title,close);dialog.append(top);document.body.append(dialog);
 const placeholder=document.createComment('Původní umístění příběhové karty');story.before(placeholder);
 dialog.append(story);
 const show=()=>{if(!dialog.open)dialog.showModal();};
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
