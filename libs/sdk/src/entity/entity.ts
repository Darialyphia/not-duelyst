import { Vec3 } from '../utils/vector';

export type EntityId = number;

export class Entity {
  constructor(
    public readonly id: EntityId,
    public position: Vec3
  ) {}

  equals(entity: Entity) {
    return entity.id === this.id;
  }

  serialize() {
    return {
      id: this.id,
      position: this.position
    };
  }
}
