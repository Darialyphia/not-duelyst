import { rooted } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { TRIBES } from '../../../utils/tribes';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';

export const neutralEarthElemental: CardBlueprint = {
  id: 'earth-elemental',
  name: 'Neutral Earth Elemental',
  description: '@Call to Arms@: @Root@ nearby enemies for one turn.',
  collectable: false,
  rarity: RARITIES.BASIC,
  faction: null,
  factions: {},
  spriteId: 'neutral_earth_elemental',
  kind: CARD_KINDS.MINION,
  cost: 3,
  attack: 2,
  maxHp: 6,
  speed: 2,
  range: 1,
  keywords: [KEYWORDS.ROOTED, KEYWORDS.CALL_TO_ARMS],
  tribes: [TRIBES.ELEMENTAL],
  onPlay({ session, entity }) {
    session.entitySystem.getNearbyEnemies(entity).forEach(enemy => {
      enemy.addModifier(rooted({ source: entity, duration: 1 }));
    });
  },
  skills: []
};
