import { Vec3, isDefined } from '@game/shared';
import { type CellId } from './cell';
import {
  type Edge,
  type GraphAdapter,
  dijkstra,
  findShortestPath
} from '../utils/dijakstra';
import type { Point3D } from '../types';
import { pointToCellId } from '../utils/helpers';
import { GameSession } from '../game-session';
import type { Entity } from '../entity/entity';

export type DistanceMap = {
  costs: ReturnType<typeof dijkstra>['costs'];
  get: (point: Point3D) => number;
};

export class Pathfinder {
  private cache = new Map<CellId, Edge<CellId>[]>();

  constructor(
    private session: GameSession,
    private entity: Entity,
    private boundaries?: [Point3D, Point3D]
  ) {}

  private makeAdapter(origin: Point3D, destination?: Point3D): GraphAdapter<CellId> {
    const originVec = Vec3.fromPoint3D(origin);
    const destinationVec = destination ? Vec3.fromPoint3D(destination) : null;

    return {
      getEdges: node => {
        if (!this.cache.has(node)) {
          const edges = [
            this.session.boardSystem.getDestination(node, 'north'),
            this.session.boardSystem.getDestination(node, 'south'),
            this.session.boardSystem.getDestination(node, 'west'),
            this.session.boardSystem.getDestination(node, 'east')
          ];

          this.cache.set(
            node,
            edges
              .filter(isDefined)
              .filter(point => {
                if (originVec.equals(point)) return false;

                const entityAtPoint = this.session.entitySystem.getEntityAt(point);
                const isDestination = destinationVec?.equals(point);
                if (isDestination && entityAtPoint) return false;

                if (!isDestination) {
                  if (
                    !this.entity.canMoveThroughCell(
                      this.session.boardSystem.getCellAt(point)!
                    )
                  ) {
                    return false;
                  }
                }

                // if (this.entity.hasKeyword(KEYWORDS.NIMBLE)) {
                //   if (entityAtPoint && this.entity.isEnemy(entityAtPoint.id)) {
                //     return false;
                //   }
                // } else {
                //   if (entityAtPoint) return false;
                // }

                if (this.boundaries) {
                  return (
                    originVec.dist(point) <= originVec.dist(this.boundaries[0]) &&
                    originVec.dist(point) <= originVec.dist(this.boundaries[1])
                  );
                }
                return true;
              })
              .map(point => {
                return {
                  node: pointToCellId(point),
                  weight: 1
                };
              })
          );
        }

        return this.cache.get(node)!;
      }
    };
  }

  findPath(from: Point3D, to: Point3D) {
    return findShortestPath<CellId>(
      this.makeAdapter(from, to),
      pointToCellId(from),
      pointToCellId(to)
    );
  }

  getDistanceMap(from: Point3D): DistanceMap {
    const map = dijkstra(this.makeAdapter(from), pointToCellId(from));

    return {
      costs: map.costs,
      get(pt: Point3D) {
        return map.costs[pointToCellId(pt)];
      }
    };
  }
}
