import { Vec3 } from '@game/shared';
import { isAllyMinion } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-utils';

export const neutralTank: CardBlueprint = {
  id: 'neutral_tank',
  name: 'Neutral tank',
  description: '',
  rarity: RARITIES.COMMON,
  factions: [null, null, null],
  spriteId: 'neutral_tank',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 4,
  attack: 2,
  maxHp: 8,
  speed: 2,
  range: 1,
  skills: [
    {
      id: 'neutral_tank_skill_1',
      cooldown: 2,
      description: 'TODO',
      name: 'Test skill',
      iconId: 'bulwark',
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
