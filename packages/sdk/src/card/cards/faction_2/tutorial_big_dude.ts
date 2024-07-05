import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f2TutorialBigDude: CardBlueprint = {
  id: 'f2_tutorial_big_dude',
  name: 'F2 Tutorial Big Dude',
  description: '',
  collectable: false,
  rarity: RARITIES.BASIC,
  faction: FACTIONS.F2,
  factions: { f2: 2 },
  spriteId: 'tutorial_big_dude',
  kind: CARD_KINDS.MINION,
  cost: 6,
  attack: 4,
  maxHp: 10,
  speed: 3,
  range: 1
};
