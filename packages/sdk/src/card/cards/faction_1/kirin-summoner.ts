import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';

export const f1KirinSummoner: CardBlueprint = {
  id: 'f1_kirin_summoner',
  name: 'F1 Kirin Summoner',
  description: '',
  collectable: true,
  rarity: RARITIES.EPIC,
  faction: FACTIONS.F1,
  factions: { f1: 3 },
  spriteId: 'f1_kirin_summoner',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 3,
  maxHp: 5,
  speed: 3,
  range: 1,
  relatedBlueprintIds: ['f1_kirin'],
  keywords: [KEYWORDS.CALL_TO_ARMS]
};
