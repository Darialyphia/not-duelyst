import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4HornOfTheForsaken = defineSerializedBlueprint({
  id: 'f4_horn_of_the_forsaken',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'ARTIFACT',
  rarity: 'common',
  effects: [
    {
      text: 'Whenever your general deals damage, summon a @Wraithling@ nearby your general.',
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
                executionContext: 'trigger_while_on_board',
                actions: [
                  {
                    type: 'summon_unit',
                    params: {
                      filter: { candidates: [], random: false },
                      execute: 'now',
                      blueprint: ['f4_wraithling'],
                      player: { candidates: [[{ type: 'ally_player' }]], random: false },
                      position: {
                        candidates: [
                          [
                            {
                              type: 'is_nearby',
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
                                cell: { candidates: [], random: false }
                              }
                            }
                          ]
                        ],
                        random: true
                      }
                    }
                  }
                ],
                triggers: [
                  {
                    type: 'on_after_unit_deal_damage',
                    params: {
                      target: { candidates: [], random: false },
                      unit: {
                        candidates: [
                          [
                            { type: 'is_general', params: { not: false } },
                            { type: 'is_ally', params: { not: false } }
                          ]
                        ],
                        random: false
                      },
                      frequency: { type: 'always' }
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
  spriteId: 'icon_f4_artifact_hornofforsaken',
  name: 'Horn of the Forsaken',
  faction: 'f4',
  cost: 1
});
