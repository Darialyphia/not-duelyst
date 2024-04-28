import { Vec3 } from '@game/shared';
import { isAllyMinion, isEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS, Faction } from '../../card-utils';

export const f1Mage: CardBlueprint = {
  id: 'f1_mage',
  name: 'F1 Mage',
  description: '',
  rarity: RARITIES.RARE,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_mage',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 5,
  attack: 1,
  maxHp: 11,
  speed: 3,
  range: 1,
  skills: [
    {
      id: 'f1_mage_skill_1',
      cooldown: 2,
      description: 'TODO',
      name: 'Test skill',
      iconId: 'lightning3',
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
      id: 'f1_mage_skill_2',
      cooldown: 2,
      description: 'TODO',
      name: 'Test skill 2',
      iconId: 'lightning2',
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
      id: 'f1_mage_skill_3',
      cooldown: 4,
      description: 'TODO',
      name: 'Test skill 3',
      iconId: 'lightning',
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
