import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';
import { ranged } from '../../../modifier/modifier-utils';

export const f1Mage: CardBlueprint = {
  id: 'f1_mage',
  name: 'F1 Mage',
  description: '@Ranged(2)@.',
  collectable: true,
  rarity: RARITIES.BASIC,
  faction: FACTIONS.F1,
  factions: { f1: 2 },
  spriteId: 'f1_mage',
  kind: CARD_KINDS.MINION,
  cost: 3,
  attack: 1,
  maxHp: 4,
  speed: 2,
  range: 1,
  keywords: [KEYWORDS.RANGED],
  onPlay({ entity }) {
    entity.addModifier(ranged({ source: entity, range: 2 }));
  }
};
