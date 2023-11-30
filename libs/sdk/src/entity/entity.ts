import mitt from 'mitt';
import { PlayerId } from '../player/player';
import { Point3D } from '../types';
import { UnitBlueprint, UnitId, UNITS } from '../units/unit-lookup';
import { Vec3 } from '../utils/vector';
import { clamp, Values } from '@hc/shared';
import { Skill, SkillId } from '../skill/skill-builder';
import { Serializable } from '../utils/interfaces';
import { isGeneral } from './entity-utils';
import { GameContext } from '../game';

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
  TAKE_DAMAGE: 'take-damage'
} as const;

export type EntityEvent = Values<typeof ENTITY_EVENTS>;

export type EntityEventMap = {
  [ENTITY_EVENTS.MOVE]: Entity;
  [ENTITY_EVENTS.TURN_START]: Entity;
  [ENTITY_EVENTS.TURN_END]: Entity;
  [ENTITY_EVENTS.USE_SKILL]: Entity;
  [ENTITY_EVENTS.DEAL_DAMAGE]: {
    entity: Entity;
    baseAmount: number;
    amount: number;
    target: Entity;
  };
  [ENTITY_EVENTS.TAKE_DAMAGE]: {
    entity: Entity;
    baseAmount: number;
    amount: Number;
    source: Entity;
  };
};

export class Entity implements Serializable {
  public readonly id: EntityId;

  public playerId: PlayerId;

  private unitId: UnitId;

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
      this.position = Vec3.fromPoint3D(point);
      this.emitter.emit(ENTITY_EVENTS.MOVE, this);
    });
  }

  summonFromLoadout(unit: UnitBlueprint) {
    if (!isGeneral(this)) {
      throw new Error('Only generals can summon, from loadout');
    }

    this.ap = Math.max(this.ap - unit.summonCost, 0);
  }

  useSkill(ctx: GameContext, skillId: SkillId, target: Point3D) {
    const skill = this.skills.find(s => s.id === skillId);
    if (!skill) throw new Error(`Skill not found on entity ${this.unit.id}: ${skillId}`);

    this.ap = Math.max(this.ap - skill.cost, 0);
    skill.execute(
      ctx,
      this,
      target,
      ctx.map.cells.filter(cell => skill.isInAreaOfEffect(ctx, cell, this, target))
    );

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

  startTurn() {
    this.ap = Math.min(this.unit.maxAp, this.ap + this.unit.apRegenRate);
    Object.keys(this.skillCooldowns).forEach(skillId => {
      this.skillCooldowns[skillId] = Math.max(this.skillCooldowns[skillId], 0);
    });

    this.emitter.emit(ENTITY_EVENTS.TURN_START, this);
  }

  endTurn() {
    this.atb = this.atbSeed;
    this.movementSpent = 0;

    this.emitter.emit(ENTITY_EVENTS.TURN_END, this);
  }
}
