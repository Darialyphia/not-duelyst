import { GameContext } from '../game';
import { Point3D } from '../types';
import { ENTITY_EVENTS, Entity, EntityId, SerializedEntity } from './entity';

export type EntityManagerOptions = {
  entities: Entity[];
  nextEntityId: number;
};

export class EntityManager {
  private entityMap = new Map<EntityId, Entity>();
  private nextEntityId = 1;

  constructor(private ctx: GameContext) {}

  setup(entities: SerializedEntity[]) {
    entities.forEach(rawEntity => {
      const entity = new Entity(rawEntity);
      this.entityMap.set(entity.id, entity);
      this.addListeners(entity);
    });

    if (entities.length) {
      this.nextEntityId = Math.max(...this.getList().map(e => e.id));
    }
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

  private addListeners(entity: Entity) {
    Object.values(ENTITY_EVENTS).forEach(eventName => {
      entity.on(eventName, () => {
        this.ctx.emitter.emit(`entity:${eventName}`, entity);
      });
    });
  }

  addEntity(rawEntity: Omit<SerializedEntity, 'id'>) {
    const id = ++this.nextEntityId;
    const entity = new Entity({ ...rawEntity, id });

    this.entityMap.set(id, entity);
    this.addListeners(entity);

    this.ctx.emitter.emit('entity:created', entity);

    return entity;
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
