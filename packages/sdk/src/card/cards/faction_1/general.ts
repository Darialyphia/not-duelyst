import { config } from '../../../config';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { f1Wisp } from './wisp';
import { neutralAirElemental } from '../neutral/air-elemental';

export const f1General: CardBlueprint = {
  id: 'f1_general',
  name: 'F1 General',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: true,
  faction: FACTIONS.F1,
  factions: {},
  spriteId: 'f1_general',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: config.GENERAL_DEFAULT_ATTACK,
  maxHp: config.GENERAL_DEFAULT_HP,
  speed: config.GENERAL_DEFAULT_SPEED,
  range: 1,
  relatedBlueprintIds: [f1Wisp.id, neutralAirElemental.id]
};
