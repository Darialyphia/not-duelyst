import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4BlackSolus = defineSerializedBlueprint({
  id: 'f4_black_solus',
  collectable: true,
  keywords: ['opening_gambit', 'essence'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'rare',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f4_blacksolus',
  name: 'Black Solus',
  cost: 4,
  attack: 4,
  maxHp: 4,
  faction: 'f4',
  effects: [
    {
      text: '@Opening Gambit@: Put 2 @Wraithling@ in your action bar',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'generate_card',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              ephemeral: false,
              location: 'hand',
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              blueprint: ['f4_wraithling']
            }
          },
          {
            type: 'generate_card',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              ephemeral: false,
              location: 'hand',
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              blueprint: ['f4_wraithling']
            }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: '@Essence(1)@: Give your @Wraithling@s @Fearsome@ until the end of the turn.',
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
                    type: 'add_effect',
                    params: {
                      filter: { candidates: [], random: false },
                      execute: 'now',
                      activeWhen: { candidates: [], random: false },
                      unit: {
                        candidates: [
                          [
                            { type: 'is_ally', params: { not: false } },
                            {
                              type: 'has_blueprint',
                              params: { blueprint: ['f4_wraithling'], not: false }
                            }
                          ]
                        ],
                        random: false
                      },
                      effect: {
                        executionContext: 'while_on_board',
                        actions: [
                          {
                            type: 'fearsome',
                            params: {
                              filter: { candidates: [], random: false },
                              execute: 'now',
                              duration: 'end_of_turn',
                              activeWhen: { candidates: [], random: false }
                            }
                          }
                        ]
                      }
                    }
                  }
                ]
              },
              cost: 1,
              targets: { min: 1, targets: [[[{ type: 'any_cell' }]]] }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ]
});
