import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralSaberspineTiger = defineSerializedBlueprint({
  id: 'neutral_saberspine_tiger',
  name: 'Saberspine Tiger',
  spriteId: 'neutral_saberspine_tiger',
  collectable: true,
  keywords: ['rush'],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 3,
  attack: 3,
  maxHp: 2,
  faction: null,
  effects: [
    {
      text: '@Rush@.',
      config: {
        executionContext: 'immediate',
        actions: [
          { type: 'rush', params: { execute: 'now', filter: { candidates: [] } } }
        ]
      }
    }
  ]
});
