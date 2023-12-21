import mitt from 'mitt';
import { PlayerId } from '../player/player';
import { Point3D } from '../types';
import { UnitBlueprint, UnitId, UNITS } from '../units/unit-lookup';
import { Vec3 } from '../utils/vector';
import { clamp, Values } from '@hc/shared';
import { Skill, SkillId } from '../skill/skill';
import { Serializable } from '../utils/interfaces';
import { isGeneral } from './entity-utils';
import { GameSession } from '../game-session';
import { Effect, EffectId } from '../effect/effect';
import { makeInterceptor } from '../utils/interceptor';

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
  RECEIVE_DAMAGE: 'receive-damage',
  HEAL: 'heal',
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
  [ENTITY_EVENTS.RECEIVE_DAMAGE]: {
    entity: Entity;
    baseAmount: number;
    amount: number;
    source: Entity;
  };
  [ENTITY_EVENTS.RECEIVE_DAMAGE]: {
    entity: Entity;
    baseAmount: number;
    amount: number;
    source: Entity;
  };
  [ENTITY_EVENTS.HEAL]: {
    entity: Entity;
    amount: number;
    source: Entity;
  };
};

export class Entity implements Serializable {
  readonly id: EntityId;

  readonly unitId: UnitId;

  private emitter = mitt<EntityEventMap>();

  private movementSpent = 0;

  public hasUsedSkillThisTurn = false;

  public atbSeed = 0;

  private interceptors = {
    attack: makeInterceptor<number, Entity>(),
    defense: makeInterceptor<number, Entity>(),
    speed: makeInterceptor<number, Entity>(),
    maxHp: makeInterceptor<number, Entity>(),
    maxAp: makeInterceptor<number, Entity>(),
    apRegenRate: makeInterceptor<number, Entity>(),
    initiative: makeInterceptor<number, Entity>(),
    canUseSkill: makeInterceptor<boolean, { entity: Entity; skill: Skill }>(),
    canMove: makeInterceptor<boolean, Entity>()
  };

  playerId: PlayerId;

  on = this.emitter.on;

  off = this.emitter.off;

  atb = 25 + this.atbSeed;

  ap = 0;

  hp = 0;

  position: Vec3;

  skillCooldowns: Record<SkillId, number> = {};

  effects: Effect[] = [];

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

  get unit() {
    return UNITS[this.unitId];
  }

  get kind() {
    return this.unit.kind;
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.unit.maxHp, this);
  }

  get maxAp(): number {
    return this.interceptors.maxAp.getValue(this.unit.maxAp, this);
  }

  get apRegenRate(): number {
    return this.interceptors.apRegenRate.getValue(this.unit.apRegenRate, this);
  }

  get speed(): number {
    return this.interceptors.speed.getValue(this.unit.speed, this);
  }

  get attack(): number {
    return this.interceptors.attack.getValue(this.unit.attack, this);
  }

  get defense(): number {
    return this.interceptors.defense.getValue(this.unit.defense, this);
  }

  get initiative(): number {
    return this.interceptors.initiative.getValue(this.unit.initiative, this);
  }

  get skills() {
    return this.unit.skills;
  }

  get remainingMovement() {
    return this.speed - this.movementSpent;
  }

  addInterceptor<T extends keyof Entity['interceptors']>(
    key: T,
    interceptor: Parameters<Entity['interceptors'][T]['add']>[0]
  ) {
    // @ts-expect-error pepega typescript
    this.interceptors[key].add(interceptor);
  }

  removeInterceptor<T extends keyof Entity['interceptors']>(
    key: T,
    interceptor: Parameters<Entity['interceptors'][T]['remove']>[0]
  ) {
    // @ts-expect-error pepega typescript
    this.interceptors[key].remove(interceptor);
  }

  hasEffect(effectId: EffectId) {
    return this.effects.some(e => e.id === effectId);
  }

  canMove(distance: number) {
    const result = distance <= this.speed - this.movementSpent;

    return this.interceptors.canMove.getValue(result, this);
  }

  hasSkill(skillId: SkillId) {
    return this.skills.some(skill => skill.id === skillId);
  }

  canUseSkillAt(skill: Skill, target?: Point3D) {
    return this.canUseSkill(skill);
  }

  canUseSkill(skill: Skill) {
    if (!this.hasSkill(skill.id)) return false;
    if (this.skillCooldowns[skill.id] > 0) return;

    const result = skill.cost <= this.ap;

    return this.interceptors.canUseSkill.getValue(result, { entity: this, skill: skill });
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
    this.hasUsedSkillThisTurn = true;
    this.emitter.emit(ENTITY_EVENTS.USE_SKILL, this);
  }

  calculateDamage(
    baseAmount: number,
    attacker: Entity,
    defender: Entity,
    isTrueDamage?: boolean
  ) {
    if (isTrueDamage) return baseAmount;

    return Math.max(1, baseAmount + (attacker.attack - defender.defense));
  }

  dealDamage(baseAmount: number, target: Entity, isTrueDamage?: boolean) {
    target.takeDamage(baseAmount, this, isTrueDamage);

    this.emitter.emit(ENTITY_EVENTS.DEAL_DAMAGE, {
      entity: this,
      amount: this.calculateDamage(baseAmount, this, target),
      baseAmount,
      target
    });
  }

  takeDamage(baseAmount: number, source: Entity, isTrueDamage?: boolean) {
    const amount = this.calculateDamage(baseAmount, source, this, isTrueDamage);
    this.hp = Math.max(0, this.hp - amount);
    this.emitter.emit(ENTITY_EVENTS.RECEIVE_DAMAGE, {
      entity: this,
      amount,
      baseAmount,
      source
    });
  }

  heal(amount: number, source: Entity) {
    this.hp = clamp(this.hp + amount, 0, this.maxHp);
    this.emitter.emit(ENTITY_EVENTS.HEAL, {
      entity: this,
      amount,
      source
    });
  }

  die() {
    this.hp = 0;
    this.emitter.emit('die', this);
  }

  startTurn() {
    this.ap = clamp(this.ap + this.unit.apRegenRate, 0, this.maxAp);
    this.movementSpent = 0;
    Object.keys(this.skillCooldowns).forEach(skillId => {
      this.skillCooldowns[skillId] = clamp(this.skillCooldowns[skillId] - 1, 0, Infinity);
    });
    this.emitter.emit(ENTITY_EVENTS.TURN_START, this);
  }

  endTurn() {
    this.atb = this.atbSeed;
    this.movementSpent = 0;
    this.hasUsedSkillThisTurn = false;

    this.emitter.emit(ENTITY_EVENTS.TURN_END, this);
  }
}
