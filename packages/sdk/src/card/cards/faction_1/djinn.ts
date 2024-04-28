import { Vec3 } from '@game/shared';
import { isAllyMinion } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-utils';

export const f1Djinn: CardBlueprint = {
  id: 'f1_djinn',
  name: 'F1 Djinn',
  description: '',
  rarity: RARITIES.RARE,
  factions: [FACTIONS.F1, FACTIONS.F1, null],
  spriteId: 'f1_djinn',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 6,
  attack: 2,
  maxHp: 10,
  speed: 4,
  range: 1,
  skills: [
    {
      id: 'f1_djinn_skill_1',
      cooldown: 2,
      description: 'Keep it discoverable',
      name: 'Test skill',
      iconId: 'chalice-green',
      initialCooldown: 0,
      isTargetable(point, { session, skill }) {
        return isAllyMinion(
          session,
          session.entitySystem.getEntityAt(point)?.id,
          skill.caster.player.id
        );
      },
      isInAreaOfEffect(point, { castPoints }) {
        const vec = Vec3.fromPoint3D(point);
        return castPoints.some(p => vec.equals(p));
      },
      minTargetCount: 0,
      maxTargetCount: 1,
      onUse({ skill, affectedCells }) {
        console.log('todo');
      }
    },
    {
      id: 'f1_djinn_skill_2',
      cooldown: 2,
      description: 'TODO',
      name: 'Test skill 2',
      iconId: 'fire2-green',
      initialCooldown: 0,
      isTargetable(point, { session, skill }) {
        return isAllyMinion(
          session,
          session.entitySystem.getEntityAt(point)?.id,
          skill.caster.player.id
        );
      },
      isInAreaOfEffect(point, { castPoints }) {
        const vec = Vec3.fromPoint3D(point);
        return castPoints.some(p => vec.equals(p));
      },
      minTargetCount: 0,
      maxTargetCount: 1,
      onUse({ skill, affectedCells }) {
        console.log('todo');
      }
    }
  ]
};
