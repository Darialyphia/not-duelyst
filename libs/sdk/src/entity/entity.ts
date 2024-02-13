import mitt from 'mitt';
import { PlayerId } from '../player/player';
import { Point3D } from '../types';
import { UnitId, UNITS } from '../units/unit-lookup';
import { Vec3 } from '../utils/vector';
import { clamp, isNumber, Nullable, Values } from '@hc/shared';
import { Skill, SkillId } from '../skill/skill';
import { Serializable } from '../utils/interfaces';
import { GameSession } from '../game-session';
import { Effect, EffectId } from '../effect/effect';
import { makeInterceptor } from '../utils/interceptor';
import { SummonInteractableAction } from '../action/summon-interactable.action';

export type EntityId = number;
export const isEntityId = (x: unknown, ctx: GameSession): x is EntityId =>
  isNumber(x) && !!ctx.entityManager.getEntityById(x);

export type SerializedEntity = {
  id: EntityId;
  position: Point3D;
  playerId: PlayerId;
  unitId: UnitId;
};

export const ENTITY_EVENTS = {
  MOVE: 'move',
  USE_SKILL: 'use-skill',
  DEAL_DAMAGE: 'deal-damage',
  RECEIVE_DAMAGE: 'receive-damage',
  HEAL: 'heal',
  DIE: 'die'
} as const;

export type EntityEvent = Values<typeof ENTITY_EVENTS>;

export type EntityEventMap = {
  [ENTITY_EVENTS.MOVE]: Entity;
  [ENTITY_EVENTS.USE_SKILL]: Entity;
  [ENTITY_EVENTS.DIE]: { entity: Entity; source: Nullable<Entity> };
  [ENTITY_EVENTS.DEAL_DAMAGE]: {
    entity: Entity;
    amount: number;
    target: Entity;
  };
  [ENTITY_EVENTS.RECEIVE_DAMAGE]: {
    entity: Entity;
    baseAmount: number;
    amount: number;
    source: Nullable<Entity>;
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

  private interceptors = {
    attack: makeInterceptor<number, Entity>(),
    speed: makeInterceptor<number, Entity>(),
    maxHp: makeInterceptor<number, Entity>(),
    apRegenRate: makeInterceptor<number, Entity>(),
    initiative: makeInterceptor<number, Entity>(),
    canUseSkill: makeInterceptor<boolean, { entity: Entity; skill: Skill }>(),
    canUseSkillAt: makeInterceptor<
      boolean,
      { entity: Entity; skill: Skill; targets: Point3D[] }
    >(),
    canMove: makeInterceptor<boolean, Entity>(),
    takeDamage: makeInterceptor<number, { entity: Entity; amount: number }>()
  };

  playerId: PlayerId;

  on = this.emitter.on;

  off = this.emitter.off;

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
      unitId: this.unitId
    } satisfies SerializedEntity;
  }

  get player() {
    return this.ctx.playerManager.getPlayerById(this.playerId)!;
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

  get speed(): number {
    return this.interceptors.speed.getValue(this.unit.speed, this);
  }

  get attack(): number {
    return this.interceptors.attack.getValue(this.unit.attack, this);
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

  canUseSkillAt(skill: Skill, targets: Point3D[]) {
    return this.interceptors.canUseSkillAt.getValue(this.canUseSkill(skill), {
      entity: this,
      skill: skill,
      targets
    });
  }

  canUseSkill(skill: Skill) {
    if (!this.hasSkill(skill.id)) return false;
    if (this.skillCooldowns[skill.id] > 0) return false;

    const result = true;

    return this.interceptors.canUseSkill.getValue(result, { entity: this, skill: skill });
  }

  move(path: Point3D[]) {
    path.forEach(point => {
      this.position = Vec3.fromPoint3D(point);
      this.movementSpent++;
      this.emitter.emit(ENTITY_EVENTS.MOVE, this);
    });
  }

  useSkill(skillId: SkillId) {
    const skill = this.skills.find(s => s.id === skillId);
    if (!skill) throw new Error(`Skill not found on entity ${this.unit.id}: ${skillId}`);

    if (skill.shouldPreventMovement) {
      this.movementSpent = this.speed;
    }
    this.skillCooldowns[skillId] = skill.cooldown;
    this.emitter.emit(ENTITY_EVENTS.USE_SKILL, this);
  }

  dealDamage(power: number, target: Entity) {
    target.takeDamage(power, this);

    this.emitter.emit(ENTITY_EVENTS.DEAL_DAMAGE, {
      entity: this,
      amount: power,
      target
    });
  }

  getTakenDamage(amount: number) {
    return this.interceptors.takeDamage.getValue(amount, {
      entity: this,
      amount
    });
  }

  takeDamage(power: number, source: Nullable<Entity>) {
    const amount = this.getTakenDamage(power);
    this.hp = Math.max(0, this.hp - amount);
    this.emitter.emit(ENTITY_EVENTS.RECEIVE_DAMAGE, {
      entity: this,
      amount,
      baseAmount: power,
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

  die(source: Nullable<Entity>) {
    this.hp = 0;
    this.emitter.emit('die', { entity: this, source });
    this.ctx.actionQueue.push(
      new SummonInteractableAction(
        {
          id: 'GOLD_COIN',
          position: this.position
        },
        this.ctx
      )
    );
  }

  startTurn() {
    this.movementSpent = 0;
    Object.keys(this.skillCooldowns).forEach(skillId => {
      this.skillCooldowns[skillId] = clamp(this.skillCooldowns[skillId] - 1, 0, Infinity);
    });
  }
}
