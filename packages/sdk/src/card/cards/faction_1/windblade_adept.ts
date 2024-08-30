import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { FACTION_IDS, RARITIES } from '../../card-enums';

export const f1WindbladeAdept = defineSerializedBlueprint({
  id: 'f1_windblade_adept',
  collectable: true,
  name: 'Windblade Adept',
  cost: 2,
  attack: 2,
  maxHp: 3,
  faction: FACTION_IDS.F1,
  keywords: [KEYWORDS.ZEAL.id],
  kind: 'MINION',
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  spriteId: 'f1_windblade_adept',
  tags: [],
  effects: [
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
                        candidates: [[{ type: 'is_self', params: { not: false } }]]
                      },
                      mode: 'give',
                      stackable: false,
                      attack: { amount: { type: 'fixed', params: { value: 2 } } }
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
