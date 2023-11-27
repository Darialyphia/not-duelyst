import { Point3D } from '../types';
import { Vec3 } from '../utils/vector';
import { Tile } from './tile';

export class Cell {
  public position: Vec3;

  constructor(
    public tile: Tile,
    position: Point3D
  ) {
    this.position = Vec3.fromPoint3D(position);
  }

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

  get isHalfTile() {
    return this.tile.isHalfTile;
  }

  get isWalkable() {
    return this.tile.isWalkable;
  }

  serialize() {
    return {
      tileId: this.tile.serialize(),
      position: this.position
    };
  }
}
