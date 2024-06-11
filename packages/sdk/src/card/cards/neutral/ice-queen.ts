import { isNearbyEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';
import { getAffectedEntities, isSelf } from '../../../utils/targeting';
import { frozen } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';

export const neutralIceQueen: CardBlueprint = {
  id: 'neutral_ice_queen',
  name: 'Neutral Ice Queen',
  description: '',
  collectable: true,
  rarity: RARITIES.EPIC,
  faction: null,
  factions: { multicolor: 4 },
  spriteId: 'neutral_ice_queen',
  kind: CARD_KINDS.MINION,
  cost: 5,
  attack: 2,
  maxHp: 5,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.FROZEN],

  skills: [
    {
      id: 'neutral_ice_queen_skill_1',
      cooldown: 2,
      description: 'Deal 1 damage to nearby enemies then @Freeze@ them for 1 turn.',
      name: 'Test skill',
      iconId: 'ice2',
      initialCooldown: 0,
      minTargetCount: 0,
      maxTargetCount: 1,
      keywords: [KEYWORDS.FROZEN],
      isTargetable(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      isInAreaOfEffect(point, { session, skill }) {
        return isNearbyEnemy(session, skill.caster, point);
      },
      onUse({ skill, affectedCells }) {
        getAffectedEntities(affectedCells).forEach(entity => {
          skill.caster.dealDamage(1, entity);
          entity.addModifier(frozen({ duration: 1, source: skill.caster }));
        });
      }
    }
  ]
};
