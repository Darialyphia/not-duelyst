import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralDancingBlades = defineSerializedBlueprint({
  id: 'neutral_dancing_blades',
  spriteId: 'neutral_dancing_blades',
  name: 'Dancing Blades',
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 5,
  attack: 4,
  maxHp: 6,
  faction: null,
  effects: [
    {
      text: '@Opening Gambit@: deal 3 damage to the minion in front of this. ',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 3 } },
              targets: {
                candidates: [
                  [
                    {
                      type: 'is_in_front',
                      params: {
                        not: false,
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]]
                        }
                      }
                    },
                    { type: 'is_minion', params: { not: false } }
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
  ]
});
