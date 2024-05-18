import { deathWatch, ranged, surge } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { isCastPoint, isSelf } from '../../../utils/targeting';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f2DoomSayer: CardBlueprint = {
  id: 'f2_doomsayer',
  name: 'F2 Doomsayer',
  description: '@Deathwatch@: Deal 1 damage to the enemy general.',
  collectable: true,
  rarity: RARITIES.RARE,
  factions: [FACTIONS.F2, null, null],
  spriteId: 'f2_doom_sayer',
  kind: CARD_KINDS.MINION,
  cooldown: 4,
  initialCooldown: 0,
  cost: 3,
  attack: 1,
  maxHp: 6,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.DEATHWATCH],
  async onPlay({ session, followup, entity }) {
    entity.addModifier(
      deathWatch({
        source: entity,
        handler() {
          entity.dealDamage(1, entity.player.opponent.general);
        }
      })
    );
  },
  skills: [
    {
      id: 'f2_doomsayer_skill1',
      name: 'F2 Doomsayer Skill 1',
      description: 'Gain @Surge(1)@.',
      initialCooldown: 0,
      cooldown: 3,
      iconId: 'focus',
      minTargetCount: 1,
      maxTargetCount: 2,
      isTargetable(point, { skill, session }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      isInAreaOfEffect(point, options) {
        return isCastPoint(point, options.castPoints);
      },
      onUse({ skill }) {
        skill.caster.addModifier(surge({ source: skill.caster }));
      }
    }
  ]
};
