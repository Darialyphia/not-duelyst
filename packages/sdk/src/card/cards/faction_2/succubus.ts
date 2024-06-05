import { isEnemyMinion } from '../../../entity/entity-utils';
import { disarmed, fearsome } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import {
  getAffectedEntities,
  isCastPoint,
  isWithinCells
} from '../../../utils/targeting';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f2Succubus: CardBlueprint = {
  id: 'f2_succubus',
  name: 'F2 Succubus',
  description: '@Fearsome@.',
  collectable: true,
  rarity: RARITIES.RARE,
  factions: [FACTIONS.F2, null, null],
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
  },
  skills: [
    {
      id: 'f2_succubus_skill1',
      name: 'F2 Succubus Skill 1',
      description: '@Disarm@ an enemy minion for 1 turn.',
      cooldown: 3,
      initialCooldown: 0,
      iconId: 'entrance',
      keywords: [KEYWORDS.DISARMED],
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { skill, session }) {
        return (
          isEnemyMinion(
            session,
            session.entitySystem.getEntityAt(point)?.id,
            skill.caster.player.id
          ) && isWithinCells(skill.caster.position, point, 3)
        );
      },
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      onUse({ affectedCells, skill }) {
        getAffectedEntities(affectedCells).forEach(entity => {
          entity.addModifier(disarmed({ source: skill.caster, duration: 1 }));
        });
      }
    }
  ]
};
