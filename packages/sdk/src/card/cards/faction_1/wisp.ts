import { Vec3 } from '@game/shared';
import { isAllyMinion, isEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { aura, structure, surge } from '../../../modifier/modifier-utils';
import {
  getAffectedEntities,
  isAxisAligned,
  isCastPoint,
  isWithinCells
} from '../../../utils/targeting';
import { KEYWORDS } from '../../../utils/keywords';
import type { Entity } from '../../../entity/entity';
import type { Skill } from '../../../entity/skill';

export const f1Wisp: CardBlueprint = {
  id: 'f1_wisp',
  name: 'F1 Wisp',
  description:
    '@Call to Arms@: The next time an ally casts an ability this turn, reduce its cooldown by 1.',
  collectable: true,
  rarity: RARITIES.COMMON,
  factions: [FACTIONS.F1, null, null],
  spriteId: 'f1_wisp',
  kind: CARD_KINDS.MINION,
  cooldown: 4,
  initialCooldown: 0,
  cost: 2,
  attack: 1,
  maxHp: 3,
  speed: 4,
  range: 1,
  keywords: [],
  onPlay({ session, entity }) {
    const onUseSkill = ({ skill, entity }: { skill: Skill; entity: Entity }) => {
      const stop = skill.addInterceptor('cooldown', val => val - 1);
      entity.once('after_use_skill', () => {
        stop();
        session.off('entity:before_use_skill', onUseSkill);
      });
    };

    session.on('entity:before_use_skill', onUseSkill);
    session.once('player:turn_end', () => {
      session.off('entity:before_use_skill', onUseSkill);
    });
  },
  skills: [
    {
      id: 'f1_wisp_skill1',
      name: 'Wisp Skill 1',
      description: 'Deal 1 damage to an enemy.',
      iconId: 'blast',
      cooldown: 2,
      initialCooldown: 0,
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { session, skill }) {
        return (
          isEnemy(
            session,
            session.entitySystem.getEntityAt(point)?.id,
            skill.caster.player.id
          ) && isWithinCells(skill.caster.position, point, 2)
        );
      },
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      onUse({ skill, affectedCells }) {
        getAffectedEntities(affectedCells).forEach(entity => {
          skill.caster.dealDamage(1, entity);
        });
      }
    }
  ]
};
