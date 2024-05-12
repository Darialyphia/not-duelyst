import { Vec3 } from '@game/shared';
import { isAllyMinion, isEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f1Mage: CardBlueprint = {
  id: 'f1_mage',
  name: 'F1 Mage',
  description: '',
  collectable: true,
  rarity: RARITIES.RARE,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_mage',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 5,
  attack: 1,
  maxHp: 11,
  speed: 3,
  range: 1,
  skills: []
};
