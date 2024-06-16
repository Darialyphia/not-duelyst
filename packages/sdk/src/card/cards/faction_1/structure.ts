import { Vec3 } from '@game/shared';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS, FACTION_IDS } from '../../card-enums';
import { aura, structure, surge } from '../../../modifier/modifier-utils';
import {
  getAffectedEntities,
  isAxisAligned,
  isWithinCells
} from '../../../utils/targeting';
import { KEYWORDS } from '../../../utils/keywords';

export const f1Structure: CardBlueprint = {
  id: 'f1_ranged',
  name: 'F1 Structure',
  description: '@Structure@.\n@Surge(1)@ @Aura@',
  collectable: true,
  rarity: RARITIES.BASIC,
  faction: FACTIONS.F1,
  factions: { f1: 1 },
  spriteId: 'f1_ranged',
  kind: CARD_KINDS.MINION,
  cost: 2,
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
        isElligible(target, source) {
          return (
            isWithinCells(target.position, source.position, 1) && target.isAlly(source.id)
          );
        },
        onGainAura(affected) {
          affected.addModifier(surge({ source: entity }));
        },
        onLoseAura(affected) {
          affected.removeModifier(KEYWORDS.SURGE.id);
        }
      })
    );
  },
  skills: [
    {
      id: 'f1_ranged_skill_1',
      name: 'Pyramid Beam',
      description: `@${FACTION_IDS.F1}(2)@Deal 2 damage to all units in a straight line.`,
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
        getAffectedEntities(affectedCells).forEach(entity => {
          skill.caster.dealDamage(2, entity);
        });
      }
    }
  ]
};
