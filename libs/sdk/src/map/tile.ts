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
  ramps: {
    [k in Direction]: boolean;
  };
};

export const tileLookup = {
  grass: {
    terrain: TERRAIN.GROUND,
    ramps: {
      east: false,
      west: false,
      north: false,
      south: false
    }
  }
} as const satisfies Record<string, TileDefinition>;

export class Tile {
  terrain!: Terrain;
  ramps!: TileDefinition['ramps'];

  constructor(readonly id: TileId) {
    Object.assign(this, tileLookup[id]);
  }

  get isRamp() {
    return Object.values(this.ramps).some(Boolean);
  }

  get isWalkable() {
    return this.terrain === TERRAIN.GROUND;
  }

  serialize() {
    return this.id;
  }
}
