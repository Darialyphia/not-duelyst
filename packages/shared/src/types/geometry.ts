export type Point = { x: number; y: number };
export type Point3D = { x: number; y: number; z: number };
export type Size = { width: number; height: number };
export type Circle = Point & { radius: number };
export type Rectangle = Point & Size;
export type Line = { start: Point; end: Point };
export type BBox = Rectangle & {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};
