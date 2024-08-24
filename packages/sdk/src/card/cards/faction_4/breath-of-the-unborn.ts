import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4BreathOfTheUnborn = defineSerializedBlueprint({
  id: 'f4_breath_of_the_unborn',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'epic',
  effects: [
    {
      text: 'Deal 4 damage to all minions. Heal your general for 1 for each minion destroyed.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              targets: {
                candidates: [[{ type: 'is_minion', params: { not: false } }]],
                random: false
              },
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          },
          {
            type: 'heal',
            params: {
              amount: { type: 'destroyed_units', params: {} },
              targets: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
                ],
                random: false
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
  targets: { min: 0, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [],
  name: 'Breath of the Unborn',
  cost: 6,
  faction: 'f4',
  spriteId: 'icon_f4_breathoftheunborn'
});
