import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f1ElementalLord: CardBlueprint = {
  id: 'f1_elemental_lord',
  name: 'F1 Elemental Lord',
  description: '',
  collectable: true,
  rarity: RARITIES.LEGENDARY,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_elementalist',
  kind: CARD_KINDS.MINION,
  cooldown: 6,
  initialCooldown: 0,
  cost: 6,
  attack: 1,
  maxHp: 12,
  speed: 3,
  range: 1,
  keywords: [],
  skills: []
};
