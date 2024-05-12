import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f1Elemental: CardBlueprint = {
  id: 'f1_placeholder',
  name: 'F1 Elemental',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: true,
  factions: [FACTIONS.F1, null, null],
  spriteId: 'f1_placeholder',
  kind: CARD_KINDS.MINION,
  cooldown: 4,
  initialCooldown: 0,
  cost: 3,
  attack: 2,
  maxHp: 6,
  speed: 3,
  range: 1,
  skills: []
};
