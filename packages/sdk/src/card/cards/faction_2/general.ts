import { isEmpty } from 'lodash-es';
import { config } from '../../../config';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import {
  getAffectedEntities,
  isCastPoint,
  isWithinCells
} from '../../../utils/targeting';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierEntityInterceptorMixin } from '../../../modifier/mixins/entity-interceptor.mixin';

export const f2General: CardBlueprint = {
  id: 'f2_general',
  name: 'F2 General',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: true,
  factions: [FACTIONS.F2, FACTIONS.F2, FACTIONS.F2],
  spriteId: 'f2_general',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: config.GENERAL_DEFAULT_ATTACK,
  maxHp: config.GENERAL_DEFAULT_HP,
  speed: config.GENERAL_DEFAULT_SPEED,
  range: 1,
  skills: [
    {
      id: 'f2_general_skill1',
      name: 'Bloodlust',
      description: 'Deal 1 damage to a minion and give it +1 Attack.',
      initialCooldown: 0,
      cooldown: 4,
      iconId: 'bloodlust',
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { session, skill }) {
        const entity = session.entitySystem.getEntityAt(point);
        if (!entity) return false;
        return (
          entity.card.kind === CARD_KINDS.MINION &&
          isWithinCells(skill.caster.position, point, 3)
        );
      },
      isInAreaOfEffect(point, options) {
        return isCastPoint(point, options.castPoints);
      },
      async onUse({ skill, affectedCells }) {
        await Promise.all(
          getAffectedEntities(affectedCells).map(target => {
            target.addModifier(
              createEntityModifier({
                visible: true,
                name: 'Bloodlust',
                description: '+2 Attack',
                stackable: false,
                source: skill.caster,
                mixins: [
                  modifierEntityInterceptorMixin({
                    key: 'attack',
                    keywords: [],
                    interceptor: () => val => val + 1
                  })
                ]
              })
            );

            return skill.caster.dealDamage(1, target);
          })
        );
      }
    }
  ]
};
