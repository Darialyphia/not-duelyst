import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5Kolossus = defineSerializedBlueprint({
  id: 'f5_kolossus',
  collectable: true,
  keywords: ['grow'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'rare',
  effects: [
    {
      text: '@Grow@: +4/+4.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'grow',
            params: {
              attack: 4,
              hp: 4,
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
  spriteId: 'f5_kolossus',
  name: 'Kolossus',
  cost: 5,
  attack: 2,
  maxHp: 7,
  faction: 'f5'
});
