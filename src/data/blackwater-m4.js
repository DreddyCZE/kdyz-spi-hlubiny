// M4 scenario expansion: additive content with stable IDs; no changes to legacy cards.
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
  }
];
