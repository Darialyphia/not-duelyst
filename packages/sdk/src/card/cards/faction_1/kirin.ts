import { Vec3 } from '@game/shared';
import { isAllyMinion, isEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';
import { flying, ranged, rush } from '../../../modifier/modifier-utils';

export const f1Kirin: CardBlueprint = {
  id: 'f1_kirin',
  name: 'F1 Kirin',
  description: '@Flying@.\n@Ranged(1)@.',
  collectable: false,
  rarity: RARITIES.BASIC,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_kirin',
  kind: CARD_KINDS.MINION,
  cooldown: 0,
  initialCooldown: 0,
  cost: 0,
  attack: 2,
  maxHp: 4,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.FLYING, KEYWORDS.RANGED],
  onPlay({ entity }) {
    entity.addModifier(flying({ source: entity }));
    entity.addModifier(ranged({ source: entity, range: 1 }));
  },
  skills: []
};
