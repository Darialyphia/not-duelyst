import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4SphereOfDarkness = defineSerializedBlueprint({
  id: 'f4_sphere_of_darkness',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: 'Create a Shadow Creep tile.',
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
                candidates: [[{ type: 'is_manual_target', params: { index: 0 } }]]
              }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 1, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [],
  spriteId: 'icon_f4_sphere_of_darkness',
  name: 'Sphere of Darkness',
  cost: 2,
  faction: 'f4'
});
