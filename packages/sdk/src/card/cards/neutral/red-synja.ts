import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralRedSynja = defineSerializedBlueprint({
  id: 'neutral_synja',
  name: 'Red Synja',
  spriteId: 'neutral_red_synja',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 7,
  attack: 7,
  maxHp: 7,
  faction: null,
  effects: [
    {
      text: 'When your general takes damage, deal 7 damage to ta random nearby enemy.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 7 } },
              targets: {
                candidates: [
                  [
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]],
                          random: false
                        },
                        cell: { candidates: [], random: false },
                        not: false
                      }
                    },
                    { type: 'is_enemy', params: { not: false } },
                    { type: 'is_minion', params: { not: false } }
                  ]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_after_unit_take_damage',
            params: {
              target: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
                ],
                random: false
              },
              unit: { candidates: [], random: false },
              card: { candidates: [], random: false },
              frequency: { type: 'always' }
            }
          }
        ]
      }
    }
  ]
});
