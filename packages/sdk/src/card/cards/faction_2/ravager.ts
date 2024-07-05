import { rooted, rush } from '../../../modifier/modifier-utils';
import {
  getAffectedEntities,
  getDirection,
  getFarthestWalkable,
  isAxisAligned
} from '../../../utils/targeting';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { getNearest } from '../../../entity/entity-utils';
import { KEYWORDS } from '../../../utils/keywords';

export const f2Ravager: CardBlueprint = {
  id: 'f2_ravager',
  name: 'F2 Ravager',
  description: '@Rush@.',
  collectable: true,
  rarity: RARITIES.BASIC,
  faction: FACTIONS.F2,
  factions: { f2: 3 },
  spriteId: 'f2_horned_demon',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 4,
  maxHp: 5,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.RUSH],
  modifiers: [rush()]
};
