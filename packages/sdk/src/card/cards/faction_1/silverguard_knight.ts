import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { zealCondition } from '../../helpers/conditions';
import { provokeEffect } from '../../helpers/provoke.effect';

export const f1SilverguardKnight = defineSerializedBlueprint({
  id: 'silverguard_knight',
  collectable: true,
  name: 'Silverguard Knight',
  cost: 3,
  attack: 1,
  maxHp: 5,
  faction: FACTION_IDS.F1,
  keywords: [KEYWORDS.ZEAL.id, KEYWORDS.PROVOKE.id],
  kind: 'MINION',
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  speed: 2,
  spriteId: 'f1_silverguard_knight',
  tags: [],
  effects: [
    provokeEffect(),
    defineCardEffect({
      text: '@Zeal@: +2/+0.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              targets: [[{ type: 'is_self' }]],
              stackable: false,
              hp: { amount: fixedAmount(0) },
              attack: {
                amount: fixedAmount(2),
                activeWhen: zealCondition()
              }
            }
          }
        ]
      }
    })
  ]
});
