import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { allyGeneral } from '../../helpers/targeting';

export const f1Magnetize = defineSerializedBlueprint({
  id: 'f1_magnetize',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  name: 'Magnetize',
  spriteId: 'icon_f1_magnetize',
  cost: 1,
  faction: FACTION_IDS.F1,
  effects: [
    {
      text: 'Teleport a minion in front of your general.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'teleport_unit',
            params: {
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { index: 0, not: false } }]
                ],
                random: false
              },
              cell: {
                candidates: [
                  [
                    {
                      type: 'is_in_front',
                      params: { unit: allyGeneral() }
                    }
                  ]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
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
            params: {
              unit: {
                candidates: [[{ type: 'is_minion', params: { not: false } }]],
                random: false
              }
            }
          }
        ]
      ]
    ]
  }
});
