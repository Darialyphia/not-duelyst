import { defineSerializedBlueprint } from '../../card-blueprint';

export const neutralSpellspark = defineSerializedBlueprint({
  id: 'neutral_spellspark',
  collectable: false,
  keywords: ['rush'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'token',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'neutral_spellspark',
  name: 'Spellspark',
  cost: 1,
  attack: 1,
  maxHp: 1,
  faction: null,
  effects: [
    {
      text: 'Your effect Text',
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
    }
  ]
});
