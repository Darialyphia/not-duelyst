import { Vec3 } from '@game/shared';
import { isAllyMinion } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { structure } from '../../../modifier/modifier-utils';
import { getAffectedEntities, isAxisAligned } from '../../../utils/targeting';
import { KEYWORDS } from '../../../utils/keywords';

export const f1Ranged: CardBlueprint = {
  id: 'f1_ranged',
  name: 'F1 Ranged',
  description: '',
  collectable: true,
  rarity: RARITIES.BASIC,
  factions: [FACTIONS.F1, null, null],
  spriteId: 'f1_ranged',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 3,
  attack: 0,
  maxHp: 7,
  speed: 2,
  range: 1,
  keywords: [KEYWORDS.STRUCTURE],
  onPlay({ entity }) {
    entity.addModifier(structure(entity));
  },
  skills: [
    {
      id: 'f1_ranged_skill_1',
      name: 'Pyramid Beam',
      description: 'Deal 2 damage to all units in a straight line',
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

        const [origin] = castPoints;
        if (point.z !== origin.z) return false;
        if (Vec3.fromPoint3D(origin).equals(point)) return true;

        if (origin.x === point.x) {
          return origin.y > skill.caster.position.y
            ? point.y > skill.caster.position.y
            : point.y < skill.caster.position.y;
        } else {
          return origin.x > skill.caster.position.x
            ? point.x > skill.caster.position.x
            : point.x < skill.caster.position.x;
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
