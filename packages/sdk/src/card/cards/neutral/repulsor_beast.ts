import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralRepulsorBeast = defineSerializedBlueprint({
  id: 'neutral_repulsor_beast',
  name: 'Repulsor Beast',
  spriteId: 'neutral_repulsor_beast',
  cost: 3,
  attack: 2,
  maxHp: 2,
  faction: null,
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  cellHighlights: [],
  effects: [
    {
      text: '@Opening Gambit@: Teleport a nearby enemy minion to any empty space.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'teleport_unit',
            params: {
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ]
              },
              cell: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 1 } }]
                ]
              },
              filter: { candidates: [[{ type: 'played_from_hand', params: {} }]] },
              execute: 'now'
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
                    { type: 'is_enemy', params: { not: false } },
                    { type: 'is_minion', params: { not: false } },
                    {
                      type: 'is_nearby',
                      params: {
                        cell: { candidates: [[{ type: 'summon_target' }]] },
                        not: false
                      }
                    }
                  ]
                ]
              }
            }
          }
        ]
      ],
      [[{ type: 'is_empty' }]]
    ]
  }
});
