import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { airdropEffect } from '../../helpers/airdrop.effect';
import { provokeEffect } from '../../helpers/provoke.effect';

export const f1IroncliffeGuardian = defineSerializedBlueprint({
  id: 'f1_ironcliffe_guardian',
  collectable: true,
  name: 'Ironcliffe Guardian',
  cost: 5,
  attack: 3,
  maxHp: 10,
  faction: FACTION_IDS.F1,
  keywords: [KEYWORDS.PROVOKE.id, KEYWORDS.AIRDROP.id],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  relatedBlueprintIds: [],
  spriteId: 'f1_ironcliffe_guardian',
  tags: [],
  effects: [provokeEffect(), airdropEffect()]
});
