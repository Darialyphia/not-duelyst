import { KEYWORDS } from '../../../utils/keywords';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { f2Imp } from './imp';

export const f2PitLord: CardBlueprint = {
  id: 'f2_pit_lord',
  name: 'F2 Pit Lord',
  description: `Allied @${f2Imp.name} have @Rush@.`,
  collectable: true,
  rarity: RARITIES.RARE,
  factions: [FACTIONS.F2, FACTIONS.F2, null],
  spriteId: 'f2_pit_lord',
  kind: CARD_KINDS.MINION,
  cooldown: 3,
  initialCooldown: 0,
  cost: 2,
  attack: 2,
  maxHp: 6,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.RUSH],
  async onPlay({ followup, entity }) {
    console.log('TODO');
  },
  skills: []
};
