import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2Gorehorn = defineSerializedBlueprint({
  id: 'f2_gorehorn',
  name: 'Gorehorn',
  collectable: true,
  keywords: [KEYWORDS.BACKSTAB.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  spriteId: 'f2_gorehorn',
  cost: 3,
  attack: 3,
  maxHp: 3,
  faction: FACTION_IDS.F2,
  effects: [
    {
      text: '@Backstab@: 1.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'backstab',
            params: {
              filter: { candidates: [] },
              activeWhen: { candidates: [] },
              amount: { type: 'fixed', params: { value: 1 } },
              execute: 'now'
            }
          }
        ]
      }
    },
    defineCardEffect({
      text: 'After this attacks, this gains +1/+1.',
      config: {
        executionContext: 'trigger_while_on_board',
        triggers: [
          {
            type: 'on_after_unit_attack',
            params: {
              target: { candidates: [] },
              unit: { candidates: [[{ type: 'is_self', params: { not: false } }]] },
              frequency: {
                type: 'always'
              }
            }
          }
        ],
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 1 } },
                activeWhen: { candidates: [] }
              },
              hp: {
                amount: { type: 'fixed', params: { value: 1 } },
                activeWhen: { candidates: [] }
              },
              targets: { candidates: [[{ type: 'is_self', params: { not: false } }]] },
              filter: { candidates: [] },
              execute: 'now'
            }
          }
        ]
      }
    })
  ]
});
