import type { Point3D } from '@game/shared';
import type { CardBlueprint } from './card-blueprint';
import { getCells, type CellConditionBase } from './conditions/cell-conditions';
import type { GameSession } from '../game-session';
import type { Card } from './card';

export type CardTargetsConfig = {
  min: number;
  targets: CellConditionBase[][][];
};

export const parseTargets = (
  config: CardTargetsConfig
): Exclude<CardBlueprint['targets'], undefined> => {
  return {
    minTargetCount: config.min,
    maxTargetCount: config.targets.length,
    isTargetable(
      point: Point3D,
      options: {
        session: GameSession;
        playedPoint?: Point3D;
        targets: Point3D[];
        card: Card;
      }
    ) {
      if (options.targets.length > options.card.targets!.maxTargetCount) {
        return false;
      }
      return getCells({
        session: options.session,
        event: {},
        card: options.card,
        targets: options.targets,
        conditions: {
          candidates: config.targets[options.targets.length],
          random: false
        },
        playedPoint: options.playedPoint
      }).some(cell => {
        return cell.position.equals(point);
      });
    },
    getAllTargets(options: {
      session: GameSession;
      playedPoint?: Point3D;
      targets: Point3D[];
      card: Card;
    }) {
      if (options.card.targets!.maxTargetCount <= options.targets.length) {
        return [];
      }
      return getCells({
        session: options.session,
        event: {},
        card: options.card,
        targets: options.targets,
        conditions: {
          candidates: config.targets[options.targets.length],
          random: false
        },
        playedPoint: options.playedPoint
      });
    }
  };
};
