import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3Blindscorch = defineSerializedBlueprint({
  id: 'f3_blindscorch',
  spriteId: 'icon_f3_blindscorch',
  name: 'Blindscorch',
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
      text: "Set a minion's attack to 0 until your next turn.",
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'set',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 0 } },
                activeWhen: { candidates: [] }
              },
              targets: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ]
              },
              filter: { candidates: [] },
              duration: 'start_of_next_turn',
              execute: 'now'
            }
          }
        ]
      }
    }
  ],
  targets: {
    min: 0,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: { candidates: [[{ type: 'is_minion', params: { not: false } }]] }
            }
          }
        ]
      ]
    ]
  }
});
