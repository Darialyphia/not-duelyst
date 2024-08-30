import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { FACTION_IDS, RARITIES } from '../../card-enums';
import { provokeEffect } from '../../helpers/provoke.effect';

export const f1SilverguardKnight = defineSerializedBlueprint({
  id: 'f1_silverguard_knight',
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
            type: 'zeal',
            params: {
              effect: {
                executionContext: 'immediate',
                actions: [
                  {
                    type: 'change_stats',
                    params: {
                      targets: {
                        candidates: [[{ type: 'is_self', params: { not: false } }]],
                        random: false
                      },
                      mode: 'give',
                      stackable: false,
                      attack: {
                        amount: { type: 'fixed', params: { value: 2 } }
                      }
                    }
                  }
                ]
              }
            }
          }
        ]
      }
    })
  ]
});
