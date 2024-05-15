import { aura, burn } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';

export const neutralFireElemental: CardBlueprint = {
  id: 'fire-elemental',
  name: 'Neutral Fire Elemental',
  description: '@Burn(2)@ @Aura@',
  collectable: false,
  rarity: RARITIES.BASIC,
  factions: [null, null, null],
  spriteId: 'neutral_fire_elemental',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 4,
  attack: 2,
  maxHp: 7,
  speed: 3,
  range: 1,
  skills: [],
  keywords: [KEYWORDS.BURN, KEYWORDS.AURA],
  onPlay({ entity }) {
    entity.addModifier(
      aura({
        source: entity,
        name: 'Immolaion',
        description: 'Nearby enemies have @Burn(2)@.',
        onGainAura(affected) {
          if (affected.isAlly(entity.id)) return;
          affected.addModifier(burn({ source: entity, stacks: 2 }));
        },
        onLoseAura(affected) {
          affected.removeModifier(KEYWORDS.BURN.id, 2);
        }
      })
    );
  }
};
