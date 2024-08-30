import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f1Sunriser = defineSerializedBlueprint({
  id: 'f1_sunriser',
  collectable: true,
  name: 'Sunriser',
  cost: 4,
  attack: 3,
  maxHp: 4,
  faction: FACTION_IDS.F1,
  keywords: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  relatedBlueprintIds: [],
  spriteId: 'f1_sunriser',
  tags: [],
  effects: [
    defineCardEffect({
      text: 'After a unit is healed, deal 2 damage to nearby enemies.',
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
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_enemy', params: { not: false } },
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]]
                        },
                        not: false
                      }
                    }
                  ]
                ]
              }
            }
          }
        ]
      }
    })
  ]
});
