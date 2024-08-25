import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5Earthwalker = defineSerializedBlueprint({
  id: 'f5_earthwalker',
  collectable: true,
  keywords: ['grow'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'common',
  effects: [
    {
      text: '@Grow@: +1/+1.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'grow',
            params: {
              attack: 1,
              hp: 1,
              execute: 'now',
              filter: { candidates: [], random: false }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f5_earth_walker',
  name: 'Earthwalker',
  cost: 2,
  attack: 2,
  maxHp: 2,
  faction: 'f5'
});
