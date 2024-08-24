import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralFlamebloodWarlock = defineSerializedBlueprint({
  id: 'neutral_flameblood_warlock',
  spriteId: 'neutral_flameblood_warlock',
  name: 'Flameblood Warlock',
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 2,
  attack: 3,
  maxHp: 1,
  faction: null,
  effects: [
    {
      text: '@Opening Gambit@: Deal 3 damage to BOTH generals.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 3 } },
              targets: { candidates: [[{ type: 'is_general', params: { not: false } }]] },
              filter: { candidates: [[{ type: 'played_from_hand', params: {} }]] },
              execute: 'now'
            }
          }
        ]
      }
    }
  ]
});
