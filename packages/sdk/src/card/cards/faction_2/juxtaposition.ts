import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2Juxtaposition = defineSerializedBlueprint({
  id: 'f2_juxtaposition',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.EPIC,
  spriteId: 'icon_f2_juxtaposition',
  name: 'Juxtaposition',
  cost: 1,
  faction: FACTION_IDS.F2,
  effects: [
    {
      text: 'Swap the position of two minions.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'swap_units',
            params: {
              unit1: {
                candidates: [
                  [{ type: 'is_manual_target', params: { index: 0, not: false } }]
                ]
              },
              unit2: {
                candidates: [
                  [{ type: 'is_manual_target', params: { index: 1, not: false } }]
                ]
              },
              filter: { candidates: [] },
              execute: 'now'
            }
          }
        ]
      }
    }
  ],
  targets: {
    min: 2,
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
      ],
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
