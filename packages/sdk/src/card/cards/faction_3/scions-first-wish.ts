import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3ScionsFirstWish = defineSerializedBlueprint({
  id: 'scions_first_wish',
  spriteId: 'icon_f3_scions_first_wish',
  name: "Scion's First Wish",
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  cellHighlights: [],
  cost: 1,
  faction: FACTION_IDS.F3,
  effects: [
    {
      text: 'Give a minion +1/+1. Draw a card.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: { amount: { type: 'fixed', params: { value: 1 } }, activeWhen: [] },
              hp: { amount: { type: 'fixed', params: { value: 1 } }, activeWhen: [] },
              targets: [[{ type: 'is_manual_target', params: { not: false, index: 0 } }]],
              filter: [],
              duration: 'always',
              execute: 'now'
            }
          },
          {
            type: 'draw_cards',
            params: {
              amount: { type: 'fixed', params: { value: 1 } },
              player: [[{ type: 'ally_player' }]],
              filter: [],
              execute: 'now'
            }
          }
        ]
      }
    }
  ],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: { unit: [[{ type: 'is_minion', params: { not: false } }]] }
          }
        ]
      ]
    ]
  }
});
