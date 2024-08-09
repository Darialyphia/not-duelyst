import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralPrimusFist = defineSerializedBlueprint({
  id: 'neutrla_primus_fist',
  name: 'Primus Fist',
  spriteId: 'neutral_primus_fist',
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 2,
  attack: 2,
  maxHp: 3,
  faction: null,
  effects: [
    defineCardEffect({
      text: '@Opening Gambit@: Give nearby allied minions +1/+0.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: { amount: { type: 'fixed', params: { value: 1 } }, activeWhen: [] },
              targets: [
                [
                  {
                    type: 'is_nearby',
                    params: {
                      unit: [[{ type: 'is_self', params: { not: false } }]],
                      cell: [],
                      not: false
                    }
                  },
                  { type: 'is_ally', params: { not: false } },
                  { type: 'is_minion', params: { not: false } }
                ]
              ],
              filter: [],
              duration: 'always',
              execute: 'now'
            }
          }
        ]
      }
    })
  ]
});
