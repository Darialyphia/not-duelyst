import { lastWill } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f2DamnedSouls: CardBlueprint = {
  id: 'f2_damned_souls',
  name: 'F2 Damned Souls',
  description: '@Last Will@: Deal 4 damage to all nearby enemies.',
  collectable: true,
  rarity: RARITIES.COMMON,
  faction: FACTIONS.F2,
  factions: { f2: 3 },
  spriteId: 'f2_flaming_skull',
  kind: CARD_KINDS.MINION,
  cost: 5,
  attack: 4,
  maxHp: 3,
  speed: 2,
  range: 1,
  keywords: [KEYWORDS.LAST_WILL],
  onPlay({ session, entity }) {
    entity.addModifier(
      lastWill({
        source: entity,
        handler() {
          session.entitySystem
            .getNearbyEntities(entity.position)
            .forEach(nearby => entity.isEnemy(nearby.id) && entity.dealDamage(4, nearby));
        }
      })
    );
  }
};
