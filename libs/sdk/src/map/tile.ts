import { Values } from '@hc/shared';

export const DIRECTION = {
  NORTH: 'north',
  SOUTH: 'south',
  WEST: 'west',
  EAST: 'east'
} as const;

export const OPPOSITE_DIRECTIONS = {
  [DIRECTION.NORTH]: 'south',
  [DIRECTION.SOUTH]: 'north',
  [DIRECTION.WEST]: 'east',
  [DIRECTION.EAST]: 'west'
} as const;

export type Direction = Values<typeof DIRECTION>;

export const TERRAIN = {
  GROUND: 'GROUND',
  WATER: 'WATER'
};

export type Terrain = Values<typeof TERRAIN>;
export type TileId = keyof typeof tileLookup;

export type TileDefinition = {
  terrain: Terrain;
  isHalfTile: boolean;
};

export const tileLookup = {
  grass: {
    terrain: TERRAIN.GROUND,
    isHalfTile: false
  }
} as const satisfies Record<string, TileDefinition>;

export class Tile {
  terrain: Terrain;
  isHalfTile: boolean;

  constructor(readonly id: TileId) {
    const tile = tileLookup[id];
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
