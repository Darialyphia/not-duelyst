import mitt from 'mitt';
import { PlayerId } from '../player/player';
import { Point3D } from '../types';
import { UnitId, UNITS } from '../units/unit-lookup';
import { Vec3 } from '../utils/vector';
import { clamp, Values } from '@hc/shared';
import { Skill, SkillId } from '../skill/skill-builder';

export type EntityId = number;

export type SerializedEntity = {
  id: EntityId;
  position: Point3D;
  playerId: PlayerId;
  unitId: UnitId;
  atbSeed: number;
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

  public playerId: PlayerId;

  private unitId: UnitId;

  private emitter = mitt<Record<EntityEvent, Entity>>();

  public on = this.emitter.on;

  public off = this.emitter.off;

  private movementSpent = 0;

  private atbSeed = 0;

  public atb = this.atbSeed;

  public ap = 0;

  public hp = 0;

  public position: Vec3;

  public skillCooldowns: Record<SkillId, number> = {};

  constructor(raw: SerializedEntity) {
    this.id = raw.id;
    this.position = Vec3.fromPoint3D(raw.position);
    this.playerId = raw.playerId;
    this.unitId = raw.unitId;
    this.ap = this.unit.maxAp;
    this.hp = this.unit.maxHp;
    this.unit.skills.forEach(skill => {
      this.skillCooldowns[skill.id] = 0;
    });
  }

  equals(entity: Entity) {
    return entity.id === this.id;
  }

  serialize(): SerializedEntity {
    return {
      id: this.id,
      position: this.position,
      playerId: this.playerId,
      unitId: this.unitId,
      atbSeed: this.atbSeed
    };
  }

  private get unit() {
    return UNITS[this.unitId];
  }

  get kind() {
    return this.unit.kind;
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

  get skills() {
    return this.unit.skills;
  }

  canMove(distance: number) {
    return distance <= this.speed - this.movementSpent;
  }

  hasSkill(skillId: SkillId) {
    return this.skills.some(skill => skill.id === skillId);
  }

  canUseSkill(skill: Skill) {
    if (!this.hasSkill(skill.id)) return false;
    if (this.skillCooldowns[skill.id] > 0) return;

    return skill.cost <= this.ap;
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
    Object.keys(this.skillCooldowns).forEach(skillId => {
      this.skillCooldowns[skillId] = Math.max(this.skillCooldowns[skillId], 0);
    });
  }

  endTurn() {
    this.emitter.emit('before-turn-end', this);
    this.atb = this.atbSeed;
    this.movementSpent = 0;
    this.emitter.emit('after-turn-end', this);
  }
}
