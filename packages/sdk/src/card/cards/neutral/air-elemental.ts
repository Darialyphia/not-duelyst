import { rush } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';

export const neutralAirElemental: CardBlueprint = {
  id: 'air-elemental',
  name: 'Neutral Air Elemental',
  description: '@Rush@.',
  collectable: false,
  rarity: RARITIES.BASIC,
  factions: [null, null, null],
  spriteId: 'neutral_air_elemental',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 4,
  attack: 2,
  maxHp: 7,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.RUSH],
  modifiers: [rush()],
  skills: []
};
