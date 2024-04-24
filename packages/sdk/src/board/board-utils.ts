import { type Point3D, type Values } from '@game/shared';

export const DIRECTION = {
  NORTH: 'north',
  SOUTH: 'south',
  WEST: 'west',
  EAST: 'east'
} as const;

export const DIRECTIONS_TO_DIFF = {
  [DIRECTION.NORTH]: { x: 0, y: -1, z: 0 },
  [DIRECTION.SOUTH]: { x: 0, y: 1, z: 0 },
  [DIRECTION.WEST]: { x: -1, y: 0, z: 0 },
  [DIRECTION.EAST]: { x: 1, y: 0, z: 0 }
} as const satisfies Record<Direction, Point3D>;

export type Direction = Values<typeof DIRECTION>;
