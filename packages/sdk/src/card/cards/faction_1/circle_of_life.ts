import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { allyGeneral, manualTarget } from '../../helpers/targeting';

export const f1CircleOfLife = defineSerializedBlueprint({
  id: 'f1_circle_of_life',
  collectable: true,
  name: 'Circle Of Life',
  cost: 5,
  kind: CARD_KINDS.SPELL,
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.LEGENDARY,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_circle_of_life',
  tags: [],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: {
                candidates: [[{ type: 'is_minion', params: { not: false } }]],
                random: false
              }
            }
          }
        ]
      ]
    ]
  },
  effects: [
    defineCardEffect({
      text: 'Deal 5 damage to a minion and heal your general for 5.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              targets: manualTarget(0),
              amount: { type: 'fixed', params: { value: 5 } }
            }
          },
          {
            type: 'heal',
            params: {
              amount: { type: 'fixed', params: { value: 5 } },
              targets: allyGeneral()
            }
          }
        ]
      }
    })
  ]
});
