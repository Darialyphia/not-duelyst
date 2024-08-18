import { defineSerializedBlueprint } from '../../card-blueprint';

export const f3InnerOasis = defineSerializedBlueprint({
  id: 'f3_inner_oasis',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'rare',
  effects: [
    {
      text: 'Give allied minions +0/+3. Draw a card.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              hp: {
                amount: { type: 'fixed', params: { value: 3 } },
                activeWhen: { candidates: [], random: false }
              },
              targets: {
                candidates: [
                  [
                    { type: 'is_minion', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              duration: 'always',
              execute: 'now'
            }
          },
          {
            type: 'draw_cards',
            params: {
              amount: { type: 'fixed', params: { value: 1 } },
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 1, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [],
  spriteId: 'icon_f3_inner_oasis',
  name: 'Inner Oasis',
  cost: 3,
  faction: 'f3'
});
