import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5Grimrock = defineSerializedBlueprint({
  id: 'f5_grimrock',
  collectable: true,
  keywords: ['grow', 'adapt'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'common',
  effects: [
    {
      text: '@Grow@: +2/+2.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'grow',
            params: {
              attack: 2,
              hp: 2,
              execute: 'now',
              filter: { candidates: [], random: false }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: '@Adapt@: @Frenzy@ or +0/+2.',
      config: {
        executionContext: 'while_in_hand',
        actions: [
          {
            type: 'adapt',
            params: {
              choices: [
                {
                  text: '@Frenzy@',
                  effect: {
                    executionContext: 'while_on_board',
                    actions: [{ type: 'frenzy', params: {} }]
                  }
                },
                {
                  text: '+0/+2',
                  effect: {
                    executionContext: 'while_on_board',
                    actions: [
                      {
                        type: 'change_stats',
                        params: {
                          mode: 'give',
                          stackable: true,
                          targets: {
                            candidates: [[{ type: 'is_self', params: { not: false } }]]
                          },
                          hp: {
                            amount: { type: 'fixed', params: { value: 2 } }
                          }
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  name: 'Grimrock',
  cost: 4,
  attack: 2,
  maxHp: 4,
  spriteId: 'f5_grimrock',
  faction: 'f5'
});
