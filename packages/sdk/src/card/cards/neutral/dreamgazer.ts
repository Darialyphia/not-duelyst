import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralDreamgazer = defineSerializedBlueprint({
  id: 'neutral_dreamgazer',
  spriteId: 'neutral_dreamgazer',
  name: 'Dreamgazer',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 2,
  attack: 2,
  maxHp: 2,
  faction: null,
  effects: [
    {
      text: 'When you replace this card, summon it behind your general and deal 2 damage to your general.',
      config: {
        executionContext: 'trigger_while_in_hand',
        actions: [
          {
            type: 'play_card',
            params: {
              card: [[{ type: 'self' }]],
              position: [
                [
                  {
                    type: 'is_behind',
                    params: {
                      unit: [
                        [
                          { type: 'is_ally', params: { not: false } },
                          { type: 'is_general', params: { not: false } }
                        ]
                      ]
                    }
                  }
                ]
              ],
              targets: [],
              filter: [],
              execute: 'now'
            }
          },
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              targets: [
                [
                  { type: 'is_general', params: { not: false } },
                  { type: 'is_ally', params: { not: false } }
                ]
              ],
              filter: [],
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_card_replaced',
            params: {
              card: [[{ type: 'self', params: {} }]],
              frequency: { type: 'always' }
            }
          }
        ]
      }
    }
  ]
});
