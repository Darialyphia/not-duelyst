import { defineSerializedBlueprint } from '../../card-blueprint';
import { f5Egg } from './egg';

export const f5SilitharElder = defineSerializedBlueprint({
  id: 'f5_silithar_elder',
  collectable: true,
  keywords: ['rebirth'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'legendary',
  effects: [
    {
      text: '@Rebirth@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'rebirth',
            params: {
              filter: { candidates: [], random: false },
              activeWhen: { candidates: [], random: false },
              execute: 'now',
              duration: 'always'
            }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: 'At the end of your turn, summon an @Egg@ that hatches into a @Silithar Elder@ behind this.',
      config: {
        actions: [
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['f5_egg'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: {
                candidates: [
                  [
                    {
                      type: 'is_behind',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]],
                          random: false
                        }
                      }
                    }
                  ]
                ],
                random: false
              }
            }
          },
          {
            type: 'add_effect',
            params: {
              unit: {
                candidates: [
                  [
                    {
                      type: 'is_behind',
                      params: {
                        not: false,
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]],
                          random: false
                        }
                      }
                    },
                    {
                      type: 'has_blueprint',
                      params: {
                        blueprint: [f5Egg.id],
                        not: false
                      }
                    }
                  ]
                ],
                random: false
              },
              effect: {
                executionContext: 'trigger_while_on_board',
                triggers: [
                  {
                    type: 'on_player_turn_end',
                    params: {
                      player: { candidates: [[{ type: 'ally_player' }]] },
                      frequency: { type: 'once' }
                    }
                  }
                ],
                actions: [
                  {
                    type: 'transform_unit',
                    params: {
                      blueprint: ['f5_silithar_elder'],
                      unit: {
                        candidates: [[{ type: 'is_self', params: { not: false } }]]
                      }
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
        executionContext: 'trigger_while_on_board',
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
    }
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f5_silithar_elder',
  name: 'Silithar Elder',
  cost: 7,
  attack: 8,
  maxHp: 8,
  faction: 'f5'
});
