import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS } from '../../card-enums';
import { celerity, nimble } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';

export const f1Dancer: CardBlueprint = {
  id: 'f1_dancer',
  name: 'F1 Dancer',
  description: '@Nimble@.\n@Celerity@',
  collectable: true,
  rarity: RARITIES.RARE,
  faction: FACTIONS.F1,
  factions: {
    f1: 2
  },
  spriteId: 'f1_dancer',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 2,
  maxHp: 6,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.NIMBLE, KEYWORDS.CELERITY],
  onPlay({ entity }) {
    entity.addModifier(nimble({ source: entity }));
    entity.addModifier(celerity({ source: entity }));
  }
};
