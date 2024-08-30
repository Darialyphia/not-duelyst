import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2MistDragonSeal = defineSerializedBlueprint({
  id: 'f2_mist_dragon_seal',
  collectable: true,
  keywords: [],
  name: 'Mist Dragon Seal',
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  spriteId: 'icon_f2_mist_dragon_seal',
  cost: 1,
  faction: FACTION_IDS.F2,
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_minion', params: { not: false } }
                  ]
                ]
              }
            }
          }
        ]
      ],
      [[{ type: 'is_empty' }]]
    ]
  },
  effects: [
    defineCardEffect({
      text: 'Give an allied minion +1/+1 and teleport it to any space.',
      config: {
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 1 } },
                activeWhen: { candidates: [] }
              },
              hp: {
                amount: { type: 'fixed', params: { value: 1 } },
                activeWhen: { candidates: [] }
              },
              targets: {
                candidates: [
                  [{ type: 'is_manual_target', params: { index: 0, not: false } }]
                ]
              },
              filter: { candidates: [] },
              duration: 'always',
              execute: 'now'
            }
          },
          {
            type: 'teleport_unit',
            params: {
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { index: 0, not: false } }]
                ]
              },
              cell: {
                candidates: [[{ type: 'is_manual_target', params: { index: 1 } }]]
              },
              filter: { candidates: [] },
              execute: 'now'
            }
          }
        ],
        executionContext: 'immediate'
      }
    })
  ]
});
