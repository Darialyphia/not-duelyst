import { isEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS, FACTION_IDS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';
import { burn, frozen, ranged } from '../../../modifier/modifier-utils';
import {
  getAffectedEntities,
  isCastPoint,
  isWithinCells
} from '../../../utils/targeting';

export const f1Mage: CardBlueprint = {
  id: 'f1_mage',
  name: 'F1 Mage',
  description: '@Ranged(2)@.',
  collectable: true,
  rarity: RARITIES.BASIC,
  faction: FACTIONS.F1,
  factions: { f1: 2 },
  spriteId: 'f1_mage',
  kind: CARD_KINDS.MINION,
  cost: 3,
  attack: 1,
  maxHp: 4,
  speed: 2,
  range: 1,
  keywords: [KEYWORDS.RANGED],
  onPlay({ entity }) {
    entity.addModifier(ranged({ source: entity, range: 2 }));
  },
  skills: [
    {
      id: 'f1_mage_skill_one',
      name: 'Fireball',
      description: `@${FACTION_IDS.F1}(4)@ Deal 3 damage to an enemy and @Burn(1)@ to nearby enemy minions.`,
      cooldown: 3,
      initialCooldown: 0,
      iconId: 'fire',
      minTargetCount: 1,
      maxTargetCount: 1,
      keywords: [KEYWORDS.BURN],
      runes: { f1: 4 },
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
          } else if (!entity.isGeneral) {
            entity.addModifier(burn({ source: skill.caster }));
          }
        });
      }
    },
    {
      id: 'f1_mage_skill_2',
      name: 'Ice Blast',
      description: `@${FACTION_IDS.F1}(4)@ Deal 1 damage and @Freeze@ an enemy unit for one turn.`,
      iconId: 'ice',
      cooldown: 4,
      minTargetCount: 1,
      maxTargetCount: 1,
      initialCooldown: 0,
      runes: { f1: 4 },
      keywords: [KEYWORDS.FROZEN],
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
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      onUse({ affectedCells, skill }) {
        getAffectedEntities(affectedCells).forEach(entity => {
          skill.caster.dealDamage(1, entity);
          entity.addModifier(frozen({ source: skill.caster, duration: 1 }));
        });
      }
    }
  ]
};
