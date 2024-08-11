import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralMiniJax = defineSerializedBlueprint({
  id: 'neutral_mini_jax',
  spriteId: 'neutral_minijax',
  name: 'Mini-jax',
  collectable: false,
  keywords: [KEYWORDS.RANGED.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 1,
  attack: 1,
  maxHp: 1,
  faction: null,
  effects: [
    {
      text: '@Ranged@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          { type: 'ranged', params: { filter: [], activeWhen: [], execute: 'now' } }
        ]
      }
    }
  ]
});
