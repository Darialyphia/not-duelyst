import { defineSerializedBlueprint } from '../../card-blueprint';

export const f1SkywindGlaives = defineSerializedBlueprint({
  id: 'f1_skywind_glaives',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'ARTIFACT',
  rarity: 'rare',
  effects: [
    {
      text: 'Your general has +1/+0.',
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
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              duration: 'always',
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
    },
    {
      text: 'Allied minions nearby your general have +2/+0.',
      config: {
        executionContext: 'while_equiped',
        actions: [
          {
            type: 'aura',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              isElligible: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_minion', params: { not: false } },
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [
                            [
                              { type: 'is_ally', params: { not: false } },
                              { type: 'is_general', params: { not: false } }
                            ]
                          ],
                          random: false
                        },
                        cell: { candidates: [], random: false },
                        not: false
                      }
                    }
                  ]
                ],
                random: false
              },
              effect: {
                executionContext: 'while_on_board',
                actions: [
                  {
                    type: 'change_stats',
                    params: {
                      mode: 'give',
                      stackable: true,
                      attack: {
                        amount: { type: 'fixed', params: { value: 2 } },
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
                        candidates: [[{ type: 'is_self', params: { not: false } }]],
                        random: false
                      },
                      filter: { candidates: [], random: false },
                      duration: 'always',
                      execute: 'now'
                    }
                  }
                ]
              },
              activeWhen: { candidates: [], random: false }
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
  },
  cellHighlights: [],
  spriteId: 'icon_f1_artifact_skywindglaives',
  name: 'Skywind Glaives',
  cost: 3,
  faction: 'f1'
});
