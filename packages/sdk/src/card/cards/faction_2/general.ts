import { config } from '../../../config';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS, FACTION_IDS } from '../../card-enums';
import {
  getAffectedEntities,
  isCastPoint,
  isWithinCells
} from '../../../utils/targeting';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierEntityInterceptorMixin } from '../../../modifier/mixins/entity-interceptor.mixin';
import { aura, fearsome } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';

export const f2General: CardBlueprint = {
  id: 'f2_general',
  name: 'F2 General',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: true,
  factions: {},
  faction: FACTIONS.F2,
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
      iconId: 'slash',
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
      onUse({ skill, affectedCells }) {
        getAffectedEntities(affectedCells).forEach(target => {
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
        });
      }
    },

    {
      id: 'f2_general_skill2',
      name: 'Fearsome Aura',
      description: `@${FACTION_IDS.F2}(4)@ Give an ally minion @Aura@: @Fearsome@`,
      initialCooldown: 0,
      cooldown: 4,
      iconId: 'bloodlust',
      minTargetCount: 1,
      maxTargetCount: 1,
      keywords: [KEYWORDS.FEARSOME, KEYWORDS.AURA],
      isTargetable(point, { session, skill }) {
        const entity = session.entitySystem.getEntityAt(point);
        if (!entity) return false;
        return !skill.caster.equals(entity) && skill.caster.isAlly(entity.id);
      },
      isInAreaOfEffect(point, options) {
        return isCastPoint(point, options.castPoints);
      },
      onUse({ skill, affectedCells }) {
        getAffectedEntities(affectedCells).forEach(target => {
          target.addModifier(
            aura({
              source: skill.caster,
              name: 'Fearsome Aura',
              description: 'Neaby allies have @Fearsome@.',
              isElligible(target, source) {
                return (
                  isWithinCells(target.position, source.position, 1) &&
                  target.isAlly(source.id)
                );
              },
              onGainAura(entity) {
                entity.addModifier(fearsome({ source: entity }));
              },
              onLoseAura(entity) {
                entity.removeModifier(KEYWORDS.FEARSOME.id);
              }
            })
          );
        });
      }
    }
  ]
};
