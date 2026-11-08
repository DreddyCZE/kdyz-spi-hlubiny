export const additionalBlackwaterCards = [
  {
    "id": "bw-00-02",
    "type": "encounter",
    "locationId": "location-0",
    "title": "Přílivový zvon",
    "description": "Z podpalubí opuštěné šalupy se ozývá zvonění. Na lavici leží mokrý kabát, pod nímž je vyšitý znak zaniklé společnosti.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-00-02-0",
        "label": "Otevřít lodní truhlu",
        "apCost": 1,
        "test": {
          "attribute": "VĚ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Uvnitř leží lodní seznam se jménem člověka, který se nikdy nenarodil. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Uvnitř leží lodní seznam se jménem člověka, který se nikdy nenarodil. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "success": {
            "text": "Uvnitř leží lodní seznam se jménem člověka, který se nikdy nenarodil. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "partialSuccess": {
            "text": "Uvnitř leží lodní seznam se jménem člověka, který se nikdy nenarodil. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
        "id": "bw-00-02-1",
        "label": "Prozkoumat zvonící palubu",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odhalíš rytmus úderů, který ukazuje na jeskyně. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Odhalíš rytmus úderů, který ukazuje na jeskyně. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "success": {
            "text": "Odhalíš rytmus úderů, který ukazuje na jeskyně. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "partialSuccess": {
            "text": "Odhalíš rytmus úderů, který ukazuje na jeskyně. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
    "id": "bw-01-02",
    "type": "encounter",
    "locationId": "location-1",
    "title": "Žena bez stínu",
    "description": "Pod plynovou lampou čeká žena v černém. Její stín se pohybuje opačným směrem než ona. V rukou drží telegram datovaný zítřkem.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-01-02-0",
        "label": "Přečíst telegram",
        "apCost": 1,
        "test": {
          "attribute": "VĚ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "V textu rozpoznáš jméno ze starého seznamu pohřešovaných. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "V textu rozpoznáš jméno ze starého seznamu pohřešovaných. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "success": {
            "text": "V textu rozpoznáš jméno ze starého seznamu pohřešovaných. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "partialSuccess": {
            "text": "V textu rozpoznáš jméno ze starého seznamu pohřešovaných. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
        "id": "bw-01-02-1",
        "label": "Sledovat cizí stín",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Stín tě dovede k opuštěnému průchodu pod knihovnou. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Stín tě dovede k opuštěnému průchodu pod knihovnou. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "success": {
            "text": "Stín tě dovede k opuštěnému průchodu pod knihovnou. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "partialSuccess": {
            "text": "Stín tě dovede k opuštěnému průchodu pod knihovnou. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
    "id": "bw-02-02",
    "type": "encounter",
    "locationId": "location-2",
    "title": "Atlas utopených",
    "description": "Na stole v archivu leží atlas, v němž se pobřeží samo překresluje. Každá nová zátoka nese jméno zmizelého občana.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-02-02-0",
        "label": "Porovnat staré mapy",
        "apCost": 1,
        "test": {
          "attribute": "VĚ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Zjistíš, že nejstarší mapa skrývá skutečnou cestu k majáku. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-10"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Zjistíš, že nejstarší mapa skrývá skutečnou cestu k majáku. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-10"
              }
            ]
          },
          "success": {
            "text": "Zjistíš, že nejstarší mapa skrývá skutečnou cestu k majáku. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-10"
              }
            ]
          },
          "partialSuccess": {
            "text": "Zjistíš, že nejstarší mapa skrývá skutečnou cestu k majáku. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-10"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
        "id": "bw-02-02-1",
        "label": "Zastavit pohyb inkoustu",
        "apCost": 1,
        "test": {
          "attribute": "VŮ",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Inkoust ustoupí a odkryje poznámku o podmořském zvonu. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-10"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Inkoust ustoupí a odkryje poznámku o podmořském zvonu. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-10"
              }
            ]
          },
          "success": {
            "text": "Inkoust ustoupí a odkryje poznámku o podmořském zvonu. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-10"
              }
            ]
          },
          "partialSuccess": {
            "text": "Inkoust ustoupí a odkryje poznámku o podmořském zvonu. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-10"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
    "id": "bw-03-02",
    "type": "encounter",
    "locationId": "location-3",
    "title": "Noční služba",
    "description": "Na konci chodby ústavu se houpe prázdný vozík. V jeho zásuvce leží čerstvý záznam o pacientovi, který zemřel před čtyřiceti lety.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-03-02-0",
        "label": "Nahlédnout do záznamu",
        "apCost": 1,
        "test": {
          "attribute": "VĚ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Najdeš jméno lékaře, který pacientům nařídil naslouchat přílivu. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Najdeš jméno lékaře, který pacientům nařídil naslouchat přílivu. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "success": {
            "text": "Najdeš jméno lékaře, který pacientům nařídil naslouchat přílivu. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "partialSuccess": {
            "text": "Najdeš jméno lékaře, který pacientům nařídil naslouchat přílivu. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
        "id": "bw-03-02-1",
        "label": "Prohledat uzamčené oddělení",
        "apCost": 1,
        "test": {
          "attribute": "SÍ",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Za dveřmi objevíš stopy solných kruhů a záznamy o zvonění. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Za dveřmi objevíš stopy solných kruhů a záznamy o zvonění. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "success": {
            "text": "Za dveřmi objevíš stopy solných kruhů a záznamy o zvonění. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "partialSuccess": {
            "text": "Za dveřmi objevíš stopy solných kruhů a záznamy o zvonění. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
    "id": "bw-04-02",
    "type": "encounter",
    "locationId": "location-4",
    "title": "Hrob, který dýchá",
    "description": "Mezi náhrobky se pomalu zvedá čerstvá hlína. Z praskliny uniká teplý vzduch vonící mořskou solí a na kameni přibývají nové letopočty.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-04-02-0",
        "label": "Přečíst měnící se epitaf",
        "apCost": 1,
        "test": {
          "attribute": "VĚ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Rozpoznáš rodinu, která financovala stavbu podzemního tunelu. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Rozpoznáš rodinu, která financovala stavbu podzemního tunelu. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "success": {
            "text": "Rozpoznáš rodinu, která financovala stavbu podzemního tunelu. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "partialSuccess": {
            "text": "Rozpoznáš rodinu, která financovala stavbu podzemního tunelu. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
        "id": "bw-04-02-1",
        "label": "Odkryt tajnou schránku",
        "apCost": 1,
        "test": {
          "attribute": "SÍ",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Pod náhrobkem objevíš měděnou destičku s rytmem zvonu. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Pod náhrobkem objevíš měděnou destičku s rytmem zvonu. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "success": {
            "text": "Pod náhrobkem objevíš měděnou destičku s rytmem zvonu. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "partialSuccess": {
            "text": "Pod náhrobkem objevíš měděnou destičku s rytmem zvonu. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
    "id": "bw-05-02",
    "type": "encounter",
    "locationId": "location-5",
    "title": "Poslední strážce",
    "description": "Na schodech majáku sedí muž v promočené uniformě. Jeho hodinky jdou pozpátku a každá minuta končí třemi údery do zdi.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-05-02-0",
        "label": "Vyslechnout strážce",
        "apCost": 1,
        "test": {
          "attribute": "VŮ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Strážce zašeptá čas příštího přílivu a jméno lodi Milost. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Strážce zašeptá čas příštího přílivu a jméno lodi Milost. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "success": {
            "text": "Strážce zašeptá čas příštího přílivu a jméno lodi Milost. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "partialSuccess": {
            "text": "Strážce zašeptá čas příštího přílivu a jméno lodi Milost. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
        "id": "bw-05-02-1",
        "label": "Prozkoumat mechanismus světla",
        "apCost": 1,
        "test": {
          "attribute": "VĚ",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Zjistíš, že maják není řízen elektřinou, ale zvukem z hlubin. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Zjistíš, že maják není řízen elektřinou, ale zvukem z hlubin. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "success": {
            "text": "Zjistíš, že maják není řízen elektřinou, ale zvukem z hlubin. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "partialSuccess": {
            "text": "Zjistíš, že maják není řízen elektřinou, ale zvukem z hlubin. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
    "id": "bw-06-02",
    "type": "encounter",
    "locationId": "location-6",
    "title": "Komnata mušlí",
    "description": "Ve skalní dutině rostou obrovské mušle. Každá opakuje jiný lidský hlas a jedna z nich vysloví tvé jméno dřív, než se přiblížíš.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-06-02-0",
        "label": "Naslouchat hlasům",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "V šepotu rozpoznáš svědectví poslední posádky Milosti. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "V šepotu rozpoznáš svědectví poslední posádky Milosti. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "success": {
            "text": "V šepotu rozpoznáš svědectví poslední posádky Milosti. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "partialSuccess": {
            "text": "V šepotu rozpoznáš svědectví poslední posádky Milosti. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
        "id": "bw-06-02-1",
        "label": "Rozbít největší mušli",
        "apCost": 1,
        "test": {
          "attribute": "SÍ",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Z jejího nitra vypadne destička s rituálním zápisem. Získáváš důležitou stopu a zpomalíš temný rituál.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Z jejího nitra vypadne destička s rituálním zápisem. Získáváš důležitou stopu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "success": {
            "text": "Z jejího nitra vypadne destička s rituálním zápisem. Stopa patří do tvého deníku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "partialSuccess": {
            "text": "Z jejího nitra vypadne destička s rituálním zápisem. Za poznání zaplatíš neklidným spánkem.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Ztratíš drahocenný čas. Místo zůstává němé.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Z temnoty se ozve odpověď. Ještě dlouho budeš cítit její přítomnost.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
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
