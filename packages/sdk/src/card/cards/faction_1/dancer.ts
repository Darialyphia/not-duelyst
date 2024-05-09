import { Vec3 } from '@game/shared';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-utils';
import { isAxisAligned, isSelf, isWithinCells } from '../../../utils/targeting';

export const f1Dancer: CardBlueprint = {
  id: 'f1_dancer',
  name: 'F1 Dancer',
  description: '',
  rarity: RARITIES.EPIC,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_dancer',
  kind: CARD_KINDS.MINION,
  cooldown: 6,
  initialCooldown: 0,
  cost: 5,
  attack: 3,
  maxHp: 12,
  speed: 3,
  range: 1,
  skills: [
    {
      id: 'f1_dancer_skill_1',
      cooldown: 2,
      description: 'TODO',
      name: 'Test skill 1',
      iconId: 'chakram-dance',
      initialCooldown: 0,
      isTargetable(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      isInAreaOfEffect(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      minTargetCount: 0,
      maxTargetCount: 1,
      onUse({ skill, affectedCells }) {
        console.log('todo');
      }
    },
    {
      id: 'f1_dancer_skill_2',
      cooldown: 2,
      description: 'TODO',
      name: 'Test skill 2',
      iconId: 'chakram',
      initialCooldown: 0,
      isTargetable(point, { skill }) {
        return (
          isAxisAligned(point, skill.caster.position) &&
          isWithinCells(skill.caster.position, point, 3)
        );
      },
      isInAreaOfEffect(point, { castPoints }) {
        return castPoints.some(p => Vec3.fromPoint3D(p).equals(point));
      },
      minTargetCount: 0,
      maxTargetCount: 1,
      onUse({ skill, affectedCells }) {
        console.log('todo');
      }
    }
  ]
};