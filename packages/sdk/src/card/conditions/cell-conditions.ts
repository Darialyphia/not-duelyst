import { type Nullable, type Point3D, type AnyObject, isEmptyArray } from '@game/shared';
import { match } from 'ts-pattern';
import type { Cell } from '../../board/cell';
import type { Entity } from '../../entity/entity';
import {
  getCellInFront,
  getCellBehind,
  getCellAbove,
  getCellBelow
} from '../../entity/entity-utils';
import type { GameSession } from '../../game-session';
import { isWithinCells } from '../../utils/targeting';
import type { Card } from '../card';
import type { Filter } from '../card-effect';
import { getUnits, type UnitCondition } from './unit-conditions';

export type CellConditionBase =
  | { type: 'any_cell' }
  | { type: 'is_empty' }
  | { type: 'has_unit'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_at'; params: { x: number; y: number; z: number } }
  | {
      type: 'is_nearby';
      params: { unit?: Filter<UnitCondition>; cell?: Filter<CellCondition> };
    }
  | { type: 'is_in_front'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_behind'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_above'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_below'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_manual_target'; params: { index: number } }
  | { type: 'is_top_right_corner' }
  | { type: 'is_top_left_corner' }
  | { type: 'is_bottom_right_corner' }
  | { type: 'is_bottom_left_corner' }
  | { type: '2x2_area'; params: { topLeft: Filter<CellConditionBase> } }
  | { type: '3x3_area'; params: { center: Filter<CellConditionBase> } };

export type CellConditionExtras =
  | { type: 'moved_unit_old_position' }
  | { type: 'moved_unit_new_position' }
  | { type: 'moved_path' }
  | { type: 'attack_target_position' }
  | { type: 'attack_source_position' }
  | { type: 'heal_target_position' }
  | { type: 'heal_source_position' }
  | { type: 'summon_target' };

export type CellCondition = CellConditionBase | CellConditionExtras;

export const getCells = ({
  session,
  entity,
  card,
  conditions,
  targets,
  event,
  eventName,
  playedPoint
}: {
  session: GameSession;
  entity?: Entity;
  card: Card;
  conditions: Filter<CellCondition>;
  targets: Array<Nullable<Point3D>>;
  event: AnyObject;
  eventName?: string;
  playedPoint?: Point3D;
}): Cell[] => {
  return session.boardSystem.cells.filter(cell => {
    if (cell.cellAbove) return false;

    return conditions.some(group => {
      return group.every(condition => {
        return match(condition)
          .with({ type: 'any_cell' }, () => true)
          .with({ type: 'is_manual_target' }, condition => {
            const point = targets[condition.params.index];
            if (!point) return false;
            return cell.position.equals(point);
          })
          .with({ type: 'is_empty' }, () => !cell.entity)
          .with({ type: 'is_nearby' }, condition => {
            const unitPositions = isEmptyArray(condition.params.unit)
              ? []
              : getUnits({
                  conditions: condition.params.unit ?? [],
                  targets,
                  session,
                  entity,
                  card,
                  event,
                  eventName
                }).map(u => u.position);
            const cellPositions = isEmptyArray(condition.params.cell)
              ? []
              : getCells({
                  conditions: condition.params.cell ?? [],
                  targets,
                  session,
                  entity,
                  card,
                  event,
                  eventName,
                  playedPoint
                }).map(c => c.position);

            return [...unitPositions, ...cellPositions].some(candidate =>
              isWithinCells(candidate, cell.position, 1)
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
              eventName,
              playedPoint
            });
            return candidates.some(candidate =>
              getCellInFront(session, candidate)?.equals(cell)
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
              eventName,
              playedPoint
            });
            return candidates.some(candidate =>
              getCellBehind(session, candidate)?.equals(cell)
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
              eventName,
              playedPoint
            });
            return candidates.some(candidate =>
              getCellAbove(session, candidate)?.equals(cell)
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
              eventName,
              playedPoint
            });
            return candidates.some(candidate =>
              getCellBelow(session, candidate)?.equals(cell)
            );
          })
          .with({ type: 'is_at' }, condition => cell.position.equals(condition.params))
          .with(
            { type: 'is_top_left_corner' },
            () => cell.x === 0 && cell.y === 0 && cell.isTopMost
          )
          .with(
            { type: 'is_top_right_corner' },
            () =>
              cell.x === session.boardSystem.width - 1 && cell.y === 0 && cell.isTopMost
          )
          .with(
            { type: 'is_bottom_left_corner' },
            () =>
              cell.x === 0 && cell.y === session.boardSystem.height - 1 && cell.isTopMost
          )
          .with(
            { type: 'is_bottom_right_corner' },
            () =>
              cell.x === session.boardSystem.width - 1 &&
              cell.y === session.boardSystem.height - 1 &&
              cell.isTopMost
          )
          .with({ type: 'has_unit' }, condition => {
            if (!cell.entity) return false;

            return getUnits({
              session,
              entity,
              card,
              conditions: condition.params.unit,
              targets,
              event,
              eventName,
              playedPoint
            }).some(unit => cell.entity?.equals(unit));
          })
          .with({ type: 'moved_unit_new_position' }, () => {
            return session.boardSystem.getCellAt(event.entity.position)?.equals(cell);
          })
          .with({ type: 'moved_unit_old_position' }, () => {
            if (eventName === 'entity:before_move') {
              return session.boardSystem.getCellAt(event.entity.position)?.equals(cell);
            }
            if (eventName === 'entity:-after_move') {
              return session.boardSystem.getCellAt(event.previousPosition)?.equals(cell);
            }
            return false;
          })
          .with({ type: 'moved_path' }, () => {
            return event.path.some((point: Point3D) =>
              session.boardSystem.getCellAt(point)?.equals(cell)
            );
          })
          .with({ type: 'attack_source_position' }, () => {
            return false;
          })
          .with({ type: 'attack_target_position' }, () => {
            return false;
          })
          .with({ type: 'heal_source_position' }, () => {
            return false;
          })
          .with({ type: 'heal_target_position' }, () => {
            return false;
          })
          .with({ type: 'summon_target' }, () => {
            if (!playedPoint) return false;
            return cell.position.equals(playedPoint);
          })
          .with({ type: '2x2_area' }, condition => {
            const topLefts = getCells({
              session,
              entity,
              card,
              conditions: condition.params.topLeft,
              targets,
              event,
              eventName,
              playedPoint
            });

            return topLefts.some(topLeft => {
              return (
                topLeft.position.x <= cell.position.x &&
                topLeft.position.y <= cell.position.y &&
                isWithinCells(topLeft, cell.position, 1)
              );
            });
          })
          .with({ type: '3x3_area' }, condition => {
            const centers = getCells({
              session,
              entity,
              card,
              conditions: condition.params.center,
              targets,
              event,
              eventName,
              playedPoint
            });

            return centers.some(center => {
              return isWithinCells(center, cell, 1);
            });
          })
          .exhaustive();
      });
    });
  });
};
