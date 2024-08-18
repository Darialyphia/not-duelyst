import { defineSerializedBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTION_IDS } from '../../card-enums';

export const f4General2 = defineSerializedBlueprint({
  id: 'f4_general2',
  name: 'Cassyva Soulreaper',
  rarity: RARITIES.BASIC,
  collectable: true,
  faction: FACTION_IDS.F4,
  spriteId: 'f4_general2',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: 2,
  maxHp: 25,
  tags: [],
  keywords: [],
  relatedBlueprintIds: [],
  effects: []
});
