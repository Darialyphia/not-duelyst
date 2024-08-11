import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3ZenuiTheBlghtspawned = defineSerializedBlueprint({
  id: 'f3_zenrui_the_blightspawned',
  spriteId: 'f3_zenrui_the_blightspawned',
  name: "Zen'rui, the Blghtspawned",
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  cellHighlights: [],
  cost: 5,
  attack: 4,
  maxHp: 3,
  faction: FACTION_IDS.F3,
  effects: [
    {
      text: '@Opening Gambit@: Take control of a nearby enemy minion with 2 attack or less.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_unit_owner',
            params: {
              filter: { candidates: [[{ type: 'played_from_hand', params: {} }]] },
              execute: 'now',
              player: { candidates: [[{ type: 'ally_player' }]] },
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ]
              },
              duration: 'always'
            }
          }
        ]
      }
    }
  ],
  targets: {
    min: 0,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: {
                candidates: [
                  [
                    { type: 'is_minion', params: { not: false } },
                    {
                      type: 'has_attack',
                      params: {
                        not: false,
                        amount: { type: 'fixed', params: { value: 3 } },
                        operator: 'less_than'
                      }
                    }
                  ]
                ]
              }
            }
          },
          {
            type: 'is_nearby',
            params: { cell: { candidates: [[{ type: 'summon_target' }]] } }
          }
        ]
      ]
    ]
  }
});
