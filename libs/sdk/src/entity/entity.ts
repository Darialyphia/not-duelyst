import { Player, PlayerId } from '../player/player';
import { Point3D } from '../types';
import { UnitBlueprint, UnitId, unitLookup } from '../units/unit-lookup';
import { Vec3 } from '../utils/vector';

export type EntityId = number;

export type SerializedEntity = {
  id: EntityId;
  position: Point3D;
  ownerId: PlayerId;
  unitId: UnitId;
};

export class Entity {
  public readonly id: EntityId;

  public ownerId: PlayerId;

  private unitId: UnitId;

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
      this.position = Vec3.fromPoint3D(point);
    });
  }

  resetAp() {
    this.ap = Math.min(this.unit.maxAp, this.ap + this.unit.apRegenRate);
  }

  endTurn() {
    this.atb = this.atbSeed;
    this.movementSpent = 0;
  }
}
