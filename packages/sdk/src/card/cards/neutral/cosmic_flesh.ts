import { defineSerializedBlueprint } from '../../card-blueprint';

export const f3CosmicFlesh = defineSerializedBlueprint({
  id: 'f3_cosmic_flesh',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: 'Give a minion +1/+3 and @Provoke@.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 0 } },
                activeWhen: { candidates: [], random: false }
              },
              hp: {
                amount: { type: 'fixed', params: { value: 3 } },
                activeWhen: { candidates: [], random: false }
              },
              targets: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              duration: 'always',
              execute: 'now'
            }
          },
          {
            type: 'add_effect',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ],
                random: false
              },
              effect: {
                executionContext: 'while_on_board',
                actions: [
                  {
                    type: 'provoke',
                    params: {
                      filter: { candidates: [], random: false },
                      activeWhen: { candidates: [], random: false },
                      execute: 'now'
                    }
                  }
                ]
              }
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
  spriteId: 'icon_f3_cosmic_flesh',
  name: 'Cosmic Flesh',
  cost: 2,
  faction: 'f3'
});
