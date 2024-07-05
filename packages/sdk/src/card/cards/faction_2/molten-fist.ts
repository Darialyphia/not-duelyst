import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierSelfEventMixin } from '../../../modifier/mixins/self-event.mixin';
import { burn, fury } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS } from '../../card-enums';

export const f2MoltenFist: CardBlueprint = {
  id: 'f2_molten_first',
  name: 'F2 Molten Fist',
  description: '@Fury@.\nAfter attacking a minion, inflict @Burn(1)@ to it',
  collectable: true,
  rarity: RARITIES.EPIC,
  faction: FACTIONS.F2,
  factions: { f2: 4 },
  spriteId: 'f2_fire_fist',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 3,
  maxHp: 6,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.BURN],
  onPlay({ entity }) {
    entity.addModifier(fury({ source: entity }));

    entity.addModifier(
      createEntityModifier({
        source: entity,
        stackable: false,
        visible: false,
        mixins: [
          modifierSelfEventMixin({
            eventName: 'after_attack',
            listener([{ target }]) {
              if (target.isGeneral) return;
              target.addModifier(burn({ source: entity }));
            }
          })
        ]
      })
    );
  }
};
