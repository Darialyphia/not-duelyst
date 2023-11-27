import { Point3D } from '../types';

export class Vec3 {
  static fromPoint3D(pt: Point3D) {
    return new Vec3(pt.x, pt.y, pt.z);
  }

  constructor(
    public x: number,
    public y: number,
    public z: number
  ) {}

  clone() {
    return new Vec3(this.x, this.y, this.z);
  }

  equals(vec: Point3D) {
    return this.x === vec.x && this.y === vec.y && this.z === vec.z;
  }

  add({ x, y, z }: Point3D) {
    this.x += x;
    this.y += y;
    this.z += z;
  }
}
