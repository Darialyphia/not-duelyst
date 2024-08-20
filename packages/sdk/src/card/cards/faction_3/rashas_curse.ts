import { defineSerializedBlueprint } from '../../card-blueprint';

export const f3RashasCurse = defineSerializedBlueprint({
  id: 'f3_rashas_curse',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'rare',
  effects: [
    {
      text: 'Destroy a random artifact equiped to the enemy general. Summon a @Wind Dervish@ nearby them.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'unequip_artifact',
            params: {
              artifact: {
                candidates: [[{ type: 'equiped_by_enemy', params: {} }]],
                random: true
              },
              execute: 'now',
              filter: { candidates: [], random: false }
            }
          },
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['f3_wind_dervish'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: {
                candidates: [[{ type: 'is_manual_target', params: { index: 0 } }]],
                random: false
              }
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
            type: 'is_nearby',
            params: {
              unit: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_enemy', params: { not: false } }
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
  spriteId: 'icon_f3_rashas_curse',
  name: "Rasha's Curse",
  cost: 2,
  faction: 'f3'
});
