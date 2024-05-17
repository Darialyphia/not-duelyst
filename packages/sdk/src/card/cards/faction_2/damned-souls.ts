import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f2DamnedSouls: CardBlueprint = {
  id: 'f2_damned_souls',
  name: 'F2 Damned Souls',
  description: '',
  collectable: true,
  rarity: RARITIES.EPIC,
  factions: [FACTIONS.F2, FACTIONS.F2, null],
  spriteId: 'f2_flaming_skull',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 5,
  attack: 4,
  maxHp: 7,
  speed: 3,
  range: 1,
  keywords: [],
  async onPlay({ session, followup, entity }) {},
  skills: []
};
