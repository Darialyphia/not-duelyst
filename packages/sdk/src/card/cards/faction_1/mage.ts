import { Vec3 } from '@game/shared';
import { isAllyMinion, isEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';
import { burn, ranged } from '../../../modifier/modifier-utils';
import {
  getAffectedEntities,
  isNearbyAlly,
  isSelf,
  isWithinCells
} from '../../../utils/targeting';

export const f1Mage: CardBlueprint = {
  id: 'f1_mage',
  name: 'F1 Mage',
  description: '@Ranged(2)@.',
  collectable: true,
  rarity: RARITIES.RARE,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_mage',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 5,
  attack: 1,
  maxHp: 10,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.RANGED],
  onPlay({ entity }) {
    entity.addModifier(ranged({ source: entity, range: 2 }));
  },
  skills: [
    {
      id: 'f1_mage_skill_one',
      name: 'Fireball',
      description: 'Deal 3 damage to an enemy and @Burn@ to nearby enemy minions.',
      cooldown: 3,
      initialCooldown: 0,
      iconId: 'fire',
      minTargetCount: 1,
      maxTargetCount: 1,
      keywords: [KEYWORDS.BURN],
      isTargetable(point, { session, skill }) {
        return (
          isWithinCells(skill.caster.position, point, 3) &&
          isEnemy(
            session,
            session.entitySystem.getEntityAt(point)?.id,
            skill.caster.player.id
          )
        );
      },
      isInAreaOfEffect(point, { skill, castPoints, session }) {
        const [castPoint] = castPoints;
        if (!castPoint) return false;

        return (
          isEnemy(
            session,
            session.entitySystem.getEntityAt(point)?.id,
            skill.caster.player.id
          ) && isWithinCells(castPoint, point, 1)
        );
      },
      onUse({ skill, castPoints, affectedCells }) {
        getAffectedEntities(affectedCells).forEach(entity => {
          if (entity.position.equals(castPoints[0])) {
            skill.caster.dealDamage(3, entity);
          } else {
            entity.addModifier(burn({ source: skill.caster }));
          }
        });
      }
    },
    {
      id: 'f1_mage_skill_2',
      name: 'Sands of Time',
      description:
        'Reduce the cooldown of all abilities of this unit and nearby allies by 1.',
      iconId: 'hourglass',
      cooldown: 5,
      minTargetCount: 1,
      maxTargetCount: 1,
      initialCooldown: 2,
      isTargetable(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      isInAreaOfEffect(point, { session, skill }) {
        return (
          isSelf(skill.caster, session.entitySystem.getEntityAt(point)) ||
          isNearbyAlly(session, skill.caster, point)
        );
      },
      onUse({ affectedCells }) {
        getAffectedEntities(affectedCells).forEach(entity => {
          entity.skills.forEach(skill => {
            skill.currentCooldown = Math.max(skill.currentCooldown - 1, 0);
          });
        });
      }
    }
  ]
};
