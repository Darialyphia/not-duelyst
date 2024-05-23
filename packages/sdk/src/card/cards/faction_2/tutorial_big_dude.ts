import { Vec3 } from '@game/shared';
import { isAlly, isAllyMinion, isEnemy } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import {
  cone,
  getAffectedEntities,
  isAxisAligned,
  isCastPoint,
  isSelf,
  isWithinCells
} from '../../../utils/targeting';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierEntityInterceptorMixin } from '../../../modifier/mixins/entity-interceptor.mixin';

export const f2TutorialBigDude: CardBlueprint = {
  id: 'f2_tutorial_big_dude',
  name: 'F2 Tutorial Big Dude',
  description: '',
  collectable: false,
  rarity: RARITIES.BASIC,
  factions: [FACTIONS.F2, FACTIONS.F2, null],
  spriteId: 'tutorial_big_dude',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 6,
  attack: 4,
  maxHp: 10,
  speed: 3,
  range: 1,
  skills: [
    {
      id: 'tutorial_big_dude_skill_1',
      cooldown: 3,
      description: 'Give +2 attack to an ally unit.',
      name: 'Test skill',
      iconId: 'fire-red',
      initialCooldown: 0,
      isTargetable(point, { session, skill }) {
        return isAlly(
          session,
          session.entitySystem.getEntityAt(point)?.id,
          skill.caster.player.id
        );
      },
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      minTargetCount: 1,
      maxTargetCount: 1,
      async onUse({ affectedCells }) {
        getAffectedEntities(affectedCells).forEach(entity => {
          entity.addModifier(
            createEntityModifier({
              stackable: true,
              visible: false,
              source: entity,
              mixins: [
                modifierEntityInterceptorMixin({
                  key: 'attack',
                  keywords: [],
                  interceptor: () => val => val + 2
                })
              ]
            })
          );
        });
      }
    }
  ]
};
