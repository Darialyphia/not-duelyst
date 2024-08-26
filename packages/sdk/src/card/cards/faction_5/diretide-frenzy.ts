import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5DiretideFrenzy = defineSerializedBlueprint({
  id: 'f5_diretide_frenzy',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: 'Give a minion +1/+0 and @Frenzy@.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 1 } },
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
                    type: 'frenzy',
                    params: {
                      filter: { candidates: [], random: false },
                      execute: 'now',
                      activeWhen: { candidates: [], random: false },
                      duration: 'always'
                    }
                  }
                ]
              },
              linkToCard: false,
              execute: 'now',
              filter: { candidates: [], random: false }
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
  spriteId: 'icon_f5_diretidefrenzy',
  name: 'Diretide Frenzy',
  cost: 2,
  faction: 'f5'
});
