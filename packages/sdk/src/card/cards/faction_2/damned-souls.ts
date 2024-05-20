import { isNearbyEnemy } from '../../../entity/entity-utils';
import { lastWill, taunted, vulnerable } from '../../../modifier/modifier-utils';
import { isCastPoint, isSelf } from '../../../utils/targeting';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f2DamnedSouls: CardBlueprint = {
  id: 'f2_damned_souls',
  name: 'F2 Damned Souls',
  description: '@Last Will@: Deal 4 damage to all nearby units.',
  collectable: true,
  rarity: RARITIES.RARE,
  factions: [FACTIONS.F2, FACTIONS.F2, null],
  spriteId: 'f2_flaming_skull',
  kind: CARD_KINDS.MINION,
  cooldown: 4,
  initialCooldown: 0,
  cost: 5,
  attack: 4,
  maxHp: 3,
  speed: 2,
  range: 1,
  keywords: [],
  async onPlay({ session, entity }) {
    entity.addModifier(
      lastWill({
        source: entity,
        async handler() {
          await Promise.all(
            session.entitySystem
              .getNearbyEntities(entity.position)
              .map(nearby => entity.dealDamage(4, nearby))
          );
        }
      })
    );
  },
  skills: [
    {
      id: 'f2_damned_souls_skill1',
      name: 'F2 Damnes Souls Skill 1',
      description: '@Taunt@ a nearby enemy and give it @Vulnerable@ for one turn.',
      initialCooldown: 0,
      cooldown: 3,
      minTargetCount: 1,
      maxTargetCount: 1,
      iconId: 'taunt-skull',
      isTargetable(point, { skill, session }) {
        return isNearbyEnemy(session, skill.caster, point);
      },
      isInAreaOfEffect(point, options) {
        return isCastPoint(point, options.castPoints);
      },
      onUse({ session, skill }) {
        session.entitySystem.getNearbyEnemies(skill.caster).forEach(enemy => {
          enemy.addModifier(vulnerable({ source: skill.caster, duration: 1 }));
          enemy.addModifier(taunted({ duration: 1, source: skill.caster }));
        });
      }
    }
  ]
};
