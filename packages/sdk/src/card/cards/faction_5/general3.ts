import { defineSerializedBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTION_IDS } from '../../card-enums';

export const f5General3 = defineSerializedBlueprint({
  id: 'f5_general3',
  name: 'Ragnora the Relentless',
  rarity: RARITIES.BASIC,
  collectable: true,
  faction: FACTION_IDS.F5,
  spriteId: 'f5_general3',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: 2,
  maxHp: 25,
  tags: [],
  keywords: [],
  relatedBlueprintIds: [],
  effects: []
});
