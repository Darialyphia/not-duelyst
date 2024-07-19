import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { fixedAmount } from '../../helpers/amount';
import { openingGambitEffect } from '../../helpers/opening-gambit.effect';
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
    openingGambitEffect({
      text: 'Heal another unit for 2',
      actions: [
        {
          type: 'heal',
          params: {
            targets: manualTarget(0),
            amount: fixedAmount(2)
          }
        }
      ]
    })
  ]
});
