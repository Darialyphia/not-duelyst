import { defineSerializedBlueprint } from '../../card-blueprint';

export const f3TimeMaelstrom = defineSerializedBlueprint({
  id: 'f3_time_maelstrom',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'rare',
  effects: [
    {
      text: 'Reactivate your general.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'activate_unit',
            params: {
              filter: { candidates: [], random: false },
              targets: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
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
  targets: { min: 1, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [],
  spriteId: 'icon_f3_time_maelstrom',
  name: 'Time maelstrom',
  cost: 3,
  faction: 'f3'
});
