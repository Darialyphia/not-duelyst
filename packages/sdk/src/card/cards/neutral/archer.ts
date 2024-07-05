import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';
import { ranged } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';

export const neutralArcher: CardBlueprint = {
  id: 'neutral_archer',
  name: 'Neutral Archer',
  description: '@Ranged(2)@',
  collectable: true,
  rarity: RARITIES.BASIC,
  faction: null,
  factions: { multicolor: 1 },
  spriteId: 'neutral_archer',
  kind: CARD_KINDS.MINION,
  cost: 3,
  attack: 2,
  maxHp: 2,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.RANGED],
  onPlay({ entity }) {
    entity.addModifier(ranged({ source: entity, range: 2 }));
  }
};
