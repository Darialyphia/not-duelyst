import { defineSerializedBlueprint } from '../../card-blueprint';

export const f3Hexblade = defineSerializedBlueprint({
  id: 'f3_hexblade',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'ARTIFACT',
  rarity: 'legendary',
  effects: [
    {
      text: 'Your general has +3/+0.',
      config: {
        executionContext: 'while_equiped',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 3 } },
                activeWhen: { candidates: [], random: false }
              },
              targets: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              duration: 'always',
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_artifact_equiped',
            params: {
              card: { candidates: [[{ type: 'self', params: {} }]], random: false },
              frequency: { type: 'always' }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: 'When your general damages an enemy, set that enemys attack to 1 until the start of your next turn.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'set',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 1 } },
                activeWhen: { candidates: [], random: false }
              },
              targets: {
                candidates: [[{ type: 'attack_target', params: { not: false } }]],
                random: false
              },
              filter: { candidates: [], random: false },
              duration: 'start_of_next_turn',
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_before_unit_attack',
            params: {
              target: { candidates: [], random: false },
              unit: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              },
              frequency: { type: 'always' }
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
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
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
  spriteId: 'icon_f3_artifact_hexblade',
  name: 'Hexblade',
  cost: 4,
  faction: 'f3'
});
