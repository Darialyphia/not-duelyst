import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4DarkSeed = defineSerializedBlueprint({
  id: 'f4_dark_seed',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: "Deal damage to the enemy general equal to the number of cards in the opponent's action bar.",
      config: {
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: {
                type: 'cards_in_hands',
                params: {
                  player: {
                    candidates: [[{ type: 'enemy_player', params: {} }]],
                    random: false
                  }
                }
              },
              targets: {
                candidates: [
                  [
                    { type: 'is_enemy', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              execute: 'now'
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
  spriteId: 'icon_f4_darkseed',
  name: 'Dark Seed',
  faction: 'f4',
  cost: 5
});
