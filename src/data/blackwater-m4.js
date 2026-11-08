// Optional M4 scenario content. Not included in legacy default decks until scenario selection exists.
export const blackwaterM4Cards = [
  {
    "id": "bw-00-01",
    "type": "encounter",
    "locationId": "location-0",
    "title": "Zvon v mlze",
    "description": "Z hladiny se ozve dutý úder. Rybáři na molu se bez jediného slova obrátí k moři. Na okamžik vidíš ve vodě odraz zvonice, která ve městě nestojí.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-00-01-listen",
        "label": "Zachytit rytmus zvonu",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Rozpoznáš rytmus jako nouzový signál. Jeden rybář potvrdí, že ho slyšel i u majáku.",
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
            "text": "Zapíšeš celý rytmus a získáš svědectví rybáře.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "success": {
            "text": "Zachytíš opakující se vzorec. Rybář ti potvrdí směr k majáku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "partialSuccess": {
            "text": "Rybář ti prozradí směr zvonění, ale ozvěna ti zůstane v hlavě. Ztrácíš 1 SAN.",
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
            "text": "Rytmus se rozpadne v hukotu přílivu. Odpovědi budeš muset hledat jinde.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Úder zazní přímo za tebou. Ztrácíš 1 SAN a Hrozba vzroste.",
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
        "id": "bw-00-01-warn",
        "label": "Varovat rybáře a odvést je od vody",
        "apCost": 1,
        "test": {
          "attribute": "VŮ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odvedeš rybáře do bezpečí. Jeden z nich ti svěří, co viděl, a přerušíš ozvěnu rituálu.",
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
            "text": "Rybáři ustoupí a jeden z nich ti svěří svědectví.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "success": {
            "text": "Rybáři tě poslechnou. Jeden z nich ti popíše loď u majáku.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "partialSuccess": {
            "text": "Posledního rybáře odtáhneš na poslední chvíli. Zraníš se, ale získáš jeho svědectví.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
                "amount": -1
              },
              {
                "type": "addEvidence",
                "id": "reward-5"
              }
            ]
          },
          "failure": {
            "text": "Rybáři odejdou sami, aniž by ti odpověděli.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Jeden rybář tě strhne na mokré molo. Ztrácíš 1 HP a Hrozba vzroste.",
            "effects": [
              {
                "type": "modifyStat",
                "stat": "hp",
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
    "id": "bw-03-01",
    "type": "encounter",
    "locationId": "location-3",
    "title": "Pacient číslo devět",
    "description": "Na dveřích pokoje je vyryta devítka. Uvnitř sedí pacient se zacpanýma ušima. Přesto přesně odpočítává údery zvonu, který nikdo jiný neslyší.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-03-01-interview",
        "label": "Vyslechnout pacienta",
        "apCost": 1,
        "test": {
          "attribute": "VŮ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Pacient ti popíše rytmus i cestu k pobřeží. Na chvíli se uklidní.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": 1
              }
            ]
          },
          "greatSuccess": {
            "text": "Získáš souvislé svědectví o nočním zvonění.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "success": {
            "text": "Pacient ti prozradí, že údery přicházejí od pobřeží.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš svědectví, ale jeho počítání se ti vryje do mysli. -1 SAN.",
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
            "text": "Pacient se odvrátí a odmítne promluvit.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Pacient začne křičet tvé jméno. -2 SAN.",
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
        "id": "bw-03-01-record",
        "label": "Zapsat rytmus jeho klepání",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Zachytíš přesný rytmus a získáš pacientovo svědectví.",
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
            "text": "Podaří se ti zapsat celý vzorec.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "success": {
            "text": "Rozpoznáš opakování a zapíšeš pacientovo svědectví.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-12"
              }
            ]
          },
          "partialSuccess": {
            "text": "Zachytíš část rytmu, ale zvuk ti rozbolí hlavu. -1 SAN.",
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
            "text": "Klepání se zastaví dřív, než rozpoznáš vzorec.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Na dveře někdo zaklepe z druhé strany. -1 SAN, Hrozba +1.",
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
    "id": "bw-01-01",
    "type": "evidence",
    "locationId": "location-1",
    "title": "Dům se solí",
    "description": "V opuštěném domě jsou všechny prahy posypané solí. Na zdi visí mapa tunelů a v prachu jsou otisky dětských bot.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-01-01-inspect",
        "label": "Prostudovat mapu a značení",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odhalíš skrytou souvislost: chodba vede pod pobřežními domy Podaří se ti zároveň zadržet postup rituálu.",
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
            "text": "Důkladně prozkoumáš stopu: chodba vede pod pobřežními domy",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "success": {
            "text": "Získáš důležitou stopu: chodba vede pod pobřežními domy",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš stopu, ale to, co spatříš, tě připraví o klid.",
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
            "text": "Stopa se ztratí, ale další odpovědi mohou čekat jinde.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Místo se probudí a temnota si všimne tvé přítomnosti.",
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
        "id": "bw-01-01-alternate",
        "label": "Prohledat zazděné dveře",
        "apCost": 1,
        "test": {
          "attribute": "SÍ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odhalíš skrytou souvislost: za zdí se skrývá vstup do starého tunelu Podaří se ti zároveň zadržet postup rituálu.",
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
            "text": "Důkladně prozkoumáš stopu: za zdí se skrývá vstup do starého tunelu",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "success": {
            "text": "Získáš důležitou stopu: za zdí se skrývá vstup do starého tunelu",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-7"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš stopu, ale to, co spatříš, tě připraví o klid.",
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
            "text": "Stopa se ztratí, ale další odpovědi mohou čekat jinde.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Místo se probudí a temnota si všimne tvé přítomnosti.",
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
    "id": "bw-02-01",
    "type": "evidence",
    "locationId": "location-2",
    "title": "Vymazaná stránka",
    "description": "V městském archivu chybí stránka se jmény těch, kteří zmizeli při posledním přílivu. Mezi listy zůstala otlačená stopa inkoustu.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-02-01-inspect",
        "label": "Obnovit otisk písma",
        "apCost": 1,
        "test": {
          "attribute": "VĚ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odhalíš skrytou souvislost: zmizelá jména byla vyškrtnuta z knihy Podaří se ti zároveň zadržet postup rituálu.",
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
            "text": "Důkladně prozkoumáš stopu: zmizelá jména byla vyškrtnuta z knihy",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-10"
              }
            ]
          },
          "success": {
            "text": "Získáš důležitou stopu: zmizelá jména byla vyškrtnuta z knihy",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-10"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš stopu, ale to, co spatříš, tě připraví o klid.",
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
            "text": "Stopa se ztratí, ale další odpovědi mohou čekat jinde.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Místo se probudí a temnota si všimne tvé přítomnosti.",
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
        "id": "bw-02-01-alternate",
        "label": "Porovnat zápisy s mapou majáku",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odhalíš skrytou souvislost: záznamy ukazují k majáku Podaří se ti zároveň zadržet postup rituálu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-9"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Důkladně prozkoumáš stopu: záznamy ukazují k majáku",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-9"
              }
            ]
          },
          "success": {
            "text": "Získáš důležitou stopu: záznamy ukazují k majáku",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-9"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš stopu, ale to, co spatříš, tě připraví o klid.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-9"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Stopa se ztratí, ale další odpovědi mohou čekat jinde.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Místo se probudí a temnota si všimne tvé přítomnosti.",
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
    "id": "bw-04-01",
    "type": "evidence",
    "locationId": "location-4",
    "title": "Hrob bez jména",
    "description": "Pod nakloněným náhrobkem je prázdná rakev. Na víku někdo vyryl stejný znak, jaký se objevuje v rybářově deníku.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-04-01-inspect",
        "label": "Překreslit rytinu",
        "apCost": 1,
        "test": {
          "attribute": "VĚ",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odhalíš skrytou souvislost: symbol spojuje hrob s obřadem přílivu Podaří se ti zároveň zadržet postup rituálu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Důkladně prozkoumáš stopu: symbol spojuje hrob s obřadem přílivu",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              }
            ]
          },
          "success": {
            "text": "Získáš důležitou stopu: symbol spojuje hrob s obřadem přílivu",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš stopu, ale to, co spatříš, tě připraví o klid.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Stopa se ztratí, ale další odpovědi mohou čekat jinde.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Místo se probudí a temnota si všimne tvé přítomnosti.",
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
        "id": "bw-04-01-alternate",
        "label": "Prozkoumat staré pohřební záznamy",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odhalíš skrytou souvislost: jméno zvoníka bylo záměrně vymazáno Podaří se ti zároveň zadržet postup rituálu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Důkladně prozkoumáš stopu: jméno zvoníka bylo záměrně vymazáno",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              }
            ]
          },
          "success": {
            "text": "Získáš důležitou stopu: jméno zvoníka bylo záměrně vymazáno",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš stopu, ale to, co spatříš, tě připraví o klid.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Stopa se ztratí, ale další odpovědi mohou čekat jinde.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Místo se probudí a temnota si všimne tvé přítomnosti.",
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
    "id": "bw-05-01",
    "type": "evidence",
    "locationId": "location-5",
    "title": "Signální kniha",
    "description": "Světlo majáku se každou noc rozsvítí přesně při třetím úderu. Ve služební knize někdo škrtl poslední směnu.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-05-01-inspect",
        "label": "Prostudovat služební záznamy",
        "apCost": 1,
        "test": {
          "attribute": "VĚ",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odhalíš skrytou souvislost: maják vysílá signál ve stejném rytmu jako zvon Podaří se ti zároveň zadržet postup rituálu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-9"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Důkladně prozkoumáš stopu: maják vysílá signál ve stejném rytmu jako zvon",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-9"
              }
            ]
          },
          "success": {
            "text": "Získáš důležitou stopu: maják vysílá signál ve stejném rytmu jako zvon",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-9"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš stopu, ale to, co spatříš, tě připraví o klid.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-9"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Stopa se ztratí, ale další odpovědi mohou čekat jinde.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Místo se probudí a temnota si všimne tvé přítomnosti.",
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
        "id": "bw-05-01-alternate",
        "label": "Zkontrolovat mechaniku světla",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odhalíš skrytou souvislost: pod majákem je skrytý servisní vstup Podaří se ti zároveň zadržet postup rituálu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-16"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Důkladně prozkoumáš stopu: pod majákem je skrytý servisní vstup",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-16"
              }
            ]
          },
          "success": {
            "text": "Získáš důležitou stopu: pod majákem je skrytý servisní vstup",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-16"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš stopu, ale to, co spatříš, tě připraví o klid.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-16"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Stopa se ztratí, ale další odpovědi mohou čekat jinde.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Místo se probudí a temnota si všimne tvé přítomnosti.",
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
    "id": "bw-06-01",
    "type": "evidence",
    "locationId": "location-6",
    "title": "Kruh z kostí",
    "description": "V jeskyni se mezi černými kameny rýsuje kruh z bělavých úlomků. Každá přílivová vlna přinese další, přestože zde není žádný otvor do moře.",
    "repeatable": false,
    "conditions": [],
    "choices": [
      {
        "id": "bw-06-01-inspect",
        "label": "Překreslit kruh bez dotyku",
        "apCost": 1,
        "test": {
          "attribute": "VĚ",
          "difficulty": 9
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odhalíš skrytou souvislost: rytina označuje hranici rituálu Podaří se ti zároveň zadržet postup rituálu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Důkladně prozkoumáš stopu: rytina označuje hranici rituálu",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              }
            ]
          },
          "success": {
            "text": "Získáš důležitou stopu: rytina označuje hranici rituálu",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš stopu, ale to, co spatříš, tě připraví o klid.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-14"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Stopa se ztratí, ale další odpovědi mohou čekat jinde.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Místo se probudí a temnota si všimne tvé přítomnosti.",
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
        "id": "bw-06-01-alternate",
        "label": "Najít bezpečnou cestu kolem kruhu",
        "apCost": 1,
        "test": {
          "attribute": "VN",
          "difficulty": 8
        },
        "outcomes": {
          "criticalSuccess": {
            "text": "Odhalíš skrytou souvislost: servisní chodba vede kolem obřadního místa Podaří se ti zároveň zadržet postup rituálu.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-16"
              },
              {
                "type": "modifyRitual",
                "amount": -1
              }
            ]
          },
          "greatSuccess": {
            "text": "Důkladně prozkoumáš stopu: servisní chodba vede kolem obřadního místa",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-16"
              }
            ]
          },
          "success": {
            "text": "Získáš důležitou stopu: servisní chodba vede kolem obřadního místa",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-16"
              }
            ]
          },
          "partialSuccess": {
            "text": "Získáš stopu, ale to, co spatříš, tě připraví o klid.",
            "effects": [
              {
                "type": "addEvidence",
                "id": "reward-16"
              },
              {
                "type": "modifyStat",
                "stat": "san",
                "amount": -1
              }
            ]
          },
          "failure": {
            "text": "Stopa se ztratí, ale další odpovědi mohou čekat jinde.",
            "effects": []
          },
          "criticalFailure": {
            "text": "Místo se probudí a temnota si všimne tvé přítomnosti.",
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
