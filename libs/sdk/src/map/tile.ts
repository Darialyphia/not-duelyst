import { Values } from '@hc/shared';
import { TileId, TILES } from './tile-lookup';

export const TERRAIN = {
  GROUND: 'GROUND',
  WATER: 'WATER'
};

export const DIRECTION = {
  NORTH: 'north',
  SOUTH: 'south',
  WEST: 'west',
  EAST: 'east'
} as const;

export const DIRECTIONS_TO_DIFF = {
  [DIRECTION.NORTH]: -1,
  [DIRECTION.SOUTH]: 1,
  [DIRECTION.WEST]: -1,
  [DIRECTION.EAST]: 1
} as const satisfies Record<Direction, number>;

export type Direction = Values<typeof DIRECTION>;

export type Terrain = Values<typeof TERRAIN>;

export type TileDefinition = {
  terrain: Terrain;
  isHalfTile: boolean;
};

export class Tile {
  terrain: Terrain;
  isHalfTile: boolean;

  constructor(readonly id: TileId) {
    const tile = TILES[id];
    this.terrain = tile.terrain;
    this.isHalfTile = tile.isHalfTile;
  }

  get isWalkable() {
    return this.terrain === TERRAIN.GROUND;
  }

  serialize() {
    return this.id;
  }
}
