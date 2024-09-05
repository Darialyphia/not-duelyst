import { defineSerializedBlueprint } from '../../card-blueprint';

export const neutralAstralCrusader = defineSerializedBlueprint({
  id: 'DcSs4Z',
  name: 'Astral Crusader',
  collectable: true,
  keywords: ['opening_gambit', 'essence'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'legendary',
  effects: [
    {
      text: '@Opening Gambit@ and at the start of your turn: Swap the position of both generals',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'swap_units',
            params: {
              unit1: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              },
              unit2: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_enemy', params: { not: false } }
                  ]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_player_turn_start',
            params: {
              player: {
                candidates: [[{ type: 'ally_player', params: {} }]],
                random: false
              },
              frequency: { type: 'always' }
            }
          },
          {
            type: 'on_unit_play',
            params: {
              unit: {
                candidates: [[{ type: 'is_self', params: { not: false } }]],
                random: false
              },
              frequency: { type: 'always' }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: '@Essence(3)@: Swap the position of both generals.',
      config: {
        executionContext: 'while_in_hand',
        actions: [
          {
            type: 'essence',
            params: {
              execute: 'now',
              filter: { candidates: [], random: false },
              effect: {
                executionContext: 'immediate',
                actions: [
                  {
                    type: 'swap_units',
                    params: {
                      unit1: {
                        candidates: [
                          [
                            { type: 'is_general', params: { not: false } },
                            { type: 'is_ally', params: { not: false } }
                          ]
                        ],
                        random: false
                      },
                      unit2: {
                        candidates: [
                          [
                            { type: 'is_general', params: { not: false } },
                            { type: 'is_enemy', params: { not: false } }
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
              cost: 3,
              targets: { min: 1, targets: [[[{ type: 'any_cell' }]]] }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'neutral_astralcrusader',
  cost: 7,
  attack: 6,
  maxHp: 12,
  faction: null
});
