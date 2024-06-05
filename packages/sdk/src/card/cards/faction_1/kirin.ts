import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';
import { flying, ranged } from '../../../modifier/modifier-utils';

export const f1Kirin: CardBlueprint = {
  id: 'f1_kirin',
  name: 'F1 Kirin',
  description: '@Flying@.\n@Ranged(1)@.',
  collectable: false,
  rarity: RARITIES.BASIC,
  factions: [FACTIONS.F1, null, null],
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
    entity.addModifier(ranged({ source: entity, range: 1 }));
  },
  skills: []
};
