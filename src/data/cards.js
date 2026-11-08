// Migrated story content: IDs are permanent, independent of array order.
export const cards = [
  {
    "id": "0-0",
    "type": "encounter",
    "locationId": "location-0",
    "title": "Ztracená loď",
    "description": "Mezi zpuchřelými moly naráží do kůlů malá rybářská loď. Její jméno někdo přeškrtl. Z podpalubí se ozývá škrábání.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "0-0-choice-1",
        "label": "Opatrně prozkoumat podpalubí",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Najdeš deník, mosazný přívěsek a značku vedoucí k majáku.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-1"
              }
            ]
          },
          "greatSuccess": {
            "text": "Najdeš deník, mosazný přívěsek a značku vedoucí k majáku.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-1"
              }
            ]
          },
          "success": {
            "text": "Najdeš deník zmizelého rybáře.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-2"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš útržek deníku, ale něco tě spatří. Ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              },
              {
                "type": "addEvidence",
                "id": "reward-3"
              }
            ]
          },
          "failure": {
            "text": "Podpalubí zůstane neprozkoumané. Ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "criticalFailure": {
            "text": "Něco tě strhne na mokré schody. Ztrácíš 2 HP a 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
                "amount": -2
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          }
        }
      },
      {
        "id": "0-0-choice-2",
        "label": "Vstoupit bez váhání",
        "apCost": 1,
        "test": {
          "attribute": "VŮ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Najdeš deník, mosazný přívěsek a značku vedoucí k majáku.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-1"
              }
            ]
          },
          "greatSuccess": {
            "text": "Najdeš deník, mosazný přívěsek a značku vedoucí k majáku.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-1"
              }
            ]
          },
          "success": {
            "text": "Najdeš deník zmizelého rybáře.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-2"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš útržek deníku, ale něco tě spatří. Ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              },
              {
                "type": "addEvidence",
                "id": "reward-3"
              }
            ]
          },
          "failure": {
            "text": "Podpalubí zůstane neprozkoumané. Ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "criticalFailure": {
            "text": "Něco tě strhne na mokré schody. Ztrácíš 2 HP a 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
                "amount": -2
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          }
        }
      }
    ]
  },
  {
    "id": "0-1",
    "type": "encounter",
    "locationId": "location-0",
    "title": "Muž z mlhy",
    "description": "Z mlhy vystupuje rybář z fotografie pohřešovaných. Jeho oči jsou zakalené a na krku má podivné znaky.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "0-1-choice-1",
        "label": "Promluvit s ním",
        "apCost": 1,
        "test": {
          "attribute": "VŮ",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Prozradí heslo kultu a svěří ti stříbrný prsten.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-4"
              }
            ]
          },
          "greatSuccess": {
            "text": "Prozradí heslo kultu a svěří ti stříbrný prsten.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-4"
              }
            ]
          },
          "success": {
            "text": "Dozvíš se, že rybáři odpluli k majáku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš svědectví, ale jeho hlas ti zůstane v hlavě. Ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              },
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "failure": {
            "text": "Muž uteče do mlhy.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Muž vykřikne neznámé jméno. Ztrácíš 2 SAN a Hrozba +1.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -2
              },
              {
                "type": "modifyThreat",
                "amount": 1
              }
            ]
          }
        }
      },
      {
        "id": "0-1-choice-2",
        "label": "Nenápadně ho sledovat",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Prozradí heslo kultu a svěří ti stříbrný prsten.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-4"
              }
            ]
          },
          "greatSuccess": {
            "text": "Prozradí heslo kultu a svěří ti stříbrný prsten.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-4"
              }
            ]
          },
          "success": {
            "text": "Dozvíš se, že rybáři odpluli k majáku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš svědectví, ale jeho hlas ti zůstane v hlavě. Ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              },
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "failure": {
            "text": "Muž uteče do mlhy.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Muž vykřikne neznámé jméno. Ztrácíš 2 SAN a Hrozba +1.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -2
              },
              {
                "type": "modifyThreat",
                "amount": 1
              }
            ]
          }
        }
      }
    ]
  },
  {
    "id": "1-0",
    "type": "evidence",
    "locationId": "location-1",
    "title": "Obálka pod prahem",
    "description": "Na konci ulice stojí dům, jehož okna někdo zazdil zevnitř. Pod prahem leží obálka s tvým jménem.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "1-0-choice-1",
        "label": "Prohlédnout obálku",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 7
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Získáš plán podzemní chodby a klíč.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-6"
              }
            ]
          },
          "greatSuccess": {
            "text": "Získáš plán podzemní chodby a klíč.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-6"
              }
            ]
          },
          "success": {
            "text": "Získáš plán podzemní chodby.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš plán, ale ztrácíš 1 HP.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
                "amount": -1
              },
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "failure": {
            "text": "Obálka je prázdná.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z domu se ozve tvůj hlas. Ztrácíš 2 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -2
              }
            ]
          }
        }
      },
      {
        "id": "1-0-choice-2",
        "label": "Vypáčit dveře",
        "apCost": 1,
        "test": {
          "attribute": "SÍ",
          "difficulty": 7
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Získáš plán podzemní chodby a klíč.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-6"
              }
            ]
          },
          "greatSuccess": {
            "text": "Získáš plán podzemní chodby a klíč.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-6"
              }
            ]
          },
          "success": {
            "text": "Získáš plán podzemní chodby.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš plán, ale ztrácíš 1 HP.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
                "amount": -1
              },
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "failure": {
            "text": "Obálka je prázdná.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z domu se ozve tvůj hlas. Ztrácíš 2 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -2
              }
            ]
          }
        }
      }
    ]
  },
  {
    "id": "2-0",
    "type": "item",
    "locationId": "location-2",
    "title": "Zakázaný katalog",
    "description": "Knihovník zmizel. V katalogu někdo označil svazek, který podle záznamů nikdy neexistoval.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "2-0-choice-1",
        "label": "Studovat katalog",
        "apCost": 1,
        "test": {
          "attribute": "VĚ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odhalíš původ symbolů a získáš zakázanou knihu.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-8"
              }
            ]
          },
          "greatSuccess": {
            "text": "Odhalíš původ symbolů a získáš zakázanou knihu.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-8"
              }
            ]
          },
          "success": {
            "text": "Najdeš plán majáku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-9"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš část informace, ale ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              },
              {
                "type": "addEvidence",
                "id": "reward-10"
              }
            ]
          },
          "failure": {
            "text": "Záznamy nedávají smysl.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Přečteš větu, kterou nelze zapomenout. Ztrácíš 2 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -2
              }
            ]
          }
        }
      },
      {
        "id": "2-0-choice-2",
        "label": "Vyslechnout hlídače",
        "apCost": 1,
        "test": {
          "attribute": "VŮ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odhalíš původ symbolů a získáš zakázanou knihu.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-8"
              }
            ]
          },
          "greatSuccess": {
            "text": "Odhalíš původ symbolů a získáš zakázanou knihu.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-8"
              }
            ]
          },
          "success": {
            "text": "Najdeš plán majáku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-9"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš část informace, ale ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              },
              {
                "type": "addEvidence",
                "id": "reward-10"
              }
            ]
          },
          "failure": {
            "text": "Záznamy nedávají smysl.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Přečteš větu, kterou nelze zapomenout. Ztrácíš 2 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -2
              }
            ]
          }
        }
      }
    ]
  },
  {
    "id": "3-0",
    "type": "encounter",
    "locationId": "location-3",
    "title": "Pokoj číslo 6",
    "description": "Pacient svírá mokré lodní lano. Opakuje, že pod majákem někdo zvoní na zvon bez srdce.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "3-0-choice-1",
        "label": "Uklidnit pacienta",
        "apCost": 1,
        "test": {
          "attribute": "VŮ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Získáš fotografii kultistů a odhalíš tajný vstup.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-11"
              }
            ]
          },
          "greatSuccess": {
            "text": "Získáš fotografii kultistů a odhalíš tajný vstup.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-11"
              }
            ]
          },
          "success": {
            "text": "Získáš svědectví o nočním zvonění.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "partialSuccess": {
            "text": "Pacient promluví, ale ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              },
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "failure": {
            "text": "Pacient se uzavře do sebe.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Pacient zaútočí. Ztrácíš 1 HP a 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
                "amount": -1
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          }
        }
      },
      {
        "id": "3-0-choice-2",
        "label": "Prozkoumat záznamy",
        "apCost": 1,
        "test": {
          "attribute": "VĚ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Získáš fotografii kultistů a odhalíš tajný vstup.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-11"
              }
            ]
          },
          "greatSuccess": {
            "text": "Získáš fotografii kultistů a odhalíš tajný vstup.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-11"
              }
            ]
          },
          "success": {
            "text": "Získáš svědectví o nočním zvonění.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "partialSuccess": {
            "text": "Pacient promluví, ale ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              },
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "failure": {
            "text": "Pacient se uzavře do sebe.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Pacient zaútočí. Ztrácíš 1 HP a 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
                "amount": -1
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          }
        }
      }
    ]
  },
  {
    "id": "4-0",
    "type": "encounter",
    "locationId": "location-4",
    "title": "Hrob bez jména",
    "description": "Na dně otevřeného hrobu leží kámen s rytinou, která se mění, když odvrátíš zrak.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "4-0-choice-1",
        "label": "Překreslit symbol",
        "apCost": 1,
        "test": {
          "attribute": "VĚ",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Rozluštíš rituál a získáš starobylý artefakt.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-13"
              }
            ]
          },
          "greatSuccess": {
            "text": "Rozluštíš rituál a získáš starobylý artefakt.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-13"
              }
            ]
          },
          "success": {
            "text": "Získáš důkaz o rituálu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              }
            ]
          },
          "partialSuccess": {
            "text": "Pochopíš část symbolu, ale ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              },
              {
                "type": "addEvidence",
                "id": "reward-14"
              }
            ]
          },
          "failure": {
            "text": "Rytina zmizí. Ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "criticalFailure": {
            "text": "Z hrobu se ozve klepání. Ztrácíš 2 SAN a Hrozba +1.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -2
              },
              {
                "type": "modifyThreat",
                "amount": 1
              }
            ]
          }
        }
      },
      {
        "id": "4-0-choice-2",
        "label": "Dotknout se kamene",
        "apCost": 1,
        "test": {
          "attribute": "VŮ",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Rozluštíš rituál a získáš starobylý artefakt.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-13"
              }
            ]
          },
          "greatSuccess": {
            "text": "Rozluštíš rituál a získáš starobylý artefakt.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-13"
              }
            ]
          },
          "success": {
            "text": "Získáš důkaz o rituálu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              }
            ]
          },
          "partialSuccess": {
            "text": "Pochopíš část symbolu, ale ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              },
              {
                "type": "addEvidence",
                "id": "reward-14"
              }
            ]
          },
          "failure": {
            "text": "Rytina zmizí. Ztrácíš 1 SAN.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "criticalFailure": {
            "text": "Z hrobu se ozve klepání. Ztrácíš 2 SAN a Hrozba +1.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -2
              },
              {
                "type": "modifyThreat",
                "amount": 1
              }
            ]
          }
        }
      }
    ]
  },
  {
    "id": "5-0",
    "type": "event",
    "locationId": "location-5",
    "title": "Schodiště pod světlem",
    "description": "Pod vrstvou soli nacházíš servisní dvířka. Zespodu proudí teplý vzduch a ozývá se zvonění.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "5-0-choice-1",
        "label": "Vypáčit dvířka",
        "apCost": 1,
        "test": {
          "attribute": "SÍ",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Otevřeš průchod a nalezneš kultovní pečeť.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-15"
              }
            ]
          },
          "greatSuccess": {
            "text": "Otevřeš průchod a nalezneš kultovní pečeť.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-15"
              }
            ]
          },
          "success": {
            "text": "Najdeš mechanismus tajného vstupu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-16"
              }
            ]
          },
          "partialSuccess": {
            "text": "Dvířka povolí, ale Hrozba +1.",
            "effects": [
              {
                "type": "modifyThreat",
                "amount": 1
              },
              {
                "type": "addEvidence",
                "id": "reward-16"
              }
            ]
          },
          "failure": {
            "text": "Vstup zůstane zavřený. Ztrácíš 1 HP.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
                "amount": -1
              }
            ]
          },
          "criticalFailure": {
            "text": "Zvonění zesílí. Ztrácíš 2 SAN a Rituál +1.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -2
              },
              {
                "type": "modifyRitual",
                "amount": 1
              }
            ]
          }
        }
      },
      {
        "id": "5-0-choice-2",
        "label": "Prozkoumat zámek",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Otevřeš průchod a nalezneš kultovní pečeť.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-15"
              }
            ]
          },
          "greatSuccess": {
            "text": "Otevřeš průchod a nalezneš kultovní pečeť.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-15"
              }
            ]
          },
          "success": {
            "text": "Najdeš mechanismus tajného vstupu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-16"
              }
            ]
          },
          "partialSuccess": {
            "text": "Dvířka povolí, ale Hrozba +1.",
            "effects": [
              {
                "type": "modifyThreat",
                "amount": 1
              },
              {
                "type": "addEvidence",
                "id": "reward-16"
              }
            ]
          },
          "failure": {
            "text": "Vstup zůstane zavřený. Ztrácíš 1 HP.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
                "amount": -1
              }
            ]
          },
          "criticalFailure": {
            "text": "Zvonění zesílí. Ztrácíš 2 SAN a Rituál +1.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -2
              },
              {
                "type": "modifyRitual",
                "amount": 1
              }
            ]
          }
        }
      }
    ]
  },
  {
    "id": "6-0",
    "type": "item",
    "locationId": "location-6",
    "title": "Dech podzemního moře",
    "description": "Voda v jezírku stoupá proti gravitaci. Na kameni leží kovový předmět vydávající slabé světlo.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "6-0-choice-1",
        "label": "Přeskočit na kámen",
        "apCost": 1,
        "test": {
          "attribute": "OB",
          "difficulty": 10
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Získáš artefakt a poznáš způsob uzavření brány.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-17"
              }
            ]
          },
          "greatSuccess": {
            "text": "Získáš artefakt a poznáš způsob uzavření brány.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-17"
              }
            ]
          },
          "success": {
            "text": "Vylovíš zvláštní kovový klíč.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-18"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš předmět, ale ztrácíš 1 HP.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
                "amount": -1
              },
              {
                "type": "addItem",
                "id": "reward-18"
              }
            ]
          },
          "failure": {
            "text": "Předmět zmizí pod hladinou.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z vody se vynoří chapadlo. Ztrácíš 2 HP a Hrozba +1.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
                "amount": -2
              },
              {
                "type": "modifyThreat",
                "amount": 1
              }
            ]
          }
        }
      },
      {
        "id": "6-0-choice-2",
        "label": "Vylovit předmět lanem",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 10
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Získáš artefakt a poznáš způsob uzavření brány.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-17"
              }
            ]
          },
          "greatSuccess": {
            "text": "Získáš artefakt a poznáš způsob uzavření brány.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-17"
              }
            ]
          },
          "success": {
            "text": "Vylovíš zvláštní kovový klíč.",
            "effects": [
              {
                "type": "addItem",
                "id": "reward-18"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš předmět, ale ztrácíš 1 HP.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
                "amount": -1
              },
              {
                "type": "addItem",
                "id": "reward-18"
              }
            ]
          },
          "failure": {
            "text": "Předmět zmizí pod hladinou.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z vody se vynoří chapadlo. Ztrácíš 2 HP a Hrozba +1.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
                "amount": -2
              },
              {
                "type": "modifyThreat",
                "amount": 1
              }
            ]
          }
        }
      }
    ]
  }
];
