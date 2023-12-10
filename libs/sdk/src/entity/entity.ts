import mitt from 'mitt';
import { PlayerId } from '../player/player';
import { Point3D } from '../types';
import { UnitBlueprint, UnitId, UNITS } from '../units/unit-lookup';
import { Vec3 } from '../utils/vector';
import { clamp, objectKeys, Values } from '@hc/shared';
import { Skill, SkillId } from '../skill/skill-builder';
import { Serializable } from '../utils/interfaces';
import { isGeneral } from './entity-utils';
import { GameSession } from '../game-session';

export type EntityId = number;

export type SerializedEntity = {
  id: EntityId;
  position: Point3D;
  playerId: PlayerId;
  unitId: UnitId;
  atbSeed: number;
};

export const ENTITY_EVENTS = {
  MOVE: 'move',
  TURN_START: 'turn-start',
  TURN_END: 'turn-end',
  USE_SKILL: 'use-skill',
  DEAL_DAMAGE: 'deal-damage',
  TAKE_DAMAGE: 'take-damage',
  DIE: 'die'
} as const;

export type EntityEvent = Values<typeof ENTITY_EVENTS>;

export type EntityEventMap = {
  [ENTITY_EVENTS.MOVE]: Entity;
  [ENTITY_EVENTS.TURN_START]: Entity;
  [ENTITY_EVENTS.TURN_END]: Entity;
  [ENTITY_EVENTS.USE_SKILL]: Entity;
  [ENTITY_EVENTS.DIE]: Entity;
  [ENTITY_EVENTS.DEAL_DAMAGE]: {
    entity: Entity;
    baseAmount: number;
    amount: number;
    target: Entity;
  };
  [ENTITY_EVENTS.TAKE_DAMAGE]: {
    entity: Entity;
    baseAmount: number;
    amount: number;
    source: Entity;
  };
};

export class Entity implements Serializable {
  readonly id: EntityId;

  readonly unitId: UnitId;

  public playerId: PlayerId;

  private emitter = mitt<EntityEventMap>();

  public on = this.emitter.on;

  public off = this.emitter.off;

  private movementSpent = 0;

  private atbSeed = 0;

  public atb = this.atbSeed;

  public ap = 0;

  public hp = 0;

  public position: Vec3;

  public skillCooldowns: Record<SkillId, number> = {};

  constructor(
    private ctx: GameSession,
    raw: SerializedEntity
  ) {
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

  clone() {
    const clone = new Entity(this.ctx, {
      id: this.id,
      position: this.position,
      atbSeed: this.atbSeed,
      playerId: this.playerId,
      unitId: this.unitId
    });

    Object.keys(this).forEach(key => {
      // @ts-expect-error cant be arsed
      clone[key] = this[key];
    });

    return clone;
  }

  serialize() {
    return {
      id: this.id,
      position: this.position.serialize(),
      playerId: this.playerId,
      unitId: this.unitId,
      atbSeed: this.atbSeed
    } satisfies SerializedEntity;
  }

  private get unit() {
    return UNITS[this.unitId];
  }

  get kind() {
    return this.unit.kind;
  }

  get maxHp() {
    return this.unit.maxHp;
  }

  get maxAp() {
    return this.unit.maxAp;
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

  get remainingMovement() {
    return this.speed - this.movementSpent;
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
      this.position = Vec3.fromPoint3D(point);
      this.movementSpent++;
      this.emitter.emit(ENTITY_EVENTS.MOVE, this);
    });
  }

  summonFromLoadout(unit: UnitBlueprint) {
    if (!isGeneral(this)) {
      throw new Error('Only generals can summon, from loadout');
    }

    this.ap = clamp(this.ap - unit.summonCost, 0, Infinity);
  }

  useSkill(skillId: SkillId) {
    const skill = this.skills.find(s => s.id === skillId);
    if (!skill) throw new Error(`Skill not found on entity ${this.unit.id}: ${skillId}`);

    this.ap = clamp(this.ap - skill.cost, 0, Infinity);
    this.skillCooldowns[skillId] = skill.cooldown;
    this.emitter.emit(ENTITY_EVENTS.USE_SKILL, this);
  }

  private calculateDamage(baseAmount: number, attacker: Entity, defender: Entity) {
    return Math.max(1, baseAmount + (attacker.attack - defender.defense));
  }

  dealDamage(baseAmount: number, target: Entity) {
    target.takeDamage(baseAmount, this);
    this.emitter.emit(ENTITY_EVENTS.DEAL_DAMAGE, {
      entity: this,
      amount: this.calculateDamage(baseAmount, this, target),
      baseAmount,
      target
    });
  }

  takeDamage(baseAmount: number, source: Entity) {
    const amount = this.calculateDamage(baseAmount, source, this);
    this.hp = Math.max(0, this.hp - amount);
    this.emitter.emit(ENTITY_EVENTS.TAKE_DAMAGE, {
      entity: this,
      amount,
      baseAmount,
      source
    });
  }

  die() {
    this.hp = 0;
    this.emitter.emit('die', this);
  }

  startTurn() {
    this.ap = Math.min(this.unit.maxAp, this.ap + this.unit.apRegenRate);
    this.movementSpent = 0;
    Object.keys(this.skillCooldowns).forEach(skillId => {
      this.skillCooldowns[skillId] = clamp(this.skillCooldowns[skillId] - 1, 0, Infinity);
    });
    this.emitter.emit(ENTITY_EVENTS.TURN_START, this);
  }

  endTurn() {
    this.atb = this.atbSeed;
    this.movementSpent = 0;

    this.emitter.emit(ENTITY_EVENTS.TURN_END, this);
  }
}
