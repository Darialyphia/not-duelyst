import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4SpectralBlade = defineSerializedBlueprint({
  id: 'f4_pectral_blade',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'ARTIFACT',
  rarity: 'rare',
  effects: [
    {
      text: 'Your general has +1/+0;',
      config: {
        executionContext: 'while_equiped',
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
      text: 'Give your general "@Slay@: heal your general for 2."',
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
                    type: 'slay',
                    params: {
                      execute: 'now',
                      filter: { candidates: [], random: false },
                      duration: 'always',
                      activeWhen: { candidates: [], random: false },
                      effect: {
                        executionContext: 'immediate',
                        actions: [
                          {
                            type: 'heal',
                            params: {
                              amount: { type: 'fixed', params: { value: 2 } },
                              targets: {
                                candidates: [
                                  [
                                    { type: 'is_general', params: { not: false } },
                                    { type: 'is_ally', params: { not: false } }
                                  ]
                                ],
                                random: false
                              },
                              execute: 'now',
                              filter: { candidates: [], random: false }
                            }
                          }
                        ]
                      }
                    }
                  }
                ]
              },
              linkToCard: true,
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
  },
  cellHighlights: [],
  spriteId: 'icon_f4_artifact_spectralblade',
  name: 'Spectral Blade',
  cost: 2,
  faction: 'f4'
});
