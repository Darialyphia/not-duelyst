import { Point, isDefined } from '@hc/shared';
import { EntityManager } from './entity/entity-manager';
import { CellId } from './map/cell';
import { GameMap } from './map/map';
import { GraphAdapter, findShortestPath } from './utils/dijakstra';
import { Point3D } from './types';
import { pointToCellId } from './utils/helpers';
import { GameContext } from './game';

export class Pathfinder {
  private graphAdapter: GraphAdapter<CellId> = {
    getEdges: node => {
      return [
        this.ctx.map.getDestination(node, 'north'),
        this.ctx.map.getDestination(node, 'south'),
        this.ctx.map.getDestination(node, 'west'),
        this.ctx.map.getDestination(node, 'east')
      ]
        .filter(isDefined)
        .filter(point => !this.ctx.entityManager.getEntityAt(point))
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
