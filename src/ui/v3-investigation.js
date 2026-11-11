// Opt-in Blackwater V3 dossier. Presentation only: the existing journal and scenario
// renderers remain authoritative for evidence, deductions, inventory and save data.
import {blackwaterItems} from '../data/blackwater-items.js';
import {blackwaterImage} from '../data/story-art.js';

export function mountV3Investigation(){
 const details=document.getElementById('details');
 const source=document.getElementById('inventory');
 if(!details||!source)return null;
 details.classList.add('v3-dossier');
 const header=document.createElement('header');header.className='v3-dossier-heading';
 const heading=document.createElement('div');
 const overline=document.createElement('p');overline.className='v3-dossier-overline';overline.textContent='BLACKWATER · ARCHIV VYŠETŘOVÁNÍ';
 const title=document.createElement('h2');title.id='v3-dossier-title';title.textContent='Vyšetřovací deník';
 heading.append(overline,title);
 const close=document.getElementById('closeDetails');
 header.append(heading);
 if(close)header.append(close);
 const nav=document.createElement('nav');nav.className='v3-dossier-nav';nav.setAttribute('aria-label','Sekce vyšetřovací složky');
 const destinations=[
  {id:'investigation-journal',label:'⌕ Deník',title:'Vyšetřovací deník'},
  {id:'inventory-panel',label:'▱ Inventář',title:'Nalezené předměty'},
  {id:'investigator',label:'♙ Vyšetřovatel',title:'Tvůj vyšetřovatel'},
  {id:'history',label:'✎ Historie',title:'Kronika událostí'},
 ];
 const navButtons=new Map();
 const choose=id=>{
  for(const section of details.querySelectorAll('.detail-panel'))section.hidden=section.id!==id;
  reflect();
 };
 for(const destination of destinations){
  const b=document.createElement('button');b.type='button';b.textContent=destination.label;
  b.dataset.dossierTarget=destination.id;
  b.addEventListener('click',()=>choose(destination.id));
  nav.append(b);navButtons.set(destination.id,b);
 }
 details.prepend(nav);details.prepend(header);
 function reflect(){
  const active=destinations.find(item=>!document.getElementById(item.id)?.hidden);
  for(const item of destinations){
   const button=navButtons.get(item.id);
   const isCurrent=item.id===active?.id;
   button.setAttribute('aria-current',isCurrent?'page':'false');
   button.setAttribute('aria-pressed',String(isCurrent));
  }
  title.textContent=active?.title||(!document.getElementById('rules-panel').hidden?'Jak se hraje':'Vyšetřovací složka');
 }
 for(const section of details.querySelectorAll('.detail-panel')){
  new MutationObserver(reflect).observe(section,{attributes:true,attributeFilter:['hidden']});
 }
 reflect();

 // Expose only earned, already rendered inventory names. No game-state reads or
 // private card definitions are used here. The source text is still owned by app.js.
 const gallery=document.createElement('div');gallery.className='v3-inventory-gallery';
 gallery.setAttribute('aria-label','Získané předměty a záznamy');
 source.after(gallery);source.classList.add('v3-inventory-source');
 source.setAttribute('aria-hidden','true');
 const known=new Map(blackwaterItems.map(item=>[item.id,item]));
 function paintInventory(){
  const entries=JSON.parse(source.dataset.entries||'[]');
  gallery.replaceChildren();
  if(!entries.length){
   const empty=document.createElement('p');empty.className='v3-dossier-empty';
   empty.textContent='Z průzkumu zatím nemáš žádné nové nálezy.';
   gallery.append(empty);return;
  }
  for(const {id,name} of entries){
   const item=known.get(id);
   const card=document.createElement('article');card.className='v3-inventory-card';
   const artwork=document.createElement('div');artwork.className='v3-inventory-art';artwork.setAttribute('aria-hidden','true');
   const image=item?blackwaterImage('items',item.id):null;
   if(image){artwork.style.backgroundImage='url("'+new URL(image,document.baseURI).href+'")';}
   else{artwork.textContent='◈';artwork.classList.add('v3-inventory-art-fallback');}
   const copy=document.createElement('div');
   const category=document.createElement('p');category.className='v3-inventory-category';
   category.textContent=item?(item.kind==='equipment'?'Vybavení':item.kind==='consumable'?'Spotřební předmět':'Úkolový předmět'):'Získaný záznam';
   const nameNode=document.createElement('h3');nameNode.textContent=name;
   copy.append(category,nameNode);
   if(item){
    const desc=document.createElement('p');desc.className='v3-inventory-desc';desc.textContent=item.description;
    copy.append(desc);
   }
   card.append(artwork,copy);gallery.append(card);
  }
 }
 const inventoryChanges=new MutationObserver(paintInventory);
 inventoryChanges.observe(source,{attributes:true,attributeFilter:['data-entries']});
 paintInventory();

 // The scenario keeps usable equipment separate from the legacy rewards inventory.
 // Mirror its *real* buttons instead of making up actions or writing gameplay data.
 const equipmentSource=document.querySelector('#storyPanel [aria-label="Výbava vyšetřovatele"]');
 if(equipmentSource){
  const panel=document.getElementById('inventory-panel');
  const equipmentHeading=document.createElement('h3');equipmentHeading.className='v3-equipment-heading';
  equipmentHeading.textContent='Použitelná výbava';
  const equipmentGrid=document.createElement('div');equipmentGrid.className='v3-equipment-grid';
  const caption=document.createElement('p');caption.className='v3-equipment-caption';
  caption.textContent='Použití předmětu se vyhodnocuje podle aktuálního stavu hry.';
  // Put usable items first. Rewards found during exploration follow underneath.
  const findingsTitle=document.createElement('h3');
  findingsTitle.className='v3-findings-heading';findingsTitle.textContent='Nálezy z průzkumu';
  gallery.before(equipmentHeading,caption,equipmentGrid,findingsTitle);
  function paintEquipment(){
   const focused=document.activeElement?.closest('[data-equipment-id]')?.dataset.equipmentId;
   equipmentGrid.replaceChildren();
   const items=[...equipmentSource.querySelectorAll('[data-item-id]')];
   if(!items.length){
    const empty=document.createElement('p');empty.className='v3-dossier-empty';
    empty.textContent='Momentálně nemáš žádnou použitelnou výbavu.';
    equipmentGrid.append(empty);return;
   }
   for(const node of items){
    const item={label:node.textContent.trim(),button:node.matches('button')?node:null};
    const id=node.dataset.itemId;
    const card=document.createElement('div');card.className='v3-equipment-card';
    card.dataset.equipmentId=id;
    const image=document.createElement('div');image.className='v3-equipment-art';image.setAttribute('aria-hidden','true');
    const art=id?blackwaterImage('items',id):null;
    if(art)image.style.backgroundImage='url("'+new URL(art,document.baseURI).href+'")';
    else image.textContent='◈';
    const info=document.createElement('div');
    const label=document.createElement('p');label.className='v3-equipment-name';label.textContent=item.label;
    info.append(label);
    if(item.button){
     const action=document.createElement('button');action.type='button';
     action.textContent=item.button.disabled?'Nyní nelze použít':'Použít předmět';
     action.disabled=item.button.disabled;
     action.addEventListener('click',()=>{
      if(item.button.isConnected&&!item.button.disabled)item.button.click();
     });
     info.append(action);
    }else{
     const passiveHint=document.createElement('span');passiveHint.className='v3-equipment-passive';
     passiveHint.textContent='Automaticky aktivní';info.append(passiveHint);
    }
    card.append(image,info);equipmentGrid.append(card);
   }
   if(focused){
    const same=[...equipmentGrid.children].find(card=>card.dataset.equipmentId===focused)?.querySelector('button:not(:disabled)');
    (same||equipmentGrid.querySelector('button:not(:disabled)')||close)?.focus({preventScroll:true});
   }
  }
  new MutationObserver(paintEquipment).observe(equipmentSource,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled']});
  paintEquipment();
 }

 // The actual ability node moves once, then app.js continues rendering it here.
 const ability=document.getElementById('scenario-ability');
 if(ability)document.getElementById('investigator').append(ability);

 // This information is derived only from the journal's public visible counters.
 const journal=document.getElementById('investigation-journal');
 if(journal){
  const metrics=document.createElement('div');metrics.className='v3-journal-metrics';
  metrics.setAttribute('aria-label','Získané výsledky vyšetřování');
  const indicators=[
   {id:'evidence',label:'Důkazy',symbol:'⌕'},
   {id:'knowledge',label:'Znalosti',symbol:'▤'},
   {id:'deductions',label:'Dedukce',symbol:'⌘'},
  ];
  const labels=new Map();
  for(const indicator of indicators){
   const tile=document.createElement('div');tile.className='v3-journal-metric';
   const caption=document.createElement('span');caption.textContent=indicator.symbol+' '+indicator.label;
   const number=document.createElement('strong');number.textContent='0';
   tile.append(caption,number);metrics.append(tile);labels.set(indicator.id,number);
   const tab=document.getElementById('journal-tab-'+indicator.id);
   if(tab){
    const update=()=>{const value=tab.textContent.match(/·\s*(\d+)\s*$/)?.[1];number.textContent=value??'0';};
    new MutationObserver(update).observe(tab,{childList:true,characterData:true,subtree:true});
    update();
   }
  }
  const intro=journal.querySelector('.journal-intro');
  if(intro)intro.after(metrics);else journal.prepend(metrics);
 }
 return {details,gallery,nav};
}
