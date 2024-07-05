import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierSelfEventMixin } from '../../../modifier/mixins/self-event.mixin';
import { fearsome } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f2Butcher: CardBlueprint = {
  id: 'f2_butcher',
  name: 'F2 Butcher',
  description:
    '@Fearsome@.\nWhenever this attacks and destroys a unit, it can attack again.',
  collectable: true,
  rarity: RARITIES.LEGENDARY,
  faction: FACTIONS.F2,
  factions: { f2: 3 },
  spriteId: 'f2_imp_lord',
  kind: CARD_KINDS.MINION,
  cost: 5,
  attack: 5,
  maxHp: 5,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.FEARSOME],
  onPlay({ entity, session }) {
    entity.addModifier(fearsome({ source: entity }));
    entity.addModifier(
      createEntityModifier({
        visible: true,
        stackable: false,
        name: 'Butcher Warpath',
        description: 'Whenever this destroys a unit, it can attack again.',
        source: entity,
        mixins: [
          modifierSelfEventMixin({
            eventName: 'before_attack',
            duration: 999,
            listener([event], { attachedTo }) {
              const onDestroyed = () => {
                const currentMaxAttacks = attachedTo.maxAttacks;
                const remove = attachedTo.addInterceptor(
                  'maxAttacks',
                  () => currentMaxAttacks + 1
                );
                attachedTo.player.once('turn_end', remove);
              };
              event.target.on('before_destroy', onDestroyed);
              attachedTo.once('after_attack', () => {
                session.actionSystem.schedule(() => {
                  event.target.off('before_destroy', onDestroyed);
                });
              });
            }
          })
        ]
      })
    );
  }
};
