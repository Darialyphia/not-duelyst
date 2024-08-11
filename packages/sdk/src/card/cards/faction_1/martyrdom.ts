import { defineSerializedBlueprint } from '../../card-blueprint';
import { FACTION_IDS, RARITIES } from '../../card-enums';
import { manualTarget } from '../../helpers/targeting';

export const f1Martyrdom = defineSerializedBlueprint({
  id: 'martyrdom',
  collectable: true,
  name: 'Martyrdom',
  cost: 2,
  kind: 'SPELL',
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_martyrdom',
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
    {
      text: "Destroy a minion and heal its owner's General for the amount of Health that minion had.",
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'heal',
            params: {
              targets: {
                candidates: [
                  [{ type: 'is_manual_target_general', params: { index: 0, not: false } }]
                ],
                random: false
              },
              amount: {
                type: 'hp',
                params: {
                  unit: {
                    candidates: [
                      [{ type: 'is_manual_target', params: { index: 0, not: false } }]
                    ],
                    random: false
                  }
                }
              }
            }
          },
          {
            type: 'destroy_unit',
            params: {
              targets: manualTarget(0)
            }
          }
        ]
      }
    }
  ]
});
