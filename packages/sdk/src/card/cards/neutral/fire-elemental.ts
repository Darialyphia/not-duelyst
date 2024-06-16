import { aura, burn } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { TRIBES } from '../../../utils/tribes';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';

export const neutralFireElemental: CardBlueprint = {
  id: 'fire-elemental',
  name: 'Neutral Fire Elemental',
  description: '@Burn(2)@ minions @Aura@',
  collectable: false,
  rarity: RARITIES.BASIC,
  faction: null,
  factions: {},
  spriteId: 'neutral_fire_elemental',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 2,
  maxHp: 4,
  speed: 3,
  range: 1,
  skills: [],
  keywords: [KEYWORDS.BURN, KEYWORDS.AURA],
  tribes: [TRIBES.ELEMENTAL],
  onPlay({ entity }) {
    entity.addModifier(
      aura({
        source: entity,
        name: 'Immolaion',
        description: 'Nearby enemies have @Burn(1)@.',
        onGainAura(affected) {
          if (affected.isAlly(entity.id)) return;
          affected.addModifier(burn({ source: entity, stacks: 2 }));
        },
        onLoseAura(affected) {
          affected.removeModifier(KEYWORDS.BURN.id, 1);
        }
      })
    );
  }
};
