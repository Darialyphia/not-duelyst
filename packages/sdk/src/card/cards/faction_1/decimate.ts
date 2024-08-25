import { defineSerializedBlueprint } from '../../card-blueprint';

export const f1Decimate = defineSerializedBlueprint({
  id: 'f1_decimate',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'legendary',
  effects: [
    {
      text: 'Destroy minions that are not nearby a general.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'destroy_unit',
            params: {
              targets: {
                candidates: [
                  [
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_general', params: { not: false } }]],
                          random: false
                        },
                        cell: { candidates: [], random: false },
                        not: true
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
  targets: { min: 0, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [],
  name: 'Decimate',
  cost: 4,
  faction: 'f1',
  spriteId: 'icon_f1_decimate'
});
