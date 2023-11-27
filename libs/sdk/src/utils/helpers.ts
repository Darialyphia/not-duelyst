import { CellId } from '../map/cell';
import { Point3D } from '../types';

export const pointToCellId = (point: Point3D): CellId =>
  `${point.x}:${point.y}:${point.z}`;
