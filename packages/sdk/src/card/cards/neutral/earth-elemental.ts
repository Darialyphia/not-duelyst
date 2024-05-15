import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';

export const neutralEarthElemental: CardBlueprint = {
  id: 'earth-elemental',
  name: 'Neutral Earth Elemental',
  description: '',
  collectable: false,
  rarity: RARITIES.BASIC,
  factions: [null, null, null],
  spriteId: 'neutral_earth_elemental',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 4,
  attack: 2,
  maxHp: 7,
  speed: 3,
  range: 1,
  skills: []
};
