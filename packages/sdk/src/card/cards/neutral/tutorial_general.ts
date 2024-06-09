import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS } from '../../card-enums';
import { config } from '../../../config';

export const tutorialGeneral: CardBlueprint = {
  id: 'tutorial_general',
  name: 'Instructor Avan',
  description: '',
  collectable: false,
  rarity: RARITIES.BASIC,
  faction: null,
  factions: {},
  spriteId: 'tutorial_general',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: config.GENERAL_DEFAULT_ATTACK,
  maxHp: 14,
  speed: config.GENERAL_DEFAULT_SPEED,
  range: 1,
  skills: []
};
