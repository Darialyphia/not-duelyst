import { Vec3 } from './types';

export type UnitId = number;

export class Unit {
  constructor(
    public readonly id: UnitId,
    public position: Vec3
  ) {}
}
