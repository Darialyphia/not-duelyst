import { Point, isDefined } from '@hc/shared';
import { EntityManager } from './entity/entity-manager';
import { CellId } from './map/cell';
import { GameMap } from './map/map';
import { GraphAdapter, findShortestPath } from './utils/dijakstra';
import { Point3D } from './types';
import { pointToCellId } from './utils/helpers';

export class Pathfinder {
  graphAdapter: GraphAdapter<CellId> = {
    getEdges: node => {
      return [
        this.map.getDestination(node, 'north'),
        this.map.getDestination(node, 'south'),
        this.map.getDestination(node, 'west'),
        this.map.getDestination(node, 'east')
      ]
        .filter(isDefined)
        .filter(point => !this.entityManager.getEntityAt(point))
        .map(point => {
          return {
            node: pointToCellId(point),
            weight: 1
          };
        });
    }
  };

  constructor(
    private map: GameMap,
    private entityManager: EntityManager
  ) {}

  findPath(from: Point3D, to: Point3D) {
    findShortestPath<CellId>(
      this.graphAdapter,
      pointToCellId(from),
      pointToCellId(to)
    );
  }
}
