import { Vec3 } from '@game/shared';
import { isAllyMinion, isEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-utils';
import { cone, isAxisAligned, isWithinCells } from '../../../utils/targeting';

export const f2TutorialBigDude: CardBlueprint = {
  id: 'f2_tutorial_big_dude',
  name: 'F2 Tutorial Big Dude',
  description: '',
  collectable: true,
  rarity: RARITIES.BASIC,
  factions: [FACTIONS.F2, FACTIONS.F2, null],
  spriteId: 'tutorial_big_dude',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 5,
  attack: 4,
  maxHp: 10,
  speed: 3,
  range: 1,
  skills: [
    {
      id: 'tutorial_big_dude_skill_1',
      cooldown: 3,
      description: 'Todo',
      name: 'Test skill',
      iconId: 'fire-red',
      initialCooldown: 0,
      isTargetable(point, { session, skill }) {
        return (
          isWithinCells(skill.caster.position, point, 1) &&
          isAxisAligned(skill.caster.position, point)
        );
      },
      isInAreaOfEffect(point, { castPoints, skill }) {
        const points = cone(skill.caster.position, castPoints[0], 1);

        return points.some(pt => Vec3.fromPoint3D(pt).equals(point));
      },
      minTargetCount: 0,
      maxTargetCount: 1,
      async onUse({ session, skill, affectedCells }) {
        const stop = session.fxSystem.changeAmbientLightUntil('#990022', 0.7);
        await Promise.all(
          affectedCells.map(async cell => {
            if (cell.entity) {
              const stopLight = session.fxSystem.addLightOnEntityUntil(cell.entity.id, {
                color: 0xff0000,
                strength: 5
              });
              await cell.entity.takeDamage(3, skill.caster);
              stopLight();
            }
          })
        );
        stop();
      }
    }
  ]
};
