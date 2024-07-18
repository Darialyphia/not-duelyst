import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';

export const f1Lightchaser = defineSerializedBlueprint({
  id: 'f1_lightchaser',
  collectable: true,
  name: 'Lightchaser',
  cost: 2,
  attack: 1,
  maxHp: 4,
  faction: FACTION_IDS.F1,
  keywords: [],
  kind: 'MINION',
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  speed: 2,
  spriteId: 'f1_lightchaser',
  tags: [],
  effects: [
    defineCardEffect({
      text: 'When a unit is healed, this gains +2/+0.',
      config: {
        executionContext: 'while_on_board',
        triggers: [
          { type: 'on_after_unit_healed', params: { unit: [[{ type: 'any_unit' }]] } }
        ],
        actions: [
          {
            type: 'change_stats',
            params: {
              targets: [[{ type: 'is_self' }]],
              mode: 'give',
              stackable: true,
              attack: {
                amount: fixedAmount(2)
              }
            }
          }
        ]
      }
    })
  ]
});
