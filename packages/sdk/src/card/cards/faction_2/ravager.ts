import { rooted, rush } from '../../../modifier/modifier-utils';
import {
  getAffectedEntities,
  getDirection,
  getFarthestWalkable,
  isAxisAligned
} from '../../../utils/targeting';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { getNearest } from '../../../entity/entity-utils';
import { KEYWORDS } from '../../../utils/keywords';

export const f2Ravager: CardBlueprint = {
  id: 'f2_ravager',
  name: 'F2 Ravager',
  description: '@Rush@.',
  collectable: true,
  rarity: RARITIES.BASIC,
  faction: FACTIONS.F2,
  factions: { f2: 3 },
  spriteId: 'f2_horned_demon',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 4,
  maxHp: 5,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.RUSH],
  modifiers: [rush()],
  skills: [
    {
      id: 'f2_ravager_skill1',
      name: 'F2 Ravager Skil 1',
      description:
        'Dash in target direction. Deal 2 damage and @Root@ the first unit met.',
      initialCooldown: 0,
      cooldown: 2,
      iconId: 'teleport-red',
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { skill }) {
        return (
          isAxisAligned(point, skill.caster.position) &&
          point.z === skill.caster.position.z
        );
      },
      isInAreaOfEffect(point, { skill, castPoints, session }) {
        if (!isAxisAligned(point, skill.caster.position)) return false;

        const [castPoint] = castPoints;
        if (!castPoint) return false;

        if (point.z !== castPoint.z) return false;

        const direction = getDirection(skill.caster.position, castPoint);
        const nearest = getNearest(session, direction, skill.caster.position);
        if (!nearest) return false;

        const entity = session.entitySystem.getEntityAt(point);
        if (!entity) return false;

        return nearest.equals(entity);
      },
      onUse({ skill, affectedCells, session, castPoints }) {
        const direction = getDirection(skill.caster.position, castPoints[0]);
        const destination = getFarthestWalkable(
          session,
          direction,
          skill.caster.position
        );
        if (!destination) return;

        skill.caster.move([destination.position.serialize()]);
        getAffectedEntities(affectedCells).forEach(entity => {
          skill.caster.dealDamage(2, entity);
          entity.addModifier(rooted({ source: skill.caster, duration: 1 }));
        });
      }
    }
  ]
};
