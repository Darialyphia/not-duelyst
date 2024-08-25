import { defineSerializedBlueprint } from '../../card-blueprint';

export const f2CycloneMask = defineSerializedBlueprint({
  id: 'f2_cyclone_mask',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'ARTIFACT',
  rarity: 'rare',
  cellHighlights: [],
  spriteId: 'icon_f2_artifact_blood_rage_mask',
  name: 'Cyclone Mask',
  cost: 3,
  faction: 'f2',
  effects: [
    {
      text: 'Your general has ranged.',
      config: {
        executionContext: 'while_equiped',
        actions: [
          {
            type: 'add_effect',
            params: {
              unit: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              },
              effect: {
                executionContext: 'while_on_board',
                actions: [
                  {
                    type: 'ranged',
                    params: {
                      filter: { candidates: [], random: false },
                      activeWhen: { candidates: [], random: false },
                      execute: 'now',
                      duration: 'always'
                    }
                  }
                ]
              },
              linkToCard: false,
              execute: 'now',
              filter: { candidates: [], random: false }
            }
          }
        ],
        triggers: [
          {
            type: 'on_artifact_equiped',
            params: {
              card: { candidates: [[{ type: 'self', params: {} }]], random: false },
              frequency: { type: 'always' }
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
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
                ],
                random: false
              }
            }
          }
        ]
      ]
    ]
  }
});
