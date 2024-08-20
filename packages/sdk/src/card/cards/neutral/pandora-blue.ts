import { defineSerializedBlueprint } from '../../card-blueprint';

export const neutralPandoraBlue = defineSerializedBlueprint({
  id: 'neutral_pandora_blue',
  spriteId: 'neutral_pandora_fly',
  name: 'Serenity',
  collectable: false,
  keywords: ['flying'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'token',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 2,
  attack: 3,
  maxHp: 3,
  faction: null,
  effects: [
    {
      text: '@Flying@',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'flying',
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
