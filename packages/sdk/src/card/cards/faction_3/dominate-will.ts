import { defineSerializedBlueprint } from '../../card-blueprint';

export const f3DominateWill = defineSerializedBlueprint({
  id: 'f3_dominate_will',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'rare',
  effects: [
    {
      text: 'Take control of an enemy minion nearby your general.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_unit_owner',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ],
                random: false
              },
              duration: 'always'
            }
          }
        ]
      },
      vfx: { tracks: [] }
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
                    { type: 'is_minion', params: { not: false } }
                  ]
                ],
                random: false
              }
            }
          },
          {
            type: 'is_nearby',
            params: {
              unit: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              },
              cell: { candidates: [], random: false }
            }
          }
        ]
      ]
    ]
  },
  cellHighlights: [],
  spriteId: 'icon_f3_dominate_will',
  name: 'Dominate Will',
  cost: 7,
  faction: 'f3'
});
