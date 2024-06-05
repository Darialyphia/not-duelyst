import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const tutorialCat: CardBlueprint = {
  id: 'tutorial_cat',
  name: "Avan's cat",
  description: '',
  collectable: false,
  rarity: RARITIES.BASIC,
  factions: [null, null, null],
  spriteId: 'tutorial_cat',
  kind: CARD_KINDS.MINION,
  cost: 2,
  attack: 2,
  maxHp: 3,
  speed: 3,
  range: 1,
  skills: []
};
