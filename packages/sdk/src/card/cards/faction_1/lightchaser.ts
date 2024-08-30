import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { FACTION_IDS, RARITIES } from '../../card-enums';

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
  spriteId: 'f1_lightchaser',
  tags: [],
  effects: [
    defineCardEffect({
      text: 'When a unit is healed, this gains +2/+0.',
      config: {
        executionContext: 'trigger_while_on_board',
        triggers: [
          {
            type: 'on_after_unit_healed',
            params: {
              frequency: { type: 'always' },
              unit: { candidates: [[{ type: 'any_unit' }]], random: false }
            }
          }
        ],
        actions: [
          {
            type: 'change_stats',
            params: {
              targets: {
                candidates: [[{ type: 'is_self', params: { not: false } }]],
                random: false
              },
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 2 } }
              }
            }
          }
        ]
      }
    })
  ]
});
