import { defineSerializedBlueprint } from '../../card-blueprint';

export const f2MistWalking = defineSerializedBlueprint({
  id: 'f2_mist_walking',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: 'Teleport your general up to 2 spaces.',
      config: {
        actions: [
          {
            type: 'teleport_unit',
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
              cell: {
                candidates: [[{ type: 'is_manual_target', params: { index: 0 } }]],
                random: false
              },
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          }
        ],
        executionContext: 'immediate'
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
            type: 'within_cells',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              cell: {
                candidates: [
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
              }
            }
          }
        ]
      ]
    ]
  },
  cellHighlights: [],
  spriteId: 'icon_f2_mistwalking',
  name: 'Mist walking',
  cost: 1,
  faction: 'f2'
});
