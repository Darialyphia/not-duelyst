import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';

export const f5FlashReincranation = defineSerializedBlueprint({
  id: 'f5_flash_reincarnation',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'rare',
  effects: [
    defineCardEffect({
      text: 'The next minion you play costs 2 less. Destroy it at the end of your next turn.',
      config: {
        actions: [
          {
            type: 'change_card_cost',
            params: {
              filter: { candidates: [], random: false },
              activeWhen: { candidates: [], random: false },
              execute: 'now',
              amount: { type: 'fixed', params: { value: -2 } },
              card: { candidates: [[{ type: 'minion' }]], random: false },
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              occurences_count: 1,
              duration: 'always'
            }
          },
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
                    type: 'add_effect',
                    params: {
                      unit: {
                        candidates: [[{ type: 'played_unit', params: { not: false } }]],
                        random: false
                      },
                      effect: {
                        executionContext: 'immediate',
                        actions: [
                          {
                            type: 'destroy_unit',
                            params: {
                              filter: { candidates: [], random: false },
                              execute: 'end_of_turn',
                              targets: {
                                candidates: [
                                  [{ type: 'is_self', params: { not: false } }]
                                ]
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
                triggers: [
                  {
                    type: 'on_unit_play',
                    params: {
                      unit: {
                        candidates: [[{ type: 'is_ally', params: { not: false } }]],
                        random: false
                      },
                      frequency: { type: 'once' }
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
        executionContext: 'immediate'
      },
      vfx: { tracks: [] }
    })
  ],
  targets: { min: 0, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [],
  spriteId: 'icon_f5_flashreincarnation',
  name: 'Flash Reincranation',
  cost: 0,
  faction: 'f5'
});
