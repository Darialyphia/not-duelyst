import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4SoulScythe = defineSerializedBlueprint({
  id: 'f4_soul_scythe',
  collectable: true,
  keywords: ['opening_gambit'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'common',
  effects: [
    {
      text: 'Destroy an ally minion to draw 2 cards.',
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
              filter: {
                candidates: [[{ type: 'played_from_hand', params: {} }]],
                random: false
              },
              execute: 'now'
            }
          },
          {
            type: 'draw_cards',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              filter: {
                candidates: [
                  [
                    { type: 'played_from_hand', params: {} },
                    {
                      type: 'target_exists',
                      params: { index: 0 }
                    }
                  ]
                ],
                random: false
              },
              execute: 'now'
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
            type: 'is_nearby',
            params: {
              unit: { candidates: [], random: false },
              cell: {
                candidates: [[{ type: 'summon_target' }]],
                random: false
              }
            }
          },
          {
            type: 'has_unit',
            params: {
              unit: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
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
  spriteId: 'f4_buildcommon',
  name: 'Soul Scythe',
  cost: 2,
  attack: 3,
  maxHp: 2,
  faction: 'f4'
});
