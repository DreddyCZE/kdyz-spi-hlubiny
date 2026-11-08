import {inspectSaves} from '../engine/save-compatibility.js';
export function mountSaveNotice(storage,mode){
 const panel=document.createElement('section');panel.id='save-compatibility';panel.className='save-compatibility';panel.setAttribute('aria-label','Uložené hry a režimy');
 const title=document.createElement('h2');title.textContent=mode==='legacy'?'Původní hra · 7 kol':mode==='blackwater'?'Ilustrovaný Blackwater':'Nový scénář · 12 kol';panel.append(title);
 const explanation=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Volba režimu a informace o uložených hrách';explanation.append(summary);
 const intro=document.createElement('p');intro.textContent='Původní hra, ilustrovaný Blackwater a nový scénář mají odlišná pravidla a samostatné uložené pozice. Nový scénář nepřevádí ani nemaže starší postup.';explanation.append(intro);
 const saves=inspectSaves(storage);
 const legacySource=['legacy','legacy-v3','legacy-v2','legacy-v1'].find(id=>saves.some(s=>s.id===id&&['valid','invalid'].includes(s.status)));
 for(const save of saves.filter(s=>s.status==='valid'||s.status==='invalid')){
  const line=document.createElement('p');line.textContent=save.name+': '+(save.status==='valid'?'nalezena uložená hra. ':'data jsou poškozená nebo mají nepodporovaný formát. Zůstanou beze změny. ');
  const shadowed=save.id.startsWith('legacy')&&save.id!==legacySource;
  if(shadowed)line.append('Jde o starší zálohu; původní režim nejprve načítá novější záznam. ');
  if(save.status==='valid'&&!shadowed&&!save.id.startsWith(mode)){
   const a=document.createElement('a');a.href=save.href;a.textContent='Pokračovat: '+save.name;line.append(a);
  }
  if(save.status==='invalid'&&(save.id===mode||mode==='legacy'&&save.id==='legacy'))line.append('Tento režim nyní neukládá, aby původní data nepřepsal.');
  panel.append(line);
 }
 const links=document.createElement('p');
 for(const [href,label] of [['./index.html','Otevřít nový scénář'],['./index.html?mode=legacy','Otevřít původní hru'],['./blackwater.html','Otevřít ilustrovaný Blackwater']]){const a=document.createElement('a');a.href=href;a.textContent=label;links.append(a,document.createTextNode(' · '));}
 explanation.append(links);
 const help=document.createElement('p');help.textContent='Uložené hry se hledají jen v tomto prohlížeči a profilu, na stejné doméně, protokolu a portu. Kořen webu a /preview/ sdílejí úložiště. Data z localhostu, jiného portu, domény nebo souboru zde automaticky dostupná nejsou. Pokud hru nenajdeš, otevři její původní adresu ve stejném profilu.';explanation.append(help);panel.append(explanation);
 if(saves.some(s=>s.status==='unavailable')){const warning=document.createElement('p');warning.textContent='Úložiště není dostupné. Hra poběží bez ukládání.';panel.append(warning);}
 document.querySelector('main').prepend(panel);return panel;
}
