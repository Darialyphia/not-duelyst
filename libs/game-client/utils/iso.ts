import { deg2Rad } from '@hc/shared';
import type { Point3D } from '@hc/sdk/src/types';

export type IsoPoint = {
  isoX: number;
  isoY: number;
  isoZ: number;
};
const TILE_WIDTH = CELL_SIZE;
const TILE_HEIGHT = TILE_WIDTH / 2;

export interface TransformOptions {
  center: boolean;
  rotation: boolean;
  isometric: boolean;
  scale: boolean;
}

export function apply_transforms(
  x: number,
  y: number,
  z: number,
  rot: number,
  opts: TransformOptions
): [number, number, number] {
  // Center grid on the origin

  let cx = x;
  let cy = y;
  if (opts.center) {
    cx -= 5;
    cy -= 5;
  }

  // Rotate around new origin
  let cos_rot = Math.cos(rot);
  let sin_rot = Math.sin(rot);

  let rx = cx;
  let ry = cy;
  if (opts.rotation) {
    rx = cx * cos_rot - cy * sin_rot;
    ry = cx * sin_rot + cy * cos_rot;
  }

  // Scale and rotate one last time to get into iso view.
  // NOTE: Since a rotation of 45 degrees makes it so sin = cos = 0.707, I
  // factor out the value since all it's doing is scaling the grid down.
  let px = rx;
  let py = ry;
  let pz = z;

  if (opts.isometric) {
    px = (rx - ry) / 2;
    py = (rx + ry) / 2;
  }

  if (opts.scale) {
    px *= TILE_WIDTH;
    py *= TILE_HEIGHT;
    pz *= TILE_HEIGHT;
  }

  return [px, py, pz];
}

// https://a5huynh.github.io/posts/2019/isometric-rotation/  math nerd shit
export const toIso = ({ x, y, z }: Point3D, angle: 0 | 90 | 180 | 270): IsoPoint => {
  const [px, py, pz] = apply_transforms(x, y, z, deg2Rad(angle), {
    isometric: true,
    rotation: true,
    scale: true,
    center: false
  });

  return { isoX: px, isoY: py, isoZ: pz };
};

export const toCartesian = ({ isoX, isoY, isoZ }: IsoPoint) => {
  return {
    x: (2 * isoY + isoX) / 2 + isoZ,
    y: (2 * isoY - isoX) / 2 + isoZ,
    z: isoZ
  };
};
