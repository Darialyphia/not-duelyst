import mitt from 'mitt';
import { Player, PlayerId } from '../player/player';
import { Point3D } from '../types';
import { UnitBlueprint, UnitId, unitLookup } from '../units/unit-lookup';
import { Vec3 } from '../utils/vector';
import { Values } from '@hc/shared';

export type EntityId = number;

export type SerializedEntity = {
  id: EntityId;
  position: Point3D;
  ownerId: PlayerId;
  unitId: UnitId;
};

export const ENTITY_EVENTS = {
  BEFORE_MOVE: 'before-move',
  AFTER_MOVE: 'after-move',
  BEFORE_TURN_START: 'before-turn-start',
  AFTER_TURN_START: 'after-turn-start',
  BEFORE_TURN_END: 'before-turn-end',
  AFTER_TURN_END: 'after-turn-end'
} as const;
export type EntityEvent = Values<typeof ENTITY_EVENTS>;

export class Entity {
  public readonly id: EntityId;

  public ownerId: PlayerId;

  private unitId: UnitId;

  private emitter = mitt<Record<EntityEvent, Entity>>();

  public on = this.emitter.on;

  public off = this.emitter.off;

  private movementSpent = 0;

  private atbSeed = Math.random();

  public atb = this.atbSeed;

  public ap = 0;

  public hp = 0;

  public position: Vec3;

  constructor(raw: SerializedEntity) {
    this.id = raw.id;
    this.position = Vec3.fromPoint3D(raw.position);
    this.ownerId = raw.ownerId;
    this.unitId = raw.unitId;
    this.ap = this.unit.maxAp;
    this.hp = this.unit.maxHp;
  }

  equals(entity: Entity) {
    return entity.id === this.id;
  }

  serialize(): SerializedEntity {
    return {
      id: this.id,
      position: this.position,
      ownerId: this.ownerId,
      unitId: this.unitId
    };
  }

  private get unit() {
    return unitLookup[this.unitId];
  }

  get speed() {
    return this.unit.speed;
  }

  get attack() {
    return this.unit.attack;
  }

  get defense() {
    return this.unit.defense;
  }

  get initiative() {
    return this.unit.initiative;
  }

  canMove(distance: number) {
    return distance <= this.speed - this.movementSpent;
  }

  move(path: Point3D[]) {
    path.forEach(point => {
      this.emitter.emit('before-move', this);
      this.position = Vec3.fromPoint3D(point);
      this.emitter.emit('after-move', this);
    });
  }

  startTurn() {
    this.emitter.emit('before-turn-start', this);
    this.ap = Math.min(this.unit.maxAp, this.ap + this.unit.apRegenRate);
    this.emitter.emit('after-turn-start', this);
  }

  endTurn() {
    this.emitter.emit('before-turn-end', this);
    this.atb = this.atbSeed;
    this.movementSpent = 0;
    this.emitter.emit('after-turn-end', this);
  }
}
