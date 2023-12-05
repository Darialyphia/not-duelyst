import { isDefined } from '@hc/shared';
import { CellId } from './cell';
import { GraphAdapter, findShortestPath } from '../utils/dijakstra';
import { Point3D } from '../types';
import { pointToCellId } from '../utils/helpers';
import { GameContext } from '../game-session';
import { isEmpty } from '../entity/entity-utils';

export class Pathfinder {
  private graphAdapter: GraphAdapter<CellId> = {
    getEdges: node => {
      const edges = [
        this.ctx.map.getDestination(node, 'north'),
        this.ctx.map.getDestination(node, 'south'),
        this.ctx.map.getDestination(node, 'west'),
        this.ctx.map.getDestination(node, 'east')
      ];

      return edges
        .filter(isDefined)
        .filter(point => isEmpty(this.ctx, point))
        .map(point => {
          return {
            node: pointToCellId(point),
            weight: 1
          };
        });
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
}
