import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f2DoomSayer: CardBlueprint = {
  id: 'f2_doomsayer',
  name: 'F2 Doomsayer',
  description: '',
  collectable: true,
  rarity: RARITIES.RARE,
  factions: [FACTIONS.F2, null, null],
  spriteId: 'f2_doom_sayer',
  kind: CARD_KINDS.MINION,
  cooldown: 4,
  initialCooldown: 0,
  cost: 3,
  attack: 1,
  maxHp: 6,
  speed: 3,
  range: 1,
  keywords: [],
  async onPlay({ session, followup, entity }) {},
  skills: []
};
