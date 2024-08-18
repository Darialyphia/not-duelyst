import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { manualTarget } from '../../helpers/targeting';

export const f2InnerFocus = defineSerializedBlueprint({
  id: 'f2_inner_focus',
  collectable: true,
  name: 'Inner Focus',
  cost: 1,
  kind: CARD_KINDS.SPELL,
  faction: FACTION_IDS.F2,
  keywords: [],
  rarity: RARITIES.RARE,
  relatedBlueprintIds: [],
  spriteId: 'icon_f2_inner_focus',
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
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_minion', params: { not: false } },
                    {
                      type: 'has_attack',
                      params: {
                        not: false,
                        operator: 'less_than',
                        amount: { type: 'fixed', params: { value: 4 } }
                      }
                    }
                  ]
                ]
              }
            }
          }
        ]
      ]
    ]
  },
  effects: [
    {
      text: 'Activate an allied minion with 3 or less Attack.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'activate_unit',
            params: {
              targets: manualTarget(0)
            }
          }
        ]
      }
    }
  ]
});
