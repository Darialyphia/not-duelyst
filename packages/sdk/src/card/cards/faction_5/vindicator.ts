import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5Vindicator = defineSerializedBlueprint({
  id: 'f5_vindicator',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'legendary',
  effects: [
    {
      text: 'The next unit you summon has @Rush@.',
      config: {
        actions: [
          {
            type: 'add_effect',
            params: {
              unit: {
                candidates: [[{ type: 'played_unit', params: { not: false } }]],
                random: false
              },
              effect: {
                executionContext: 'while_on_board',
                actions: [
                  {
                    type: 'rush',
                    params: { execute: 'now', filter: { candidates: [], random: false } }
                  }
                ]
              },
              linkToCard: false,
              execute: 'now',
              filter: { candidates: [], random: false }
            }
          }
        ],
        executionContext: 'trigger_while_on_board',
        triggers: [
          {
            type: 'on_unit_play',
            params: {
              unit: {
                candidates: [
                  [
                    { type: 'is_self', params: { not: true } },
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]],
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
              frequency: { type: 'once', params: { count: 1 } }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f5_vindicator',
  name: 'Vindicator',
  cost: 3,
  attack: 2,
  maxHp: 4,
  faction: 'f5'
});
