import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4DarkfireCrescendo = defineSerializedBlueprint({
  id: 'f4_darkfire_crescendo',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'legendary',
  effects: [
    {
      text: 'Give a minion "@Deathwatch@: This ains +2/+2".',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'add_effect',
            params: {
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ],
                random: false
              },
              effect: {
                executionContext: 'trigger_while_on_board',
                actions: [
                  {
                    type: 'change_stats',
                    params: {
                      mode: 'give',
                      stackable: true,
                      attack: {
                        amount: { type: 'fixed', params: { value: 2 } },
                        activeWhen: { candidates: [], random: false }
                      },
                      hp: {
                        amount: { type: 'fixed', params: { value: 2 } },
                        activeWhen: { candidates: [], random: false }
                      },
                      speed: {
                        amount: { type: 'fixed', params: { value: 0 } },
                        activeWhen: { candidates: [], random: false }
                      },
                      targets: {
                        candidates: [[{ type: 'is_self', params: { not: false } }]],
                        random: false
                      },
                      filter: { candidates: [], random: false },
                      duration: 'always',
                      execute: 'now'
                    }
                  }
                ],
                triggers: [
                  {
                    type: 'on_after_unit_destroyed',
                    params: {
                      unit: {
                        candidates: [[{ type: 'any_unit', params: {} }]],
                        random: false
                      },
                      frequency: { type: 'always' }
                    }
                  }
                ]
              },
              filter: { candidates: [], random: false },
              execute: 'now'
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
                candidates: [[{ type: 'is_minion', params: { not: false } }]],
                random: false
              }
            }
          }
        ]
      ]
    ]
  },
  cellHighlights: [],
  spriteId: 'icon_f4_deathfirecrescendo',
  name: 'Darkfire Crescendo',
  cost: 3,
  faction: 'f4'
});
