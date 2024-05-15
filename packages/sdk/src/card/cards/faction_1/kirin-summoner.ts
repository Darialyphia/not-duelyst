import { Vec3 } from '@game/shared';
import {
  getCellInFront,
  isAllyMinion,
  isEmpty,
  isEnemy
} from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { isWithinCells } from '../../../utils/targeting';
import { rush } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { f1Kirin } from './kirin';

export const f1KirinSummoner: CardBlueprint = {
  id: 'f1_kirin_summoner',
  name: 'F1 Kirin Summoner',
  description: '@Call to Arms@ : summon a @F1 Kirin@ on a nearby tile.',
  collectable: true,
  rarity: RARITIES.EPIC,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_kirin_summoner',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 5,
  attack: 1,
  maxHp: 9,
  speed: 3,
  range: 1,
  relatedBlueprintIds: ['f1_kirin'],
  keywords: [KEYWORDS.CALL_TO_ARMS],
  followup: {
    minTargetCount: 0,
    maxTargetCount: 1,
    isTargetable(point, { session, summonedPoint }) {
      return isEmpty(session, point) && isWithinCells(point, summonedPoint, 1);
    }
  },
  onPlay({ entity, followup }) {
    if (!followup[0]) return;

    const card = entity.player.generateCard('f1_kirin', entity.card.pedestalId);
    card.play({
      position: followup[0],
      targets: []
    });
  },
  skills: [
    {
      id: 'f1_kirin_summoner_skill1',
      cooldown: 3,
      name: 'Summon Kirin',
      description: 'Summoned a @F1 Kirin@ with @Rush@ on a nearby tile.',
      iconId: 'kirin',
      initialCooldown: 2,
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { session, skill }) {
        return isEmpty(session, point) && isWithinCells(point, skill.caster.position, 1);
      },
      isInAreaOfEffect() {
        return false;
      },
      onUse({ castPoints, skill }) {
        const card = skill.caster.player.generateCard(
          f1Kirin.id,
          skill.caster.card.pedestalId
        );

        card.modifiers.push(rush());
        card.play({
          position: castPoints[0],
          targets: []
        });
      }
    }
  ]
};
