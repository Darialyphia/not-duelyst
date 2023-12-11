import { Nullable, isNumber } from '@hc/shared';
import { Point3D } from '../types';
import { Vec3 } from '../utils/vector';
import { Entity } from '../entity/entity';

export const isWithinRange = (
  origin: Point3D,
  point: Point3D,
  range: number | Point3D
) => {
  if (isNumber(range)) {
    range = { x: range, y: range, z: range };
  }
  const vec = Vec3.fromPoint3D(origin);
  const dist = vec.dist(Vec3.add(vec, { x: range.x, y: range.y, z: range.z }));

  return vec.dist(point) <= dist;
};

export const isWithinCells = (
  origin: Point3D,
  point: Point3D,
  range: number | Point3D
) => {
  if (isNumber(range)) {
    range = { x: range, y: range, z: range };
  }

  return (
    Math.abs(point.x - origin.x) <= range.x &&
    Math.abs(point.y - origin.y) <= range.y &&
    Math.abs(point.z - origin.z) <= range.z
  );
};

export const isAxisAligned = (point: Point3D, origin: Point3D) => {
  return point.x === origin.x || point.y === origin.y;
};

export const isSelf = (reference: Entity, entity: Nullable<Entity>) => {
  if (!entity) return false;
  return reference.equals(entity);
};
