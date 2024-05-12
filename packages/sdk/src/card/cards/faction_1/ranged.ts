import { Vec3 } from '@game/shared';
import { isAllyMinion } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f1Ranged: CardBlueprint = {
  id: 'f1_ranged',
  name: 'F1 Ranged',
  description: '',
  collectable: true,
  rarity: RARITIES.BASIC,
  factions: [FACTIONS.F1, null, null],
  spriteId: 'f1_ranged',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 3,
  attack: 2,
  maxHp: 5,
  speed: 2,
  range: 1,
  skills: []
};
