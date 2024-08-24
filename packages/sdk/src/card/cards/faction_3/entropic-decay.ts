import { defineSerializedBlueprint } from '../../card-blueprint';

export const f3EntropicDecay = defineSerializedBlueprint({
  id: 'f3_entropic_decay',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: 'Destroy all minions on the same row as your general. ',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'destroy_unit',
            params: {
              targets: {
                candidates: [
                  [
                    {
                      type: 'is_same_row',
                      params: {
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
                          ],
                          random: false
                        },
                        not: false
                      }
                    },
                    { type: 'is_minion', params: { not: false } }
                  ]
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
  targets: { min: 1, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [],
  spriteId: 'icon_f3_entropic_decay',
  name: 'Entropic Decay',
  cost: 3,
  faction: 'f3'
});
