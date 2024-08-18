import { defineSerializedBlueprint } from '../../card-blueprint';

export const f3FountainOfYouth = defineSerializedBlueprint({
  id: 'f3_fountain_of_youth',
  collectable: true,
  keywords: ['cleanse'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'epic',
  effects: [
    {
      text: 'Fully heal and @Cleanse@ a unit.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'cleanse_entity',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ],
                random: false
              }
            }
          },
          {
            type: 'heal',
            params: {
              amount: {
                type: 'hp',
                params: {
                  unit: {
                    candidates: [
                      [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                    ],
                    random: false
                  }
                }
              },
              targets: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
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
  cellHighlights: [],
  name: 'Fountain of Youth',
  cost: 1,
  spriteId: 'icon_f3_fountain_of_youth',
  faction: 'f3'
});
