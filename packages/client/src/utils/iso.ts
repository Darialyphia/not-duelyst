import { deg2Rad } from '@game/shared';
import type { Point, Point3D } from '@game/shared';
import { CELL_HEIGHT, CELL_WIDTH } from './constants';

export type IsoPoint = {
  isoX: number;
  isoY: number;
  isoZ: number;
};
const TILE_WIDTH = CELL_WIDTH;
const TILE_HEIGHT = TILE_WIDTH / 2;

export interface TransformOptions {
  rotation: boolean;
  isometric: boolean;
  scale: boolean;
}

export function applyTransforms(
  x: number,
  y: number,
  z: number,
  angle: number,
  gridSize: { width: number; height: number }
): Point3D {
  const rotationCenter = {
    x: gridSize.width / 2,
    y: gridSize.height / 2
  };

  const centered = {
    x: x - rotationCenter.x,
    y: y - rotationCenter.y
  };

  const radius = Math.sqrt(Math.pow(centered.x, 2) + Math.pow(centered.y, 2));
  const rotationAngle = Math.atan2(centered.y, centered.x) + angle;

  const rotated = {
    x: rotationCenter.x + radius * Math.cos(rotationAngle),
    y: rotationCenter.x + radius * Math.sin(rotationAngle)
  };

  const iso = {
    x: (rotated.x - rotated.y) / 2,
    y: (rotated.x + rotated.y) / 2
  };

  const final = {
    x: iso.x * TILE_WIDTH,
    y: iso.y * TILE_HEIGHT,
    z: (z * CELL_HEIGHT) / 4
  };

  return final;
}
export const toIso = (
  { x, y, z }: Point3D,
  angle: 0 | 90 | 180 | 270,
  gridSize: { width: number; height: number }
): IsoPoint => {
  const transformed = applyTransforms(x, y, z, deg2Rad(angle), gridSize);

  return { isoX: transformed.x, isoY: transformed.y, isoZ: transformed.z };
};

export const toCartesian = ({ isoX, isoY, isoZ }: IsoPoint) => {
  return {
    x: Math.round((2 * isoY + isoX) / 2 + isoZ),
    y: Math.round((2 * isoY - isoX) / 2 + isoZ),
    z: Math.round(isoZ)
  };
};
