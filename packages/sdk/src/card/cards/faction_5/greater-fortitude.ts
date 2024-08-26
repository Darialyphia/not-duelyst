import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5GreaterFortitude = defineSerializedBlueprint({
  id: 'f5_greater-fortitude',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: 'Gie a minion +2/+2.',
      config: {
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 2 } },
                activeWhen: { candidates: [], random: false }
              },
              hp: {
                amount: { type: 'fixed', params: { value: 2 } },
                activeWhen: { candidates: [], random: false }
              },
              speed: {
                amount: { type: 'fixed', params: { value: 0 } },
                activeWhen: { candidates: [], random: false }
              },
              targets: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              duration: 'always',
              execute: 'now'
            }
          }
        ],
        executionContext: 'immediate'
      },
      vfx: { tracks: [] }
    }
  ],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: {
                candidates: [[{ type: 'is_minion', params: { not: false } }]],
                random: false
              }
            }
          }
        ]
      ]
    ]
  },
  cellHighlights: [],
  spriteId: 'icon_f5_greaterfortitude',
  name: 'Greater Fortitude',
  cost: 1,
  faction: 'f5'
});
