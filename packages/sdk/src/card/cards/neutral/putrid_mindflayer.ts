import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralPutridMindflayer = defineSerializedBlueprint({
  id: 'neutral_putrid_mindflayer',
  name: 'Putrid Mindflayer',
  spriteId: 'neutral_putrid_mindflayer',
  collectable: true,
  keywords: [KEYWORDS.DYING_WISH.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 4,
  attack: 4,
  maxHp: 3,
  faction: null,
  effects: [
    {
      text: '@Dying Wish@: Deal 4 damage to nearby enemies.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 4 } },
              targets: {
                candidates: [
                  [
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [
                            [
                              {
                                type: 'is_nearby',
                                params: {
                                  unit: {
                                    candidates: [
                                      [{ type: 'is_self', params: { not: false } }]
                                    ]
                                  },
                                  not: false
                                }
                              }
                            ]
                          ]
                        },
                        not: false
                      }
                    },
                    { type: 'is_enemy', params: { not: false } }
                  ]
                ]
              },
              filter: { candidates: [] },
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_before_unit_destroyed',
            params: {
              unit: { candidates: [[{ type: 'is_self', params: { not: false } }]] },
              frequency: { type: 'always' }
            }
          }
        ]
      }
    }
  ]
});
