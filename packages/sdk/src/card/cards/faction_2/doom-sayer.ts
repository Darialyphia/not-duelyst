import { deathWatch, ranged, surge } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { isCastPoint, isSelf, isWithinCells } from '../../../utils/targeting';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS } from '../../card-enums';

export const f2DoomSayer: CardBlueprint = {
  id: 'f2_doomsayer',
  name: 'F2 Doomsayer',
  description:
    '@Ranged(1)@.\n@Deathwatch@: Deal 1 damage to the enemy general if this is unit is up to 3 tiles away.',
  collectable: true,
  rarity: RARITIES.EPIC,
  faction: FACTIONS.F2,
  factions: { f2: 2 },
  spriteId: 'f2_doom_sayer',
  kind: CARD_KINDS.MINION,
  cost: 3,
  attack: 1,
  maxHp: 4,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.DEATHWATCH],
  async onPlay({ entity }) {
    entity.addModifier(ranged({ range: 1, source: entity }));
    entity.addModifier(
      deathWatch({
        source: entity,
        async handler(_entity) {
          if (!_entity.isGeneral && isWithinCells(entity.position, _entity.position, 3)) {
            await entity.dealDamage(1, entity.player.opponent.general);
          }
        }
      })
    );
  },
  skills: [
    {
      id: 'f2_doomsayer_skill1',
      name: 'F2 Doomsayer Skill 1',
      description: 'Gain @Surge(1)@.',
      initialCooldown: 2,
      cooldown: 3,
      iconId: 'focus',
      minTargetCount: 1,
      maxTargetCount: 1,
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
