import { Vec3 } from '@game/shared';
import { isAllyMinion, isEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f1Kirin: CardBlueprint = {
  id: 'f1_kirin',
  name: 'F1 Kirin',
  description: '',
  collectable: true,
  rarity: RARITIES.LEGENDARY,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_kirin',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 4,
  attack: 2,
  maxHp: 10,
  speed: 3,
  range: 1,
  skills: []
};
