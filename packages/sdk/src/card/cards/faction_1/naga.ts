import { isNearbyEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { getAffectedEntities, isSelf } from '../../../utils/targeting';
import { vigilant, vulnerable } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';

export const f1Naga: CardBlueprint = {
  id: 'f1_naga',
  name: 'F1 Naga',
  description: '@Vigilant@.',
  collectable: true,
  rarity: RARITIES.COMMON,
  factions: [FACTIONS.F1, FACTIONS.F1, null],
  spriteId: 'f1_naga',
  kind: CARD_KINDS.MINION,
  cooldown: 4,
  initialCooldown: 0,
  cost: 4,
  attack: 3,
  maxHp: 8,
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
        'Deals 1 damage and inflicts @Vulnerable@ to all nearby enemies for 2 turns.',
      name: 'Naga skill 1',
      iconId: 'blade2-green',
      initialCooldown: 0,
      minTargetCount: 0,
      maxTargetCount: 1,
      keywords: [KEYWORDS.VULNERABLE],
      isTargetable(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      isInAreaOfEffect(point, { skill, session }) {
        return isNearbyEnemy(session, skill.caster, point);
      },
      onUse({ skill, affectedCells }) {
        getAffectedEntities(affectedCells).forEach(entity => {
          entity.takeDamage(1, skill.caster);
          entity.addModifier(vulnerable({ source: skill.caster, duration: 2 }));
        });
      }
    }
  ]
};
