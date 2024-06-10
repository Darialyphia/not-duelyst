import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';
import { flying } from '../../../modifier/modifier-utils';

export const f1Kirin: CardBlueprint = {
  id: 'f1_kirin',
  name: 'F1 Kirin',
  description: '@Flying@.',
  collectable: false,
  rarity: RARITIES.BASIC,
  faction: FACTIONS.F1,
  factions: { f1: 2 },
  spriteId: 'f1_kirin',
  kind: CARD_KINDS.MINION,
  cost: 0,
  attack: 2,
  maxHp: 4,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.FLYING, KEYWORDS.RANGED],
  onPlay({ entity }) {
    entity.addModifier(flying({ source: entity }));
  },
  skills: []
};
