import { Vec3 } from '@game/shared';
import { config } from '../../../config';
import { isEnemy, isAllyMinion } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import {
  getAffectedEntities,
  isCastPoint,
  isNearbyEnemy
} from '../../../utils/targeting';
import { KEYWORDS } from '../../../utils/keywords';
import { purgeEntity, vulnerable } from '../../../modifier/modifier-utils';

export const f1General: CardBlueprint = {
  id: 'f1_general',
  name: 'F1 General',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: true,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_general',
  kind: CARD_KINDS.GENERAL,
  cooldown: 0,
  initialCooldown: 0,
  cost: 0,
  attack: config.GENERAL_DEFAULT_ATTACK,
  maxHp: config.GENERAL_DEFAULT_HP,
  speed: config.GENERAL_DEFAULT_SPEED,
  range: 1,
  skills: [
    {
      id: 'f1_general_skill-1',
      name: 'Void Thrust',
      description: '@Purge@ an enemy minion and give it @Vulnerable(1)@, then attack it.',
      cooldown: 3,
      initialCooldown: 0,
      iconId: 'spear1',
      keywords: [KEYWORDS.PURGE, KEYWORDS.VULNERABLE],
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { session, skill }) {
        return isNearbyEnemy(session, skill.caster, point);
      },
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      async onUse({ session, skill, affectedCells }) {
        await Promise.all(
          getAffectedEntities(affectedCells).map(entity => {
            purgeEntity(entity);
            entity.addModifier(vulnerable({ source: skill.caster }));
            return skill.caster.performAttack(entity);
          })
        );
      }
    }
  ]
};
