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
    return new Vec3(this.x + x, this.y + y, this.z + z);
  }

  sub({ x, y, z }: Point3D) {
    return new Vec3(this.x - x, this.y - y, this.z - z);
  }

  mul({ x, y, z }: Point3D) {
    return new Vec3(this.x * x, this.y * y, this.z * z);
  }

  div({ x, y, z }: Point3D) {
    return new Vec3(this.x / x, this.y / y, this.z / z);
  }

  dist({ x, y, z }: Point3D) {
    const diff = {
      x: x - this.x,
      y: y - this.y,
      z: z - this.z
    };

    return Math.sqrt(diff.x ** 2 + diff.y ** 2 + diff.z ** 2);
  }
}
