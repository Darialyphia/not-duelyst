import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';

export const neutralTank: CardBlueprint = {
  id: 'neutral_tank',
  name: 'Neutral tank',
  description: '',
  collectable: true,
  rarity: RARITIES.COMMON,
  faction: null,
  factions: { multicolor: 3 },
  spriteId: 'neutral_tank',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 2,
  maxHp: 7,
  speed: 2,
  range: 1,
  keywords: [KEYWORDS.TAUNTED]
};
