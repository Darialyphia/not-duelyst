import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';

export const neutralPandora = defineSerializedBlueprint({
  id: 'neutral_pandora',
  spriteId: 'neutral_pandora',
  name: 'Pandora',
  collectable: true,
  keywords: ['essence'],
  tags: [],
  kind: 'MINION',
  rarity: 'legendary',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  relatedBlueprintIds: [
    'neutral_pandora_blue',
    'neutral_pandora_green',
    'neutral_pandora_red',
    'neutral_pandora_yellow',
    'neutral_pandora_purple'
  ],
  cost: 7,
  attack: 3,
  maxHp: 10,
  faction: null,
  effects: [
    {
      text: 'At the end of your turn, summon @Envy@, @Serenity@, @Fear@, @Rage@or @Wrath@ at random on a random nearby space.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: [
                'neutral_pandora_purple',
                'neutral_pandora_green',
                'neutral_pandora_red',
                'neutral_pandora_yellow',
                'neutral_pandora_blue'
              ],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: {
                candidates: [
                  [
                    { type: 'is_empty' },
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]],
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
            type: 'on_player_turn_end',
            params: {
              player: {
                candidates: [[{ type: 'ally_player', params: {} }]],
                random: false
              },
              frequency: { type: 'always' }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    defineCardEffect({
      text: '@Essence(3)@:  Summon one of those at random nearby your general. ',
      config: {
        executionContext: 'while_in_hand',
        actions: [
          {
            type: 'essence',
            params: {
              execute: 'now',
              filter: { candidates: [], random: false },
              targets: {
                min: 1,
                targets: [
                  [
                    [
                      { type: 'is_empty' },
                      {
                        type: 'is_nearby',
                        params: {
                          unit: {
                            candidates: [
                              [
                                { type: 'is_ally', params: { not: false } },
                                { type: 'is_general', params: { not: false } }
                              ]
                            ]
                          }
                        }
                      }
                    ]
                  ]
                ]
              },
              effect: {
                executionContext: 'immediate',
                actions: [
                  {
                    type: 'summon_unit',
                    params: {
                      filter: { candidates: [], random: false },
                      execute: 'now',
                      blueprint: [
                        'neutral_pandora_green',
                        'neutral_pandora_yellow',
                        'neutral_pandora_blue',
                        'neutral_pandora_purple',
                        'neutral_pandora_red'
                      ],
                      player: { candidates: [[{ type: 'ally_player' }]], random: false },
                      position: {
                        candidates: [
                          [{ type: 'is_manual_target', params: { index: 0 } }]
                        ],
                        random: false
                      }
                    }
                  }
                ]
              },
              cost: 3
            }
          }
        ]
      },
      vfx: { tracks: [] }
    })
  ]
});
