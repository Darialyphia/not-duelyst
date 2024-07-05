import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';

export const f1Wisp: CardBlueprint = {
  id: 'f1_wisp',
  name: 'F1 Wisp',
  description:
    '@Call to Arms@: The next time an ally casts an ability this turn, reduce its cooldown by 1.',
  collectable: true,
  rarity: RARITIES.COMMON,
  faction: FACTIONS.F1,
  factions: { f1: 2 },
  spriteId: 'f1_wisp',
  kind: CARD_KINDS.MINION,
  cost: 2,
  attack: 1,
  maxHp: 3,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.CALL_TO_ARMS]
};
