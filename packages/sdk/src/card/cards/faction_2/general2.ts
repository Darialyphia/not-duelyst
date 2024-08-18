import { defineSerializedBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTION_IDS } from '../../card-enums';

export const f2General2 = defineSerializedBlueprint({
  id: 'f2_general2',
  name: 'Reva Eventide',
  rarity: RARITIES.BASIC,
  collectable: true,
  faction: FACTION_IDS.F2,
  spriteId: 'f2_general2',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: 2,
  maxHp: 25,
  tags: [],
  keywords: [],
  relatedBlueprintIds: [],
  effects: []
});
