import { defineSerializedBlueprint } from '../../card-blueprint';

export const f2OnyxBearSeal = defineSerializedBlueprint({
  id: 'f2_onyx_bear_seal',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'epic',
  effects: [
    {
      text: 'Transform a minion into a @Panddo@.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'transform_unit',
            params: {
              blueprint: ['f2_panddo'],
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ]
              },
              execute: 'now',
              filter: { candidates: [], random: false }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: 'If you control less minions than your opponent, reduce the cost of this card by 1.',
      config: {
        executionContext: 'while_in_hand',
        actions: [
          {
            type: 'change_card_cost',
            params: {
              filter: { candidates: [], random: false },
              activeWhen: {
                candidates: [
                  [
                    {
                      type: 'player_has_more_minions',
                      params: { player: { candidates: [[{ type: 'enemy_player' }]] } }
                    }
                  ]
                ],
                random: false
              },
              execute: 'now',
              amount: { type: 'fixed', params: { value: -1 } },
              card: { candidates: [[{ type: 'self' }]], random: false },
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              occurences_count: 0,
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
  spriteId: 'icon_f2_onyxbearseal',
  name: 'Onyx Bear Seal',
  cost: 3,
  faction: 'f2'
});
