import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { fixedAmount } from '../../helpers/amount';
import { anyOccupiedCell, manualTarget } from '../../helpers/targeting';

export const neutralHealingMystic = defineSerializedBlueprint({
  id: 'healing_mystic',
  collectable: true,
  name: 'Healing Mystic',
  cost: 2,
  attack: 2,
  maxHp: 3,
  faction: null,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  kind: 'MINION',
  rarity: 'common',
  relatedBlueprintIds: [],
  spriteId: 'neutral_healing_mystic',
  tags: [],
  targets: {
    min: 0,
    targets: [anyOccupiedCell()]
  },
  effects: [
    defineCardEffect({
      text: 'Heal another unit for 2',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'heal',
            params: {
              targets: manualTarget(0),
              amount: fixedAmount(2)
            }
          }
        ]
      }
    })
  ]
});
