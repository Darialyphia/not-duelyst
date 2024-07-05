import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';

export const neutralIceQueen: CardBlueprint = {
  id: 'neutral_ice_queen',
  name: 'Neutral Ice Queen',
  description: '',
  collectable: true,
  rarity: RARITIES.EPIC,
  faction: null,
  factions: { multicolor: 4 },
  spriteId: 'neutral_ice_queen',
  kind: CARD_KINDS.MINION,
  cost: 5,
  attack: 2,
  maxHp: 5,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.FROZEN]
};
