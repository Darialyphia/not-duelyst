import { Vec3 } from '@game/shared';
import { isAllyMinion, isEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';
import { getAffectedEntities, isSelf, isWithinCells } from '../../../utils/targeting';
import { taunted } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';

export const neutralTank: CardBlueprint = {
  id: 'neutral_tank',
  name: 'Neutral tank',
  description: '',
  collectable: true,
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
      description: 'Taunt nearby enemies for 1 turn.',
      name: 'Test skill',
      iconId: 'bulwark',
      initialCooldown: 0,
      minTargetCount: 0,
      maxTargetCount: 1,
      keywords: [KEYWORDS.TAUNTED],
      isTargetable(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      isInAreaOfEffect(point, { session, skill }) {
        return (
          isWithinCells(skill.caster.position, point, 1) &&
          isEnemy(
            session,
            session.entitySystem.getEntityAt(point)?.id,
            skill.caster.player.id
          )
        );
      },
      onUse({ skill, affectedCells }) {
        getAffectedEntities(affectedCells).forEach(entity => {
          entity.addModifier(taunted({ duration: 1, source: skill.caster }));
        });
      }
    }
  ]
};
