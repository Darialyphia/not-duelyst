import { config } from '../../../config';
import { isEmpty, isEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS, FACTION_IDS } from '../../card-enums';
import {
  getAffectedEntities,
  isCastPoint,
  isWithinCells
} from '../../../utils/targeting';
import { KEYWORDS } from '../../../utils/keywords';
import { purgeEntity, rush } from '../../../modifier/modifier-utils';
import { f1Wisp } from './wisp';
import { neutralAirElemental } from '../neutral/air-elemental';

export const f1General: CardBlueprint = {
  id: 'f1_general',
  name: 'F1 General',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: true,
  faction: FACTIONS.F1,
  factions: {},
  spriteId: 'f1_general',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: config.GENERAL_DEFAULT_ATTACK,
  maxHp: config.GENERAL_DEFAULT_HP,
  speed: config.GENERAL_DEFAULT_SPEED,
  range: 1,
  relatedBlueprintIds: [f1Wisp.id, neutralAirElemental.id],
  skills: [
    {
      id: 'f1_general_skill',
      name: 'Summon Wisp',
      description: `Summon a @${f1Wisp.name}@ with @${KEYWORDS.RUSH.name}@ nearby your general. It dies at the end of the turn.`,
      cooldown: 2,
      initialCooldown: 0,
      iconId: 'summon-wisp',
      keywords: [KEYWORDS.RUSH],
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { session, skill }) {
        return isEmpty(session, point) && isWithinCells(skill.caster.position, point, 1);
      },
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      onUse({ session, skill, castPoints }) {
        const card = skill.caster.player.generateCard({
          blueprintId: f1Wisp.id,
          pedestalId: skill.caster.card.pedestalId,
          modifiers: [rush()]
        });

        const entity = card.play({
          position: castPoints[0],
          targets: []
        });

        session.once('player:turn_end', () => {
          entity.destroy();
        });
      }
    },
    {
      id: 'f1_general_skill2',
      name: 'F1 General 1 Skill 2',
      description: `@Purge@ a nearby enemy, then deal 2 damage to it.`,
      cooldown: 4,
      initialCooldown: 3,
      runes: {
        f1: 3
      },
      iconId: 'spear1',
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { session, skill }) {
        return (
          isWithinCells(skill.caster.position, point, 1) &&
          isEnemy(
            session,
            session.entitySystem.getEntityAt(point)?.id,
            skill.caster.player.id
          )
        );
      },
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      onUse({ skill, affectedCells }) {
        getAffectedEntities(affectedCells).forEach(target => {
          purgeEntity(target);
          skill.caster.dealDamage(2, target, { isAbilityDamage: true });
        });
      }
    }
  ]
};
