import { defineSerializedBlueprint } from '../../card-blueprint';

export const f3SandHowler = defineSerializedBlueprint({
  id: 'f3_sand_howler',
  collectable: true,
  keywords: ['opening_gambit'],
  relatedBlueprintIds: [],
  tags: ['dervish'],
  kind: 'MINION',
  rarity: 'epic',
  cellHighlights: [],
  spriteId: 'f3_sandhowler',
  name: 'Sand Howler',
  cost: 4,
  attack: 4,
  maxHp: 4,
  faction: 'f3',
  effects: [
    {
      text: '@Opening Gambit@: Give a nearby minion -4 / -0 until your next turn.',
      config: {
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: -4 } },
                activeWhen: { candidates: [] }
              },
              targets: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ]
              },
              filter: { candidates: [] },
              duration: 'start_of_next_turn',
              execute: 'now'
            }
          }
        ],
        executionContext: 'immediate'
      }
    }
  ],
  targets: {
    min: 0,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: {
                candidates: [
                  [
                    { type: 'is_minion', params: { not: false } },
                    {
                      type: 'is_nearby',
                      params: {
                        cell: { candidates: [[{ type: 'summon_target' }]] },
                        not: false
                      }
                    }
                  ]
                ]
              }
            }
          }
        ]
      ]
    ]
  }
});
