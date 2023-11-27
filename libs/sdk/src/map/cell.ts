import { Vec3 } from '../types';
import { Tile } from './tile';

export class Cell {
  constructor(
    public tile: Tile,
    private position: Vec3
  ) {}

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get z() {
    return this.position.z;
  }

  get terrain() {
    return this.tile.terrain;
  }

  get ramps() {
    return this.tile.ramps;
  }

  get isWalkable() {
    return this.tile.isWalkable;
  }

  get isRamp() {
    return this.tile.isRamp;
  }

  serialize() {
    return {
      tileId: this.tile.serialize(),
      position: this.position
    };
  }
}
