import { TRIBES } from '../../../utils/tribes';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f1Elemental: CardBlueprint = {
  id: 'f1_placeholder',
  name: 'F1 Lesser Elemental',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: true,
  faction: FACTIONS.F1,
  factions: { f1: 1 },
  spriteId: 'f1_placeholder',
  kind: CARD_KINDS.MINION,
  tribes: [TRIBES.ELEMENTAL],
  cost: 3,
  attack: 2,
  maxHp: 5,
  speed: 3,
  range: 1
};
