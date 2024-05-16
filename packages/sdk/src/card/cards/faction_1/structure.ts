import { Vec3 } from '@game/shared';
import { isAllyMinion } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { aura, structure, surge } from '../../../modifier/modifier-utils';
import { getAffectedEntities, isAxisAligned } from '../../../utils/targeting';
import { KEYWORDS } from '../../../utils/keywords';

export const f1Structure: CardBlueprint = {
  id: 'f1_ranged',
  name: 'F1 Structure',
  description: '@Structure@.\n@Surge(1)@ @Aura@',
  collectable: true,
  rarity: RARITIES.BASIC,
  factions: [FACTIONS.F1, FACTIONS.F1, null],
  spriteId: 'f1_ranged',
  kind: CARD_KINDS.MINION,
  cooldown: 4,
  initialCooldown: 0,
  cost: 3,
  attack: 0,
  maxHp: 6,
  speed: 0,
  range: 1,
  keywords: [KEYWORDS.STRUCTURE],
  onPlay({ entity }) {
    entity.addModifier(structure(entity));

    entity.addModifier(
      aura({
        source: entity,
        name: 'Amplify Magic',
        description: 'Nearby allies have @Surge@',
        onGainAura(affected) {
          if (affected.isAlly(entity.id)) {
            affected.addModifier(surge({ source: entity }));
          }
        },
        onLoseAura(affected) {
          if (affected.isAlly(entity.id)) {
            affected.removeModifier(KEYWORDS.SURGE.id);
          }
        }
      })
    );
  },
  skills: [
    {
      id: 'f1_ranged_skill_1',
      name: 'Pyramid Beam',
      description: 'Deal 2 damage to all units in a straight line.',
      cooldown: 2,
      iconId: 'laser-green',
      initialCooldown: 0,
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { skill }) {
        return isAxisAligned(point, skill.caster.position);
      },
      isInAreaOfEffect(point, { skill, castPoints }) {
        if (!isAxisAligned(point, skill.caster.position)) return false;

        const [castPoint] = castPoints;
        if (!castPoint) return false;

        if (point.z !== castPoint.z) return false;
        if (Vec3.fromPoint3D(castPoint).equals(point)) return true;
        const caster = skill.caster.position;

        if (castPoint.x === caster.x) {
          if (point.x !== caster.x) return false;

          return castPoint.y > caster.y
            ? point.y > skill.caster.position.y
            : point.y < skill.caster.position.y;
        } else if (castPoint.y === caster.y) {
          if (point.y !== caster.y) return false;

          return castPoint.x > skill.caster.position.x
            ? point.x > skill.caster.position.x
            : point.x < skill.caster.position.x;
        } else {
          return false;
        }
      },
      onUse({ castPoints, affectedCells, skill }) {
        console.log(castPoints[0]);
        console.log(affectedCells);
        getAffectedEntities(affectedCells).forEach(entity => {
          skill.caster.dealDamage(2, entity);
        });
      }
    }
  ]
};
