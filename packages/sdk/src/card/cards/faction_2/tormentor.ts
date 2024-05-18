import { Vec3 } from '@game/shared';
import {
  getCellInFront,
  isAllyMinion,
  isEnemy,
  isEnemyMinion
} from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { cone, isAxisAligned, isWithinCells } from '../../../utils/targeting';
import { KEYWORDS } from '../../../utils/keywords';
import { fury, rooted } from '../../../modifier/modifier-utils';

export const f2Tormentor: CardBlueprint = {
  id: 'f2_tormentor',
  name: 'F2 Tormentor',
  description:
    '@Fury@.\n@Call to Arms@: Select an enemy minion and move it in front of this unit, then @Root@ it for one turn.',
  collectable: true,
  rarity: RARITIES.RARE,
  factions: [FACTIONS.F2, null, null],
  spriteId: 'f2_tormentor',
  kind: CARD_KINDS.MINION,
  cooldown: 4,
  initialCooldown: 0,
  cost: 4,
  attack: 3,
  maxHp: 5,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.FURY, KEYWORDS.CALL_TO_ARMS, KEYWORDS.ROOTED],
  followup: {
    minTargetCount: 0,
    maxTargetCount: 1,
    isTargetable(point, { summonedPoint, card, session }) {
      return (
        isWithinCells(summonedPoint, point, 3) &&
        isEnemyMinion(
          session,
          session.entitySystem.getEntityAt(point)?.id,
          card.player.id
        )
      );
    }
  },
  async onPlay({ session, followup, entity }) {
    entity.addModifier(fury({ source: entity }));

    if (!followup[0]) return;
    const target = session.entitySystem.getEntityAt(followup[0]);
    if (!target) return;

    const cell = getCellInFront(session, entity);
    if (!cell) return;
    if (!cell.canSummonAt) return;
    await target.move([cell], true);
    target.addModifier(rooted({ source: entity, duration: 1 }));
  },
  skills: []
};
