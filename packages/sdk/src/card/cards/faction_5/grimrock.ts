import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5Grimrock = defineSerializedBlueprint({
  id: 'f5_grimrock',
  collectable: true,
  keywords: ['grow'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'common',
  effects: [
    {
      text: '@Grow@: +2/+2.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'grow',
            params: {
              attack: 2,
              hp: 2,
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
  name: 'Grimrock',
  cost: 4,
  attack: 2,
  maxHp: 5,
  spriteId: 'f5_grimrock',
  faction: 'f5'
});
