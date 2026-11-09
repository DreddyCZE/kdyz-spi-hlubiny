// Public rules only: never read card outcomes, puzzle answers or ending conditions.
export function renderRules(container,{legacy=false,rounds=12,ap=3,automaticDeductions=true}={}){
 const chapters=[
  ['První kroky',legacy?'Původní hra používá pevnou postavu a sedmikolový průzkum. Nemá vítězné zakončení.':'Vyber si vyšetřovatele. Pátrej po zmizení posádky, sbírej důkazy a připrav cestu k závěru v jeskyních. Dostupné zakončení musíš sám potvrdit; jeho podmínky odhalí vyšetřování.'],
  ['Kola a akční body',`Hra má nejvýše ${rounds} kol. Na začátku kola máš ${ap} AP. Přesun stojí 1 AP, dobrání karty je zdarma. Cenu zvoleného postupu vidíš u tlačítka. Zaplatíš ji až při vyhodnocení společně s následkem. Další kolo obnoví AP; nevyužité body se nepřenášejí.`],
  ['Karty a kostky',`Zvol postup a hoď 2k6. Přičte se uvedený atribut a modifikátor proti obtížnosti testu. Dvě šestky znamenají kritický úspěch, dvě jedničky kritické selhání. Jinak rozdíl alespoň 3 znamená velký úspěch, 0 až 2 úspěch, −2 až −1 částečný úspěch a nižší neúspěch. Následek se odhalí až po vyhodnocení.${legacy?'':' Hod nejprve potvrď. Jednou můžeš přehodit za 1 SAN, pokud máš alespoň 2 SAN; platí lepší úroveň výsledku.'} Rozhodnutí bez testu kostky nepoužívá. Vyřešené jednorázové karty se neobnovují.`],
  ['Důkazy a deník',`Deník uchovává nalezené důkazy, znalosti a historii. ${automaticDeductions&&!legacy?'Znalosti se odvozují automaticky po herní akci, když máš potřebné podklady.':'Dostupné dedukce spustíš tlačítkem v deníku.'} Samotné otevření přehledu nic nestojí a nemění herní stav. Neznámé následky a řešení hádanek zůstávají skryté.`],
  ['Zdraví, příčetnost a čas',`Při nulovém HP nebo SAN či Hrozbě 10 vyšetřování končí porážkou. ${legacy?'Rituál 8 také ukončí hru.':'Údery zvonu postupují v určených kolech; sedmý úder ukončí scénář. Jednorázová schopnost okultistky může jejich postup snížit.'} Další kolo používej uvážlivě.`],
  ...(!legacy?[
   ['Postava a výbava','Každá postava má vlastní limity HP/SAN, počáteční výbavu a jednu schopnost použitelnou jednou za scénář. Základní atributy testů jsou společné. Obvaz obnovuje až 2 HP, laudanum až 2 SAN a sůl snižuje hrozbu o 1; spotřebují se jednou. Revolver přidává +1 k útoku. Příběhové předměty a důkazy jsou uvedené v inventáři a deníku.'],
   ['Nepovinná střetnutí','Střetnutí na vybraných lokacích zahájíš za 1 AP. Během souboje nelze prozkoumávat ani měnit kolo. Zvol útok nebo útěk; souboj má nejvýše tři výměny, pak skončí vynuceným únikem s následkem. Zranění a stav souboje se ukládají. Stejného protivníka nelze opakovaně využívat. Střetnutí nejsou podmínkou získání hlavních stop.'],
   ['Hádanky a pomocník','V lokaci můžeš najít hádanku. Zobrazí se jen získané indicie a dostupné nápovědy. Počet pokusů a stav vidíš u zadání. Pes je volitelný pomocník bez vlastních AP: hledá stopy, ale neřeší hádanku za tebe. Jeho aktivní schopnost lze použít jednou za kolo. Hlavní vyšetřování lze dokončit bez něj.'],
  ]:[]),
  ['Ukládání a ovládání','Hra se automaticky ukládá po akcích do tohoto prohlížeče. Jednotlivé režimy mají oddělené pozice. Při chybě úložiště se zobrazí upozornění a pokračuješ pouze v otevřené záložce. Obnovení stránky zachová platnou uloženou pozici. Ovládání funguje klávesami Tab a Enter; přehled zavřeš také Escape. Nová hra vyžaduje potvrzení.'],
 ];
 container.replaceChildren();
 const title=document.createElement('h2');title.textContent='Jak se hraje';container.append(title);
 for(const [heading,text] of chapters){const h=document.createElement('h3'),p=document.createElement('p');h.textContent=heading;p.textContent=text;container.append(h,p);}
}
