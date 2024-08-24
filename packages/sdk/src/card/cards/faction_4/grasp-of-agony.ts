import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4GraspOfAgony = defineSerializedBlueprint({
  id: 'f4_grasp_of_agony',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'rare',
  effects: [
    {
      text: 'Give a minion @Dying Wish@: Deal 3 damage to nearby allies.',
      config: {
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
                    type: 'deal_damage',
                    params: {
                      amount: { type: 'fixed', params: { value: 3 } },
                      targets: {
                        candidates: [
                          [
                            { type: 'is_ally', params: { not: false } },
                            {
                              type: 'is_nearby',
                              params: {
                                unit: {
                                  candidates: [
                                    [{ type: 'is_self', params: { not: false } }]
                                  ],
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
                      filter: { candidates: [], random: false },
                      execute: 'now'
                    }
                  }
                ],
                triggers: [
                  {
                    type: 'on_before_unit_destroyed',
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
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          }
        ],
        executionContext: 'immediate'
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
  spriteId: 'icon_f4_curseofagony',
  name: 'Grasp of Agony',
  cost: 1,
  faction: 'f4'
});
