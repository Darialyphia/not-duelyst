import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { zealCondition } from '../../helpers/conditions';

export const f1SecondSun = defineSerializedBlueprint({
  id: 'second_sun',
  collectable: true,
  name: 'Second Sun',
  cost: 5,
  attack: 0,
  maxHp: 8,
  faction: FACTION_IDS.F1,
  keywords: [KEYWORDS.ZEAL.id],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  speed: 2,
  spriteId: 'f1_second_sun',
  tags: [],
  effects: [
    defineCardEffect({
      text: '@Zeal@: +8/+0.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              targets: [[{ type: 'is_self' }]],
              mode: 'give',
              stackable: false,
              attack: {
                amount: fixedAmount(8),
                activeWhen: zealCondition()
              }
            }
          }
        ]
      }
    })
  ]
});
