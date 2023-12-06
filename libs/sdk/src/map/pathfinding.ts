import { isDefined } from '@hc/shared';
import { CellId } from './cell';
import { Edge, GraphAdapter, dijkstra, findShortestPath } from '../utils/dijakstra';
import { Point3D } from '../types';
import { pointToCellId } from '../utils/helpers';
import { GameContext } from '../game-session';
import { isEmpty } from '../entity/entity-utils';

export class Pathfinder {
  private cache = new Map<CellId, Edge<CellId>[]>();

  private graphAdapter: GraphAdapter<CellId> = {
    getEdges: node => {
      if (!this.cache.has(node)) {
        const edges = [
          this.ctx.map.getDestination(node, 'north'),
          this.ctx.map.getDestination(node, 'south'),
          this.ctx.map.getDestination(node, 'west'),
          this.ctx.map.getDestination(node, 'east')
        ];

        this.cache.set(
          node,
          edges
            .filter(isDefined)
            .filter(point => isEmpty(this.ctx, point))
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

  constructor(private ctx: GameContext) {}

  findPath(from: Point3D, to: Point3D) {
    return findShortestPath<CellId>(
      this.graphAdapter,
      pointToCellId(from),
      pointToCellId(to)
    );
  }

  getDistanceMap(from: Point3D) {
    const map = dijkstra(this.graphAdapter, pointToCellId(from));

    return {
      costs: map.costs,
      get(pt: Point3D) {
        return map.costs[pointToCellId(pt)];
      }
    };
  }
}
