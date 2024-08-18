import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralFrostboneNaga = defineSerializedBlueprint({
  id: 'neutral_frostbone_naga',
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'neutral_frostbone_naga',
  name: 'Frostbone Naga',
  cost: 4,
  attack: 3,
  maxHp: 3,
  faction: null,
  effects: [
    {
      text: '@Opening Gambit@: deal 2 damage to nearby units.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              targets: {
                candidates: [
                  [
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]]
                        },
                        not: false
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
  ]
});
