import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralSyvrelTheExile = defineSerializedBlueprint({
  id: 'neutral_syvrel_the_exile',
  name: 'Syvrel the Exile',
  spriteId: 'neutral_syvrel_the_exile',
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id, KEYWORDS.RANGED.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  cellHighlights: [],
  cost: 3,
  attack: 1,
  maxHp: 4,
  faction: null,
  effects: [
    defineCardEffect({
      text: '@Ranged@.',
      config: {
        executionContext: 'while_on_board',
        actions: [{ type: 'ranged', params: {} }]
      }
    }),
    {
      text: '@Opening Gambit@: Teleport an enemy minion to the space in front of this.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'teleport_unit',
            params: {
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ]
              },
              cell: {
                candidates: [
                  [
                    {
                      type: 'is_in_front',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]]
                        }
                      }
                    }
                  ]
                ]
              },
              filter: { candidates: [[{ type: 'played_from_hand', params: {} }]] },
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
              unit: {
                candidates: [
                  [
                    { type: 'is_enemy', params: { not: false } },
                    { type: 'is_minion', params: { not: false } }
                  ]
                ]
              }
            }
          }
        ]
      ]
    ]
  }
});
