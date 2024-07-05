import { isDefined } from '@game/shared';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';
import { barrier, celerity, flying, fury, tough } from '../../../modifier/modifier-utils';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierSelfEventMixin } from '../../../modifier/mixins/self-event.mixin';

export const f1Djinn: CardBlueprint = {
  id: 'f1_djinn',
  name: 'F1 Djinn',
  description:
    '@Flying@\n.When this attacks, grant @Celerity@, @Fury@, @Tough@ or @Barrier@ to your general for 2 turns.',
  collectable: true,
  rarity: RARITIES.RARE,
  faction: FACTIONS.F1,
  factions: {
    f1: 3
  },
  spriteId: 'f1_djinn',
  kind: CARD_KINDS.MINION,
  cost: 6,
  attack: 3,
  maxHp: 8,
  speed: 4,
  range: 1,
  keywords: [
    KEYWORDS.FLYING,
    KEYWORDS.CELERITY,
    KEYWORDS.FURY,
    KEYWORDS.TOUGH,
    KEYWORDS.BARRIER
  ],
  onPlay({ session, entity }) {
    entity.addModifier(flying({ source: entity }));
    entity.addModifier(
      createEntityModifier({
        source: entity,
        stackable: false,
        visible: true,
        name: "Djinn's Wish",
        description: 'When this unit attacks, grant a positive effect to your general',
        mixins: [
          modifierSelfEventMixin({
            eventName: 'after_attack',
            listener() {
              const general = entity.player.general;
              const modifiers = [
                general.hasKeyword(KEYWORDS.CELERITY)
                  ? null
                  : celerity({ source: entity, duration: 2 }),
                general.hasKeyword(KEYWORDS.FURY)
                  ? null
                  : fury({ source: entity, duration: 2 }),
                general.hasKeyword(KEYWORDS.TOUGH)
                  ? null
                  : tough({ source: entity, duration: 2 }),
                general.hasKeyword(KEYWORDS.BARRIER)
                  ? null
                  : barrier({ source: entity, duration: 2 })
              ].filter(isDefined);

              const index = session.rngSystem.nextInt(modifiers.length - 1);
              general.addModifier(modifiers[index]);
            }
          })
        ]
      })
    );
  }
};
