import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralPrimusShieldMaster = defineSerializedBlueprint({
  id: 'primus_shieldmaster',
  collectable: true,
  name: 'Primus Shieldmaster',
  cost: 4,
  attack: 3,
  maxHp: 6,
  faction: null,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  speed: 2,
  spriteId: 'neutral_primus_shieldmaster',
  tags: [],
  effects: [
    defineCardEffect({
      text: '@Provoke@.',
      config: {
        executionContext: 'immediate',
        actions: [{ type: 'provoke', params: {} }]
      }
    })
  ]
});
