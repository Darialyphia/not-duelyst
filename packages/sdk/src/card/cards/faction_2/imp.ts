import { isEmpty } from '../../../entity/entity-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { isWithinCells } from '../../../utils/targeting';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f2Imp: CardBlueprint = {
  id: 'f2_imp',
  name: 'F2 Imp',
  description: '@Call to Arms@: @Summon@ an @F2 Imp@ on a nearby tile.',
  collectable: true,
  rarity: RARITIES.BASIC,
  factions: [FACTIONS.F2, null, null],
  spriteId: 'f2_imp',
  kind: CARD_KINDS.MINION,
  cooldown: 3,
  initialCooldown: 0,
  cost: 2,
  attack: 2,
  maxHp: 1,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.CALL_TO_ARMS, KEYWORDS.SUMMON],
  followup: {
    minTargetCount: 0,
    maxTargetCount: 1,
    isTargetable(point, { session, summonedPoint }) {
      return isEmpty(session, point) && isWithinCells(summonedPoint, point, 1);
    }
  },
  async onPlay({ followup, entity }) {
    const [point] = followup;
    if (!point) return;

    const card = entity.player.generateCard({
      blueprintId: f2Imp.id,
      pedestalId: entity.card.pedestalId
    });
    await card.play({
      position: point,
      targets: []
    });
  },
  skills: []
};
