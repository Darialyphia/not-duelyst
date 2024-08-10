import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3ScionssSecondWish = defineSerializedBlueprint({
  id: 'scions_second_wish',
  spriteId: 'icon_f3_scions_second_wish',
  name: "Scions's Second Wish",
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  targets: { min: 1, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [],
  cost: 2,
  faction: FACTION_IDS.F3,
  effects: [
    {
      text: 'Heal your general for 2. Draw 2 cards.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'draw_cards',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              player: [[{ type: 'ally_player' }]],
              filter: [],
              execute: 'now'
            }
          },
          {
            type: 'heal',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              targets: [
                [
                  { type: 'is_general', params: { not: false } },
                  { type: 'is_ally', params: { not: false } }
                ]
              ],
              filter: [],
              execute: 'now'
            }
          }
        ]
      }
    }
  ]
});
