import { defineSerializedBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTION_IDS } from '../../card-enums';

export const f1General3 = defineSerializedBlueprint({
  id: 'f1_general3',
  name: 'Brome Warcrest',
  rarity: RARITIES.BASIC,
  collectable: true,
  faction: FACTION_IDS.F1,
  spriteId: 'f1_general3',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: 2,
  maxHp: 25,
  tags: [],
  keywords: [],
  relatedBlueprintIds: [],
  effects: []
});
