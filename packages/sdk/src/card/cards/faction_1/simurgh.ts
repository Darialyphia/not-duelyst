import { isEmpty } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import {
  getAffectedEntities,
  isAxisAligned,
  isWithinCells
} from '../../../utils/targeting';
import { KEYWORDS } from '../../../utils/keywords';
import {
  aura,
  celerity,
  flying,
  purgeEntity,
  silenced,
  surge
} from '../../../modifier/modifier-utils';
import { TERRAINS } from '../../../board/board-utils';

export const f1Simurgh: CardBlueprint = {
  id: 'f1_Simurgh',
  name: 'F1 Simurgh',
  description: '@Flying@.\n@Celerity@.\n@Surge(1)@ @Aura@.',
  rarity: RARITIES.LEGENDARY,
  collectable: true,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_simurgh',
  kind: CARD_KINDS.MINION,
  cooldown: 6,
  initialCooldown: 0,
  cost: 7,
  attack: 4,
  maxHp: 12,
  speed: 4,
  range: 1,
  keywords: [KEYWORDS.FLYING, KEYWORDS.CELERITY, KEYWORDS.SURGE, KEYWORDS.AURA],
  onPlay({ entity }) {
    entity.addModifier(flying({ source: entity }));
    entity.addModifier(celerity({ source: entity }));

    entity.addModifier(
      aura({
        source: entity,
        name: 'Amplify Magic',
        description: 'Nearby allies have @Surge@',
        keywords: [KEYWORDS.SURGE],
        onGainAura(affected) {
          if (affected.isAlly(entity.id)) {
            affected.addModifier(surge({ source: entity }));
          }
        },
        onLoseAura(affected) {
          if (affected.isAlly(entity.id)) {
            affected.removeModifier(KEYWORDS.SURGE.id);
          }
        }
      })
    );
  },
  skills: [
    {
      id: 'f1_simurgh_skill1',
      name: 'Simurgh Skill 1',
      description:
        'Move to a tile, Dealing 2 damage to enemies it passes through, leaving a trail of Burning Ground.',
      iconId: 'simurgh',
      cooldown: 2,
      initialCooldown: 0,
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { session, skill }) {
        return isEmpty(session, point) && isAxisAligned(point, skill.caster.position);
      },
      isInAreaOfEffect(point, { session, castPoints, skill }) {
        const [castPoint] = castPoints;
        if (!castPoint) return false;

        const caster = skill.caster.position;

        if (castPoint.x === caster.x) {
          if (point.x !== caster.x) return false;

          return castPoint.y > caster.y
            ? point.y > skill.caster.position.y && point.y < castPoint.y
            : point.y < skill.caster.position.y && point.y > castPoint.y;
        } else if (castPoint.y === caster.y) {
          if (point.y !== caster.y) return false;

          return castPoint.x > skill.caster.position.x
            ? point.x > skill.caster.position.x && point.x < castPoint.x
            : point.x < skill.caster.position.x && point.x > castPoint.x;
        } else {
          return false;
        }
      },
      async onUse({ affectedCells, skill, castPoints }) {
        await skill.caster.move([castPoints[0]], true);
        getAffectedEntities(affectedCells).forEach(entity => {
          if (skill.caster.isAlly(entity.id)) return;
          skill.caster.dealDamage(2, entity);
        });
        affectedCells.forEach(cell => {
          if (cell.terrain === TERRAINS.GROUND) {
            cell.addTile('burning_ground');
          }
        });
      }
    },
    {
      id: 'f1_simurgh_skill2',
      name: 'Simurgh Skill 2',
      description: '@Purge@ and @Silence@ units in a 3x3 area for 2 turns.',
      iconId: 'lightning3-green',
      cooldown: 3,
      initialCooldown: 0,
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { skill }) {
        return isWithinCells(skill.caster.position, point, 4);
      },
      isInAreaOfEffect(point, { castPoints }) {
        const [castPoint] = castPoints;
        if (!castPoint) return false;

        return isWithinCells(castPoint, point, 1);
      },
      onUse({ skill, affectedCells }) {
        getAffectedEntities(affectedCells).forEach(entity => {
          purgeEntity(entity);
          entity.addModifier(silenced({ source: skill.caster, duration: 2 }));
        });
      }
    }
  ]
};
