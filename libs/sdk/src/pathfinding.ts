import { Point, isDefined } from '@hc/shared';
import { EntityManager } from './entity/entity-manager';
import { CellId } from './map/cell';
import { GameMap } from './map/map';
import { GraphAdapter, findShortestPath } from './utils/dijakstra';
import { Point3D } from './types';
import { pointToCellId } from './utils/helpers';
import { GameContext, LazyGameContext } from './game';

export class Pathfinder {
  private graphAdapter: GraphAdapter<CellId> = {
    getEdges: node => {
      const ctx = this.getContext();

      return [
        ctx.map.getDestination(node, 'north'),
        ctx.map.getDestination(node, 'south'),
        ctx.map.getDestination(node, 'west'),
        ctx.map.getDestination(node, 'east')
      ]
        .filter(isDefined)
        .filter(point => !this.getContext().entityManager.getEntityAt(point))
        .map(point => {
          return {
            node: pointToCellId(point),
            weight: 1
          };
        });
    }
  };

  constructor(private getContext: LazyGameContext) {}

  findPath(from: Point3D, to: Point3D) {
    return findShortestPath<CellId>(
      this.graphAdapter,
      pointToCellId(from),
      pointToCellId(to)
    );
  }
}
