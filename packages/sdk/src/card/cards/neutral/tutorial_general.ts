import { Vec3 } from '@game/shared';
import { isAllyMinion } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-utils';
import { config } from '../../../config';

export const neutralTank: CardBlueprint = {
  id: 'tutorial_general',
  name: 'Instructor Avan',
  description: '',
  rarity: RARITIES.BASIC,
  factions: [null, null, null],
  spriteId: 'tutorial_general',
  kind: CARD_KINDS.GENERAL,
  cooldown: 0,
  initialCooldown: 0,
  cost: 0,
  attack: config.GENERAL_DEFAULT_ATTACK,
  maxHp: 12,
  speed: config.GENERAL_DEFAULT_SPEED,
  range: 1,
  skills: []
};
