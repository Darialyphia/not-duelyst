import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5Overload = defineSerializedBlueprint({
  id: 'f5_overload',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'epic',
  effects: [
    {
      text: 'Give your general +1/+0.',
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
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              duration: 'always',
              execute: 'now'
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'icon_f5_boundedlifeforce',
  name: 'Overload',
  cost: 2,
  faction: 'f5'
});
