import { defineSerializedBlueprint } from '../../card-blueprint';

export const neutralGhostLynx = defineSerializedBlueprint({
  id: 'neutral_ghost_lynx',
  spriteId: 'neutral_ghost_lynx',
  name: 'Ghost Lynx',
  collectable: true,
  keywords: ['opening_gambit'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'common',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 2,
  attack: 1,
  maxHp: 3,
  faction: null,
  effects: [
    {
      text: '@Opening Gambit@: Draw a card at the end of your turn.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'draw_cards',
            params: {
              amount: { type: 'fixed', params: { value: 1 } },
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              filter: { candidates: [], random: false },
              execute: 'end_of_turn'
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ]
});
