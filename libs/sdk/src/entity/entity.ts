import { Player } from '../player/player';
import { Point3D } from '../types';
import { UnitBlueprint, UnitId, unitLookup } from '../units/unit-lookup';
import { Vec3 } from '../utils/vector';

export type EntityId = number;

export class Entity {
  private movementSpent = 0;
  public atb = 0;
  public ap = 0;
  public hp = 0;

  constructor(
    public readonly id: EntityId,
    public position: Vec3,
    public owner: Player,
    private unitId: UnitId
  ) {
    this.ap = this.unit.maxAp;
    this.hp = this.unit.maxHp;
  }

  equals(entity: Entity) {
    return entity.id === this.id;
  }

  serialize() {
    return {
      id: this.id,
      position: this.position,
      ownerId: this.owner.id,
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
    this.atb = 0;
    this.movementSpent = 0;
  }
}
