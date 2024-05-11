import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-utils';
import { config } from '../../../config';

export const tutorialCat: CardBlueprint = {
  id: 'tutorial_cat',
  name: "Avan's cat",
  description: '',
  collectable: false,
  rarity: RARITIES.BASIC,
  factions: [null, null, null],
  spriteId: 'tutorial_cat',
  kind: CARD_KINDS.MINION,
  cooldown: 0,
  initialCooldown: 0,
  cost: 2,
  attack: 2,
  maxHp: 3,
  speed: 3,
  range: 1,
  skills: []
};
