import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4WraithlingSwarm = defineSerializedBlueprint({
  id: 'f4_wraithling_swarm',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: 'Summon three joined wraithlings.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['f4_wraithling'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: {
                candidates: [[{ type: 'is_manual_target', params: { index: 0 } }]],
                random: false
              }
            }
          },
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['f4_wraithling'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: {
                candidates: [[{ type: 'is_manual_target', params: { index: 1 } }]],
                random: false
              }
            }
          },
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['f4_wraithling'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: {
                candidates: [[{ type: 'is_manual_target', params: { index: 2 } }]],
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
    min: 3,
    targets: [
      [
        [
          { type: 'is_empty' },
          {
            type: 'is_nearby',
            params: {
              unit: {
                candidates: [[{ type: 'is_ally', params: { not: false } }]],
                random: false
              },
              cell: { candidates: [], random: false }
            }
          }
        ]
      ],
      [
        [
          { type: 'is_empty' },
          {
            type: 'is_nearby',
            params: {
              unit: { candidates: [], random: false },
              cell: {
                candidates: [[{ type: 'is_manual_target', params: { index: 0 } }]],
                random: false
              }
            }
          }
        ]
      ],
      [
        [
          { type: 'is_empty' },
          {
            type: 'is_nearby',
            params: {
              unit: { candidates: [], random: false },
              cell: {
                candidates: [
                  [{ type: 'is_manual_target', params: { index: 0 } }],
                  [{ type: 'is_manual_target', params: { index: 1 } }]
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
  spriteId: 'icon_f4_wraithling_swarm',
  name: 'Wraithling Swarm',
  cost: 2,
  faction: 'f4'
});
