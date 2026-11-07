// Story content and explicit mechanical effects.
export const locations = [
  {
    "id": "location-0",
    "name": "Přístav",
    "description": "Opuštěná mola mizí v mlze.",
    "cards": [
      {
        "id": "0-0",
        "title": "Ztracená loď",
        "story": "Mezi zpuchřelými moly naráží do kůlů malá rybářská loď. Její jméno někdo přeškrtl. Z podpalubí se ozývá škrábání.",
        "difficulty": 8,
        "choices": [
          {
            "label": "Opatrně prozkoumat podpalubí",
            "attribute": "VN"
          },
          {
            "label": "Vstoupit bez váhání",
            "attribute": "VŮ"
          }
        ],
        "outcomes": [
          {
            "text": "Najdeš deník, mosazný přívěsek a značku vedoucí k majáku.",
            "item": "Deník a přívěsek",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Najdeš deník zmizelého rybáře.",
            "item": "Deník",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Získáš útržek deníku, ale něco tě spatří. Ztrácíš 1 SAN.",
            "item": "Útržek deníku",
            "effects": {
              "hp": 0,
              "san": -1,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Podpalubí zůstane neprozkoumané. Ztrácíš 1 SAN.",
            "item": null,
            "effects": {
              "hp": 0,
              "san": -1,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Něco tě strhne na mokré schody. Ztrácíš 2 HP a 1 SAN.",
            "item": null,
            "effects": {
              "hp": -2,
              "san": -1,
              "threat": 0,
              "ritual": 0
            }
          }
        ]
      },
      {
        "id": "0-1",
        "title": "Muž z mlhy",
        "story": "Z mlhy vystupuje rybář z fotografie pohřešovaných. Jeho oči jsou zakalené a na krku má podivné znaky.",
        "difficulty": 9,
        "choices": [
          {
            "label": "Promluvit s ním",
            "attribute": "VŮ"
          },
          {
            "label": "Nenápadně ho sledovat",
            "attribute": "VN"
          }
        ],
        "outcomes": [
          {
            "text": "Prozradí heslo kultu a svěří ti stříbrný prsten.",
            "item": "Heslo kultu a prsten",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Dozvíš se, že rybáři odpluli k majáku.",
            "item": "Svědectví rybáře",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Získáš svědectví, ale jeho hlas ti zůstane v hlavě. Ztrácíš 1 SAN.",
            "item": "Svědectví rybáře",
            "effects": {
              "hp": 0,
              "san": -1,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Muž uteče do mlhy.",
            "item": null,
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Muž vykřikne neznámé jméno. Ztrácíš 2 SAN a Hrozba +1.",
            "item": null,
            "effects": {
              "hp": 0,
              "san": -2,
              "threat": 1,
              "ritual": 0
            }
          }
        ]
      }
    ]
  },
  {
    "id": "location-1",
    "name": "Staré město",
    "description": "Zavřené obchody a zazděná okna.",
    "cards": [
      {
        "id": "1-0",
        "title": "Obálka pod prahem",
        "story": "Na konci ulice stojí dům, jehož okna někdo zazdil zevnitř. Pod prahem leží obálka s tvým jménem.",
        "difficulty": 7,
        "choices": [
          {
            "label": "Prohlédnout obálku",
            "attribute": "VN"
          },
          {
            "label": "Vypáčit dveře",
            "attribute": "SÍ"
          }
        ],
        "outcomes": [
          {
            "text": "Získáš plán podzemní chodby a klíč.",
            "item": "Plán a klíč",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Získáš plán podzemní chodby.",
            "item": "Plán",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Získáš plán, ale ztrácíš 1 HP.",
            "item": "Plán",
            "effects": {
              "hp": -1,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Obálka je prázdná.",
            "item": null,
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Z domu se ozve tvůj hlas. Ztrácíš 2 SAN.",
            "item": null,
            "effects": {
              "hp": 0,
              "san": -2,
              "threat": 0,
              "ritual": 0
            }
          }
        ]
      }
    ]
  },
  {
    "id": "location-2",
    "name": "Knihovna",
    "description": "Archiv ukrývá zakázané záznamy.",
    "cards": [
      {
        "id": "2-0",
        "title": "Zakázaný katalog",
        "story": "Knihovník zmizel. V katalogu někdo označil svazek, který podle záznamů nikdy neexistoval.",
        "difficulty": 8,
        "choices": [
          {
            "label": "Studovat katalog",
            "attribute": "VĚ"
          },
          {
            "label": "Vyslechnout hlídače",
            "attribute": "VŮ"
          }
        ],
        "outcomes": [
          {
            "text": "Odhalíš původ symbolů a získáš zakázanou knihu.",
            "item": "Zakázaná kniha",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Najdeš plán majáku.",
            "item": "Plán majáku",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Získáš část informace, ale ztrácíš 1 SAN.",
            "item": "Útržek z katalogu",
            "effects": {
              "hp": 0,
              "san": -1,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Záznamy nedávají smysl.",
            "item": null,
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Přečteš větu, kterou nelze zapomenout. Ztrácíš 2 SAN.",
            "item": null,
            "effects": {
              "hp": 0,
              "san": -2,
              "threat": 0,
              "ritual": 0
            }
          }
        ]
      }
    ]
  },
  {
    "id": "location-3",
    "name": "Ústav",
    "description": "Za okny se pohybují neklidné postavy.",
    "cards": [
      {
        "id": "3-0",
        "title": "Pokoj číslo 6",
        "story": "Pacient svírá mokré lodní lano. Opakuje, že pod majákem někdo zvoní na zvon bez srdce.",
        "difficulty": 8,
        "choices": [
          {
            "label": "Uklidnit pacienta",
            "attribute": "VŮ"
          },
          {
            "label": "Prozkoumat záznamy",
            "attribute": "VĚ"
          }
        ],
        "outcomes": [
          {
            "text": "Získáš fotografii kultistů a odhalíš tajný vstup.",
            "item": "Fotografie kultistů",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Získáš svědectví o nočním zvonění.",
            "item": "Svědectví pacienta",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Pacient promluví, ale ztrácíš 1 SAN.",
            "item": "Svědectví pacienta",
            "effects": {
              "hp": 0,
              "san": -1,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Pacient se uzavře do sebe.",
            "item": null,
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Pacient zaútočí. Ztrácíš 1 HP a 1 SAN.",
            "item": null,
            "effects": {
              "hp": -1,
              "san": -1,
              "threat": 0,
              "ritual": 0
            }
          }
        ]
      }
    ]
  },
  {
    "id": "location-4",
    "name": "Hřbitov",
    "description": "Mokré náhrobky a rozrytá hlína.",
    "cards": [
      {
        "id": "4-0",
        "title": "Hrob bez jména",
        "story": "Na dně otevřeného hrobu leží kámen s rytinou, která se mění, když odvrátíš zrak.",
        "difficulty": 9,
        "choices": [
          {
            "label": "Překreslit symbol",
            "attribute": "VĚ"
          },
          {
            "label": "Dotknout se kamene",
            "attribute": "VŮ"
          }
        ],
        "outcomes": [
          {
            "text": "Rozluštíš rituál a získáš starobylý artefakt.",
            "item": "Artefakt",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Získáš důkaz o rituálu.",
            "item": "Rytina rituálu",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Pochopíš část symbolu, ale ztrácíš 1 SAN.",
            "item": "Rytina rituálu",
            "effects": {
              "hp": 0,
              "san": -1,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Rytina zmizí. Ztrácíš 1 SAN.",
            "item": null,
            "effects": {
              "hp": 0,
              "san": -1,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Z hrobu se ozve klepání. Ztrácíš 2 SAN a Hrozba +1.",
            "item": null,
            "effects": {
              "hp": 0,
              "san": -2,
              "threat": 1,
              "ritual": 0
            }
          }
        ]
      }
    ]
  },
  {
    "id": "location-5",
    "name": "Maják",
    "description": "Světlo se otáčí, přestože je odpojené.",
    "cards": [
      {
        "id": "5-0",
        "title": "Schodiště pod světlem",
        "story": "Pod vrstvou soli nacházíš servisní dvířka. Zespodu proudí teplý vzduch a ozývá se zvonění.",
        "difficulty": 9,
        "choices": [
          {
            "label": "Vypáčit dvířka",
            "attribute": "SÍ"
          },
          {
            "label": "Prozkoumat zámek",
            "attribute": "VN"
          }
        ],
        "outcomes": [
          {
            "text": "Otevřeš průchod a nalezneš kultovní pečeť.",
            "item": "Kultovní pečeť",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Najdeš mechanismus tajného vstupu.",
            "item": "Tajný vstup",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Dvířka povolí, ale Hrozba +1.",
            "item": "Tajný vstup",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 1,
              "ritual": 0
            }
          },
          {
            "text": "Vstup zůstane zavřený. Ztrácíš 1 HP.",
            "item": null,
            "effects": {
              "hp": -1,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Zvonění zesílí. Ztrácíš 2 SAN a Rituál +1.",
            "item": null,
            "effects": {
              "hp": 0,
              "san": -2,
              "threat": 0,
              "ritual": 1
            }
          }
        ]
      }
    ]
  },
  {
    "id": "location-6",
    "name": "Jeskyně",
    "description": "Příliv odhaluje cestu do černé skály.",
    "cards": [
      {
        "id": "6-0",
        "title": "Dech podzemního moře",
        "story": "Voda v jezírku stoupá proti gravitaci. Na kameni leží kovový předmět vydávající slabé světlo.",
        "difficulty": 10,
        "choices": [
          {
            "label": "Přeskočit na kámen",
            "attribute": "OB"
          },
          {
            "label": "Vylovit předmět lanem",
            "attribute": "VN"
          }
        ],
        "outcomes": [
          {
            "text": "Získáš artefakt a poznáš způsob uzavření brány.",
            "item": "Artefakt hlubiny",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Vylovíš zvláštní kovový klíč.",
            "item": "Kovový klíč",
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Získáš předmět, ale ztrácíš 1 HP.",
            "item": "Kovový klíč",
            "effects": {
              "hp": -1,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Předmět zmizí pod hladinou.",
            "item": null,
            "effects": {
              "hp": 0,
              "san": 0,
              "threat": 0,
              "ritual": 0
            }
          },
          {
            "text": "Z vody se vynoří chapadlo. Ztrácíš 2 HP a Hrozba +1.",
            "item": null,
            "effects": {
              "hp": -2,
              "san": 0,
              "threat": 1,
              "ritual": 0
            }
          }
        ]
      }
    ]
  }
];
