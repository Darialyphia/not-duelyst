import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { FACTION_IDS, RARITIES } from '../../card-enums';
import { zealCondition } from '../../helpers/conditions';

export const f1WindbladeAdept = defineSerializedBlueprint({
  id: 'windblade_adept',
  collectable: true,
  name: 'Windblade Adept',
  cost: 2,
  attack: 2,
  maxHp: 3,
  faction: FACTION_IDS.F1,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  kind: 'MINION',
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  speed: 2,
  spriteId: 'f1_windblade_adept',
  tags: [],
  effects: [
    defineCardEffect({
      text: '@Zeal@: +2/+0.',
      config: {
        executionContext: 'while_on_board',
        triggers: [
          {
            type: 'on_unit_play',
            params: {
              unit: [[{ type: 'is_self' }]]
            }
          }
        ],
        actions: [
          {
            type: 'change_stats',
            params: {
              targets: [[{ type: 'is_self' }]],
              stackable: false,
              hp: { amount: { type: 'fixed', params: { value: 0 } } },
              attack: {
                amount: { type: 'fixed', params: { value: 2 } },
                activeWhen: zealCondition()
              }
            }
          }
        ]
      }
    })
  ]
});
