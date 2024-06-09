import { Vec3 } from '@game/shared';
import { isEmpty, isEnemy } from '../../../entity/entity-utils';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierSelfEventMixin } from '../../../modifier/mixins/self-event.mixin';
import { fearsome, vulnerable } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { isWithinCells } from '../../../utils/targeting';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f2Butcher: CardBlueprint = {
  id: 'f2_butcher',
  name: 'F2 Butcher',
  description:
    '@Fearsome@.\nWhenever this attacks and destroys a unit, it can attack again.',
  collectable: true,
  rarity: RARITIES.LEGENDARY,
  factions: { f2: 3 },
  spriteId: 'f2_imp_lord',
  kind: CARD_KINDS.MINION,
  cost: 5,
  attack: 3,
  maxHp: 6,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.FEARSOME],
  async onPlay({ entity, session }) {
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
  },
  skills: [
    {
      id: 'f2_butcher_skill1',
      name: 'F2 Butcher Skill 1',
      description: 'Teleport nearby and enemy, and give it @Vulnerable@ for 2 turns.',
      initialCooldown: 1,
      cooldown: 3,
      iconId: 'teleport-red',
      minTargetCount: 2,
      maxTargetCount: 2,
      isTargetable(point, { session, skill, castPoints }) {
        if (castPoints.length === 0) {
          return (
            isWithinCells(skill.caster.position, point, 4) &&
            isEnemy(
              session,
              session.entitySystem.getEntityAt(point)?.id,
              skill.caster.player.id
            )
          );
        }

        return isEmpty(session, point) && isWithinCells(castPoints[0], point, 1);
      },
      isInAreaOfEffect(point, { castPoints }) {
        return !!castPoints[0] && Vec3.fromPoint3D(point).equals(castPoints[0]);
      },
      async onUse({ skill, session, castPoints }) {
        await skill.caster.move([castPoints[0]]);
        session.entitySystem
          .getEntityAt(castPoints[1])!
          .addModifier(vulnerable({ source: skill.caster, duration: 2 }));
      }
    }
  ]
};
