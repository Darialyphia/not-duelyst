import { isEnemyMinion } from '../../../entity/entity-utils';
import { disarmed, fearsome } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import {
  getAffectedEntities,
  isCastPoint,
  isWithinCells
} from '../../../utils/targeting';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS, FACTION_IDS } from '../../card-enums';

export const f2Succubus: CardBlueprint = {
  id: 'f2_succubus',
  name: 'F2 Succubus',
  description: '@Fearsome@.',
  collectable: true,
  rarity: RARITIES.RARE,
  faction: FACTIONS.F2,
  factions: { f2: 1 },
  spriteId: 'f2_succubus',
  kind: CARD_KINDS.MINION,
  cost: 3,
  attack: 3,
  maxHp: 3,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.FEARSOME],
  onPlay({ entity }) {
    entity.addModifier(fearsome({ source: entity }));
  }
};
