import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4DaemonicLure = defineSerializedBlueprint({
  id: 'f4_daemonic_lure',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: 'Deal 1 damage to an enemy minion and teleport it to any space.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 1 } },
              targets: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          },
          {
            type: 'teleport_unit',
            params: {
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ],
                random: false
              },
              cell: {
                candidates: [[{ type: 'is_manual_target', params: { index: 1 } }]],
                random: false
              },
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          }
        ]
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
                candidates: [
                  [
                    { type: 'is_enemy', params: { not: false } },
                    { type: 'is_minion', params: { not: false } }
                  ]
                ],
                random: false
              }
            }
          }
        ]
      ],
      [[{ type: 'is_empty' }]]
    ]
  },
  cellHighlights: [],
  spriteId: 'icon_f4_daemoniclure',
  cost: 2,
  faction: 'f4',
  name: 'Daemonic Lure'
});
