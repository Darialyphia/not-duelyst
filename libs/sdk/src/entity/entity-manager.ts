import { Player } from '../player/player';
import { Point3D } from '../types';
import { Vec3 } from '../utils/vector';
import { Entity, EntityId } from './entity';

export type EntityManagerOptions = {
  entities: Entity[];
  nextEntityId: number;
};

export class EntityManager {
  private entityMap = new Map<EntityId, Entity>();
  private nextEntityId = 1;

  constructor() {}

  hydrate(entities: Entity[]) {
    this.entityMap.clear();

    entities.forEach(entity => {
      this.entityMap.set(entity.id, entity);
    });

    this.nextEntityId = Math.max(...this.getList().map(e => e.id));
  }

  getList() {
    return [...this.entityMap.values()];
  }

  getEntityById(id: EntityId) {
    return this.entityMap.get(id) ?? null;
  }

  getEntityAt(position: Point3D) {
    return this.getList().find(e => e.position.equals(position)) ?? null;
  }

  addEntity(position: Point3D, owner: Player) {
    const id = ++this.nextEntityId;
    this.entityMap.set(id, new Entity(id, Vec3.fromPoint3D(position), owner));
  }

  removeEntity(entity: Entity) {
    this.entityMap.set(entity.id, entity);
  }

  serialize() {
    return {
      entities: this.getList().map(e => e.serialize()),
      nextEntityId: this.nextEntityId
    };
  }
}
