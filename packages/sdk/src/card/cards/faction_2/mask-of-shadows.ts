import { defineSerializedBlueprint } from '../../card-blueprint';

export const f2MaskOfShadows = defineSerializedBlueprint({
  id: 'f2_mask_of_shadows',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'ARTIFACT',
  rarity: 'legendary',
  effects: [
    {
      text: 'Your general has +1/+0 and @Backstab@: 4.',
      config: {
        executionContext: 'while_equiped',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 1 } },
                activeWhen: { candidates: [], random: false }
              },
              hp: {
                amount: { type: 'fixed', params: { value: 0 } },
                activeWhen: { candidates: [], random: false }
              },
              speed: {
                amount: { type: 'fixed', params: { value: 0 } },
                activeWhen: { candidates: [], random: false }
              },
              targets: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              duration: 'always',
              execute: 'now'
            }
          },
          {
            type: 'add_effect',
            params: {
              linkToCard: true,
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
                    type: 'backstab',
                    params: {
                      filter: { candidates: [], random: false },
                      activeWhen: { candidates: [], random: false },
                      amount: { type: 'fixed', params: { value: 4 } },
                      execute: 'now',
                      duration: 'always'
                    }
                  }
                ]
              },
              filter: { candidates: [], random: false },
              execute: 'now'
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
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              }
            }
          }
        ]
      ]
    ]
  },
  cellHighlights: [],
  spriteId: 'icon_f2_artifact_maskofshadows',
  name: 'Mask of Shadows',
  cost: 2,
  faction: 'f2'
});
