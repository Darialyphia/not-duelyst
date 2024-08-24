import { defineSerializedBlueprint } from '../../card-blueprint';

export const neutralPaddo = defineSerializedBlueprint({
  id: 'neutral_paddo',
  collectable: true,
  keywords: ['essence'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'legendary',
  effects: [
    {
      text: 'Your general has +3/+0.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 3 } },
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
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: '@Essence(2)@: Your general has +3/+0 until the start of your next trn',
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
                    type: 'change_stats',
                    params: {
                      mode: 'give',
                      stackable: true,
                      attack: {
                        amount: { type: 'fixed', params: { value: 3 } },
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
                      duration: 'start_of_next_turn',
                      execute: 'now'
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
  spriteId: 'neutral_paddo',
  name: 'Paddo',
  cost: 7,
  attack: 8,
  maxHp: 8,
  faction: null
});
