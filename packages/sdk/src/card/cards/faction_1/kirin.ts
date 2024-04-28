import { Vec3 } from '@game/shared';
import { isAllyMinion, isEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS, Faction } from '../../card-utils';

export const f1Kirin: CardBlueprint = {
  id: 'f1_kirin',
  name: 'F1 Kirin',
  description: '',
  rarity: RARITIES.LEGENDARY,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_kirin',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 4,
  attack: 2,
  maxHp: 10,
  speed: 3,
  range: 1,
  skills: [
    {
      id: 'f1_kirin_skill_1',
      cooldown: 2,
      description: 'TODO',
      name: 'Test skill',
      iconId: 'waterball2-green',
      initialCooldown: 0,
      isTargetable(point, { session, skill }) {
        return isEnemy(
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
      id: 'f1_kirin_skill_1',
      cooldown: 2,
      description: 'TODO',
      name: 'Test skill',
      iconId: 'meditate',
      initialCooldown: 0,
      isTargetable(point, { session, skill }) {
        return isEnemy(
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
