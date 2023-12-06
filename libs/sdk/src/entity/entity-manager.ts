import { isDefined } from '@hc/shared';
import { Point3D } from '../types';
import { Entity, EntityId, SerializedEntity } from './entity';
import { PlayerId } from '../player/player';
import { isGeneral } from './entity-utils';
import { GameSession } from '../game-session';

export type EntityManagerOptions = {
  entities: Entity[];
  nextEntityId: number;
};

export class EntityManager {
  private entityMap = new Map<EntityId, Entity>();
  private nextEntityId = 0;

  constructor(private ctx: GameSession) {}

  setup(entities: SerializedEntity[]) {
    entities.forEach(rawEntity => {
      const entity = new Entity(this.ctx, rawEntity, this.ctx.isAuthoritative);
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
    ].filter(isDefined);
  }

  getNearbyAllies(point: Point3D, playerId: PlayerId) {
    return this.getNearbyEntities(point).filter(entity => entity.playerId === playerId);
  }

  hasNearbyAllies(point: Point3D, playerId: PlayerId) {
    return this.getNearbyAllies(point, playerId).length > 0;
  }

  getGeneral(playerId: PlayerId) {
    return this.ctx.entityManager
      .getList()
      .find(entity => isGeneral(entity) && entity.playerId === playerId)!;
  }

  private addListeners(entity: Entity) {
    entity.on('*', type => {
      this.ctx.emitter.emit(`entity:${type}`, entity);
    });
  }

  addEntity(rawEntity: Omit<SerializedEntity, 'id'>) {
    const id = ++this.nextEntityId;
    const entity = new Entity(this.ctx, { ...rawEntity, id }, this.ctx.isAuthoritative);

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
