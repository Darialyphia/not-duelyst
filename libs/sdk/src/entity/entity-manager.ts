import { Point3D } from '../types';
import { Vec3 } from '../utils/vector';
import { Entity, EntityId } from './entity';

export type EntityManagerOptions = {
  entities: { id: EntityId; position: Point3D }[];
  nextEntityId: number;
};

export class EntityManager {
  private entityMap = new Map<EntityId, Entity>();
  private nextEntityId = 1;

  constructor(options: EntityManagerOptions) {
    this.nextEntityId = options.nextEntityId;

    options.entities.forEach(entity => {
      this.entityMap.set(
        entity.id,
        new Entity(entity.id, Vec3.fromPoint3D(entity.position))
      );
    });
  }

  getEntityList() {
    return [...this.entityMap.values()];
  }

  getEntityById(id: EntityId) {
    return this.entityMap.get(id) ?? null;
  }

  getEntityAt(position: Point3D) {
    return this.getEntityList().find(e => e.position.equals(position)) ?? null;
  }

  addEntity(position: Point3D) {
    const id = ++this.nextEntityId;
    this.entityMap.set(id, new Entity(id, Vec3.fromPoint3D(position)));
  }

  removeEntity(entity: Entity) {
    this.entityMap.set(entity.id, entity);
  }

  serialize() {
    return this.getEntityList().map(e => e.serialize());
  }
}
