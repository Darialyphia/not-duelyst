import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { fixedAmount } from '../../helpers/amount';
import { openingGambitEffect } from '../../helpers/opening-gambit.effect';
import { followup } from '../../helpers/targeting';

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
  speed: 2,
  spriteId: 'neutral_healing_mystic',
  tags: [],
  followup: undefined, // haven't handled followup as data yet,
  effects: [
    openingGambitEffect({
      text: 'Heal another unit for 2',
      actions: [
        {
          type: 'heal',
          params: {
            targets: followup(0),
            amount: fixedAmount(2)
          }
        }
      ]
    })
  ]
});
