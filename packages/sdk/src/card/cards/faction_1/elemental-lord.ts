import { KEYWORDS } from '../../../utils/keywords';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS } from '../../card-enums';
import { neutralAirElemental } from '../neutral/air-elemental';
import { neutralEarthElemental } from '../neutral/earth-elemental';
import { neutralFireElemental } from '../neutral/fire-elemental';
import { neutralWaterElemental } from '../neutral/water-elemental';

export const f1ElementalLord: CardBlueprint = {
  id: 'f1_elemental_lord',
  name: 'F1 Elemental Lord',
  description: '',
  collectable: true,
  rarity: RARITIES.LEGENDARY,
  faction: FACTIONS.F1,
  factions: { f1: 3 },
  spriteId: 'f1_elementalist',
  kind: CARD_KINDS.MINION,
  cost: 5,
  attack: 1,
  maxHp: 6,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.REGENERATION],
  relatedBlueprintIds: [
    neutralAirElemental.id,
    neutralEarthElemental.id,
    neutralFireElemental.id,
    neutralWaterElemental.id
  ]
};
