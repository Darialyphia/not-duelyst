import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { aura, structure, surge } from '../../../modifier/modifier-utils';
import { isWithinCells } from '../../../utils/targeting';
import { KEYWORDS } from '../../../utils/keywords';

export const f1Structure: CardBlueprint = {
  id: 'f1_ranged',
  name: 'F1 Structure',
  description: '@Structure@.\n@Surge(1)@ @Aura@',
  collectable: true,
  rarity: RARITIES.BASIC,
  faction: FACTIONS.F1,
  factions: { f1: 1 },
  spriteId: 'f1_ranged',
  kind: CARD_KINDS.MINION,
  cost: 2,
  attack: 0,
  maxHp: 6,
  speed: 0,
  range: 1,
  keywords: [KEYWORDS.STRUCTURE],
  onPlay({ entity }) {
    entity.addModifier(structure(entity));

    entity.addModifier(
      aura({
        source: entity,
        name: 'Amplify Magic',
        description: 'Nearby allies have @Surge@',
        isElligible(target, source) {
          return (
            isWithinCells(target.position, source.position, 1) && target.isAlly(source.id)
          );
        },
        onGainAura(affected) {
          affected.addModifier(surge({ source: entity }));
        },
        onLoseAura(affected) {
          affected.removeModifier(KEYWORDS.SURGE.id);
        }
      })
    );
  }
};
