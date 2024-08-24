import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4DarkfireSacrifice = defineSerializedBlueprint({
  id: 'f4_darkfire_sacrifice',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'rare',
  effects: [
    {
      text: 'Destroy an allied minion. The next minion you play costs 2 less.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'destroy_unit',
            params: {
              targets: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          },
          {
            type: 'change_card_cost',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              amount: { type: 'fixed', params: { value: -2 } },
              card: { candidates: [[{ type: 'minion' }]], random: false },
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              occurences_count: 1,
              duration: 'always'
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
                candidates: [
                  [
                    { type: 'is_minion', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              }
            }
          }
        ]
      ]
    ]
  },
  cellHighlights: [],
  spriteId: 'icon_f4_darkfire_sacrifice',
  name: 'Darkfire Sacrifice',
  cost: 0,
  faction: 'f4'
});
