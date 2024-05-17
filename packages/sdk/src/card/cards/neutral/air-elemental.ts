import { celerity, rush } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { TRIBES } from '../../../utils/tribes';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';

export const neutralAirElemental: CardBlueprint = {
  id: 'air-elemental',
  name: 'Neutral Air Elemental',
  description: '@Rush@\n.@Celerity@',
  collectable: false,
  rarity: RARITIES.BASIC,
  factions: [null, null, null],
  spriteId: 'neutral_air_elemental',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 3,
  attack: 2,
  maxHp: 5,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.RUSH, KEYWORDS.CELERITY],
  tribes: [TRIBES.ELEMENTAL],
  modifiers: [rush()],
  skills: [],
  onPlay({ entity }) {
    entity.addModifier(celerity({ source: entity }));
  }
};
