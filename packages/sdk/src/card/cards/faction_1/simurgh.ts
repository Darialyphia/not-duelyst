import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';
import { aura, flying, surge } from '../../../modifier/modifier-utils';

export const f1Simurgh: CardBlueprint = {
  id: 'f1_Simurgh',
  name: 'F1 Simurgh',
  description: '@Flying@.\n@Surge(1)@ @Aura@.',
  rarity: RARITIES.LEGENDARY,
  collectable: true,
  faction: FACTIONS.F1,
  factions: { f1: 4 },
  spriteId: 'f1_simurgh',
  kind: CARD_KINDS.MINION,
  cost: 7,
  attack: 4,
  maxHp: 10,
  speed: 4,
  range: 1,
  keywords: [KEYWORDS.FLYING, KEYWORDS.SURGE, KEYWORDS.AURA],
  onPlay({ entity }) {
    entity.addModifier(flying({ source: entity }));

    entity.addModifier(
      aura({
        source: entity,
        name: 'Amplify Magic',
        description: 'Nearby allies have @Surge@',
        keywords: [KEYWORDS.SURGE],
        onGainAura(affected) {
          if (affected.isAlly(entity.id)) {
            affected.addModifier(surge({ source: entity }));
          }
        },
        onLoseAura(affected) {
          if (affected.isAlly(entity.id)) {
            affected.removeModifier(KEYWORDS.SURGE.id);
          }
        }
      })
    );
  }
};
