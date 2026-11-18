import {blackwaterImage} from '../data/story-art.js';
import {blackwaterItemById} from '../data/blackwater-items.js';

const statIcons={hp:'♥',san:'◉',ap:'◆', 'SÍ':'✚',OB:'↝','VĚ':'✦','VŮ':'♜',VN:'◈'};
function element(tag,text,className){
 const node=document.createElement(tag);
 if(text)node.textContent=text;
 if(className)node.className=className;
 return node;
}
function stat(label,value,icon){
 const badge=element('span',null,'case-stat');
 const glyph=element('i',icon,'case-icon');glyph.setAttribute('aria-hidden','true');
 badge.append(glyph,element('span',label),element('b',String(value)));
 return badge;
}
export function createCasebook(registry,pack,investigators,attributes,select){
 const picker=document.getElementById('caseScenario');
 for(const id of registry.ids){const option=element('option',registry.get(id).scenario.title);option.value=id;picker.append(option);}
 picker.value=pack.scenario.id;
 picker.onchange=()=>{const url=new URL(location.href);url.searchParams.set('scenario',picker.value);location.href=url;};
 document.getElementById('caseSynopsis').replaceChildren(...(pack.intro||[pack.scenario.title]).map(text=>element('p',text)));
 const roster=document.getElementById('caseRoster');
 for(const hero of investigators){
  const file=element('article',null,'case-file');
  const photo=element('img',null,'case-photo');photo.src=blackwaterImage('investigators',hero.id);photo.alt='';
  const header=element('header');header.append(photo,element('p',hero.role,'case-role'),element('h3',hero.name));
  const vital=element('div',null,'case-vitals');vital.append(stat('HP',hero.hp,statIcons.hp),stat('SAN',hero.san,statIcons.san),stat('AP',pack.scenario.rules.apPerRound,statIcons.ap));
  const tests=element('div',null,'case-attributes');tests.setAttribute('aria-label','Atributy');for(const [key,value] of Object.entries(attributes))tests.append(stat(key,value,statIcons[key]));
  const notes=element('dl',null,'case-notes');
  for(const [label,value] of [['Schopnost',hero.ability],['Pasivní · '+hero.passive.name,hero.passive.text],['Počáteční výbava',hero.startingItems.map(id=>blackwaterItemById[id].name).join(' · ')]])notes.append(element('dt',label),element('dd',value));
  const start=element('button','Vybrat postavu','case-select');
  start.type='button';start.setAttribute('aria-label',hero.name+' · HP '+hero.hp+' / SAN '+hero.san+' · Zahájit vyšetřování');start.onclick=()=>select(hero.id);
  file.append(header,vital,element('p',hero.flavor,'case-flavor'),tests,notes,start);roster.append(file);
 }
}
