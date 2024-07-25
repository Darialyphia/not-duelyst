import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';

export const f1Sunriser = defineSerializedBlueprint({
  id: 'sunriser',
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
        executionContext: 'while_on_board',
        triggers: [
          {
            type: 'on_after_unit_healed',
            params: { frequency: { type: 'always' }, unit: [[{ type: 'any_unit' }]] }
          }
        ],
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: fixedAmount(2),
              targets: [
                [
                  { type: 'is_enemy' },
                  { type: 'is_nearby', params: { unit: [[{ type: 'is_self' }]] } }
                ]
              ]
            }
          }
        ]
      }
    })
  ]
});
