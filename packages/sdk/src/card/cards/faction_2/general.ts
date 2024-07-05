import { config } from '../../../config';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS } from '../../card-enums';

export const f2General: CardBlueprint = {
  id: 'f2_general',
  name: 'Kaleos Xaan',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: true,
  faction: FACTIONS.F2,
  spriteId: 'f2_general',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: config.GENERAL_DEFAULT_ATTACK,
  maxHp: config.GENERAL_DEFAULT_HP,
  speed: config.GENERAL_DEFAULT_SPEED,
  range: 1
};
