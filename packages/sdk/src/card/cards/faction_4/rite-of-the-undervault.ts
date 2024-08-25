import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4RiteOfTheUndervault = defineSerializedBlueprint({
  id: 'f4_rite_of_the_undervault',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'epic',
  effects: [
    {
      text: 'Draw cards until your hand is full.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'draw_cards',
            params: {
              amount: { type: 'missing_cards_in_hand', params: {} },
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
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
  spriteId: 'icon_f4_riteoftheundervault',
  name: 'Rite of the Undervault',
  cost: 3,
  faction: 'f4'
});
