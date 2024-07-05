import { config } from '../../../config';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f1TutorialGeneral: CardBlueprint = {
  id: 'f1_tutorial_general',
  name: 'F1 General',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: false,
  faction: FACTIONS.F1,
  factions: {},
  spriteId: 'f1_general',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: config.GENERAL_DEFAULT_ATTACK,
  maxHp: 25,
  speed: config.GENERAL_DEFAULT_SPEED,
  range: 1
};
