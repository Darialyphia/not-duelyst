import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5Elucidator = defineSerializedBlueprint({
  id: 'f5_elucidator',
  collectable: true,
  keywords: ['opening_gambit', 'rush'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'rare',
  effects: [
    {
      text: '@Rush@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'rush',
            params: { execute: 'now', filter: { candidates: [], random: false } }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: '@Opening Gambit@: Deal 4 damage to your general.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 4 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              },
              execute: 'now',
              filter: {
                candidates: [[{ type: 'played_from_hand', params: {} }]],
                random: false
              }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f5_elucidator',
  name: 'Elucidator',
  cost: 4,
  attack: 4,
  maxHp: 4,
  faction: 'f5'
});
