import { defineSerializedBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTION_IDS } from '../../card-enums';

export const f6General = defineSerializedBlueprint({
  id: 'f6_general',
  name: 'Faie Bloodwing',
  rarity: RARITIES.BASIC,
  collectable: true,
  faction: FACTION_IDS.F6,
  spriteId: 'f6_general',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: 2,
  maxHp: 25,
  tags: [],
  keywords: [],
  relatedBlueprintIds: [],
  effects: []
});
