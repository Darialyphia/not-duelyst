import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralAethermaster = defineSerializedBlueprint({
  id: 'neutral_aethermaster',
  name: 'Aethermaster',
  spriteId: 'neutral_aethermaster',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 2,
  attack: 1,
  maxHp: 3,
  faction: null,
  effects: [
    defineCardEffect({
      text: 'You can replace an additional card each turn.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'change_replaces_count',
            params: {
              player: { candidates: [[{ type: 'ally_player' }]] },
              amount: { type: 'fixed', params: { value: 1 } },
              duration: 'always',
              stackable: true,
              filter: { candidates: [] },
              execute: 'now',
              mode: 'give'
            }
          }
        ]
      }
    })
  ]
});
