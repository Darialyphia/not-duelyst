import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5UnstableLeviathan = defineSerializedBlueprint({
  id: 'f5_unstable_leviathan',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'epic',
  effects: [
    {
      text: 'At the start of your turn, deal 4 damage all units nearby this.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 4 } },
              targets: {
                candidates: [
                  [
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]],
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
              execute: 'now',
              filter: { candidates: [], random: false }
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
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: '@Essence(2)@: Deal 4 damage to a random unit.',
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
                    type: 'deal_damage',
                    params: {
                      amount: { type: 'fixed', params: { value: 4 } },
                      targets: { candidates: [[{ type: 'any_unit' }]], random: true },
                      execute: 'now',
                      filter: { candidates: [], random: false }
                    }
                  }
                ]
              },
              cost: 2,
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
  name: 'Unstable Leviathan',
  spriteId: 'f5_unstable_leviathan',
  cost: 7,
  attack: 11,
  maxHp: 11,
  faction: 'f5'
});
