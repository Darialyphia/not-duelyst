import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5PlasmaStorm = defineSerializedBlueprint({
  id: 'f5_plasma_storm',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'rare',
  effects: [
    {
      text: 'Destroy minions with 3 or less attack.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'destroy_unit',
            params: {
              targets: {
                candidates: [
                  [
                    { type: 'is_minion', params: { not: false } },
                    {
                      type: 'has_attack',
                      params: {
                        not: false,
                        amount: { type: 'fixed', params: { value: 4 } },
                        operator: 'less_than'
                      }
                    }
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
  targets: { min: 1, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [],
  name: 'Plasma Storm',
  cost: 5,
  spriteId: 'icon_f5_plasmastorm',
  faction: 'f5'
});
