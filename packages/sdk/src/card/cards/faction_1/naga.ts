import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { vigilant } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';

export const f1Naga: CardBlueprint = {
  id: 'f1_naga',
  name: 'F1 Naga',
  description: '@Vigilant@.',
  collectable: true,
  rarity: RARITIES.COMMON,
  faction: FACTIONS.F1,
  factions: { f1: 3 },
  spriteId: 'f1_naga',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 3,
  maxHp: 6,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.VIGILANT],
  onPlay({ entity }) {
    entity.addModifier(vigilant({ source: entity }));
  }
};
