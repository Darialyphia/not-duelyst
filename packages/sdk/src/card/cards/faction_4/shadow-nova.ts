import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4ShadowNova = defineSerializedBlueprint({
  id: 'f4_shadow_nova',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'rare',
  effects: [
    {
      text: 'Create Shadow Creep tiles in a 2x2 area.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'create_tile',
            params: {
              execute: 'now',
              filter: { candidates: [], random: false },
              player: { candidates: [[{ type: 'ally_player' }]] },
              tile: 'shadow_creep',
              position: {
                candidates: [
                  [
                    {
                      type: '2x2_area',
                      params: {
                        topLeft: {
                          candidates: [
                            [{ type: 'is_manual_target', params: { index: 0 } }]
                          ],
                          random: false
                        }
                      }
                    }
                  ]
                ]
              }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 1, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [
    [
      {
        type: '2x2_area',
        params: {
          topLeft: {
            candidates: [[{ type: 'is_manual_target', params: { index: 0 } }]],
            random: false
          }
        }
      }
    ]
  ],
  spriteId: 'icon_f4_shadow_nova',
  name: 'Shadow Nova',
  cost: 5,
  faction: 'f4'
});
