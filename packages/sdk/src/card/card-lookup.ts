import { keyBy } from 'lodash-es';
import type { CardBlueprintId } from './card';
import type { CardBlueprint } from './card-blueprint';
import { CARD_KINDS, FACTIONS, RARITIES } from './card-utils';
import { config } from '../config';
import { isAllyMinion, isEnemy } from '../entity/entity-utils';
import { Vec3 } from '@game/shared';

const allCards: CardBlueprint[] = [
  {
    id: 'f1_general',
    name: 'F1 General',
    description: 'Fuck up once: die',
    rarity: RARITIES.BASIC,
    factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
    spriteId: 'f1_general',
    kind: CARD_KINDS.GENERAL,
    cooldown: 0,
    initialCooldown: 0,
    cost: 0,
    attack: config.GENERAL_DEFAULT_ATTACK,
    maxHp: config.GENERAL_DEFAULT_HP,
    speed: config.GENERAL_DEFAULT_SPEED,
    range: 1,
    skills: [
      {
        id: 'f1_general_skill_1',
        cooldown: 2,
        description: 'Deal 1 damage to an enemy.',
        name: 'Test skill 2',
        iconId: 'blade1',
        initialCooldown: 0,
        isTargetable(point, { session }) {
          return isEnemy(
            session,
            session.entitySystem.getEntityAt(point)?.id,
            session.playerSystem.activePlayer.id
          );
        },
        isInAreaOfEffect(point, { castPoints }) {
          const vec = Vec3.fromPoint3D(point);
          return castPoints.some(p => vec.equals(p));
        },
        minTargetCount: 0,
        maxTargetCount: 1,
        onUse({ skill, affectedCells }) {
          affectedCells.forEach(cell => {
            if (cell.entity) {
              cell.entity.takeDamage(1, skill.caster);
            }
          });
        }
      },
      {
        id: 'f1_general_skill_2',
        cooldown: 3,
        description: 'Give 1 attack to an ally minion.',
        name: 'Test skill 2',
        iconId: 'bloodlust',
        initialCooldown: 0,
        isTargetable(point, { session }) {
          return isAllyMinion(
            session,
            session.entitySystem.getEntityAt(point)?.id,
            session.playerSystem.activePlayer.id
          );
        },
        isInAreaOfEffect(point, { castPoints }) {
          const vec = Vec3.fromPoint3D(point);
          return castPoints.some(p => vec.equals(p));
        },
        minTargetCount: 0,
        maxTargetCount: 1,
        onUse({ affectedCells }) {
          affectedCells.forEach(cell => {
            if (cell.entity) {
              cell.entity.addInterceptor('attack', atk => atk + 1);
            }
          });
        }
      }
    ]
  },
  {
    id: 'f1_placeholder',
    name: 'F1 Placeholder',
    description: '',
    rarity: RARITIES.BASIC,
    factions: [FACTIONS.F1, null, null],
    spriteId: 'f1_placeholder',
    kind: CARD_KINDS.MINION,
    cooldown: 3,
    initialCooldown: 0,
    cost: 3,
    attack: 2,
    maxHp: 2,
    speed: 3,
    range: 1,
    skills: [
      {
        id: 'f1_placeholder_skill_1',
        cooldown: 2,
        description: 'Deal 1 to nearby enemies.',
        name: 'Test skill',
        iconId: 'consecration',
        initialCooldown: 0,
        isTargetable() {
          return true;
        },
        isInAreaOfEffect(point, { session, skill }) {
          return session.entitySystem
            .getNearbyEnemies(skill.caster)
            .some(entity => entity.position.equals(point));
        },
        minTargetCount: 0,
        maxTargetCount: 1,
        onUse({ skill, affectedCells }) {
          affectedCells.forEach(cell => {
            if (cell.entity) {
              cell.entity.takeDamage(1, skill.caster);
            }
          });
        }
      }
    ]
  }
];
export const CARDS: Record<CardBlueprintId, CardBlueprint> = keyBy(allCards, 'id');
