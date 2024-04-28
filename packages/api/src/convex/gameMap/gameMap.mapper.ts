import type { Id } from '../_generated/dataModel';
import type { GameMap } from './gameMap.entity';
import type { Point3D } from '@game/shared';

export type GameMapDto = {
  id: Id<'gameMaps'>;
  cells: string;
  height: number;
  width: number;
  startPositions: [Point3D, Point3D];
  name: string;
};

export const toGameMapDto = (gameMap: GameMap): GameMapDto => {
  return {
    id: gameMap._id,
    cells: gameMap.cells,
    height: gameMap.height,
    width: gameMap.width,
    startPositions: gameMap.startPositions as [Point3D, Point3D],
    name: gameMap.name
  };
};
