import { Vec3 } from '@game/shared';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { isAxisAligned, isSelf, isWithinCells } from '../../../utils/targeting';
import { nimble } from '../../../modifier/modifier-utils';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierEntityInterceptorMixin } from '../../../modifier/mixins/entity-interceptor.mixin';
import { KEYWORDS } from '../../../utils/keywords';

export const f1Dancer: CardBlueprint = {
  id: 'f1_dancer',
  name: 'F1 Dancer',
  description: '',
  collectable: true,
  rarity: RARITIES.EPIC,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_dancer',
  kind: CARD_KINDS.MINION,
  cooldown: 6,
  initialCooldown: 0,
  cost: 5,
  attack: 3,
  maxHp: 12,
  speed: 3,
  range: 1,
  skills: [
    {
      id: 'f1_dancer_skill_1',
      cooldown: 2,
      description: 'Gain @Nimble@ and +1 speed for 3 turns',
      name: 'Battle dance',
      iconId: 'chakram-dance',
      initialCooldown: 0,
      minTargetCount: 0,
      maxTargetCount: 1,
      isTargetable(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      isInAreaOfEffect(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      keywords: [KEYWORDS.NIMBLE],
      onUse({ skill, affectedCells }) {
        skill.caster.addModifier(nimble({ source: skill.caster, duration: 3 }));
        skill.caster.addModifier(
          createEntityModifier({
            source: skill.caster,
            visible: false,
            stackable: false,
            mixins: [
              modifierEntityInterceptorMixin({
                key: 'speed',
                interceptor: () => val => val + 1,
                duration: 3,
                keywords: []
              })
            ]
          })
        );
      }
    }
  ]
};
