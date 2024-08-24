import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4NightsorrowAssassin = defineSerializedBlueprint({
  id: 'f4_nightsorrow-assassin',
  collectable: true,
  keywords: ['fearsome', 'rush'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'common',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f4_nightsorrow_assassin',
  name: 'Nightsorrow Assassin',
  cost: 3,
  attack: 3,
  maxHp: 1,
  faction: 'f4',
  effects: [
    {
      text: '@Rush@.',
      config: {
        actions: [
          {
            type: 'rush',
            params: { execute: 'now', filter: { candidates: [], random: false } }
          }
        ],
        executionContext: 'while_on_board'
      },
      vfx: { tracks: [] }
    },
    {
      text: '@Fearsome@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'fearsome',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              activeWhen: { candidates: [], random: false }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ]
});
