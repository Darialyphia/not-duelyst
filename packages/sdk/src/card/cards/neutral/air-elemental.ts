import { celerity } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { TRIBES } from '../../../utils/tribes';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';

export const neutralAirElemental: CardBlueprint = {
  id: 'air-elemental',
  name: 'Neutral Air Elemental',
  description: '@Celerity@',
  collectable: false,
  rarity: RARITIES.BASIC,
  faction: null,
  factions: {},
  spriteId: 'neutral_air_elemental',
  kind: CARD_KINDS.MINION,
  cost: 3,
  attack: 2,
  maxHp: 4,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.CELERITY],
  tribes: [TRIBES.ELEMENTAL],
  skills: [],
  onPlay({ entity }) {
    entity.addModifier(celerity({ source: entity }));
  }
};
