import { defineSerializedBlueprint } from '../../card-blueprint';

export const f2Panddo = defineSerializedBlueprint({
  id: 'f2_panddo',
  collectable: false,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'token',
  effects: [
    {
      text: 'This cannot be attacked.',
      config: {
        actions: [
          {
            type: 'change_can_be_attacked',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              activeWhen: { candidates: [], random: false },
              unit: {
                candidates: [[{ type: 'is_self', params: { not: false } }]],
                random: false
              },
              target: { candidates: [[{ type: 'any_unit' }]], random: false },
              duration: 'always'
            }
          }
        ],
        executionContext: 'while_on_board'
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f2_panddo',
  name: 'Panddo',
  cost: 0,
  attack: 0,
  maxHp: 2,
  faction: 'f2'
});
