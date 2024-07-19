import { defineSerializedBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTION_IDS } from '../../card-enums';

export const f1General = defineSerializedBlueprint({
  id: 'f1_general',
  name: 'Argeon Highmane',
  rarity: RARITIES.BASIC,
  collectable: true,
  faction: FACTION_IDS.F1,
  spriteId: 'f1_general',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: 2,
  maxHp: 25,
  tags: [],
  keywords: [],
  relatedBlueprintIds: [],
  effects: []
});
