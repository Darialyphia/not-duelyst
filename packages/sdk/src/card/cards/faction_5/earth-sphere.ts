import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5EarthSphere = defineSerializedBlueprint({
  id: 'f5_earth_sphere',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: 'Heal your general for 8.',
      config: {
        actions: [
          {
            type: 'heal',
            params: {
              amount: { type: 'fixed', params: { value: 8 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              },
              execute: 'now',
              filter: { candidates: [], random: false }
            }
          }
        ],
        executionContext: 'immediate'
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 0, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [],
  spriteId: 'icon_f5_earthsphere',
  name: 'Earth Sphere',
  cost: 4,
  faction: 'f5'
});
