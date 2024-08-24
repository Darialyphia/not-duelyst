import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4VoidPulse = defineSerializedBlueprint({
  id: 'void_pulse',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: 'Deal 1 damage to a unit and heal your general for 2.',
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
            type: 'heal',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
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
            params: { unit: { candidates: [[{ type: 'any_unit' }]], random: false } }
          }
        ]
      ]
    ]
  },
  cellHighlights: [],
  spriteId: 'icon_f4_void_pulse',
  name: 'Void Pulse',
  cost: 1,
  faction: 'f4'
});
