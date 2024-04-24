import { isDefined } from '@game/shared';
import type { Point3D } from '../types';
import { ENTITY_EVENTS, Entity, type EntityId, type SerializedEntity } from './entity';
import { GameSession } from '../game-session';

export class EntitySystem {
  private entityMap = new Map<EntityId, Entity>();
  private nextEntityId = 0;

  constructor(private session: GameSession) {}

  setup(entities: SerializedEntity[]) {
    entities.forEach(rawEntity => {
      const entity = new Entity(this.session, rawEntity);
      this.entityMap.set(entity.id, entity);
      this.setupListeners(entity);
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
    return (
      this.getList().find(e => {
        return e.position.equals(position);
      }) ?? null
    );
  }

  getNearbyEntities({ x, y, z }: Point3D) {
    // prettier-ignore
    return [
      // Same level
      this.getEntityAt({ x: x - 1, y: y - 1, z }), // top left
      this.getEntityAt({ x: x    , y: y - 1, z }), // top
      this.getEntityAt({ x: x + 1, y: y - 1, z }), // top right
      this.getEntityAt({ x: x - 1, y: y    , z}),  // left
      this.getEntityAt({ x: x + 1, y: y    , z}),  // right
      this.getEntityAt({ x: x - 1, y: y + 1, z }), // bottom left
      this.getEntityAt({ x: x    , y: y + 1, z }), // bottom
      this.getEntityAt({ x: x + 1, y: y + 1, z }), // bottom right,

      // below
      this.getEntityAt({ x: x - 1, y: y - 1, z: z - 1 }), // top left
      this.getEntityAt({ x: x    , y: y - 1, z: z - 1 }), // top
      this.getEntityAt({ x: x + 1, y: y - 1, z: z - 1 }), // top right
      this.getEntityAt({ x: x - 1, y: y    , z: z - 1 }), // left
      this.getEntityAt({ x: x    , y: y    , z: z - 1 }), // center
      this.getEntityAt({ x: x + 1, y: y    , z: z - 1 }), // right
      this.getEntityAt({ x: x - 1, y: y + 1, z: z - 1 }), // bottom left
      this.getEntityAt({ x: x    , y: y + 1, z: z - 1 }), // bottom
      this.getEntityAt({ x: x + 1, y: y + 1, z: z - 1 }), // bottom right,

      // Above
      this.getEntityAt({ x: x - 1, y: y - 1, z: z + 1 }), // top left
      this.getEntityAt({ x: x    , y: y - 1, z: z + 1 }), // top
      this.getEntityAt({ x: x + 1, y: y - 1, z: z + 1 }), // top right
      this.getEntityAt({ x: x - 1, y: y    , z: z + 1 }), // left
      this.getEntityAt({ x: x    , y: y    , z: z + 1 }), // center
      this.getEntityAt({ x: x + 1, y: y    , z: z + 1 }), // right
      this.getEntityAt({ x: x - 1, y: y + 1, z: z + 1 }), // bottom left
      this.getEntityAt({ x: x    , y: y + 1, z: z + 1 }), // bottom
      this.getEntityAt({ x: x + 1, y: y + 1, z: z + 1 }), // bottom right,
    ].filter(isDefined)
  }

  getNearbyAllies(origin: Entity) {
    return this.getNearbyEntities(origin.position).filter(entity =>
      origin.isAlly(entity.id)
    );
  }

  getNearbyAllyMinions(origin: Entity) {
    return this.getNearbyAllies(origin).filter(entity => !entity.isGeneral);
  }

  getNearbyEnemies(origin: Entity) {
    return this.getNearbyEntities(origin.position).filter(entity =>
      origin.isEnemy(entity.id)
    );
  }

  getNearbyEnemyMinions(origin: Entity) {
    return this.getNearbyEnemies(origin).filter(entity => !entity.isGeneral);
  }

  setupListeners(entity: Entity) {
    Object.values(ENTITY_EVENTS).forEach(eventName => {
      entity.on(eventName, event => {
        this.session.emit(`entity:${eventName}`, event as any);
      });
    });
  }

  addEntity(rawEntity: Omit<SerializedEntity, 'id'>) {
    const id = ++this.nextEntityId;
    const entity = new Entity(this.session, { ...rawEntity, id });
    this.entityMap.set(id, entity);
    this.setupListeners(entity);

    return entity;
  }

  removeEntity(entity: Entity) {
    this.entityMap.delete(entity.id);
  }

  serialize() {
    return {
      entities: this.getList().map(e => e.serialize()),
      nextEntityId: this.nextEntityId
    };
  }
}
