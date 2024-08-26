import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5NaturalSelection = defineSerializedBlueprint({
  id: 'f5_natural_selection',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: 'Destroy a minion with the lowest attack.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'destroy_unit',
            params: {
              targets: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ],
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
                    { type: 'has_lowest_attack', params: { not: false } },
                    { type: 'is_minion', params: { not: false } }
                  ]
                ],
                random: false
              }
            }
          }
        ]
      ]
    ]
  },
  cellHighlights: [],
  name: 'Natural Selection',
  spriteId: 'icon_f5_naturalselection',
  cost: 2,
  faction: 'f5'
});
