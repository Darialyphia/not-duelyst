import { Vec3 } from '@game/shared';
import { isAllyMinion, isEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import {
  getAffectedEntities,
  isAxisAligned,
  isCastPoint,
  isWithinCells
} from '../../../utils/targeting';
import { vigilant, vulnerable } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';

export const f1Naga: CardBlueprint = {
  id: 'f1_naga',
  name: 'F1 Naga',
  description: 'Vigilant.',
  collectable: true,
  rarity: RARITIES.EPIC,
  factions: [FACTIONS.F1, FACTIONS.F1, null],
  spriteId: 'f1_naga',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 4,
  attack: 3,
  maxHp: 9,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.VIGILANT],
  onPlay({ entity }) {
    entity.addModifier(vigilant({ source: entity }));
  },
  skills: [
    {
      id: 'f1_naga_skill_1',
      cooldown: 3,
      description:
        'Deals 2 damage and inflicts Vulnerable until the end of your next turn.',
      name: 'Naga skill 1',
      iconId: 'blade2-green',
      initialCooldown: 0,
      minTargetCount: 0,
      maxTargetCount: 1,
      keywords: [KEYWORDS.VULNERABLE],
      isTargetable(point, { session, skill }) {
        return (
          isEnemy(
            session,
            session.entitySystem.getEntityAt(point)?.id,
            skill.caster.player.id
          ) &&
          isAxisAligned(skill.caster.position, point) &&
          isWithinCells(skill.caster.position, point, { x: 1, y: 1, z: 0 })
        );
      },
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      onUse({ skill, affectedCells }) {
        getAffectedEntities(affectedCells).forEach(entity => {
          entity.takeDamage(2, skill.caster);
          entity.addModifier(vulnerable({ source: skill.caster, duration: 2 }));
        });
      }
    }
  ]
};
