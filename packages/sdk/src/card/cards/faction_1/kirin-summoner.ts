import { isEmpty } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { isWithinCells } from '../../../utils/targeting';
import { rush } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { f1Kirin } from './kirin';

export const f1KirinSummoner: CardBlueprint = {
  id: 'f1_kirin_summoner',
  name: 'F1 Kirin Summoner',
  description: '',
  collectable: true,
  rarity: RARITIES.EPIC,
  faction: FACTIONS.F1,
  factions: { f1: 3 },
  spriteId: 'f1_kirin_summoner',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 3,
  maxHp: 5,
  speed: 3,
  range: 1,
  relatedBlueprintIds: ['f1_kirin'],
  keywords: [KEYWORDS.CALL_TO_ARMS],
  skills: [
    {
      id: 'f1_kirin_summoner_skill1',
      cooldown: 3,
      name: 'Summon Kirin',
      description: 'Summoned a @F1 Kirin@ on a nearby tile.',
      iconId: 'kirin',
      initialCooldown: 0,
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { session, skill }) {
        return isEmpty(session, point) && isWithinCells(point, skill.caster.position, 1);
      },
      isInAreaOfEffect() {
        return false;
      },
      onUse({ castPoints, skill }) {
        const card = skill.caster.player.generateCard({
          blueprintId: f1Kirin.id,
          pedestalId: skill.caster.card.pedestalId
        });

        card.play({
          position: castPoints[0],
          targets: []
        });
      }
    }
  ]
};
