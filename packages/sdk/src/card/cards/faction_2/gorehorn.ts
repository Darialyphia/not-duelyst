import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';

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
      text: '@Backstab@: 2.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'backstab',
            params: {
              filter: [],
              activeWhen: [],
              amount: fixedAmount(2),
              execute: 'now'
            }
          }
        ]
      }
    },
    {
      text: 'After this attacks, this gains +1/+1.',
      config: {
        executionContext: 'while_on_board',
        triggers: [
          {
            type: 'on_after_unit_attack',
            params: {
              target: [],
              unit: [[{ type: 'is_self' }]],
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
                amount: fixedAmount(1),
                activeWhen: []
              },
              hp: {
                amount: fixedAmount(1),
                activeWhen: []
              },
              targets: [[{ type: 'is_self' }]],
              filter: [],
              execute: 'now'
            }
          }
        ]
      }
    }
  ]
});
