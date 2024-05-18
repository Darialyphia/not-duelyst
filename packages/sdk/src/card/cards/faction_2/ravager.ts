import { rush } from '../../../modifier/modifier-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f2Ravager: CardBlueprint = {
  id: 'f2_ravager',
  name: 'F2 Ravager',
  description: '@Rush@.',
  collectable: true,
  rarity: RARITIES.BASIC,
  factions: [FACTIONS.F2, null, null],
  spriteId: 'f2_horned_demon',
  kind: CARD_KINDS.MINION,
  cooldown: 4,
  initialCooldown: 0,
  cost: 4,
  attack: 4,
  maxHp: 5,
  speed: 3,
  range: 1,
  keywords: [],
  modifiers: [rush()],
  skills: []
};
