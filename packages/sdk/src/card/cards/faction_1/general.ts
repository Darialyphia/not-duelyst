import { Vec3 } from '@game/shared';
import { config } from '../../../config';
import { isEnemy, isAllyMinion } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f1General: CardBlueprint = {
  id: 'f1_general',
  name: 'F1 General',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: true,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_general',
  kind: CARD_KINDS.GENERAL,
  cooldown: 0,
  initialCooldown: 0,
  cost: 0,
  attack: config.GENERAL_DEFAULT_ATTACK,
  maxHp: config.GENERAL_DEFAULT_HP,
  speed: config.GENERAL_DEFAULT_SPEED,
  range: 1,
  skills: []
};
