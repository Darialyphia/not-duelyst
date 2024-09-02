import { type Nullable, type Point3D, type AnyObject, isEmptyArray } from '@game/shared';
import { match } from 'ts-pattern';
import type { Entity } from '../../entity/entity';
import {
  getEntityInFront,
  getNearest,
  getEntityBehind,
  getEntityAbove,
  getEntityBelow
} from '../../entity/entity-utils';
import type { GameSession } from '../../game-session';
import { getKeywordById, type KeywordId } from '../../utils/keywords';
import { isWithinCells } from '../../utils/targeting';
import type { Card } from '../card';
import type { Filter, NumericOperator } from '../card-effect';
import { getCells, type CellCondition } from './cell-conditions';
import type { CardConditionExtras } from './card-conditions';
import { matchNumericOperator } from '../card-action';
import { getAmount, type Amount } from '../helpers/amount';
import type { TagId } from '../../utils/tribes';

export type UnitConditionBase =
  | { type: 'any_unit' }
  | { type: 'is_self'; params: { not: boolean } }
  | { type: 'is_general'; params: { not: boolean } }
  | { type: 'is_minion'; params: { not: boolean } }
  | { type: 'is_ally'; params: { not: boolean } }
  | { type: 'is_enemy'; params: { not: boolean } }
  | {
      type: 'is_nearby';
      params: {
        unit?: Filter<UnitCondition>;
        cell?: Filter<CellCondition>;
        not: boolean;
      };
    }
  | { type: 'is_in_front'; params: { unit: Filter<UnitCondition>; not: boolean } }
  | { type: 'is_nearest_in_front'; params: { unit: Filter<UnitCondition>; not: boolean } }
  | { type: 'is_behind'; params: { unit: Filter<UnitCondition>; not: boolean } }
  | { type: 'is_nearest_behind'; params: { unit: Filter<UnitCondition>; not: boolean } }
  | { type: 'is_above'; params: { unit: Filter<UnitCondition>; not: boolean } }
  | { type: 'is_nearest_above'; params: { unit: Filter<UnitCondition>; not: boolean } }
  | { type: 'is_below'; params: { unit: Filter<UnitCondition>; not: boolean } }
  | { type: 'is_nearest_below'; params: { unit: Filter<UnitCondition>; not: boolean } }
  | { type: 'is_manual_target'; params: { index: number; not: boolean } }
  | { type: 'is_manual_target_general'; params: { index: number; not: boolean } }
  | { type: 'is_same_row'; params: { cell: Filter<CellCondition>; not: boolean } }
  | { type: 'is_same_column'; params: { cell: Filter<CellCondition>; not: boolean } }
  | { type: 'has_keyword'; params: { keyword: KeywordId; not: boolean } }
  | { type: 'has_blueprint'; params: { blueprint: string[]; not: boolean } }
  | { type: 'has_tag'; params: { tag: TagId; not: boolean } }
  | {
      type: 'has_attack';
      params: {
        amount: Amount<{
          unit: UnitConditionExtras['type'];
          card: CardConditionExtras['type'];
        }>;
        operator: NumericOperator;
        not: boolean;
      };
    }
  | {
      type: 'has_hp';
      params: {
        amount: Amount<{
          unit: UnitConditionExtras['type'];
          card: CardConditionExtras['type'];
        }>;
        operator: NumericOperator;
        not: boolean;
      };
    }
  | {
      type: 'has_lowest_attack';
      params: { not: false };
    }
  | {
      type: 'has_highest_attack';
      params: { not: false };
    }
  | { type: 'is_exhausted'; params: { not: boolean } };

export type UnitConditionExtras =
  | { type: 'attack_target'; params: { not: boolean } }
  | { type: 'attack_source'; params: { not: boolean } }
  | { type: 'healing_target'; params: { not: boolean } }
  | { type: 'healing_source'; params: { not: boolean } }
  | { type: 'moved_unit'; params: { not: boolean } }
  | { type: 'played_unit'; params: { not: boolean } }
  | { type: 'destroyed_unit'; params: { not: boolean } };

export type UnitCondition = UnitConditionBase | UnitConditionExtras;

export const getUnits = ({
  session,
  entity,
  conditions,
  targets,
  event,
  card,
  eventName,
  playedPoint
}: {
  session: GameSession;
  entity?: Entity;
  card: Card;
  conditions: Filter<UnitCondition>;
  targets: Array<Nullable<Point3D>>;
  event: AnyObject;
  eventName?: string;
  playedPoint?: Point3D;
}): Entity[] => {
  const results = session.entitySystem.getList().filter(e => {
    if (!conditions.candidates.length) return true;

    return conditions.candidates.some(group => {
      return group.every(condition => {
        const isMatch = match(condition)
          .with({ type: 'any_unit' }, () => true)
          .with({ type: 'has_keyword' }, condition => {
            return e.hasKeyword(getKeywordById(condition.params.keyword)!);
          })
          .with({ type: 'is_ally' }, () => card.player.equals(e.player))
          .with({ type: 'is_enemy' }, () => !card.player.equals(e.player))
          .with({ type: 'is_manual_target' }, condition => {
            const point = targets[condition.params.index];
            if (!point) return false;
            const entity = session.entitySystem.getEntityAt(point);
            if (!entity) return false;
            return e.equals(entity);
          })
          .with({ type: 'is_manual_target_general' }, condition => {
            const point = targets[condition.params.index];
            if (!point) return false;
            const entity = session.entitySystem.getEntityAt(point);
            if (!entity) return false;
            return e.equals(entity.player.general);
          })
          .with({ type: 'is_general' }, () => e.isGeneral)
          .with({ type: 'is_minion' }, () => !e.isGeneral)
          .with({ type: 'is_self' }, () => {
            if (!entity) return false;
            return entity.equals(e);
          })
          .with({ type: 'is_nearby' }, condition => {
            const unitConditions = condition.params.unit ?? {
              candidates: [],
              random: false
            };
            const cellConditions = condition.params.cell ?? {
              candidates: [],
              random: false
            };
            const unitPositions = isEmptyArray(unitConditions.candidates)
              ? []
              : getUnits({
                  conditions: unitConditions,
                  targets,
                  session,
                  entity,
                  card,
                  event,
                  eventName
                }).map(u => u.position);
            const cellPositions = isEmptyArray(cellConditions.candidates)
              ? []
              : getCells({
                  conditions: cellConditions,
                  targets,
                  session,
                  entity,
                  card,
                  event,
                  eventName,
                  playedPoint
                }).map(c => c.position);

            return [...unitPositions, ...cellPositions].some(
              candidate =>
                isWithinCells(candidate, e.position, 1) && !candidate.equals(e.position)
            );
          })
          .with({ type: 'is_in_front' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getEntityInFront(session, candidate)?.equals(e)
            );
          })
          .with({ type: 'is_nearest_in_front' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getNearest(
                session,
                candidate.player.isPlayer1 ? 'right' : 'left',
                candidate.position
              )?.equals(e)
            );
          })
          .with({ type: 'is_behind' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate => {
              return getEntityBehind(session, candidate)?.equals(e);
            });
          })
          .with({ type: 'is_nearest_behind' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getNearest(
                session,
                candidate.player.isPlayer1 ? 'left' : 'right',
                candidate.position
              )?.equals(e)
            );
          })
          .with({ type: 'is_above' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getEntityAbove(session, candidate)?.equals(e)
            );
          })
          .with({ type: 'is_nearest_above' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getNearest(session, 'up', candidate.position)?.equals(e)
            );
          })
          .with({ type: 'is_below' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getEntityBelow(session, candidate)?.equals(e)
            );
          })
          .with({ type: 'is_nearest_below' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getNearest(session, 'down', candidate.position)?.equals(e)
            );
          })
          .with({ type: 'moved_unit' }, () => {
            return e.equals(event.entity);
          })
          .with({ type: 'destroyed_unit' }, () => {
            return e.equals(event as Entity);
          })
          .with({ type: 'played_unit' }, () => {
            return e.equals(event as Entity);
          })
          .with({ type: 'healing_source' }, () => {
            return event.source && e.equals(event.source);
          })
          .with({ type: 'healing_target' }, () => {
            return event.entity && e.equals(event.entity);
          })
          .with({ type: 'attack_source' }, () => {
            if (
              eventName === 'entity:before_attack' ||
              eventName === 'entity:after_attack' ||
              eventName === 'entity:before_retaliate' ||
              eventName === 'entity:after_retaliate' ||
              eventName === 'entity:before_deal_damage' ||
              eventName === 'entity:after_deal_damage'
            ) {
              return event.entity && e.equals(event.entity);
            }

            if (
              eventName === 'entity:before_take_damage' ||
              eventName === 'entity:after_take_damage'
            ) {
              return event.source && e.equals(event.source);
            }

            return false;
          })
          .with({ type: 'attack_target' }, () => {
            if (
              eventName === 'entity:before_attack' ||
              eventName === 'entity:after_attack' ||
              eventName === 'entity:before_retaliate' ||
              eventName === 'entity:after_retaliate' ||
              eventName === 'entity:before_deal_damage' ||
              eventName === 'entity:after_deal_damage'
            ) {
              return event.target && e.equals(event.target);
            }

            if (
              eventName === 'entity:before_take_damage' ||
              eventName === 'entity:after_take_damage'
            ) {
              return event.entity && e.equals(event.entity);
            }

            return false;
          })
          .with({ type: 'has_attack' }, condition => {
            const amount = getAmount({
              amount: condition.params.amount,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });

            return matchNumericOperator(e.attack, amount, condition.params.operator);
          })
          .with({ type: 'has_hp' }, condition => {
            const amount = getAmount({
              amount: condition.params.amount,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });

            return matchNumericOperator(amount, e.hp, condition.params.operator);
          })
          .with({ type: 'is_exhausted' }, () => {
            return e.isExhausted;
          })
          .with({ type: 'has_blueprint' }, condition => {
            return condition.params.blueprint.includes(e.card.blueprintId);
          })
          .with({ type: 'has_tag' }, condition => {
            return e.hasTag(condition.params.tag);
          })
          .with({ type: 'is_same_row' }, condition => {
            const cells = getCells({
              targets,
              session,
              entity,
              card,
              event,
              eventName,
              conditions: condition.params.cell
            });

            return cells.some(c => c.y === e.position.y);
          })
          .with({ type: 'is_same_column' }, condition => {
            const cells = getCells({
              targets,
              session,
              entity,
              card,
              event,
              eventName,
              conditions: condition.params.cell
            });

            return cells.some(c => c.x === e.position.x);
          })
          .with({ type: 'has_lowest_attack' }, () => {
            let entities: Entity[] = [];
            let lowest = Infinity;
            session.entitySystem.getList().forEach(entity => {
              if (entity.attack < lowest) {
                entities = [entity];
              } else if (entity.attack === lowest) {
                entities.push(entity);
                lowest = entity.attack;
              }
            });
            return entities;
          })
          .with({ type: 'has_highest_attack' }, () => {
            let entities: Entity[] = [];
            let highest = 0;
            session.entitySystem.getList().forEach(entity => {
              if (entity.attack > highest) {
                entities = [entity];
              } else if (entity.attack === highest) {
                entities.push(entity);
                highest = entity.attack;
              }
            });
            return entities;
          })
          .exhaustive();

        return 'params' in condition &&
          'not' in condition.params &&
          condition.params.not === true
          ? !isMatch
          : isMatch;
      });
    });
  });

  if (conditions.random && results.length) {
    const index = session.rngSystem.nextInt(results.length - 1);
    return [results[index]];
  }

  return results;
};
