import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralValeHunter = defineSerializedBlueprint({
  id: 'neutral_vale_hunter',
  collectable: true,
  keywords: [KEYWORDS.RANGED.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'neutral_vale_hunter',
  name: 'Vale Hunter',
  cost: 2,
  attack: 1,
  maxHp: 2,
  faction: null,
  effects: [
    {
      text: '@Ranged@.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'ranged',
            params: {
              filter: { candidates: [] },
              activeWhen: { candidates: [] },
              execute: 'now'
            }
          }
        ]
      }
    }
  ]
});
