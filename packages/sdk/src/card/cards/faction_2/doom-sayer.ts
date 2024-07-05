import { deathWatch, ranged } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { isWithinCells } from '../../../utils/targeting';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS } from '../../card-enums';

export const f2DoomSayer: CardBlueprint = {
  id: 'f2_doomsayer',
  name: 'F2 Doomsayer',
  description:
    '@Ranged(1)@.\n@Deathwatch@: Deal 1 damage to the enemy general if this is unit is up to 3 tiles away.',
  collectable: true,
  rarity: RARITIES.EPIC,
  faction: FACTIONS.F2,
  factions: { f2: 2 },
  spriteId: 'f2_doom_sayer',
  kind: CARD_KINDS.MINION,
  cost: 3,
  attack: 1,
  maxHp: 4,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.DEATHWATCH],
  onPlay({ entity }) {
    entity.addModifier(ranged({ range: 1, source: entity }));
    entity.addModifier(
      deathWatch({
        source: entity,
        handler(_entity) {
          if (!_entity.isGeneral && isWithinCells(entity.position, _entity.position, 3)) {
            entity.dealDamage(1, entity.player.opponent.general);
          }
        }
      })
    );
  }
};
