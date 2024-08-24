import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';
import { provokeEffect } from '../../helpers/provoke.effect';

export const neutralPrimusShieldMaster = defineSerializedBlueprint({
  id: 'neutral_primus_shieldmaster',
  collectable: true,
  name: 'Primus Shieldmaster',
  cost: 4,
  attack: 3,
  maxHp: 6,
  faction: null,
  keywords: [KEYWORDS.PROVOKE.id],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  spriteId: 'neutral_primus_shieldmaster',
  tags: [],
  effects: [provokeEffect()]
});
