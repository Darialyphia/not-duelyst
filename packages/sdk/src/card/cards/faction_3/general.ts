import { defineSerializedBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTION_IDS } from '../../card-enums';

export const f3General = defineSerializedBlueprint({
  id: 'f3_general',
  name: 'Zirix Starstrider',
  rarity: RARITIES.BASIC,
  collectable: true,
  faction: FACTION_IDS.F3,
  spriteId: 'f3_general',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: 2,
  maxHp: 25,
  tags: [],
  keywords: [],
  relatedBlueprintIds: [],
  effects: []
});
