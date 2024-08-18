import { defineSerializedBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTION_IDS } from '../../card-enums';

export const f3General3 = defineSerializedBlueprint({
  id: 'f3_general3',
  name: 'Ciphyron Ascendant',
  rarity: RARITIES.BASIC,
  collectable: true,
  faction: FACTION_IDS.F3,
  spriteId: 'f3_general3',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: 2,
  maxHp: 25,
  tags: [],
  keywords: [],
  relatedBlueprintIds: [],
  effects: []
});
