import { getCellInFront, isEnemyMinion } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import {
  getAffectedEntities,
  isCastPoint,
  isWithinCells
} from '../../../utils/targeting';
import { KEYWORDS } from '../../../utils/keywords';
import { fury, rooted } from '../../../modifier/modifier-utils';

export const f2Tormentor: CardBlueprint = {
  id: 'f2_tormentor',
  name: 'F2 Tormentor',
  description: '@Fury@.',
  collectable: true,
  rarity: RARITIES.RARE,
  faction: FACTIONS.F2,
  factions: { f2: 2 },
  spriteId: 'f2_tormentor',
  kind: CARD_KINDS.MINION,
  cost: 3,
  attack: 2,
  maxHp: 4,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.FURY, KEYWORDS.CALL_TO_ARMS, KEYWORDS.ROOTED],
  onPlay({ entity }) {
    entity.addModifier(fury({ source: entity }));
  }
};
